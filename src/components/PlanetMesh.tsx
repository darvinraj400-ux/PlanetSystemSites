import { useRef, useState, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { Planet } from '../data/planets';

interface PlanetMeshProps {
  planet: Planet;
  isSelected: boolean;
  onSelect: (id: string) => void;
  time: number;
}

export function PlanetMesh({ planet, isSelected, onSelect, time }: PlanetMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

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
    if (glowRef.current) {
      const scale = isSelected ? 1.3 : hovered ? 1.15 : 1.0;
      glowRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI * 0.4;
      ringRef.current.rotation.z += 0.001;
    }
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
      {/* Planet body */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.emissiveColor}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
        <meshBasicMaterial
          color={planet.atmosphereColor}
          transparent
          opacity={isSelected ? 0.25 : hovered ? 0.15 : 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.size * 1.5, planet.size * 1.6, 64]} />
          <meshBasicMaterial
            color={planet.atmosphereColor}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Rings */}
      {planet.hasRings && (
        <mesh ref={ringRef}>
          <ringGeometry args={[planet.size * 1.6, planet.size * 2.4, 64]} />
          <meshBasicMaterial
            color={planet.ringColor || '#aaaaaa'}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export function CentralStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.001;
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#aaccff" />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial
          color="#4466ff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#2233aa"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <pointLight color="#aaccff" intensity={2} distance={100} decay={1} />
      <pointLight color="#4466ff" intensity={0.5} distance={60} decay={2} />
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
      opacity={0.15}
      lineWidth={0.5}
    />
  );
}
