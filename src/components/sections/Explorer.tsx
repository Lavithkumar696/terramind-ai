import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { HAZARDS } from '@/types';
import type { HazardCategory } from '@/types';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/ui/Reveal';

interface ExplorerProps {
  onSelect?: (cat: HazardCategory) => void;
}

export default function Explorer({ onSelect }: ExplorerProps) {
  const [hovered, setHovered] = useState<HazardCategory | null>(null);

  return (
    <section id="explorer" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.3em] text-emerald/70">04 · EXPLORE</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-mint sm:text-5xl">
            Disaster Explorer
          </h2>
          <p className="mt-3 max-w-xl text-mint/55">
            Browse hazard categories to understand each threat, view live events, and access
            preparedness guidance.
          </p>
        </Reveal>

        <StaggerGroup className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HAZARDS.map((h) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[h.icon] ?? Icons.Globe;
            const isHovered = hovered === h.category;
            return (
              <StaggerItem key={h.category}>
                <motion.button
                  onMouseEnter={() => setHovered(h.category)}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ y: -6 }}
                  onClick={() => onSelect?.(h.category)}
                  className="group relative w-full overflow-hidden rounded-2xl p-6 text-left transition-all"
                  style={{
                    background: isHovered
                      ? `linear-gradient(135deg, ${h.color}15, ${h.color}05)`
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isHovered ? `${h.color}40` : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: h.color }}
                  />
                  <div className="relative flex items-start justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${h.color}15`, border: `1px solid ${h.color}30` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: h.color }} strokeWidth={1.6} />
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-mint/30">
                      {h.short.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-mint">{h.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mint/55">{h.description}</p>
                  <span
                    className="mt-4 inline-flex items-center gap-1.5 text-xs transition-colors"
                    style={{ color: h.accent }}
                  >
                    Explore events
                    <Icons.ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
