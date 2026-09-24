import { ChatGroq } from '@langchain/groq';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { env } from '../config/env.js';
import { aboutMe, projects } from '../data/portfolioData.js';

const chatModel = new ChatGroq({ model: 'compound-beta', apiKey: env.groq.apiKey });

function getTargetedContext(query) {
  const lowercaseQuery = (query || '').toLowerCase();

  let context = 'YOHANES DEBEBE PROFILE:\n';
  if (aboutMe.about) context += `Bio:\n${aboutMe.about}\n\n`;
  if (aboutMe.skills) context += `Skills:\n${aboutMe.skills}\n\n`;
  if (aboutMe.contact) context += `Contact Details:\n${aboutMe.contact}\n\n`;

  let matchedProject = null;
  for (const proj of projects) {
    const titleLower = proj.title.toLowerCase();

    const isDirectMatch = lowercaseQuery.includes(titleLower);
    const words = titleLower.split(' ').filter((w) => w.length > 3);
    const isWordMatch = words.some((word) => lowercaseQuery.includes(word));

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
    context += `### COMPLETED PROJECTS LIST:\n`;
    projects.forEach((p) => {
      context += `- ${p.title} (Tech Stack: ${p.tags.join(', ')})\n`;
    });
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
  const dynamicContext = getTargetedContext(userQuery);

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