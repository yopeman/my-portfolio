import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  SendHorizonal,
  Sparkles,
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import SlideImage from './SlideImage';
import { BASE_URL } from '../data/constants';
import { requestsApi } from '../api/requests.js';
import { useStaggerReveal } from '../hooks/useScrollReveal';
import {
  Card,
  Field,
  Notice,
  SectionHeading,
  SectionShell,
  TextArea,
  TextInput,
} from './ui.jsx';

const CONTACT_ICONS = {
  phone: { icon: Phone, tone: 'text-indigo-500' },
  email: { icon: Mail, tone: 'text-emerald-500' },
  github: { icon: Github, tone: 'text-slate-700 dark:text-slate-200' },
  linkedin: { icon: Linkedin, tone: 'text-blue-600 dark:text-blue-400' },
  telegram: { icon: Send, tone: 'text-sky-500' },
  location: { icon: MapPin, tone: 'text-rose-500' },
};

function isContactLink(value) {
  return /^(?:https?:|mailto:|tel:)/i.test(String(value || ''));
}

// The contact block is stored as a "- Label: value" markdown list.
function parseContactInfo(markdown) {
  if (!markdown) return [];
  const items = [];
  for (const line of markdown.split('\n')) {
    const match = line.match(/^-\s+([^:]+):\s+(.+)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (value.startsWith('[') && value.includes('](')) {
      const urlMatch = value.match(/\]\(([^)]+)\)/);
      if (urlMatch) value = urlMatch[1];
    }
    items.push({ label: match[1].trim(), value });
  }
  return items;
}

function ContactCard({ label, value }) {
  const match = CONTACT_ICONS[label.toLowerCase()];
  const Icon = match?.icon || Globe;
  const tone = match?.tone || 'text-indigo-500';
  const isLink = isContactLink(value);

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/60 bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/40 night:border-purple-900/15 night:bg-black/50">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
        <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </span>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring link-underline mt-0.5 block truncate rounded text-sm font-bold text-slate-800 dark:text-slate-100"
          >
            {value.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        ) : (
          <span className="mt-0.5 block truncate text-sm font-bold text-slate-800 dark:text-slate-100">
            {value}
          </span>
        )}
      </span>
    </div>
  );
}

export default function Contact({ aboutMe }) {
  const images = aboutMe?.images || [];
  const { ref: staggerRef, isRevealed } = useStaggerReveal({ threshold: 0.1 });
  const contactList = parseContactInfo(aboutMe?.contact);

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ type: '', text: '' });
  const [isContactLoading, setIsContactLoading] = useState(false);

  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState({ type: '', text: '' });
  const [isSubLoading, setIsSubLoading] = useState(false);

  const setField = (key) => (event) => setForm((c) => ({ ...c, [key]: event.target.value }));

  async function handleContactSubmit(event) {
    event.preventDefault();
    setIsContactLoading(true);
    setContactStatus({ type: '', text: '' });
    try {
      // Two independent sinks: the mail relay and the admin request inbox.
      // Success is reported if either one lands.
      const [emailResult, requestResult] = await Promise.allSettled([
        fetch(`${BASE_URL}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            message: form.message,
          }),
        }),
        requestsApi.create({ message: form.message }),
      ]);

      const emailOk = emailResult.status === 'fulfilled' && (await emailResult.value.json()).ok !== false;
      const requestOk = requestResult.status === 'fulfilled';

      if (emailOk || requestOk) {
        setContactStatus({ type: 'success', text: 'Thank you! Your message has been sent.' });
        setForm((current) => ({ ...current, name: '', email: '', message: '' }));
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        setContactStatus({ type: 'error', text: 'Something went wrong. Please try again.' });
      }
    } catch {
      setContactStatus({ type: 'error', text: 'Could not reach the server. Please try again later.' });
    } finally {
      setIsContactLoading(false);
    }
  }

  async function handleSubscribeSubmit(event) {
    event.preventDefault();
    setIsSubLoading(true);
    setSubStatus({ type: '', text: '' });
    try {
      const response = await fetch(`${BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        const isNew = data.created !== false;
        setSubStatus({
          type: 'success',
          text: isNew ? 'Subscribed. Check your inbox for confirmation.' : data.message || 'You are already subscribed.',
        });
        setSubEmail('');
        if (isNew) confetti({ particleCount: 50, spread: 40, origin: { y: 0.9 } });
      } else {
        setSubStatus({ type: 'error', text: data.error || 'Failed to subscribe.' });
      }
    } catch {
      setSubStatus({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setIsSubLoading(false);
    }
  }

  return (
    <SectionShell id="contact" size={images.length ? 'wide' : 'narrow'} tone="muted">
      <div className={`grid items-start gap-12 ${images.length ? 'lg:grid-cols-2 lg:gap-16' : ''}`}>
        <div className="order-2 lg:order-1">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Contact"
              icon={MessageSquare}
              title="Get in touch"
              description="A project you want to discuss, a backend role that is open, or a question about my AI work — any of those is a good reason to write."
            />
          </AnimatedSection>

          {contactList.length > 0 && (
            <div
              ref={staggerRef}
              className={`stagger-children mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 ${isRevealed ? 'revealed' : ''}`}
            >
              {contactList.map((item, index) => (
                <ContactCard key={`${item.label}-${index}`} {...item} />
              ))}
            </div>
          )}

          <Card interactive={false} className="mt-6 p-6">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              Subscribe to updates
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Get notified when I publish a new article or release a tool.
            </p>
            <form onSubmit={handleSubscribeSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="subscribe-email" className="sr-only">
                Email address
              </label>
              <TextInput
                id="subscribe-email"
                type="email"
                value={subEmail}
                onChange={(event) => setSubEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="sm:flex-1"
              />
              <button
                type="submit"
                disabled={isSubLoading}
                className="btn-primary shrink-0 px-5 py-3 text-xs uppercase tracking-wider"
              >
                {isSubLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Subscribe'}
              </button>
            </form>
            {subStatus.text && (
              <Notice tone={subStatus.type === 'success' ? 'success' : 'error'} className="mt-4">
                {subStatus.text}
              </Notice>
            )}
          </Card>

          <Card interactive={false} className="mt-6 p-6 sm:p-8">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Send a message</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Fields marked with an asterisk are required.
            </p>

            <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="contact-name" label="Name" required>
                  <TextInput
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={setField('name')}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field id="contact-phone" label="Phone" hint="Optional">
                  <TextInput
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={setField('phone')}
                    placeholder="+251 9XX XXX XXX"
                    autoComplete="tel"
                  />
                </Field>
              </div>

              <Field id="contact-email" label="Email" required>
                <TextInput
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field id="contact-message" label="Message" required>
                <TextArea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={setField('message')}
                  placeholder="Tell me about your project…"
                  required
                />
              </Field>

              <button type="submit" disabled={isContactLoading} className="btn-primary w-full py-3.5">
                {isContactLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <SendHorizonal className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {contactStatus.text && (
              <Notice tone={contactStatus.type === 'success' ? 'success' : 'error'} className="mt-4">
                {contactStatus.text}
              </Notice>
            )}
          </Card>
        </div>

        {images.length > 0 && (
          <AnimatedSection direction="right" delay={120} className="order-1 hidden lg:order-2 lg:block">
            <SlideImage
              images={images}
              className="aspect-[4/5] max-h-[70vh] w-full shadow-2xl shadow-indigo-950/20"
            />
          </AnimatedSection>
        )}
      </div>
    </SectionShell>
  );
}
