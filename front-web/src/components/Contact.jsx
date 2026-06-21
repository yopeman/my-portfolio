import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Phone, Mail, Github, Linkedin, Send, MapPin, ExternalLink,
  SendHorizonal, Globe, Check, AlertCircle, Loader2
} from 'lucide-react';
import SlideImage from './SlideImage';
import { BASE_URL } from '../data/constants';

export default function Contact({ aboutMe }) {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState({ type: '', text: '' });

  // Subscribe Form State
  const [subEmail, setSubEmail] = useState('');
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [subStatus, setSubStatus] = useState({ type: '', text: '' });

  // Parse contact info from markdown
  const parseContactInfo = (markdown) => {
    if (!markdown) return [];
    const lines = markdown.split('\n');
    const items = [];
    lines.forEach(line => {
      const match = line.match(/^\-\s+([^:]+):\s+(.+)$/);
      if (match) {
        let label = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('[') && value.includes('](')) {
          const urlMatch = value.match(/\]\(([^\)]+)\)/);
          if (urlMatch) value = urlMatch[1];
        }
        items.push({ label, value });
      }
    });
    return items;
  };

  const contactList = parseContactInfo(aboutMe.contact);

  const getContactIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'phone':    return <Phone    className="w-5 h-5 text-indigo-500" />;
      case 'email':    return <Mail     className="w-5 h-5 text-emerald-500" />;
      case 'github':   return <Github   className="w-5 h-5 text-slate-800 dark:text-slate-200" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-600" />;
      case 'telegram': return <Send     className="w-5 h-5 text-sky-500" />;
      case 'location': return <MapPin   className="w-5 h-5 text-rose-500" />;
      default:         return <Globe    className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setIsContactLoading(true);
    setContactStatus({ type: '', text: '' });
    try {
      const response = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, phone: contactPhone, message: contactMessage }),
      });
      const data = await response.json();
      if (response.ok) {
        setContactStatus({ type: 'success', text: 'Thank you! Your message has been sent successfully.' });
        setContactName(''); setContactEmail(''); setContactMessage('');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        setContactStatus({ type: 'error', text: data.error || 'Something went wrong. Please try again.' });
      }
    } catch {
      setContactStatus({ type: 'error', text: 'Could not connect to the mail server. Please try again later.' });
    } finally {
      setIsContactLoading(false);
    }
  };

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!subEmail) return;
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
        setSubStatus({ type: 'success', text: 'Subscribed successfully! Check your inbox.' });
        setSubEmail('');
        confetti({ particleCount: 50, spread: 40, origin: { y: 0.9 } });
      } else {
        setSubStatus({ type: 'error', text: data.error || 'Failed to subscribe.' });
      }
    } catch {
      setSubStatus({ type: 'error', text: 'Could not connect to the server.' });
    } finally {
      setIsSubLoading(false);
    }
  };

  return (
    <section id="contact" className="border-b border-slate-100 dark:border-slate-800 night:border-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">

        {/* Left – contact content */}
        <div className="py-20 lg:pr-16 space-y-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Get In Touch
            </h2>
            <p className="mt-4 text-md text-slate-500 dark:text-slate-400 leading-relaxed">
              Have a project you would like to discuss, a backend role open, or questions about my AI applications? Contact me through any channel or send a direct message using the form.
            </p>
          </div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contactList.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 night:bg-black/60 border border-slate-200/40 dark:border-slate-800/60 night:border-purple-900/15 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 night:bg-purple-950/20 border border-slate-100 dark:border-slate-700/50 shrink-0">
                  {getContactIcon(item.label)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.value.startsWith('http') ? (
                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-violet-400 flex items-center gap-0.5">
                        Link <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe */}
          <div className="p-6 rounded-3xl bg-indigo-500/[0.03] dark:bg-violet-500/[0.03] border border-indigo-500/10 dark:border-violet-500/10 night:border-purple-900/10 space-y-4">
            <h4 className="text-md font-bold text-slate-800 dark:text-slate-100">Subscribe to updates</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get notified when I release new articles, tutorials, or open-source libraries.
            </p>
            <form onSubmit={handleSubscribeSubmit} className="flex gap-2">
              <input
                type="email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)}
                placeholder="Enter your email" required
                className="flex-grow px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" disabled={isSubLoading}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-violet-700 dark:hover:bg-violet-600 night:bg-purple-700 text-white font-semibold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center cursor-pointer">
                {isSubLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Subscribe'}
              </button>
            </form>
            {subStatus.text && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${subStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {subStatus.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {subStatus.text}
              </div>
            )}
          </div>

          {/* Contact form */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-slate-900/50 night:bg-black/60 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-slate-800/80 night:border-purple-900/10 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send a Message</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Name</label>
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your Name" required
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+251 9XX XXX XXXX"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="name@example.com" required
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message</label>
                <textarea rows="4" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Tell me about your project..." required
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <button type="submit" disabled={isContactLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 night:bg-purple-600 text-white font-bold text-sm transition-colors shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50">
                {isContactLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send Message <SendHorizonal className="w-4 h-4" /></>}
              </button>
            </form>
            {contactStatus.text && (
              <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-sm font-semibold ${
                contactStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/35 dark:text-emerald-400'
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/35 dark:text-rose-400'
              }`}>
                {contactStatus.type === 'success'
                  ? <Check className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  : <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />}
                <span className="leading-relaxed">{contactStatus.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right – crossfading image */}
        <div className="hidden lg:flex items-center justify-center py-16 pl-8">
          <SlideImage
            className="w-full aspect-[4/5] max-h-[80vh] shadow-2xl shadow-slate-900/10"
          />
        </div>
      </div>
    </section>
  );
}