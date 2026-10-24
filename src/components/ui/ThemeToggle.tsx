import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/hooks/useTheme';

const OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const CurrentIcon = OPTIONS.find((o) => o.mode === mode)?.icon ?? Monitor;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-mint/75 transition-colors hover:bg-white/5 hover:text-mint"
        aria-label={`Theme: ${mode}. Click to change.`}
        aria-expanded={open}
      >
        <CurrentIcon className="h-[18px] w-[18px] transition-transform duration-200" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-midnight-deep p-1.5 shadow-2xl"
            role="menu"
          >
            {OPTIONS.map((o) => {
              const Icon = o.icon;
              const active = mode === o.mode;
              return (
                <button
                  key={o.mode}
                  onClick={() => {
                    setMode(o.mode);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-emerald/10 text-emerald'
                      : 'text-mint/70 hover:bg-white/5 hover:text-mint'
                  }`}
                  role="menuitemradio"
                  aria-checked={active}
                >
                  <Icon className="h-4 w-4" />
                  {o.label}
                  {active && <Check className="ml-auto h-3.5 w-3.5" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
