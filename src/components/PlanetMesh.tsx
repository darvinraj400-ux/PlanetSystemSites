import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { Planet } from '../data/planets';
import {
  planetVertexShader,
  planetFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
  starVertexShader,
  starFragmentShader,
  coronaVertexShader,
  coronaFragmentShader,
  ringVertexShader,
  ringFragmentShader,
} from '../shaders/planetShaders';

// Map planet IDs to shader types
const planetTypeMap: Record<string, number> = {
  vesper: 0,   // ocean
  nyx: 1,      // volcanic
  elyra: 2,    // ringed
  solune: 3,   // crystal
  aureon: 4,   // gas giant
};

interface PlanetMeshProps {
  planet: Planet;
  isSelected: boolean;
  onSelect: (id: string) => void;
  time: number;
}

export function PlanetMesh({ planet, isSelected, onSelect, time }: PlanetMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const planetType = planetTypeMap[planet.id] ?? 0;

  // Parse hex colors to vec3
  const hexToVec3 = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  const color1 = hexToVec3(planet.color);
  const emissiveColor = hexToVec3(planet.emissiveColor);
  const atmosphereColor = hexToVec3(planet.atmosphereColor);

  // Planet shader uniforms
  const planetUniforms = useMemo(() => ({
    uColor1: { value: new THREE.Vector3(...color1) },
    uColor2: { value: new THREE.Vector3(...emissiveColor) },
    uColor3: { value: new THREE.Vector3(...atmosphereColor) },
    uTime: { value: 0 },
    uNoiseScale: { value: 1.0 },
    uNoiseStrength: { value: 1.0 },
    uPlanetType: { value: planetType },
    uEmissiveStrength: { value: planet.id === 'nyx' ? 1.5 : 0.3 },
    uLightDir: { value: new THREE.Vector3(0, 0, 0) }, // Will be updated each frame
  }), [planetType]);

  const atmosphereUniforms = useMemo(() => ({
    uAtmosphereColor: { value: new THREE.Vector3(...atmosphereColor) },
    uIntensity: { value: planet.id === 'vesper' ? 1.2 : 0.8 },
    uLightDir: { value: new THREE.Vector3(0, 0, 0) },
  }), []);

  const ringUniforms = useMemo(() => ({
    uRingColor: { value: new THREE.Vector3(...hexToVec3(planet.ringColor || '#aaaaaa')) },
    uInnerRadius: { value: planet.size * 1.6 },
    uOuterRadius: { value: planet.size * 2.4 },
    uTime: { value: 0 },
  }), []);

  const orbitAngle = time * planet.orbitSpeed * 100;
  const x = Math.cos(orbitAngle) * planet.orbitRadius;
  const z = Math.sin(orbitAngle) * planet.orbitRadius;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += planet.rotationSpeed;
    }
    if (atmosphereRef.current) {
      const scale = isSelected ? 1.18 : hovered ? 1.12 : 1.08;
      atmosphereRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
    }
    if (ringMeshRef.current) {
      ringMeshRef.current.rotation.z += 0.0005;
    }

    // Update light direction (from star at origin)
    const lightDir = new THREE.Vector3(-x, 0, -z).normalize();
    planetUniforms.uTime.value = time;
    planetUniforms.uLightDir.value.copy(lightDir);
    atmosphereUniforms.uLightDir.value.copy(lightDir);
    ringUniforms.uTime.value = time;
  });

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(planet.id);
  }, [onSelect, planet.id]);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  return (
    <group ref={groupRef}>
      {/* Planet body with custom shader */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[planet.size, 64, 64]} />
        <shaderMaterial
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={planetUniforms}
        />
      </mesh>

      {/* Atmosphere shell */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[planet.size, 48, 48]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosphereUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Selection ring indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.size * 1.6, planet.size * 1.65, 64]} />
          <meshBasicMaterial
            color={planet.atmosphereColor}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Rings for Elyra and Aureon */}
      {planet.hasRings && (
        <mesh ref={ringMeshRef} rotation={[Math.PI * 0.42, 0, 0.1]}>
          <ringGeometry args={[planet.size * 1.5, planet.size * 2.5, 128, 1]} />
          <shaderMaterial
            vertexShader={ringVertexShader}
            fragmentShader={ringFragmentShader}
            uniforms={ringUniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Cloud layer for ocean planet */}
      {planet.id === 'vesper' && (
        <mesh rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[planet.size * 1.01, 48, 48]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.08}
            roughness={1}
          />
        </mesh>
      )}
    </group>
  );
}

export function CentralStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);

  const starUniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  const coronaUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.005;
      meshRef.current.rotation.x = Math.sin(t * 0.003) * 0.1;
    }
    if (coronaRef.current) {
      const pulse = 1.0 + Math.sin(t * 0.4) * 0.03;
      coronaRef.current.scale.set(pulse, pulse, pulse);
    }
    if (outerGlowRef.current) {
      const pulse2 = 1.0 + Math.sin(t * 0.2) * 0.05;
      outerGlowRef.current.scale.set(pulse2, pulse2, pulse2);
    }
    starUniforms.uTime.value = t;
    coronaUniforms.uTime.value = t;
  });

  return (
    <group>
      {/* Star surface with shader */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial
          vertexShader={starVertexShader}
          fragmentShader={starFragmentShader}
          uniforms={starUniforms}
        />
      </mesh>

      {/* Inner corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[3.2, 48, 48]} />
        <shaderMaterial
          vertexShader={coronaVertexShader}
          fragmentShader={coronaFragmentShader}
          uniforms={coronaUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer glow layers */}
      <mesh>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial
          color="#4466cc"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial
          color="#2233aa"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Lens flare sprite */}
      <sprite scale={[20, 20, 1]}>
        <spriteMaterial
          color="#aaccff"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
        />
      </sprite>

      {/* Lighting */}
      <pointLight color="#aaccff" intensity={3} distance={120} decay={1.5} />
      <pointLight color="#6688ff" intensity={1} distance={80} decay={2} />
    </group>
  );
}

export function OrbitPaths({ planets }: { planets: Planet[] }) {
  return (
    <group>
      {planets.map((planet) => (
        <OrbitRing key={planet.id} radius={planet.orbitRadius} color={planet.atmosphereColor} />
      ))}
    </group>
  );
}

function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
  }

  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={0.12}
      lineWidth={0.5}
    />
  );
}
