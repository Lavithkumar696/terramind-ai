import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { HazardCategory } from '@/types';
import { HAZARD_MAP, SEVERITY_META } from '@/types';
import { useDisasterEvents } from '@/hooks/useDisasterEvents';
import { filterEvents, formatRelativeTime, formatLatLon } from '@/lib/utils';
import { Reveal } from '@/components/ui/Reveal';

interface HazardPageProps {
  category: HazardCategory;
  onBack: () => void;
  onAskAI: (question: string) => void;
}

const PREPAREDNESS: Record<HazardCategory, string[]> = {
  earthquake: [
    'Drop, Cover, and Hold On — get under a sturdy table and protect your head and neck.',
    'Secure heavy furniture and appliances to walls to prevent tipping during shaking.',
    'Prepare a 72-hour emergency kit with water, food, and first-aid supplies.',
    'Identify safe spots in each room and practice earthquake drills with your family.',
    'After shaking stops, check for injuries and structural damage before moving.',
  ],
  flood: [
    'Move to higher ground immediately — never walk or drive through floodwaters.',
    'Keep a go-bag with documents, medications, and essentials ready.',
    'Turn off utilities at the main switches if evacuation is ordered.',
    'Avoid downed power lines and report them to authorities.',
    'Do not return home until officials declare it safe.',
  ],
  cyclone: [
    'Follow evacuation orders from local authorities without delay.',
    'Secure outdoor objects that could become projectiles in high winds.',
    'Stock up on water, non-perishable food, and battery-powered lights.',
    'Stay indoors in an interior room away from windows during the storm.',
    'Be aware of the eye — calm is temporary and winds will return from the opposite direction.',
  ],
  wildfire: [
    'Create defensible space around your home — clear vegetation and debris within 30 feet.',
    'Pack a go-bag with documents, medications, and irreplaceable items.',
    'Monitor air quality and use N95 masks if smoke is present.',
    'Follow evacuation orders immediately — wildfires move fast.',
    'Sign up for local emergency alerts and have multiple notification channels.',
  ],
  volcano: [
    'Follow evacuation orders and stay upwind of ashfall and gases.',
    'Wear an N95 mask or damp cloth over nose and mouth to avoid inhaling ash.',
    'Protect eyes with goggles and keep skin covered.',
    'Be aware of lahars (mudflows) in valleys and low-lying areas after eruptions.',
    'Clear ash from roofs to prevent collapse — do not use water hoses on dry ash.',
  ],
  tsunami: [
    'Move to high ground or inland immediately — do not wait for an official warning if you feel strong shaking.',
    'Follow evacuation routes — never use elevators during a tsunami warning.',
    'Stay away until officials confirm it is safe; multiple waves can arrive over hours.',
    'A sudden receding of the ocean is a natural warning sign — move immediately.',
    'Keep a go-bag accessible and know your community evacuation zones.',
  ],
  drought: [
    'Conserve water — fix leaks, use water-efficient fixtures, and reduce outdoor watering.',
    'Store emergency water supplies: one gallon per person per day.',
    'Follow local water-use restrictions and guidelines.',
    'Support sustainable groundwater practices in your community.',
    'Stay informed about wildfire risk, which increases during drought.',
  ],
  landslide: [
    'Watch for warning signs: cracks in ground, doors sticking, unusual water flow.',
    'Evacuate immediately if you suspect a landslide is imminent.',
    'Avoid the base of steep slopes and cliffs, especially during heavy rain.',
    'Listen for unusual sounds like trees cracking or boulders knocking.',
    'Do not return until officials confirm the area is stable.',
  ],
  extremeHeat: [
    'Stay hydrated — drink water frequently, even if not thirsty.',
    'Stay indoors in air conditioning during the hottest hours.',
    'Check on vulnerable neighbors: elderly, children, and those with health conditions.',
    'Never leave children or pets in parked vehicles.',
    'Wear lightweight, light-colored clothing and use sunscreen.',
  ],
  severeStorm: [
    'Seek shelter inside a sturdy building — avoid open areas and tall isolated trees.',
    'Stay away from windows and avoid using corded electronics during lightning.',
    'Secure outdoor objects before storms arrive.',
    'Monitor weather alerts via NOAA Weather Radio or local apps.',
    'Have a weather emergency kit with flashlight, batteries, and first aid.',
  ],
  other: [
    'Stay informed through official emergency channels.',
    'Keep an emergency kit and family communication plan ready.',
    'Follow evacuation orders and guidance from local authorities.',
    'Sign up for local emergency notification systems.',
  ],
};

const OFFICIAL_LINKS: Record<HazardCategory, { label: string; url: string }[]> = {
  earthquake: [
    { label: 'USGS Earthquakes', url: 'https://earthquake.usgs.gov' },
    { label: 'FEMA Earthquake Safety', url: 'https://www.fema.gov/emergency-managers/risk-management/earthquake' },
  ],
  flood: [
    { label: 'NOAA Flood Safety', url: 'https://www.weather.gov/safety/flood' },
    { label: 'FEMA Flood', url: 'https://www.ready.gov/floods' },
  ],
  cyclone: [
    { label: 'NOAA Hurricane Safety', url: 'https://www.weather.gov/safety/hurricane' },
    { label: 'Ready.gov Hurricanes', url: 'https://www.ready.gov/hurricanes' },
  ],
  wildfire: [
    { label: 'Ready.gov Wildfires', url: 'https://www.ready.gov/wildfires' },
    { label: 'USGS Fire Information', url: 'https://www.usgs.gov/programs/natural-hazards' },
  ],
  volcano: [
    { label: 'USGS Volcanoes', url: 'https://www.usgs.gov/programs/VHP' },
    { label: 'Smithsonian Global Volcanism', url: 'https://volcano.si.edu' },
  ],
  tsunami: [
    { label: 'NOAA Tsunami', url: 'https://www.weather.gov/safety/tsunami' },
    { label: 'Ready.gov Tsunamis', url: 'https://www.ready.gov/tsunamis' },
  ],
  drought: [
    { label: 'NOAA Drought', url: 'https://www.weather.gov/safety/drought' },
    { label: 'U.S. Drought Monitor', url: 'https://droughtmonitor.unl.edu' },
  ],
  landslide: [
    { label: 'USGS Landslides', url: 'https://www.usgs.gov/programs/natural-hazards/landslide-hazards' },
    { label: 'Ready.gov Landslides', url: 'https://www.ready.gov/landslides-debris-flow' },
  ],
  extremeHeat: [
    { label: 'CDC Extreme Heat', url: 'https://www.cdc.gov/extreme-heat/' },
    { label: 'Ready.gov Heat', url: 'https://www.ready.gov/heat' },
  ],
  severeStorm: [
    { label: 'NOAA Thunderstorm Safety', url: 'https://www.weather.gov/safety/thunderstorm' },
    { label: 'Ready.gov Thunderstorms', url: 'https://www.ready.gov/thunderstorms-lightning' },
  ],
  other: [
    { label: 'Ready.gov', url: 'https://www.ready.gov' },
    { label: 'FEMA', url: 'https://www.fema.gov' },
  ],
};

export default function HazardPage({ category, onBack, onAskAI }: HazardPageProps) {
  const { data } = useDisasterEvents();
  const meta = HAZARD_MAP[category];
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[meta.icon] ?? Icons.Globe;

  const events = useMemo(
    () => filterEvents(data?.events ?? [], { categories: [category] }).slice(0, 20),
    [data, category]
  );

  const askAboutCategory = () => {
    onAskAI(`Give me an overview of ${meta.label.toLowerCase()} — what causes them, recent activity, and key preparedness advice.`);
  };

  return (
    <div className="min-h-screen bg-midnight pt-24">
      {/* Atmospheric backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute top-0 left-1/4 h-[50vh] w-[50vh] rounded-full blur-[130px]"
          style={{ background: `${meta.color}12` }}
        />
        <div className="absolute bottom-0 right-1/4 h-[40vh] w-[40vh] rounded-full bg-ocean/8 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Back */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-mint/55 transition-all duration-200 hover:text-mint hover:translate-x-[-4px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to explorer
        </button>

        {/* Header */}
        <Reveal>
          <div className="flex items-start gap-5">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
            >
              <Icon className="h-8 w-8" style={{ color: meta.color }} strokeWidth={1.6} />
            </span>
            <div>
              <p className="font-mono text-xs tracking-[0.3em]" style={{ color: `${meta.color}99` }}>
                {meta.short.toUpperCase()}
              </p>
              <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-mint sm:text-5xl">
                {meta.label}
              </h1>
              <p className="mt-2 max-w-2xl text-mint/60">{meta.description}</p>
            </div>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={0.1}>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <StatBox label="Recent Events" value={events.length.toString()} color={meta.color} />
            <StatBox
              label="Severe+"
              value={events.filter((e) => e.severity === 'extreme' || e.severity === 'severe').length.toString()}
              color="#FFB054"
            />
            <StatBox
              label="Data Source"
              value={events[0]?.source ?? (data?.usedDemo ? 'demo' : '—')}
              color="#4FA8D8"
            />
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Events */}
          <Reveal delay={0.15}>
            <div className="glass-dark rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-xs tracking-widest text-mint/50">RECENT {meta.label.toUpperCase()}</h2>
                <span className="text-xs text-mint/40">{events.length} events</span>
              </div>
              {events.length === 0 ? (
                <div className="py-10 text-center">
                  <Icon className="mx-auto h-10 w-10 text-mint/20" />
                  <p className="mt-3 text-sm text-mint/45">No recent {meta.label.toLowerCase()} in the live feed.</p>
                  <p className="mt-1 text-xs text-mint/30">Check back as feeds update throughout the day.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((e) => {
                    const sev = SEVERITY_META[e.severity];
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition-all duration-200 hover:border-white/12 hover:bg-white/[0.04]"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: sev.color, boxShadow: `0 0 6px ${sev.color}` }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-mint/90">{e.title}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mint/45">
                            <MapPin className="h-3 w-3" />
                            {e.place ?? formatLatLon(e.location.lat, e.location.lon)}
                            <span className="font-mono">{formatRelativeTime(e.timestamp)}</span>
                          </p>
                        </div>
                        {e.magnitude && (
                          <span className="font-display text-lg font-semibold text-gradient-emerald">
                            {e.magnitude.toFixed(1)}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>

          {/* Preparedness + links */}
          <div className="space-y-5">
            <Reveal delay={0.2}>
              <div className="glass-dark rounded-2xl p-5">
                <h2 className="font-mono text-xs tracking-widest text-mint/50">PREPAREDNESS</h2>
                <ul className="mt-4 space-y-3">
                  {PREPAREDNESS[category].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-mint/70">
                      <span className="font-mono text-xs" style={{ color: meta.color }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="glass-dark rounded-2xl p-5">
                <h2 className="font-mono text-xs tracking-widest text-mint/50">OFFICIAL RESOURCES</h2>
                <div className="mt-4 space-y-2">
                  {OFFICIAL_LINKS[category].map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-mint/75 transition-all duration-200 hover:border-emerald/30 hover:text-mint hover:scale-[1.02]"
                    >
                      <ExternalLink className="h-4 w-4 text-ocean-light" />
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <button
                onClick={askAboutCategory}
                className="btn-primary w-full rounded-2xl px-5 py-4 text-sm font-semibold"
              >
                Ask the AI analyst about {meta.label.toLowerCase()}
              </button>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass-dark rounded-xl p-4">
      <p className="font-mono text-[10px] tracking-widest text-mint/40">{label.toUpperCase()}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
