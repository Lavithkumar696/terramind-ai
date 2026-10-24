import { motion, AnimatePresence } from 'framer-motion';
import { Globe2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative flex h-20 w-20 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full border border-emerald/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.span
                className="absolute inset-2 rounded-full border border-ocean/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Globe2 className="h-9 w-9 text-emerald" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 font-display text-sm tracking-[0.3em] text-mint/70"
          >
            TERRAMIND AI
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="mt-4 h-px bg-gradient-to-r from-transparent via-emerald to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
