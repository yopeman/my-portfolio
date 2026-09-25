import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Chatbot from './Chatbot.jsx';

export default function PublicLayout({ children }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main key={location.key || location.pathname} className="page-enter flex-grow">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
