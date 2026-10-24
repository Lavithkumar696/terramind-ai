import { Globe2, Github, Mail } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl glass-emerald">
                  <Globe2 className="h-5 w-5 text-emerald" strokeWidth={1.8} />
                </span>
                <div className="leading-none">
                  <p className="font-display text-base font-semibold text-mint">TerraMind AI</p>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-emerald/70">INTELLIGENCE</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-sm text-mint/50">
                Understand the planet. Anticipate the risk. Protect what matters.
              </p>
              <p className="mt-4 text-xs text-mint/35">
                A cinematic disaster intelligence platform built on public scientific feeds.
              </p>
            </div>

            <FooterCol title="Platform" links={[
              { label: 'Dashboard', href: '#dashboard' },
              { label: 'AI Analyst', href: '#ai-analyst' },
              { label: 'Explorer', href: '#explorer' },
              { label: 'Preparedness', href: '#preparedness' },
            ]} />

            <FooterCol title="Data" links={[
              { label: 'USGS Earthquakes', href: 'https://earthquake.usgs.gov', ext: true },
              { label: 'NASA EONET', href: 'https://eonet.gsfc.nasa.gov', ext: true },
              { label: 'GDACS', href: 'https://www.gdacs.org', ext: true },
              { label: 'Methodology', href: '#sources' },
            ]} />

            <div>
              <h4 className="font-mono text-xs tracking-widest text-mint/40">CONNECT</h4>
              <div className="mt-4 flex gap-2">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 text-mint/60 hover:border-emerald/30 hover:text-emerald">
                  <Github className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 text-mint/60 hover:border-emerald/30 hover:text-emerald">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-mint/35 sm:flex-row">
          <p>© {new Date().getFullYear()} TerraMind AI. Data from public government &amp; scientific APIs.</p>
          <p className="text-center sm:text-right">
            Not an emergency alert system. For emergencies, follow official authorities.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string; ext?: boolean }[] }) {
  return (
    <div>
      <h4 className="font-mono text-xs tracking-widest text-mint/40">{title.toUpperCase()}</h4>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.ext ? '_blank' : undefined}
              rel={l.ext ? 'noopener noreferrer' : undefined}
              className="text-sm text-mint/55 transition-colors hover:text-emerald"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
