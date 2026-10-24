import { useCallback, useEffect, useState } from 'react';
import type { DisasterEvent, HazardCategory } from '@/types';
import { HAZARD_MAP } from '@/types';
import { useDisasterEvents } from '@/hooks/useDisasterEvents';
import Preloader from '@/components/ui/Preloader';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import EventTicker from '@/components/sections/EventTicker';
import Dashboard from '@/components/sections/Dashboard';
import AIAnalyst from '@/components/sections/AIAnalyst';
import Explorer from '@/components/sections/Explorer';
import Preparedness from '@/components/sections/Preparedness';
import Sources from '@/components/sections/Sources';
import Footer from '@/components/layout/Footer';
import HazardPage from '@/components/sections/HazardPage';

const HAZARD_CATEGORIES = Object.keys(HAZARD_MAP) as HazardCategory[];

function parseHash(): { route: 'home' | 'hazard'; category?: HazardCategory } {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (h.startsWith('hazard/')) {
    const cat = h.slice('hazard/'.length) as HazardCategory;
    if (HAZARD_CATEGORIES.includes(cat)) return { route: 'hazard', category: cat };
  }
  return { route: 'home' };
}

export default function App() {
  const { data } = useDisasterEvents();
  const [aiQuestion, setAiQuestion] = useState<{ text: string; key: number } | null>(null);
  const [explorerCategory, setExplorerCategory] = useState<HazardCategory | null>(null);
  const [route, setRoute] = useState(parseHash());

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigateToHazard = useCallback((cat: HazardCategory) => {
    window.location.hash = `/hazard/${cat}`;
  }, []);

  const navigateHome = useCallback(() => {
    window.location.hash = '';
  }, []);

  const handleAskAI = useCallback((event: DisasterEvent) => {
    const text = `Explain this event: "${event.title}" (${event.source}, ${new Date(event.timestamp).toUTCString()}). Summarize likely impacts and offer preparedness advice.`;
    setAiQuestion({ text, key: Date.now() });
    navigateHome();
    setTimeout(() => {
      const el = document.getElementById('ai-analyst');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [navigateHome]);

  const handleAskAIQuestion = useCallback((question: string) => {
    setAiQuestion({ text: question, key: Date.now() });
    navigateHome();
    setTimeout(() => {
      const el = document.getElementById('ai-analyst');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [navigateHome]);

  const handleExplorerSelect = useCallback((cat: HazardCategory) => {
    navigateToHazard(cat);
  }, [navigateToHazard]);

  if (route.route === 'hazard' && route.category) {
    return (
      <div className="relative min-h-screen bg-midnight">
        <Navbar />
        <HazardPage
          category={route.category}
          onBack={navigateHome}
          onAskAI={handleAskAIQuestion}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-midnight">
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <EventTicker data={data} />
        <Dashboard onAskAI={handleAskAI} preselectCategory={explorerCategory} />
        <AIAnalyst contextEvents={data?.events ?? []} injectedQuestion={aiQuestion} />
        <Explorer onSelect={handleExplorerSelect} />
        <Preparedness />
        <Sources />
      </main>
      <Footer />
    </div>
  );
}
