import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { name: 'About', to: '/about' },
  { name: 'Skills', to: '/skills' },
  { name: 'Projects', to: '/projects' },
  { name: 'Roadmap', to: '/plans' },
  { name: 'Blog', to: '/blogs' },
  { name: 'Feedback', to: '/feedback' },
];

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      // Auto-hide only when scrolling down past the header, and never while
      // the mobile drawer is open.
      setHidden(currentScrollY > 160 && currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigating away closes the drawer. Adjusting state during render (rather
  // than in an effect) avoids a second commit just to reset the menu.
  const routeKey = `${pathname}${hash}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (routeKey !== lastRouteKey) {
    setLastRouteKey(routeKey);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isActive = (link) => {
    const [path, targetHash] = link.to.split('#');
    if (targetHash) return pathname === path && hash === `#${targetHash}`;
    if (path === '/') return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const drawerHidden = hidden && !mobileMenuOpen;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'navbar-scrolled border-b border-slate-200/60 dark:border-slate-800/60 night:border-purple-900/10'
          : 'border-b border-transparent'
      } ${drawerHidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="glass absolute inset-0 -z-10" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="focus-ring group flex items-center gap-2.5 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-base font-black text-white shadow-lg shadow-indigo-600/25 transition-transform duration-300 group-hover:scale-110">
            Y
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-violet-300">
              Yohanes Debebe
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
              Software Developer
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={`focus-ring relative rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? 'text-indigo-600 dark:text-violet-300'
                    : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-violet-300'
                }`}
              >
                {link.name}
                <span
                  className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-transform duration-300 ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/contact" className="focus-ring btn-primary hidden text-xs sm:inline-flex">
            Contact me
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={`hamburger focus-ring relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg md:hidden ${
              mobileMenuOpen ? 'hamburger-open' : ''
            }`}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="hamburger-line h-0.5 w-5 rounded-full bg-slate-700 dark:bg-slate-200" />
            <span className="hamburger-line h-0.5 w-5 rounded-full bg-slate-700 dark:bg-slate-200" />
            <span className="hamburger-line h-0.5 w-5 rounded-full bg-slate-700 dark:bg-slate-200" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-navigation"
        hidden={!mobileMenuOpen}
        className="glass-strong absolute left-0 top-full w-full overflow-hidden border-b border-slate-200/60 shadow-2xl dark:border-slate-800/60 md:hidden"
      >
        <nav className="stagger-children revealed flex flex-col gap-1 px-5 py-5" aria-label="Mobile">
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`focus-ring flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-600 dark:bg-violet-500/10 dark:text-violet-300'
                    : 'text-slate-600 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/70'
                }`}
              >
                {link.name}
                <ArrowRight className="h-4 w-4 opacity-40" aria-hidden="true" />
              </Link>
            );
          })}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-primary mt-3 w-full"
          >
            Contact me
          </Link>
        </nav>
      </div>
    </header>
  );
}
