import { useState } from 'react';
import { aboutMe } from './data/portfolioData';
import ThemeToggle from './components/ThemeToggle';
import Projects from './components/Projects';
import Chatbot from './components/Chatbot';
import Markdown from 'markdown-to-jsx';
import confetti from 'canvas-confetti';
import { 
  Phone, Mail, Github, Linkedin, Send, MapPin, ExternalLink,
  Terminal, GraduationCap, Award, BookOpen, 
  SendHorizonal, Calendar, Globe, Server, Check, AlertCircle, Loader2
} from 'lucide-react';

export default function App() {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState({ type: '', text: '' });

  // Subscribe Form State
  const [subEmail, setSubEmail] = useState('');
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [subStatus, setSubStatus] = useState({ type: '', text: '' });

  // Parse contact info from SKILLS/ABOUT markdown
  const parseContactInfo = (markdown) => {
    if (!markdown) return [];
    const lines = markdown.split('\n');
    const items = [];
    lines.forEach(line => {
      const match = line.match(/^\-\s+([^:]+):\s+(.+)$/);
      if (match) {
        let label = match[1].trim();
        let value = match[2].trim();
        // Remove markdown link syntax from value if present e.g. [name](url) -> url
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
      case 'phone': return <Phone className="w-5 h-5 text-indigo-500" />;
      case 'email': return <Mail className="w-5 h-5 text-emerald-500" />;
      case 'github': return <Github className="w-5 h-5 text-slate-800 dark:text-slate-200" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-600" />;
      case 'telegram': return <Send className="w-5 h-5 text-sky-500" />;
      case 'location': return <MapPin className="w-5 h-5 text-rose-500" />;
      default: return <Globe className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setIsContactLoading(true);
    setContactStatus({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setContactStatus({ type: 'success', text: 'Thank you! Your message has been sent successfully.' });
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      } else {
        setContactStatus({ type: 'error', text: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (err) {
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
      const response = await fetch('http://localhost:5000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubStatus({ type: 'success', text: 'Subscribed successfully! Check your inbox.' });
        setSubEmail('');
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.9 }
        });
      } else {
        setSubStatus({ type: 'error', text: data.error || 'Failed to subscribe.' });
      }
    } catch (err) {
      setSubStatus({ type: 'error', text: 'Could not connect to the server.' });
    } finally {
      setIsSubLoading(false);
    }
  };

  // Extract YouTube ID
  const getYoutubeEmbedUrl = (markdown) => {
    if (!markdown) return '';
    const match = markdown.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) || 
                  markdown.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : '';
  };
  const embedUrl = getYoutubeEmbedUrl(aboutMe.about);

  // Markdown renderer options for skills to automatically convert into nice badges
  const skillsMarkdownOptions = {
    overrides: {
      h1: { component: () => null }, // hide main heading
      h2: {
        component: ({ children }) => (
          <h4 className="text-sm font-bold text-indigo-600 dark:text-violet-400 uppercase tracking-wider mb-3 pl-1">
            {children}
          </h4>
        )
      },
      ul: {
        component: ({ children }) => (
          <div className="flex flex-wrap gap-2 mb-8">{children}</div>
        )
      },
      li: {
        component: ({ children }) => (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700/80 night:bg-purple-950/20 night:border-purple-900/10 text-slate-700 dark:text-slate-200 night:text-purple-300 border border-slate-200/50 dark:border-slate-700/60 transition-colors shadow-sm">
            {children}
          </span>
        )
      }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 w-full glass border-b border-slate-200/40 dark:border-slate-800/40 night:border-purple-900/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-violet-600 night:bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              Y
            </div>
            <span className="font-extrabold text-slate-850 dark:text-white text-md tracking-tight group-hover:text-indigo-600 dark:group-hover:text-violet-400 transition-colors">
              Yohanes.dev
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-650 dark:text-slate-355">
            <a href="#about" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">About</a>
            <a href="#skills" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Skills</a>
            <a href="#projects" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Projects</a>
            <a href="#contact" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a 
              href="#contact" 
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-violet-600 dark:hover:bg-violet-500 night:bg-purple-600 night:hover:bg-purple-500 transition-colors cursor-pointer"
            >
              Hire Me
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden ticks-bg border-b border-slate-100 dark:border-slate-850 night:border-purple-900/10">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-violet-400 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" /> Full-Stack Portfolio
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            Hi, I’m <span className="text-gradient-purple">Yohanes Debebe</span>
          </h1>

          <p className="text-lg sm:text-2xl max-w-2xl mx-auto text-slate-500 dark:text-slate-400 font-medium">
            A backend-focused software developer with strong frontend knowledge and a passion for building reliable systems.
          </p>

          {/* Academic High Points Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 night:bg-black/40 border border-slate-200/50 dark:border-slate-800/60 night:border-purple-900/15 flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Degree</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">B.Sc. Computer Science</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 night:bg-black/40 border border-slate-200/50 dark:border-slate-800/60 night:border-purple-900/15 flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CGPA</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">3.81 / 4.00</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 night:bg-black/40 border border-slate-200/50 dark:border-slate-800/60 night:border-purple-900/15 flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Graduation</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Class of 2026</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <a 
              href="#projects" 
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 night:bg-purple-600 night:hover:bg-purple-50 text-white dark:text-white night:text-white shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
            >
              Explore Projects
            </a>
            <a 
              href="#contact" 
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold rounded-xl border border-slate-250 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 night:border-purple-900/30 night:hover:bg-purple-950/20 text-slate-700 dark:text-slate-300 night:text-purple-400 cursor-pointer transition-colors"
            >
              Contact Me
            </a>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Bio Column */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              About Me
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed text-md space-y-4">
              <Markdown overrides={{ h1: { component: () => null }, h2: { component: () => null } }}>
                {aboutMe.about || ''}
              </Markdown>
            </div>
          </div>

          {/* YouTube Video Column */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-800 night:border-purple-900/20 bg-slate-900 flex items-center justify-center">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Yohanes Debebe Introduction Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 text-indigo-500/40" />
                  <span>Introduction video placeholder</span>
                </div>
              )}
            </div>
            <p className="text-xs text-center text-slate-400">
              📺 Check out my video presentation to learn more about my coding philosophy.
            </p>
          </div>
        </div>
      </section>

      {/* Skills & Technologies Section */}
      <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-850/20 night:bg-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Skills & Expertise
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
              Languages, backend architectures, AI workflows, and development tooling.
            </p>
          </div>

          {/* Badges Grid (Automatically parsed from markdown file) */}
          <div className="p-6 sm:p-10 bg-white dark:bg-slate-900/40 night:bg-black/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 night:border-purple-900/10 shadow-sm max-w-4xl mx-auto">
            <Markdown options={skillsMarkdownOptions}>
              {aboutMe.skills || ''}
            </Markdown>
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <Projects />

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/50 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Details Side */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Get In Touch
              </h2>
              <p className="mt-4 text-md text-slate-500 dark:text-slate-400 leading-relaxed">
                Have a project you would like to discuss, a backend role open, or questions about my AI applications? Contact me through any channel or send a direct email using the form.
              </p>
            </div>

            {/* List Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactList.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/20 night:bg-black border border-slate-200/40 dark:border-slate-800/60 night:border-purple-900/15 flex items-center gap-3.5 hover:shadow-sm transition-shadow"
                >
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 night:bg-purple-950/20 border border-slate-100 dark:border-slate-700/50 night:border-purple-900/10 shrink-0">
                    {getContactIcon(item.label)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.value.startsWith('http') ? (
                        <a href={item.value} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-violet-400 flex items-center gap-0.5">
                          Link <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter Subscription */}
            <div className="p-6 rounded-3xl bg-indigo-500/[0.03] dark:bg-violet-500/[0.03] night:bg-purple-500/[0.02] border border-indigo-500/10 dark:border-violet-500/10 night:border-purple-900/10 space-y-4">
              <h4 className="text-md font-bold text-slate-800 dark:text-slate-100">Subscribe to updates</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive notifications when I release new articles, tutorials, or open-source backend libraries.
              </p>
              <form onSubmit={handleSubscribeSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-grow px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSubLoading}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 night:bg-purple-650 night:hover:bg-purple-550 text-white font-semibold text-xs tracking-wider uppercase transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                >
                  {isSubLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Subscribe'}
                </button>
              </form>
              {subStatus.text && (
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                  subStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {subStatus.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {subStatus.text}
                </div>
              )}
            </div>
          </div>

          {/* Form Side */}
          <div className="p-6 sm:p-10 bg-white dark:bg-slate-900/40 night:bg-black/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 night:border-purple-900/10 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send Message</h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  rows="4"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell me about your project..."
                  required
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white dark:bg-slate-800 night:bg-black dark:text-white night:border-purple-900/15 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isContactLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 night:bg-purple-600 night:hover:bg-purple-500 text-white font-bold text-sm transition-colors shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
              >
                {isContactLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Message <SendHorizonal className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {contactStatus.text && (
              <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-sm font-semibold ${
                contactStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/35 dark:text-emerald-400'
                  : 'bg-rose-50 border-rose-250 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/35 dark:text-rose-450'
              }`}>
                {contactStatus.type === 'success' ? (
                  <Check className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 dark:text-rose-450 mt-0.5" />
                )}
                <span className="leading-relaxed">{contactStatus.text}</span>
              </div>
            )}
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900 night:bg-black text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-semibold text-slate-550 dark:text-slate-400">
            © {new Date().getFullYear()} Yohanes Debebe. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/yopeman" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-white transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/yohanes-debebe-71a93136b" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-white transition-colors">LinkedIn</a>
            <a href="https://t.me/yope_man" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-white transition-colors">Telegram</a>
          </div>
        </div>
      </footer>

      {/* Interactive Chatbot widget */}
      <Chatbot />

    </div>
  );
}
