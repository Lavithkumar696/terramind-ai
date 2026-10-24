import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, MapPin, Clock, ShieldCheck, ShieldAlert, Waves,
  Activity, Users, TrendingUp, Gauge, Anchor, FileText, Globe2,
} from 'lucide-react';
import type { DisasterEvent, SourceLink } from '@/types';
import { HAZARD_MAP, SEVERITY_META } from '@/types';
import { formatUTC, formatRelativeTime, formatLatLon } from '@/lib/utils';

interface EventDrawerProps {
  event: DisasterEvent | null;
  onClose: () => void;
  onAskAI?: (event: DisasterEvent) => void;
}

export default function EventDrawer({ event, onClose, onAskAI }: EventDrawerProps) {
  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-midnight/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col glass-dark border-l border-white/10"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <span className="font-mono text-xs tracking-widest text-mint/60">EVENT DETAIL</span>
              <button onClick={onClose} className="rounded-lg p-1.5 text-mint/60 hover:bg-white/5 hover:text-mint" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {(() => {
                const meta = HAZARD_MAP[event.category];
                const sev = SEVERITY_META[event.severity];
                const verifiedFacts = getVerifiedFacts(event);
                return (
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: `${meta.color}22`, color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: `${sev.color}22`, color: sev.color }}>
                        {sev.label}
                      </span>
                      {event.alertLevel && (
                        <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-300">
                          Alert: {event.alertLevel}
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-xl font-semibold leading-snug text-mint">
                      {event.title}
                    </h2>

                    {(event.place || event.country || event.region) && (
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-mint/60">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.place}
                        {event.place && event.country && <span>·</span>}
                        {event.country}
                        {event.region && <span className="text-mint/35">({event.region})</span>}
                      </p>
                    )}

                    {/* Key metrics row */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {event.magnitude !== undefined && (
                        <MetricCard icon={<Activity className="h-4 w-4" />} label="Magnitude" value={`${event.magnitude.toFixed(1)}`} unit={event.magnitudeUnit} color="#39D98A" />
                      )}
                      {event.depthKm !== undefined && (
                        <MetricCard icon={<Gauge className="h-4 w-4" />} label="Depth" value={`${event.depthKm.toFixed(1)}`} unit="km" color="#4FA8D8" />
                      )}
                      {event.felt !== undefined && event.felt > 0 && (
                        <MetricCard icon={<Users className="h-4 w-4" />} label="Felt Reports" value={event.felt.toLocaleString()} color="#6FC4E8" />
                      )}
                      {event.significance !== undefined && event.significance > 0 && (
                        <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Significance" value={event.significance.toString()} color="#FFB054" />
                      )}
                    </div>

                    {event.tsunamiAlert && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4">
                        <Anchor className="h-5 w-5 shrink-0 text-amber-300" />
                        <div>
                          <p className="text-sm font-medium text-amber-200">USGS Tsunami Flag Active</p>
                          <p className="mt-0.5 text-xs text-amber-200/70">
                            This event triggered a USGS tsunami evaluation. Follow NOAA Tsunami Warning Center guidance.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Verified facts section */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-emerald" />
                        <span className="font-mono text-[10px] tracking-widest text-emerald/70">VERIFIED FACTS FROM FEED</span>
                      </div>
                      <dl className="space-y-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm">
                        <DataRow icon={<MapPin className="h-3.5 w-3.5" />} label="Coordinates" value={formatLatLon(event.location.lat, event.location.lon)} />
                        <DataRow icon={<Clock className="h-3.5 w-3.5" />} label="Time (UTC)" value={`${formatUTC(event.timestamp)} · ${formatRelativeTime(event.timestamp)}`} />
                        <DataRow icon={<Waves className="h-3.5 w-3.5" />} label="Source" value={event.source} />
                        <DataRow icon={<Globe2 className="h-3.5 w-3.5" />} label="Region" value={event.region ?? '—'} />
                        <DataRow icon={<MapPin className="h-3.5 w-3.5" />} label="Country" value={event.country ?? '—'} />
                        <DataRow
                          icon={event.verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                          label="Verification"
                          value={event.verified ? 'Verified from live feed' : 'Demo / unverified data'}
                          valueClass={event.verified ? 'text-emerald' : 'text-amber-300'}
                        />
                      </dl>
                    </div>

                    {/* Supporting data / estimates */}
                    {verifiedFacts.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Gauge className="h-3.5 w-3.5 text-ocean-light" />
                          <span className="font-mono text-[10px] tracking-widest text-ocean-light/70">SUPPORTING DATA &amp; ESTIMATES</span>
                        </div>
                        <p className="rounded-xl border border-white/8 bg-white/[0.02] p-4 text-xs leading-relaxed text-mint/55">
                          {verifiedFacts.join(' ')}
                        </p>
                      </div>
                    )}

                    {event.description && (
                      <p className="mt-4 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm leading-relaxed text-mint/70">
                        {event.description}
                      </p>
                    )}

                    {/* Source links */}
                    {event.sourceLinks && event.sourceLinks.length > 0 ? (
                      <div className="mt-4">
                        <p className="mb-2 font-mono text-[10px] tracking-widest text-mint/40">OFFICIAL SOURCES</p>
                        <div className="space-y-2">
                          {event.sourceLinks.map((link, i) => (
                            <SourceLinkRow key={i} link={link} />
                          ))}
                        </div>
                      </div>
                    ) : event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center gap-2 rounded-xl border border-ocean/30 bg-ocean/5 px-4 py-3 text-sm text-ocean-light transition-colors hover:bg-ocean/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View original source
                      </a>
                    )}

                    {/* Emergency notice for severe events */}
                    {event.severity === 'extreme' || event.severity === 'severe' || event.tsunamiAlert ? (
                      <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-200">
                        <p className="font-medium">For urgent danger, follow official authorities.</p>
                        <p className="mt-1 text-amber-200/70">
                          If you are in an affected area, prioritize guidance from local emergency
                          management and national meteorological agencies. Do not rely on this
                          platform for real-time emergency alerts.
                        </p>
                      </div>
                    ) : null}

                    {onAskAI && (
                      <button
                        onClick={() => onAskAI(event)}
                        className="mt-4 w-full rounded-xl bg-gradient-to-br from-emerald to-ocean px-4 py-3 text-sm font-semibold text-midnight transition-transform hover:scale-[1.02]"
                      >
                        Ask the AI analyst about this event
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MetricCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] tracking-widest text-mint/40">{label.toUpperCase()}</span>
      </div>
      <div className="mt-1 flex items-end gap-1">
        <span className="font-display text-2xl font-semibold" style={{ color }}>{value}</span>
        {unit && <span className="mb-0.5 text-xs text-mint/45">{unit}</span>}
      </div>
    </div>
  );
}

function DataRow({ icon, label, value, valueClass }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-mint/40">{icon}</span>
      <span className="w-24 shrink-0 text-xs text-mint/40">{label}</span>
      <span className={`text-mint/85 ${valueClass ?? ''}`}>{value}</span>
    </div>
  );
}

function SourceLinkRow({ link }: { link: SourceLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-ocean/20 bg-ocean/5 px-4 py-3 text-sm text-ocean-light transition-colors hover:bg-ocean/10"
    >
      <ExternalLink className="h-4 w-4 shrink-0" />
      <span className="truncate">{link.label}</span>
      <span className="ml-auto truncate text-xs text-mint/30">{new URL(link.url).hostname}</span>
    </a>
  );
}

function getVerifiedFacts(event: DisasterEvent): string[] {
  const facts: string[] = [];
  if (event.depthKm !== undefined) {
    facts.push(`Depth: ${event.depthKm.toFixed(1)} km — shallower events typically cause more surface shaking. This is a measured value from seismic data, not an estimate.`);
  }
  if (event.felt !== undefined && event.felt > 0) {
    facts.push(`Felt reports: ${event.felt} — this is the number of people who submitted "Did You Feel It?" reports to USGS. It indicates perceived intensity, not damage.`);
  }
  if (event.significance !== undefined && event.significance > 0) {
    facts.push(`Significance score: ${event.significance} — USGS composite metric combining magnitude, felt reports, and damage estimates. Higher values indicate greater overall impact.`);
  }
  if (event.alertLevel) {
    facts.push(`USGS PAGER alert level: ${event.alertLevel} — this is an automated impact assessment, not a direct measurement. Green = minimal impact, Yellow = moderate, Orange = significant, Red = destructive.`);
  }
  return facts;
}
