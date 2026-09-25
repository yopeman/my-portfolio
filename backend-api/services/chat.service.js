import { ChatGroq } from '@langchain/groq';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { env } from '../config/env.js';
import { About, Project } from '../models/index.js';

const chatModel = new ChatGroq({ model: 'compound-beta', apiKey: env.groq.apiKey });

async function getTargetedContext(query) {
  const lowercaseQuery = (query || '').toLowerCase();
  const [about, projects] = await Promise.all([
    About.findOne({ deletedAt: null }).lean(),
    Project.find({ deletedAt: null }).sort({ order: 1, createdAt: -1 }).lean(),
  ]);

  let context = 'YOHANES DEBEBE PROFILE:\n';
  if (about?.headline) context += `Headline: ${about.headline}\n`;
  if (about?.bio) context += `Bio:\n${about.bio}\n\n`;
  if (about?.skills?.length) {
    context += 'Skills:\n';
    for (const skill of about.skills) {
      context += `- ${skill.category ? `${skill.category}: ` : ''}${skill.name}\n`;
    }
    context += '\n';
  }
  if (about?.contacts?.length) {
    context += 'Contact Details:\n';
    for (const contact of about.contacts) {
      context += `- ${contact.title || contact.name}: ${contact.link}\n`;
    }
    context += '\n';
  }

  const matchedProject = projects.find((project) => {
    const title = project.name.toLowerCase();
    const words = title.split(' ').filter((word) => word.length > 3);
    return lowercaseQuery.includes(title) || words.some((word) => lowercaseQuery.includes(word));
  });

  if (matchedProject) {
    context += '### DETAILED PROJECT CONTEXT:\n';
    context += `Project Name: ${matchedProject.name}\n`;
    context += `Full Details / Write-up:\n${matchedProject.description || matchedProject.summary || ''}\n`;
  } else {
    context += '### COMPLETED PROJECTS LIST:\n';
    for (const project of projects) {
      context += `- ${project.name} (Tech Stack: ${(project.tags || []).join(', ')})\n`;
    }
  }

  return context;
}

function buildSystemPrompt(dynamicContext) {
  return `You are the digital assistant (chatbot) of Yohanes Debebe, a backend-focused software developer.
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
6. Don't use table in your answers.
`;
}

export async function handleChat(messages) {
  const lastUserMsg = [...messages].reverse().find((msg) => msg.role === 'user');
  const userQuery = lastUserMsg ? lastUserMsg.content : '';
  const dynamicContext = await getTargetedContext(userQuery);

  const langchainMessages = [
    new SystemMessage(buildSystemPrompt(dynamicContext)),
    ...messages.map((msg) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      }
      if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      }
      return new SystemMessage(msg.content);
    }),
  ];

  const response = await chatModel.invoke(langchainMessages);
  return response.content;
}
