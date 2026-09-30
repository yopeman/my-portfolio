import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Chatbot from './Chatbot.jsx';

export default function PublicLayout({ children }) {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // A new page starts at the top. Hash targets resolve after the render
    // commits, so they are handled in a follow-up frame.
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Move keyboard focus too, so the jump is not purely visual.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link btn-primary text-sm">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" key={key || pathname} className="page-enter flex-grow">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
