import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDisasterEvents } from '@/hooks/useDisasterEvents';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const EarthCanvas = lazy(() => import('@/components/earth/EarthCanvas'));

export default function Hero() {
  const { data } = useDisasterEvents();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden">
      {/* Aurora background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/4 left-1/4 h-[60vh] w-[60vh] rounded-full bg-emerald/10 blur-[120px] animate-aurora" />
        <div className="absolute top-1/3 -right-20 h-[50vh] w-[50vh] rounded-full bg-ocean/15 blur-[130px] animate-aurora" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-0 left-1/2 h-[40vh] w-[80vh] -translate-x-1/2 rounded-full bg-emerald/5 blur-[150px]" />
      </div>

      {/* 3D Earth */}
      <div className="absolute inset-0 -z-[5]">
        <ErrorBoundary
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[50vh] w-[50vh] rounded-full bg-gradient-to-br from-ocean/20 via-emerald/10 to-transparent blur-3xl animate-pulse-soft" />
            </div>
          }
        >
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-midnight-deep to-midnight" />}>
            <EarthCanvas events={data?.events ?? []} reducedMotion={reduced} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 -z-[4] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,26,27,0.65)_100%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="flex items-center gap-2 rounded-full border border-emerald/20 bg-midnight/40 px-3.5 py-1.5 backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 text-emerald" />
            <span className="font-mono text-xs tracking-widest text-mint/80">GLOBAL DISASTER INTELLIGENCE</span>
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          <span className="text-mint">Understand the planet.</span>
          <br />
          <span className="text-gradient">Anticipate the risk.</span>
          <br />
          <span className="text-mint/90">Protect what matters.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-mint/65"
        >
          A cinematic intelligence platform unifying live seismic, meteorological, and
          environmental feeds — explained and contextualized by an AI analyst grounded in
          verified data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#dashboard"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald to-ocean px-6 py-3.5 text-sm font-semibold text-midnight transition-transform hover:scale-[1.03]"
          >
            <span className="relative z-10">Explore the live map</span>
            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          </a>
          <a
            href="#ai-analyst"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-mint backdrop-blur-md transition-colors hover:border-emerald/30 hover:bg-emerald/5"
          >
            Ask the AI analyst
          </a>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-mint/50">SCROLL</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-emerald/60" />
      </motion.div>
    </section>
  );
}
