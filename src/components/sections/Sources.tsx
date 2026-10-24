import { motion } from 'framer-motion';
import { Database, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/ui/Reveal';

const SOURCES = [
  {
    name: 'USGS Earthquake Hazards',
    url: 'https://earthquake.usgs.gov',
    desc: 'US Geological Survey all-day earthquake feed — magnitude, depth, location, and time for seismic events worldwide.',
    endpoints: ['earthquakes/feed/v1.0/summary/all_day.geojson'],
    status: 'live',
  },
  {
    name: 'NASA EONET',
    url: 'https://eonet.gsfc.nasa.gov',
    desc: 'Earth Observatory Natural Event Tracker — open natural events including wildfires, volcanoes, floods, and severe storms.',
    endpoints: ['api/v3/events?status=open'],
    status: 'live',
  },
  {
    name: 'GDACS',
    url: 'https://www.gdacs.org',
    desc: 'Global Disaster Alert and Coordination System — near-real-time alerts for major disasters. RSS feeds referenced; structured JSON varies by hazard.',
    endpoints: ['RSS / XML feeds (hazard-specific)'],
    status: 'referenced',
  },
];

export default function Sources() {
  return (
    <section id="sources" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.3em] text-emerald/70">06 · TRANSPARENCY</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-mint sm:text-5xl">
            Sources &amp; Methodology
          </h2>
          <p className="mt-3 max-w-xl text-mint/55">
            Every event in TerraMind AI traces back to a documented public API. We label data
            sources, show timestamps, and never fabricate live events.
          </p>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-3">
          {SOURCES.map((s) => (
            <StaggerItem key={s.name}>
              <motion.a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                className="glass-dark block h-full rounded-2xl p-6 transition-colors hover:border-emerald/20"
              >
                <div className="flex items-start justify-between">
                  <Database className="h-6 w-6 text-emerald/70" />
                  <ExternalLink className="h-4 w-4 text-mint/30" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-mint">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mint/55">{s.desc}</p>
                <div className="mt-4 space-y-1">
                  {s.endpoints.map((e) => (
                    <code key={e} className="block truncate font-mono text-[11px] text-mint/40">
                      {e}
                    </code>
                  ))}
                </div>
                <span
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${
                    s.status === 'live'
                      ? 'bg-emerald/10 text-emerald'
                      : 'bg-ocean/10 text-ocean-light'
                  }`}
                >
                  {s.status === 'live' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {s.status === 'live' ? 'Live integration' : 'Referenced'}
                </span>
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal delay={0.15}>
          <div className="mt-8 glass-dark rounded-2xl p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-mint">How it works</h3>
            <ol className="mt-4 space-y-3 text-sm text-mint/60">
              <li className="flex gap-3">
                <span className="font-mono text-emerald">01</span>
                <span>Frontend calls a provider abstraction layer that fetches USGS and NASA EONET in parallel, with client-side caching and retry.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-emerald">02</span>
                <span>Each event carries its source, timestamp, coordinates, and verified status. Demo data is clearly labeled when live feeds are unreachable.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-emerald">03</span>
                <span>The AI analyst runs server-side via a Supabase Edge Function. API keys stay in environment variables and never reach the browser.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-emerald">04</span>
                <span>AI responses are grounded in the retrieved event context, cite sources, explain uncertainty, and direct to official authorities for emergencies.</span>
              </li>
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
