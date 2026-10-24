import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { latLonToVec3 } from '@/lib/utils';
import type { DisasterEvent } from '@/types';
import { HAZARD_MAP } from '@/types';

const EARTH_RADIUS = 2;

function EarthGlobe() {
  const groupRef = useRef<THREE.Group>(null);

  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOcean: { value: new THREE.Color('#2378A5') },
        uOceanDeep: { value: new THREE.Color('#0A2730') },
        uLand: { value: new THREE.Color('#1A4530') },
        uLandHi: { value: new THREE.Color('#2E7D5A') },
        uAtmo: { value: new THREE.Color('#39D98A') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uOcean;
        uniform vec3 uOceanDeep;
        uniform vec3 uLand;
        uniform vec3 uLandHi;
        uniform vec3 uAtmo;

        // hash + noise
        float hash(vec3 p) {
          p = fract(p * vec3(443.897, 441.423, 437.195));
          p += dot(p, p.yzx + 19.19);
          return fract((p.x + p.y) * p.z);
        }
        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec3(1.0,0.0,0.0));
          float c = hash(i + vec3(0.0,1.0,0.0));
          float d = hash(i + vec3(1.0,1.0,0.0));
          float e = hash(i + vec3(0.0,0.0,1.0));
          float g = hash(i + vec3(1.0,0.0,1.0));
          float h = hash(i + vec3(0.0,1.0,1.0));
          float k = hash(i + vec3(1.0,1.0,1.0));
          return mix(
            mix(mix(a,b,f.x), mix(c,d,f.x), f.y),
            mix(mix(e,g,f.x), mix(h,k,f.x), f.y),
            f.z
          );
        }
        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p *= 2.02;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 p = normalize(vPos) * 2.4;
          float continents = fbm(p);
          float detail = fbm(p * 3.0);
          float landMask = smoothstep(0.48, 0.52, continents);
          float coast = smoothstep(0.46, 0.52, continents);

          vec3 ocean = mix(uOceanDeep, uOcean, smoothstep(0.3, 0.5, continents));
          ocean += uAtmo * 0.04 * smoothstep(0.44, 0.5, continents);
          vec3 land = mix(uLand, uLandHi, detail);
          vec3 color = mix(ocean, land, landMask);

          // ice caps near poles
          float lat = abs(normalize(vPos).y);
          float ice = smoothstep(0.78, 0.92, lat + detail * 0.1);
          color = mix(color, vec3(0.82, 0.92, 0.95), ice * 0.7);

          // city lights / glow hints on land
          float glow = smoothstep(0.55, 0.8, detail) * landMask;
          color += uAtmo * 0.05 * glow;

          // day/night terminator — slow light sweep
          vec3 lightDir = normalize(vec3(sin(uTime * 0.05), 0.3, cos(uTime * 0.05)));
          float light = dot(normalize(vNormal), lightDir) * 0.5 + 0.5;
          light = smoothstep(0.2, 0.85, light);
          color *= 0.35 + light * 0.75;

          // rim atmosphere
          float rim = 1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
          rim = pow(rim, 2.5);
          color += uAtmo * rim * 0.18;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
    earthMaterial.uniforms.uTime.value += delta;
  });

  return (
    <group ref={groupRef}>
      <mesh material={earthMaterial}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
      </mesh>
    </group>
  );
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color('#39D98A') },
          uColor2: { value: new THREE.Color('#4FA8D8') },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 uColor;
          uniform vec3 uColor2;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            vec3 col = mix(uColor2, uColor, intensity);
            gl_FragColor = vec4(col, intensity * 0.85);
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  return (
    <mesh material={material} scale={1.18}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
    </mesh>
  );
}

function EventMarkers({ events }: { events: DisasterEvent[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const limit = Math.min(events.length, 120);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    for (let i = 0; i < limit; i++) {
      const e = events[i];
      const [x, y, z] = latLonToVec3(e.location.lat, e.location.lon, EARTH_RADIUS * 1.02);
      const pulse = 1 + Math.sin(t * 1.5 + i) * 0.18;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(pulse);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const colorArray = useMemo(() => {
    const colors = new Float32Array(limit * 3);
    for (let i = 0; i < limit; i++) {
      const c = new THREE.Color(HAZARD_MAP[events[i].category].color);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return colors;
  }, [events, limit]);

  if (limit === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, limit]}>
      <sphereGeometry args={[0.03, 12, 12]} />
      <meshBasicMaterial toneMapped={false}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </meshBasicMaterial>
    </instancedMesh>
  );
}

interface EarthSceneProps {
  events?: DisasterEvent[];
  className?: string;
}

export default function EarthScene({ events = [] }: EarthSceneProps) {
  const { camera } = useThree();
  useMemo(() => {
    camera.position.set(0, 0, 6);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <EarthGlobe />
      <Atmosphere />
      <EventMarkers events={events} />
    </>
  );
}
