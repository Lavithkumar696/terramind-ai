import { motion } from 'framer-motion';
import { Backpack, MapPin, Radio, HeartPulse, Home, Droplets } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/ui/Reveal';

const GUIDES = [
  {
    icon: Backpack,
    title: 'Emergency Kit',
    desc: 'Water, non-perishable food, flashlight, first-aid, medications, documents — 72 hours minimum.',
    color: '#39D98A',
  },
  {
    icon: Radio,
    title: 'Stay Informed',
    desc: 'Monitor official channels: national meteorological agencies, local emergency alerts, NOAA Weather Radio.',
    color: '#4FA8D8',
  },
  {
    icon: Home,
    title: 'Shelter Plan',
    desc: 'Know safe rooms in your home, the nearest evacuation routes, and designated community shelters.',
    color: '#6FC4E8',
  },
  {
    icon: MapPin,
    title: 'Communication',
    desc: 'Establish a family meeting point and out-of-area contact. Keep phones charged and carry a backup battery.',
    color: '#39D98A',
  },
  {
    icon: Droplets,
    title: 'Water & Hygiene',
    desc: 'Store one gallon per person per day. Include purification tablets and sanitation supplies.',
    color: '#2378A5',
  },
  {
    icon: HeartPulse,
    title: 'Health & First Aid',
    desc: 'Keep a stocked first-aid kit, spare prescriptions, and know CPR basics and emergency medical contacts.',
    color: '#5FEBA0',
  },
];

export default function Preparedness() {
  return (
    <section id="preparedness" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.3em] text-emerald/70">05 · RESILIENCE</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-mint sm:text-5xl">
            Preparedness &amp; Resilience
          </h2>
          <p className="mt-3 max-w-xl text-mint/55">
            Practical, vetted guidance to help you and your community prepare before disaster
            strikes and respond effectively when it does.
          </p>
        </Reveal>

        {/* Calm emergency info panel */}
        <Reveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-emerald/20 bg-gradient-to-br from-emerald/8 to-ocean/5 p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-mint">
                  In an emergency, official channels come first
                </h3>
                <p className="mt-2 max-w-lg text-sm text-mint/60">
                  TerraMind AI provides intelligence and context — not emergency alerts. For
                  immediate danger, follow your national meteorological agency and local
                  emergency management.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <a
                  href="https://www.weather.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-emerald/30 bg-emerald/10 px-4 py-2.5 text-sm text-emerald transition-all duration-200 hover:bg-emerald/15 hover:scale-[1.03]"
                >
                  NOAA / NWS (US)
                </a>
                <a
                  href="https://www.ready.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-ocean/30 bg-ocean/10 px-4 py-2.5 text-sm text-ocean-light transition-all duration-200 hover:bg-ocean/15 hover:scale-[1.03]"
                >
                  Ready.gov
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => {
            const Icon = g.icon;
            return (
              <StaggerItem key={g.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="glass-dark h-full rounded-2xl p-6"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${g.color}15`, border: `1px solid ${g.color}30` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: g.color }} strokeWidth={1.7} />
                  </span>
                  <h4 className="mt-4 font-display text-base font-semibold text-mint">{g.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-mint/55">{g.desc}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
