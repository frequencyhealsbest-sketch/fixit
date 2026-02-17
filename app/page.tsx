import Header from '@/components/Header';
import Section from '@/components/Section';
import FloatingConsultationButton from '@/components/FloatingConsultationButton';
import Contact from '@/components/Contact';
import HeroConsultationForm from '@/components/HeroConsultationForm';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata = {
  title: 'FixIt - Post-Production & Media Enhancement',
  description: 'Professional media repair, enhancement, and post-production solutions',
};

const portfolioData = {
  video: {
    id: 'video',
    title: 'Video Solutions',
    description: 'Cinematic storytelling through expert video production and editing',
    videos: [
      { 
        id: 'abc123def4', 
        title: 'Color Correction Mastery', 
        caption: 'Before/after color grading transformation' 
      },
      { 
        id: 'abc123def4', 
        title: 'Corporate Brand Video', 
        caption: 'Professional storytelling for enterprise clients' 
      },
      { 
        id: 'abc123def4', 
        title: 'Documentary Short', 
        caption: 'Emotional narrative with cinematic appeal' 
      },
      { 
        id: 'abc123def4', 
        title: 'Product Launch', 
        caption: 'High-impact commercial showcase' 
      },
      { 
        id: 'abc123def4', 
        title: 'Event Coverage', 
        caption: 'Multi-camera live event production' 
      },
      { 
        id: 'abc123def4', 
        title: 'Music Video', 
        caption: 'Creative visual storytelling with rhythm' 
      },
    ]
  },
  audio: {
    id: 'audio',
    title: 'Audio Solutions',
    description: 'Crystal-clear sound design and audio enhancement',
    videos: [
      { 
        id: 'abc123def4', 
        title: 'Noise Reduction', 
        caption: 'Clean audio extraction from noisy environments' 
      },
      { 
        id: 'abc123def4', 
        title: 'Voice Enhancement', 
        caption: 'Professional podcast audio treatment' 
      },
      { 
        id: 'abc123def4', 
        title: 'Soundtrack Composition', 
        caption: 'Custom music scoring for video content' 
      },
      { 
        id: 'abc123def4', 
        title: 'Sound Effects Design', 
        caption: 'Immersive audio layering and mixing' 
      },
      { 
        id: 'abc123def4', 
        title: 'Dialogue Editing', 
        caption: 'Seamless conversation flow and clarity' 
      },
      { 
        id: 'abc123def4', 
        title: 'Audio Restoration', 
        caption: 'Recovering audio from damaged sources' 
      },
    ]
  },
  vfx: {
    id: 'vfx',
    title: 'VFX Solutions',
    description: 'Seamless visual effects that bring imagination to reality',
    videos: [
      { 
        id: 'abc123def4', 
        title: 'Green Screen Compositing', 
        caption: 'Realistic background replacement' 
      },
      { 
        id: 'abc123def4', 
        title: 'Motion Tracking', 
        caption: 'Precise 3D camera tracking integration' 
      },
      { 
        id: 'abc123def4', 
        title: 'Particle Effects', 
        caption: 'Dynamic simulations and explosions' 
      },
      { 
        id: 'abc123def4', 
        title: 'Matte Painting', 
        caption: 'Photorealistic environment extensions' 
      },
      { 
        id: 'abc123def4', 
        title: 'Object Removal', 
        caption: 'Clean plate generation and fixes' 
      },
      { 
        id: 'abc123def4', 
        title: 'CGI Integration', 
        caption: 'Blending 3D elements with live footage' 
      },
    ]
  },
  animation: {
    id: 'animation',
    title: 'Animation Solutions',
    description: 'Dynamic motion graphics and character animation',
    videos: [
      { 
        id: 'abc123def4', 
        title: '2D Character Animation', 
        caption: 'Expressive personality-driven movement' 
      },
      { 
        id: 'abc123def4', 
        title: 'Logo Animation', 
        caption: 'Brand identity with motion and energy' 
      },
      { 
        id: 'abc123def4', 
        title: 'Explainer Video', 
        caption: 'Clear communication through animation' 
      },
      { 
        id: 'abc123def4', 
        title: 'Motion Graphics', 
        caption: 'Data visualization and kinetic typography' 
      },
      { 
        id: 'abc123def4', 
        title: '3D Product Visualization', 
        caption: 'Photorealistic rendering and animation' 
      },
      { 
        id: 'abc123def4', 
        title: 'Title Sequences', 
        caption: 'Cinematic opening and credits design' 
      },
    ]
  },
  generativeUI: {
    id: 'generative-ui',
    title: 'Generative UI Solutions',
    description: 'Cutting-edge AI-powered interface design and development',
    videos: [
      { 
        id: 'abc123def4', 
        title: 'AI Design System', 
        caption: 'Automated component generation workflow' 
      },
      { 
        id: 'abc123def4', 
        title: 'Dynamic Layouts', 
        caption: 'Context-aware adaptive interfaces' 
      },
      { 
        id: 'abc123def4', 
        title: 'Personalized UX', 
        caption: 'User behavior-driven interface adaptation' 
      },
      { 
        id: 'abc123def4', 
        title: 'Real-time Prototyping', 
        caption: 'AI-assisted rapid design iteration' 
      },
      { 
        id: 'abc123def4', 
        title: 'Interactive Data Viz', 
        caption: 'Generative charts and dashboards' 
      },
      { 
        id: 'abc123def4', 
        title: 'Voice Interface Design', 
        caption: 'Conversational UI patterns and flows' 
      },
    ]
  }
};

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Atmospheric glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight gradient-text animate-fade-in">
            FixIt
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto animate-fade-in-delay">
            Professional Media Repair, Enhancement, and Post-Production Solutions
          </p>
          
          <HeroConsultationForm />
        </div>
      </section>

      <main>
        <Section {...portfolioData.video} />
        <Section {...portfolioData.audio} />
        <Section {...portfolioData.vfx} />
        <Section {...portfolioData.animation} />
        <Section {...portfolioData.generativeUI} />
        
        <Contact />
      </main>

      <FloatingConsultationButton />

      <Footer />
    </>
  );
}
