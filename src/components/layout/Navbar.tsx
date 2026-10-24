import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'AI Analyst', href: '#ai-analyst' },
  { label: 'Explorer', href: '#explorer' },
  { label: 'Preparedness', href: '#preparedness' },
  { label: 'Sources', href: '#sources' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        <a href="#top" className="flex items-center gap-2.5">
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
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-lg px-3.5 py-2 text-sm text-mint/75 transition-colors hover:bg-white/5 hover:text-mint"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald/5 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse-soft" />
            <span className="font-mono text-[10px] tracking-wider text-emerald">LIVE FEEDS</span>
          </span>
          <a
            href="#dashboard"
            className="rounded-lg bg-gradient-to-br from-emerald to-ocean px-4 py-2 text-sm font-medium text-midnight transition-transform hover:scale-[1.03]"
          >
            Open Dashboard
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-mint md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mt-2 overflow-hidden rounded-2xl glass-dark md:hidden"
          >
            <ul className="flex flex-col p-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-mint/80 hover:bg-white/5 hover:text-mint"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-2 block rounded-lg bg-gradient-to-br from-emerald to-ocean px-4 py-3 text-center font-medium text-midnight"
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
