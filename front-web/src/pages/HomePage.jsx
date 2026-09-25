import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';
import Chatbot from '../components/Chatbot.jsx';
import { aboutMe } from '../data/portfolioData.js';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <About aboutMe={aboutMe} />
      <Skills aboutMe={aboutMe} />
      <ProjectsSection />
      <Contact aboutMe={aboutMe} />
      <Footer />
      <Chatbot />
    </div>
  );
}