import { Router } from 'express';
import authRoutes from './auth.routes.js';
import aboutRoutes from './about.routes.js';
import projectRoutes from './project.routes.js';
import requestRoutes from './request.routes.js';
import subscriberRoutes from './subscriber.routes.js';
import blogRoutes from './blog.routes.js';
import planRoutes from './plan.routes.js';
import fileRoutes from './file.routes.js';
import feedbackRoutes from './feedback.routes.js';
import reactionRoutes from './reaction.routes.js';
import userRoutes from './user.routes.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMail } from '../services/email.service.js';
import { handleChat } from '../services/chat.service.js';
import { isDbReady } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/about', aboutRoutes);
router.use('/api/projects', projectRoutes);
router.use('/api/requests', requestRoutes);
router.use('/api/subscribers', subscriberRoutes);
router.use('/api/blogs', blogRoutes);
router.use('/api/plans', planRoutes);
router.use('/api/files', fileRoutes);
router.use('/api/feedback', feedbackRoutes);
router.use('/api/reactions', reactionRoutes);
router.use('/api/users', userRoutes);

router.post('/api/chat', asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages list' });
  }

  try {
    const response = await handleChat(messages);
    return res.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(200).json({
      response: "I'm sorry, I'm having trouble connecting to my local brain right now (Ollama might be starting or offline). You can email Yohanes directly at yopeman318@gmail.com!",
    });
  }
}));

router.post('/api/contact', asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  try {
    const receiver = env.receiverEmail;

    const phoneDisplay = phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : '';
    const phoneText = phone ? `\nPhone: ${phone}` : '';

    await sendMail({
      from: `"${name}" <${env.smtp.user}>`,
      replyTo: email,
      to: receiver,
      subject: `Portfolio Contact: Message from ${name}`,
      text:
        `You have received a new contact message from your portfolio website.\n\n` +
        `Name: ${name}\n` +
        `Email: <${email}>${phoneText}\n\n` +
        `Message:\n${message}`,
      html:
        `<h3>New Portfolio Message</h3>` +
        `<p><strong>Name:</strong> ${name}</p>` +
        `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` +
        `${phoneDisplay}` +
        `<p><strong>Message:</strong></p>` +
        `<div style="padding: 10px; background: #f3f4f6; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</div>`,
    });

    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
}));

router.post('/api/subscribe', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const receiver = env.receiverEmail;

    await sendMail({
      from: env.smtp.user,
      to: receiver,
      subject: `Portfolio Subscription: New Subscriber`,
      text: `A new user has subscribed to your newsletter.\n\nEmail: ${email}`,
      html:
        `<h3>New Newsletter Subscription</h3>` +
        `<p>A new user has subscribed to your newsletter.</p>` +
        `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>`,
    });

    try {
      await sendMail({
        from: env.smtp.user,
        to: email,
        subject: `Thank you for subscribing!`,
        text:
          `Hello,\n\nThank you for subscribing to Yohanes Debebe's newsletter! You will receive updates about new projects and insights.\n\nBest regards,\nYohanes Debebe`,
        html:
          `<h3>Thank you for subscribing!</h3>` +
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
}));

router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date(), db: isDbReady() ? 'connected' : 'disconnected' });
});

router.get('/', (req, res) => {
  res.redirect('https://yohanesdbb.vercel.app');
});

export { router as routes };