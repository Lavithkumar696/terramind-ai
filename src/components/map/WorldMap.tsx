import { useMemo, useState } from 'react';

// Simplified world continent outlines (low-poly, designed for projection overlay).
// Coordinates are [lon, lat] polygon rings. Not geographically exhaustive — stylized.
const CONTINENTS: number[][][] = [
  // North America (rough)
  [[-168,66],[-156,71],[-128,70],[-95,72],[-80,73],[-60,68],[-55,60],[-60,52],[-70,47],[-75,40],[-80,32],[-95,28],[-100,22],[-110,24],[-115,30],[-125,33],[-128,40],[-125,48],[-135,55],[-150,58],[-165,60],[-168,66]],
  // South America
  [[-78,12],[-70,12],[-60,8],[-50,5],[-40,-5],[-35,-8],[-38,-22],[-48,-28],[-58,-35],[-65,-42],[-70,-52],[-73,-45],[-72,-30],[-75,-18],[-78,-5],[-78,12]],
  // Europe + Scandinavia
  [[-10,36],[-5,36],[0,43],[5,43],[8,44],[12,45],[15,45],[20,42],[28,41],[30,45],[35,47],[40,50],[45,55],[50,60],[55,65],[50,70],[40,70],[30,68],[20,68],[10,64],[5,58],[0,55],[-5,50],[-10,45],[-10,36]],
  // Africa
  [[-17,14],[-10,8],[-5,5],[0,5],[8,4],[12,4],[15,12],[20,14],[30,15],[35,18],[40,12],[45,12],[50,18],[52,25],[48,30],[42,35],[35,32],[30,30],[25,30],[18,32],[10,33],[5,35],[0,32],[-8,28],[-12,22],[-17,18],[-17,14]],
  // Asia
  [[40,50],[45,45],[50,40],[55,35],[60,30],[65,25],[70,22],[75,18],[80,8],[85,8],[90,12],[95,15],[100,12],[105,10],[108,12],[110,18],[115,22],[120,25],[122,30],[125,35],[130,38],[135,42],[140,45],[145,50],[150,55],[155,60],[160,65],[170,68],[175,70],[170,72],[150,75],[130,72],[110,72],[90,72],[70,72],[60,68],[55,65],[50,60],[45,55],[40,50]],
  // Australia
  [[115,-20],[125,-15],[135,-12],[142,-12],[148,-18],[152,-25],[150,-32],[145,-38],[140,-38],[130,-32],[120,-32],[115,-28],[115,-20]],
  // Greenland
  [[-50,60],[-40,62],[-30,65],[-20,70],[-25,75],[-40,78],[-50,75],[-55,70],[-50,60]],
  // Indonesia/Philippines (rough island cluster)
  [[95,5],[105,5],[115,0],[125,-3],[130,-5],[125,-8],[115,-8],[105,-6],[100,-2],[95,5]],
];

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  color: string;
  title: string;
  magnitude?: number;
  severity: string;
  source: string;
  place?: string;
  country?: string;
}

interface WorldMapProps {
  width?: number;
  height?: number;
  onMarkerClick?: (id: string) => void;
  activeId?: string | null;
  events: MapMarker[];
}

export default function WorldMap({ width = 1000, height = 500, events, onMarkerClick, activeId }: WorldMapProps) {
  const [hovered, setHovered] = useState<MapMarker | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Equirectangular projection
  const project = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  const paths = useMemo(() => {
    return CONTINENTS.map((ring) => {
      const pts = ring.map(([lon, lat]) => {
        const [x, y] = project(lon, lat);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      return `M ${pts.join(' L ')} Z`;
    });
  }, [width, height]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        setMouse({
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        });
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--bg-soft)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--bg-deep)" stopOpacity="0.2" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={width} height={height} fill="url(#oceanGrad)" />

      {/* grid lines */}
      <g stroke="#4FA8D8" strokeOpacity="0.08" strokeWidth="0.5">
        {[-60, -30, 0, 30, 60].map((lat) => {
          const [, y] = project(0, lat);
          return <line key={`lat-${lat}`} x1="0" y1={y} x2={width} y2={y} />;
        })}
        {[-120, -60, 0, 60, 120].map((lon) => {
          const [x] = project(lon, 0);
          return <line key={`lon-${lon}`} x1={x} y1="0" x2={x} y2={height} />;
        })}
      </g>

      {/* continents */}
      <g
        fill="var(--emerald)"
        fillOpacity="0.15"
        stroke="var(--emerald)"
        strokeOpacity="0.3"
        strokeWidth="0.8"
        strokeLinejoin="round"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* event markers */}
      <g filter="url(#glow)">
        {events.map((e) => {
          const [x, y] = project(e.lon, e.lat);
          const active = e.id === activeId;
          const isHovered = hovered?.id === e.id;
          return (
            <g
              key={e.id}
              transform={`translate(${x},${y})`}
              onClick={() => onMarkerClick?.(e.id)}
              onMouseEnter={() => setHovered(e)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Large transparent hit area for easier clicking */}
              <circle r={14} fill="transparent" />

              {/* Pulsing outer ring */}
              <circle r="9" fill="none" stroke={e.color} strokeOpacity="0.4" strokeWidth="1">
                <animate attributeName="r" values="4;12;4" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
              </circle>

              {/* Main marker */}
              <circle
                r={active || isHovered ? 6 : 3.5}
                fill={e.color}
                fillOpacity="0.9"
                style={{ transition: 'r 0.15s ease' }}
              >
                <animate
                  attributeName="r"
                  values={active ? '6;8;6' : '3.5;5;3.5'}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </g>

      {/* Hover tooltip */}
      {hovered && (
        <g pointerEvents="none" style={{ pointerEvents: 'none' }}>
          {(() => {
            const [hx, hy] = project(hovered.lon, hovered.lat);
            const tipW = 220;
            const tipH = 64;
            // Position tooltip, flipping if near edge
            const flipX = hx + tipW / 2 > width - 10;
            const flipY = hy - tipH - 16 < 10;
            const tx = flipX ? hx - tipW - 16 : hx + 16;
            const ty = flipY ? hy + 16 : hy - tipH - 16;
            return (
              <g transform={`translate(${tx},${ty})`}>
                <rect
                  width={tipW}
                  height={tipH}
                  rx={10}
                  fill="var(--bg-deep)"
                  fillOpacity="0.95"
                  stroke={hovered.color}
                  strokeOpacity="0.35"
                  strokeWidth="0.8"
                />
                <text x={12} y={20} fill={hovered.color} fontSize="11" fontWeight="600" fontFamily="monospace">
                  {hovered.source.toUpperCase()}
                </text>
                <text x={12} y={38} fill="var(--text-primary)" fontSize="12" fontWeight="500">
                  {hovered.magnitude !== undefined
                    ? `M${hovered.magnitude.toFixed(1)} — `
                    : ''}
                  {hovered.title.length > 32
                    ? hovered.title.slice(0, 30) + '…'
                    : hovered.title}
                </text>
                <text x={12} y={54} fill="var(--text-primary)" fillOpacity="0.5" fontSize="10">
                  {hovered.place || hovered.country || `${hovered.lat.toFixed(2)}°, ${hovered.lon.toFixed(2)}°`}
                  {' · '}
                  {hovered.severity}
                </text>
              </g>
            );
          })()}
        </g>
      )}
    </svg>
  );
}
