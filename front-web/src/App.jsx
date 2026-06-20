import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import ProjectsSection from './components/ProjectsSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { aboutMe } from './data/portfolioData';

export default function App() {
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