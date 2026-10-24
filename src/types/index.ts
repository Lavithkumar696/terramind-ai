export type HazardCategory =
  | 'earthquake'
  | 'flood'
  | 'cyclone'
  | 'wildfire'
  | 'volcano'
  | 'tsunami'
  | 'drought'
  | 'landslide'
  | 'extremeHeat'
  | 'severeStorm'
  | 'other';

export type Severity = 'extreme' | 'severe' | 'moderate' | 'minor' | 'advisory' | 'info';

export type DataSource = 'USGS' | 'NASA EONET' | 'GDACS' | 'demo' | 'manual';

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface SourceLink {
  label: string;
  url: string;
}

export interface DisasterEvent {
  id: string;
  title: string;
  category: HazardCategory;
  severity: Severity;
  source: DataSource;
  sourceUrl?: string;
  sourceLinks?: SourceLink[];
  timestamp: string;
  location: GeoPoint;
  place?: string;
  country?: string;
  region?: string;
  magnitude?: number;
  magnitudeUnit?: string;
  depthKm?: number;
  felt?: number;
  tsunamiAlert?: boolean;
  alertLevel?: string;
  significance?: number;
  description?: string;
  verified: boolean;
  raw?: Record<string, unknown>;
}

export interface ProviderResult {
  events: DisasterEvent[];
  ok: boolean;
  source: DataSource;
  fetchedAt: number;
  error?: string;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface HazardMeta {
  category: HazardCategory;
  label: string;
  short: string;
  icon: string;
  color: string;
  accent: string;
  description: string;
}

export const HAZARDS: HazardMeta[] = [
  {
    category: 'earthquake',
    label: 'Earthquakes',
    short: 'Seismic',
    icon: 'Waves',
    color: '#39D98A',
    accent: '#5FEBA0',
    description: 'Sudden shaking from tectonic plate movement, with potential aftershocks and damage.',
  },
  {
    category: 'flood',
    label: 'Floods',
    short: 'Hydrological',
    icon: 'CloudRain',
    color: '#4FA8D8',
    accent: '#6FC4E8',
    description: 'Overflow of rivers, coasts, or urban drainage leading to inundation.',
  },
  {
    category: 'cyclone',
    label: 'Cyclones',
    short: 'Tropical',
    icon: 'Hurricane',
    color: '#6FC4E8',
    accent: '#9FD8F0',
    description: 'Rotating storm systems with high winds and heavy rainfall over warm waters.',
  },
  {
    category: 'wildfire',
    label: 'Wildfires',
    short: 'Thermal',
    icon: 'Flame',
    color: '#FFB054',
    accent: '#FFC97A',
    description: 'Uncontrolled vegetation fires spreading rapidly in dry, windy conditions.',
  },
  {
    category: 'volcano',
    label: 'Volcanic Eruptions',
    short: 'Geologic',
    icon: 'Mountain',
    color: '#FF7A54',
    accent: '#FFA88A',
    description: 'Emissions of lava, ash, and gases from volcanic vents and fissures.',
  },
  {
    category: 'tsunami',
    label: 'Tsunamis',
    short: 'Ocean wave',
    icon: 'Tsunami',
    color: '#2378A5',
    accent: '#4FA8D8',
    description: 'Ocean wave series triggered by underwater seismic or volcanic activity.',
  },
  {
    category: 'drought',
    label: 'Droughts',
    short: 'Climatological',
    icon: 'Sun',
    color: '#FFB054',
    accent: '#FFD08A',
    description: 'Prolonged deficits in precipitation leading to water scarcity.',
  },
  {
    category: 'landslide',
    label: 'Landslides',
    short: 'Mass movement',
    icon: 'TriangleAlert',
    color: '#B88A54',
    accent: '#D4A878',
    description: 'Downslope movement of rock and soil under gravity, often rain-triggered.',
  },
  {
    category: 'extremeHeat',
    label: 'Extreme Heat',
    short: 'Heatwave',
    icon: 'ThermometerSun',
    color: '#FF7A54',
    accent: '#FF9D80',
    description: 'Dangerously high temperatures posing risk to health and infrastructure.',
  },
  {
    category: 'severeStorm',
    label: 'Severe Storms',
    short: 'Convective',
    icon: 'Zap',
    color: '#9FD8F0',
    accent: '#C0E8F8',
    description: 'Thunderstorms, hail, damaging winds, and tornado activity.',
  },
  {
    category: 'other',
    label: 'Other Hazards',
    short: 'General',
    icon: 'Globe',
    color: '#B8F3D0',
    accent: '#D6FBE5',
    description: 'Additional natural hazards tracked across global feeds.',
  },
];

export const HAZARD_MAP: Record<HazardCategory, HazardMeta> = HAZARDS.reduce(
  (acc, h) => ({ ...acc, [h.category]: h }),
  {} as Record<HazardCategory, HazardMeta>
);

export const SEVERITY_META: Record<Severity, { label: string; color: string; rank: number }> = {
  extreme: { label: 'Extreme', color: '#FF7A54', rank: 5 },
  severe: { label: 'Severe', color: '#FFB054', rank: 4 },
  moderate: { label: 'Moderate', color: '#39D98A', rank: 3 },
  minor: { label: 'Minor', color: '#4FA8D8', rank: 2 },
  advisory: { label: 'Advisory', color: '#6FC4E8', rank: 1 },
  info: { label: 'Info', color: '#B8F3D0', rank: 0 },
};
