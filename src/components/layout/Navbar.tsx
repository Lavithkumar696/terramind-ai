import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const NAV_LINKS = [
  { label: 'Dashboard', id: 'dashboard' },
  { label: 'AI Analyst', id: 'ai-analyst' },
  { label: 'Explorer', id: 'explorer' },
  { label: 'Preparedness', id: 'preparedness' },
  { label: 'Sources', id: 'sources' },
];

function useActiveSection() {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    NAV_LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const activeSection = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      scrollToSection(id);
      setOpen(false);
    },
    [scrollToSection]
  );

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav
        className={`mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-6 ${
          scrolled ? 'glass-dark' : 'bg-transparent'
        }`}
        style={{ width: 'calc(100% - 1.5rem)' }}
      >
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, 'top')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl glass-emerald">
            <Globe2 className="h-5 w-5 text-emerald" strokeWidth={1.8} />
            <span className="absolute inset-0 rounded-xl border border-emerald/30 animate-pulse-soft" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold tracking-tight text-mint">
              TerraMind
            </span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-emerald/70">
              AI · INTELLIGENCE
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const isActive = activeSection === l.id;
            return (
              <li key={l.id} className="relative">
                <a
                  href={`#${l.id}`}
                  onClick={(e) => handleNavClick(e, l.id)}
                  className={`relative rounded-lg px-3.5 py-2 text-sm transition-colors ${
                    isActive ? 'text-mint' : 'text-mint/75 hover:bg-white/5 hover:text-mint'
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-emerald to-ocean"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <span className="flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald/5 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse-soft" />
            <span className="font-mono text-[10px] tracking-wider text-emerald">LIVE FEEDS</span>
          </span>
          <a
            href="#dashboard"
            onClick={(e) => handleNavClick(e, 'dashboard')}
            className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
          >
            Open Dashboard
          </a>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-mint transition-colors hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-3 mt-2 overflow-hidden rounded-2xl glass-dark md:hidden"
          >
            <ul className="flex flex-col p-3">
              {NAV_LINKS.map((l) => {
                const isActive = activeSection === l.id;
                return (
                  <li key={l.id}>
                    <a
                      href={`#${l.id}`}
                      onClick={(e) => handleNavClick(e, l.id)}
                      className={`block rounded-lg px-4 py-3 transition-colors ${
                        isActive
                          ? 'bg-emerald/10 text-emerald'
                          : 'text-mint/80 hover:bg-white/5 hover:text-mint'
                      }`}
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href="#dashboard"
                  onClick={(e) => handleNavClick(e, 'dashboard')}
                  className="btn-primary mt-2 block rounded-lg px-4 py-3 text-center font-medium"
                >
                  Open Dashboard
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
