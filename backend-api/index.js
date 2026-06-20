import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

// Import the pre-compiled and summarized portfolio data
import { aboutMe, projects } from '../front-web/src/data/portfolioData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dynamic Keyword-based RAG Router to keep context window targeted and minimal for qwen2.5:0.5b
function getTargetedContext(query) {
  const lowercaseQuery = (query || '').toLowerCase();
  
  // Base details (Yohanes' bio, skills, contact)
  let context = 'YOHANES DEBEBE PROFILE:\n';
  if (aboutMe.about) context += `Bio:\n${aboutMe.about}\n\n`;
  if (aboutMe.skills) context += `Skills:\n${aboutMe.skills}\n\n`;
  if (aboutMe.contact) context += `Contact Details:\n${aboutMe.contact}\n\n`;

  // Scan user query for any project keyword match
  let matchedProject = null;
  for (const proj of projects) {
    const titleLower = proj.title.toLowerCase();
    
    // Check direct title match or significant word match
    const isDirectMatch = lowercaseQuery.includes(titleLower);
    const words = titleLower.split(' ').filter(w => w.length > 3);
    const isWordMatch = words.some(word => lowercaseQuery.includes(word));
    
    if (isDirectMatch || isWordMatch) {
      matchedProject = proj;
      break;
    }
  }

  if (matchedProject) {
    context += `### DETAILED PROJECT CONTEXT:\n`;
    context += `Project Name: ${matchedProject.title}\n`;
    context += `Full Details / Write-up:\n${matchedProject.readme || matchedProject.summary}\n`;
  } else {
    // Fallback: Brief list of project titles so the LLM is aware of them
    context += `### COMPLETED PROJECTS LIST:\n`;
    projects.forEach(p => {
      context += `- ${p.title} (Tech Stack: ${p.tags.join(', ')})\n`;
    });
  }

  return context;
}

// Ollama Chat model setup
const chatModel = new ChatOllama({
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: 'qwen2.5:0.5b',
  temperature: 0.5, // slightly lower temperature for higher factual consistency
});

// Endpoint: Chat with the portfolio assistant
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages list' });
  }

  try {
    // 1. Get last user query to determine context routing
    const lastUserMsg = [...messages].reverse().find(msg => msg.role === 'user');
    const userQuery = lastUserMsg ? lastUserMsg.content : '';
    const dynamicContext = getTargetedContext(userQuery);

    // 2. Build system prompt using dynamic context
    const systemPrompt = `You are the digital assistant (chatbot) of Yohanes Debebe, a backend-focused software developer.
You are helping visitors of Yohanes' portfolio website to learn about him, his skills, and his projects.

You have the complete facts about Yohanes in the context block below. Do NOT say you cannot browse the internet or look up projects. If asked about a project, look it up in the context below and summarize it directly.

Here is all the relevant information about Yohanes:
=======================================
${dynamicContext}
=======================================

Guidelines:
1. Always be professional, helpful, polite, and write concise responses.
2. Only answer questions related to Yohanes, his bio, his skills, his projects, and how to contact him.
3. If a visitor asks something unrelated, politely steer the conversation back to Yohanes' work or refuse to answer.
4. Under no circumstances should you make up or hallucinate details. Do not mix details between different projects.
5. Keep your responses short, natural, and friendly. Output in plain text (Markdown is fine, but keep it simple).
`;

    // Map incoming messages to Langchain message instances
    const langchainMessages = [
      new SystemMessage(systemPrompt),
      ...messages.map(msg => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else if (msg.role === 'assistant') {
          return new AIMessage(msg.content);
        } else {
          return new SystemMessage(msg.content);
        }
      })
    ];

    const response = await chatModel.invoke(langchainMessages);
    return res.json({ response: response.content });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(200).json({ 
      response: "I'm sorry, I'm having trouble connecting to my local brain right now (Ollama might be starting or offline). You can email Yohanes directly at yopeman318@gmail.com!"
    });
  }
});

// Mail Transporter utility
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Endpoint: Contact form email sender
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  try {
    const transporter = createTransporter();
    const receiver = process.env.RECEIVER_EMAIL || 'yopeman318@gmail.com';

    const phoneDisplay = phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : '';
    const phoneText = phone ? `\nPhone: ${phone}` : '';

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: receiver,
      subject: `Portfolio Contact: Message from ${name}`,
      text: `You have received a new contact message from your portfolio website.\n\n` +
            `Name: ${name}\n` +
            `Email: <${email}>${phoneText}\n\n` +
            `Message:\n${message}`,
      html: `<h3>New Portfolio Message</h3>` +
            `<p><strong>Name:</strong> ${name}</p>` +
            `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` +
            `${phoneDisplay}` +
            `<p><strong>Message:</strong></p>` +
            `<div style="padding: 10px; background: #f3f4f6; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</div>`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});

// Endpoint: Newsletter subscription
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const transporter = createTransporter();
    const receiver = process.env.RECEIVER_EMAIL || 'yopeman318@gmail.com';

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: receiver,
      subject: `Portfolio Subscription: New Subscriber`,
      text: `A new user has subscribed to your newsletter.\n\nEmail: ${email}`,
      html: `<h3>New Newsletter Subscription</h3>` +
            `<p>A new user has subscribed to your newsletter.</p>` +
            `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    // Optional confirmation email to subscriber
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: `Thank you for subscribing!`,
        text: `Hello,\n\nThank you for subscribing to Yohanes Debebe's newsletter! You will receive updates about new projects and insights.\n\nBest regards,\nYohanes Debebe`,
        html: `<h3>Thank you for subscribing!</h3>` +
              `<p>Hello,</p>` +
              `<p>Thank you for subscribing to Yohanes Debebe's newsletter! You will receive updates about new projects and insights.</p>` +
              `<p>Best regards,<br>Yohanes Debebe</p>`,
      });
    } catch (confError) {
      console.warn('Could not send subscriber confirmation email:', confError);
    }

    return res.json({ success: true, message: 'Subscribed successfully.' });
  } catch (error) {
    console.error('Subscription email error:', error);
    return res.status(500).json({ error: 'Failed to complete subscription. Please try again later.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
