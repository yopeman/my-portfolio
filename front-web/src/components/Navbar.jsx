import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { name: 'About', href: '/#about', isRouterLink: false },
  { name: 'Skills', href: '/#skills', isRouterLink: false },
  { name: 'Projects', href: '/projects', isRouterLink: true },
  { name: 'Plans', href: '/plans', isRouterLink: true },
  { name: 'Blog', href: '/blogs', isRouterLink: true },
  { name: 'Plans', href: '/plans', isRouterLink: true },
  { name: 'Feedback', href: '/feedback', isRouterLink: true },
  { name: 'Contact', href: '/#contact', isRouterLink: false },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      setHidden(currentScrollY > 120 && currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (link) => {
    if (link.isRouterLink) return location.pathname.startsWith(link.href);
    return location.pathname === '/' && location.hash === link.href.slice(1);
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b glass transition-all duration-300 ${scrolled ? 'navbar-scrolled' : 'border-slate-200/40 dark:border-slate-800/40 night:border-purple-900/10'} ${hidden && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/40">Y</div>
          <span className="text-md font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-violet-400">Yohanes DBB</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex dark:text-slate-300">
          {NAV_LINKS.map((link) => (
            link.isRouterLink ? (
              <Link key={link.name} to={link.href} aria-current={isActive(link) ? 'page' : undefined} className={`animated-underline py-1 transition-colors hover:text-indigo-600 dark:hover:text-violet-400 ${isActive(link) ? 'active text-indigo-600 dark:text-violet-400' : ''}`}>{link.name}</Link>
            ) : (
              <a key={link.name} href={link.href} aria-current={isActive(link) ? 'page' : undefined} className={`animated-underline py-1 transition-colors hover:text-indigo-600 dark:hover:text-violet-400 ${isActive(link) ? 'active text-indigo-600 dark:text-violet-400' : ''}`}>{link.name}</a>
            )
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="/#contact" className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:glow-accent sm:inline-flex">Contact Me</a>
          <button
            type="button"
            className={`hamburger relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5 focus:outline-none md:hidden ${mobileMenuOpen ? 'hamburger-open' : ''}`}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className={`hamburger-line h-0.5 w-6 bg-slate-700 dark:bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? 'hamburger-open' : ''}`} />
            <span className={`hamburger-line h-0.5 w-6 bg-slate-700 dark:bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`hamburger-line h-0.5 w-6 bg-slate-700 dark:bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? 'hamburger-open' : ''}`} />
          </button>
        </div>
      </div>

      <div id="mobile-navigation" className={`glass-strong absolute left-0 top-full w-full overflow-hidden border-b border-slate-200/50 shadow-2xl transition-all duration-300 dark:border-slate-800/60 md:hidden ${mobileMenuOpen ? 'visible max-h-80 opacity-100' : 'invisible max-h-0 opacity-0'}`}>
        <nav className={`stagger-children flex flex-col px-6 py-4 ${mobileMenuOpen ? 'revealed' : ''}`}>
          {NAV_LINKS.map((link) => (
            link.isRouterLink ? (
              <Link key={link.name} to={link.href} onClick={() => setMobileMenuOpen(false)} className={`border-b border-slate-100 py-3 text-sm font-semibold text-slate-600 last:border-0 dark:border-slate-800/60 dark:text-slate-300 ${isActive(link) ? 'text-indigo-600 dark:text-violet-400' : ''}`}>{link.name}</Link>
            ) : (
              <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`border-b border-slate-100 py-3 text-sm font-semibold text-slate-600 last:border-0 dark:border-slate-800/60 dark:text-slate-300 ${isActive(link) ? 'text-indigo-600 dark:text-violet-400' : ''}`}>{link.name}</a>
            )
          ))}
          <a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-center text-sm font-bold text-white">Contact Me</a>
        </nav>
      </div>
    </header>
  );
}
