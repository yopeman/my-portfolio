import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Chatbot from './Chatbot.jsx';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}