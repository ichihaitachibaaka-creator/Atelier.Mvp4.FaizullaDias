import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import FeatureSection from '@/components/FeatureSection';
import Showcase from '@/components/Showcase';
import Benefits from '@/components/Benefits';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import Workspace from '@/pages/Workspace';
import Dashboard from '@/pages/Dashboard';

function LandingPage({ onAuthClick }: { onAuthClick: () => void }) {
  return (
    <>
      <Navbar onAuthClick={onAuthClick} />
      <main>
        <Hero />
        <HowItWorks />
        <FeatureSection />
        <Showcase />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-cream text-ink overflow-x-hidden">
        <Routes>
          <Route path="/" element={<LandingPage onAuthClick={() => setAuthOpen(true)} />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    </AuthProvider>
  );
}

export default App;
