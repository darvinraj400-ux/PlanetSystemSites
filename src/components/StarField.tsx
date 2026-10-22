import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StarField({ count = 4000 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Distribute stars in a sphere
      const r = 80 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      // Star color variation (blue-white to warm yellow)
      const colorType = Math.random();
      if (colorType < 0.3) {
        // Blue-white hot stars
        col[i * 3] = 0.7 + Math.random() * 0.3;
        col[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        col[i * 3 + 2] = 1.0;
      } else if (colorType < 0.6) {
        // White stars
        col[i * 3] = 0.9 + Math.random() * 0.1;
        col[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorType < 0.85) {
        // Yellow-white stars
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        col[i * 3 + 2] = 0.7 + Math.random() * 0.2;
      } else {
        // Orange/red cool stars
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.6 + Math.random() * 0.2;
        col[i * 3 + 2] = 0.3 + Math.random() * 0.2;
      }
      
      // Size variation - most stars small, few large
      const sizeRand = Math.random();
      if (sizeRand < 0.7) {
        sz[i] = 0.3 + Math.random() * 0.5;
      } else if (sizeRand < 0.9) {
        sz[i] = 0.8 + Math.random() * 0.8;
      } else {
        sz[i] = 1.5 + Math.random() * 1.5;
      }
    }
    return [pos, col, sz];
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.00008;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.00003) * 0.005;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        sizeAttenuation
        transparent
        opacity={0.9}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function Nebula() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.003;
    }
  });

  // Create multiple nebula clouds at different positions
  const nebulae = useMemo(() => {
    const items = [];
    const colors = ['#1a0a3a', '#0a1a3a', '#2a0a2a', '#0a0a4a', '#1a0530'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 60 + Math.random() * 40;
      items.push({
        position: [
          Math.cos(angle) * dist,
          (Math.random() - 0.5) * 30,
          -80 - Math.random() * 40,
        ] as [number, number, number],
        scale: 30 + Math.random() * 40,
        color: colors[i % colors.length],
        opacity: 0.08 + Math.random() * 0.1,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return items;
  }, []);

  return (
    <group ref={groupRef}>
      {nebulae.map((nebula, i) => (
        <mesh key={i} position={nebula.position} rotation={[0, 0, nebula.rotation]}>
          <planeGeometry args={[nebula.scale, nebula.scale]} />
          <meshBasicMaterial
            color={nebula.color}
            transparent
            opacity={nebula.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function CosmicDust({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      
      // Subtle purple/blue dust
      const t = Math.random();
      col[i * 3] = 0.2 + t * 0.2;
      col[i * 3 + 1] = 0.1 + t * 0.1;
      col[i * 3 + 2] = 0.4 + t * 0.3;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.0002;
      ref.current.rotation.x = state.clock.elapsedTime * 0.00015;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.3}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
