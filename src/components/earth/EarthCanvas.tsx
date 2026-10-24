import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import EarthScene from './EarthScene';
import { ParticleField } from './ParticleField';
import type { DisasterEvent } from '@/types';

function LoaderFallback() {
  return null;
}

interface EarthCanvasProps {
  events?: DisasterEvent[];
  reducedMotion?: boolean;
}

export default function EarthCanvas({ events = [], reducedMotion = false }: EarthCanvasProps) {
  const dpr = useMemo<[number, number]>(() => [1, reducedMotion ? 1 : 1.5], [reducedMotion]);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={<LoaderFallback />}>
        <EarthScene events={events} />
        <ParticleField count={reducedMotion ? 150 : 400} />
      </Suspense>
    </Canvas>
  );
}
