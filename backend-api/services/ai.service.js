import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const MODEL = 'openai/gpt-oss-20b';
const MAX_TEXT = 20000;
const MAX_ITEMS = 60;
const MAX_INSTRUCTION = 1000;

let model;

// Built lazily so a missing GROQ_API_KEY only fails the request that needs it
// instead of crashing the whole API at import time.
function getModel() {
  if (!model) {
    if (!env.groq.apiKey) {
      throw ApiError.badRequest('AI features are not configured on this server.');
    }
    model = new ChatGroq({
      model: MODEL,
      apiKey: env.groq.apiKey,
      temperature: 0.4,
      maxTokens: 4096,
      modelKwargs: { response_format: { type: 'json_object' } },
    });
  }
  return model;
}

// Each entity mirrors the shape the admin form keeps in React state, not the
// database document: comma separated strings for tag-like fields and no _id,
// timestamps, or file keys. Only these keys ever reach the model or come back.
const TEXT = 'string';
const NUMBER = 'number';
const BOOLEAN = 'boolean';
const DATE = 'date';
const LINK = 'link';
const TAG_STRING = 'tagString';
const ITEM_LIST = 'items';

const ENTITIES = {
  about: {
    resource: 'about',
    label: 'profile',
    fields: {
      headline: { type: TEXT, hint: 'One specific sentence naming the role and specialty.' },
      bio: { type: TEXT, hint: 'Markdown supported. Three short paragraphs: what you build, how you work, what you are after.' },
      contacts: {
        type: ITEM_LIST,
        items: {
          name: { type: TEXT, hint: 'Display label, e.g. "Email", "GitHub".' },
          title: { type: TEXT, hint: 'Short qualifier such as the handle or label.' },
          link: { type: LINK, hint: 'Absolute URL, mailto:, or tel: address.' },
          order: { type: NUMBER, min: 0 },
        },
      },
      skills: {
        type: ITEM_LIST,
        items: {
          category: { type: TEXT, hint: 'Grouping such as "Backend", "Frontend", "Tooling".' },
          name: { type: TEXT, hint: 'A single technology or competency.' },
          progress: { type: NUMBER, min: 1, max: 100, hint: 'Honest self-rating from 1 to 100.' },
          order: { type: NUMBER, min: 0 },
        },
      },
      educations: {
        type: ITEM_LIST,
        items: {
          institution: { type: TEXT },
          degree: { type: TEXT, hint: 'For example BSc.' },
          field: { type: TEXT, hint: 'Field of study.' },
          location: { type: TEXT },
          startDate: { type: DATE },
          endDate: { type: DATE, hint: 'Empty string when still studying.' },
          cgpa: { type: NUMBER, min: 0, max: 10, hint: 'Leave empty when unknown.' },
          description: { type: TEXT, hint: 'Thesis, honours, or notable coursework.' },
          link: { type: LINK },
          order: { type: NUMBER, min: 0 },
        },
      },
      experiences: {
        type: ITEM_LIST,
        items: {
          company: { type: TEXT },
          role: { type: TEXT },
          type: { type: TEXT, hint: 'One of: full-time, part-time, contract, internship, freelance.' },
          location: { type: TEXT },
          remote: { type: BOOLEAN },
          startDate: { type: DATE },
          endDate: { type: DATE, hint: 'Empty string marks the current role.' },
          description: { type: TEXT, hint: 'What you owned and what shipped.' },
          highlights: { type: TAG_STRING, hint: 'Comma separated, each entry a measurable outcome.' },
          skills: { type: TAG_STRING, hint: 'Comma separated technologies used in the role.' },
          link: { type: LINK },
          order: { type: NUMBER, min: 0 },
        },
      },
    },
  },
  project: {
    resource: 'projects',
    label: 'project',
    fields: {
      name: { type: TEXT, hint: 'Specific product name, no generic titles.' },
      summary: { type: TEXT, hint: 'One sentence for cards and previews.' },
      problem: { type: TEXT, hint: 'The real pain this project addressed.' },
      solution: { type: TEXT, hint: 'The approach taken and the outcome it produced.' },
      description: { type: TEXT, hint: 'Markdown supported. Structure it as the story of building the project.' },
      tags: { type: TAG_STRING, hint: 'Comma separated technologies and topics.' },
      type: { type: TEXT, hint: 'One of: product, case study, tutorial.' },
      features: {
        type: ITEM_LIST,
        items: {
          name: { type: TEXT, hint: 'Short capability name.' },
          description: { type: TEXT, hint: 'What the capability does for the user.' },
          order: { type: NUMBER, min: 0 },
        },
      },
      stacks: {
        type: ITEM_LIST,
        items: {
          name: { type: TEXT, hint: 'Technology or tool.' },
          description: { type: TEXT, hint: 'How the project used it.' },
          order: { type: NUMBER, min: 0 },
        },
      },
      links: {
        type: ITEM_LIST,
        items: {
          type: { type: TEXT, hint: 'Short label such as github, website, demo, docs.' },
          link: { type: LINK },
          order: { type: NUMBER, min: 0 },
        },
      },
    },
  },
  blog: {
    resource: 'blogs',
    label: 'blog post',
    fields: {
      title: { type: TEXT, hint: 'Specific, benefit driven title without clickbait.' },
      excerpt: { type: TEXT, hint: 'One or two sentences for cards and search results.' },
      content: { type: TEXT, hint: 'Markdown supported. Improve structure, headings, and clarity of the existing draft.' },
      tags: { type: TAG_STRING, hint: 'Comma separated topics covered.' },
      type: { type: TEXT, hint: 'One of: article, blog, event.' },
      status: { type: TEXT, hint: 'One of: draft, published, archived. Only change this when asked.' },
      links: {
        type: ITEM_LIST,
        items: {
          type: { type: TEXT, hint: 'Short label such as website, docs, source.' },
          link: { type: LINK },
        },
      },
    },
  },
};

export function aiResourceFor(entity) {
  return ENTITIES[entity]?.resource || null;
}

export function isAiEntity(entity) {
  return Object.hasOwn(ENTITIES, entity);
}

function cleanString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.slice(0, MAX_TEXT);
}

// The admin form edits tag-like fields as one comma separated string, so an
// array coming back from the model is joined rather than dropped.
function cleanTagString(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanString(entry))
      .filter(Boolean)
      .join(', ');
  }
  return cleanString(value) ?? '';
}

function cleanDate(value) {
  const text = cleanString(value);
  if (!text) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(text)) return '';
  return text.slice(0, 10);
}

function cleanNumber(value, { min, max } = {}) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

// Mirrors the allow-list in about.controller so the model cannot smuggle in a
// javascript: link.
function cleanLink(value) {
  const text = cleanString(value);
  if (!text) return '';
  try {
    const url = new URL(text);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function cleanField(spec, value) {
  switch (spec.type) {
    case TEXT:
      return cleanString(value);
    case TAG_STRING:
      return cleanTagString(value);
    case NUMBER:
      return cleanNumber(value, spec);
    case BOOLEAN:
      return value === true || value === 'true';
    case DATE:
      return cleanDate(value);
    case LINK:
      return cleanLink(value);
    default:
      return null;
  }
}

function cleanItems(spec, value) {
  if (!Array.isArray(value)) return [];
  const fields = Object.entries(spec.items);
  return value.slice(0, MAX_ITEMS).map((item) => {
    const source = item && typeof item === 'object' ? item : {};
    const cleaned = {};
    for (const [key, itemSpec] of fields) {
      const result = cleanField(itemSpec, source[key]);
      if (result !== null) cleaned[key] = result;
    }
    return cleaned;
  });
}

function cleanEntityData(entity, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const cleaned = {};
  for (const [key, spec] of Object.entries(ENTITIES[entity].fields)) {
    if (data[key] === undefined) continue;
    if (spec.type === ITEM_LIST) cleaned[key] = cleanItems(spec, data[key]);
    else {
      const result = cleanField(spec, data[key]);
      if (result !== null) cleaned[key] = result;
    }
  }
  return cleaned;
}

// Blocks the model from returning records that would only fail validation on
// save, such as a feature row with no name or a link row with no URL.
function isUsableItem(spec, key, item) {
  if (key === 'links') return Boolean(item.link);
  if (spec.items.name) return Boolean(item.name);
  return true;
}

function describeShape(fields) {
  const lines = [];
  for (const [key, spec] of Object.entries(fields)) {
    if (spec.type === ITEM_LIST) {
      const itemFields = Object.entries(spec.items).map(([itemKey, itemSpec]) => {
        const range = itemSpec.min !== undefined || itemSpec.max !== undefined
          ? ` (${itemSpec.min ?? 'any'}–${itemSpec.max ?? 'any'})`
          : '';
        return `${itemKey}: ${itemSpec.type}${range}${itemSpec.hint ? ` — ${itemSpec.hint}` : ''}`;
      });
      lines.push(`  "${key}": array of objects, each with:`);
      lines.push(...itemFields.map((line) => `    - ${line}`));
    } else {
      lines.push(`  "${key}": ${spec.type}${spec.hint ? ` — ${spec.hint}` : ''}`);
    }
  }
  return lines.join('\n');
}

const SYSTEM_PROMPT = `You rewrite the text someone has already typed into an admin form of their portfolio site.

Your output replaces the form fields. It is never saved to the database by you and it must not attempt to change anything else.

Hard rules:
1. Never invent facts. Do not add employers, schools, clients, dates, numbers, metrics, links, or technologies that are not already in the input. Never guess a URL.
2. Keep every existing entity. If an input array has three rows, your output array has the same three rows in the same order. Add nothing, drop nothing, and do not reorder.
3. Copy identifiers and structured values exactly: dates, numbers, booleans, URLs, and order values must be returned unchanged.
4. Improve clarity, specificity, grammar, and structure. Prefer concrete wording over filler. Cut marketing padding and buzzwords.
5. If the input is empty for a field, leave that field out of the response instead of fabricating a value.
6. Improve only the fields you can improve. Repeat the others unchanged, because the response replaces the whole form.
7. Respond with a single JSON object and nothing else. No prose, no markdown fences, no commentary.`;

function buildUserPrompt(entity, data, instruction) {
  const spec = ENTITIES[entity];
  return [
    `Entity: ${spec.label}`,
    `Extra instruction from the user (may be empty): "${instruction || ''}"`,
    '',
    'Return a JSON object with exactly these keys, and no others:',
    describeShape(spec.fields),
    '',
    'Current form data as JSON:',
    JSON.stringify(data),
  ].join('\n');
}

function extractJson(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    // The model sometimes prefixes its JSON with a sentence, so fall back to
    // the outermost brace pair.
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

export async function enhanceFormData({ entity, data, instruction }) {
  if (!isAiEntity(entity)) {
    throw ApiError.badRequest('entity must be one of: about, project, blog');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw ApiError.badRequest('data must be an object of form values');
  }

  const spec = ENTITIES[entity];
  const current = cleanEntityData(entity, data);
  if (!current || Object.keys(current).length === 0) {
    throw ApiError.badRequest('data contains no fields this entity can improve');
  }

  const prompt = buildUserPrompt(
    entity,
    current,
    typeof instruction === 'string' ? instruction.trim().slice(0, MAX_INSTRUCTION) : '',
  );

  let response;
  try {
    response = await getModel().invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);
  } catch (error) {
    console.error('AI enhance error:', error);
    throw ApiError.badRequest('The AI service is unavailable right now. Try again shortly.');
  }

  const parsed = extractJson(response.content);
  if (!parsed) {
    throw ApiError.badRequest('The AI returned an unreadable response. Try again.');
  }

  const enhanced = cleanEntityData(entity, parsed);
  if (!enhanced || Object.keys(enhanced).length === 0) {
    throw ApiError.badRequest('The AI did not return any usable fields. Try again.');
  }

  // Rows without a usable identifier cannot be saved, so keep only what is
  // complete enough for the form.
  for (const [key, fieldSpec] of Object.entries(spec.fields)) {
    if (fieldSpec.type !== ITEM_LIST || !Array.isArray(enhanced[key])) continue;
    enhanced[key] = enhanced[key].filter((item) => isUsableItem(fieldSpec, key, item));
  }

  return { data: enhanced, model: MODEL };
}
