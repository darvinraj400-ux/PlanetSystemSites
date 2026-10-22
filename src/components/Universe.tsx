import { useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { StarField, Nebula, CosmicDust } from './StarField';
import { PlanetMesh, CentralStar, OrbitPaths } from './PlanetMesh';
import { CameraController } from './CameraController';
import { planets } from '../data/planets';
import type { Planet } from '../data/planets';

interface UniverseProps {
  selectedPlanet: Planet | null;
  onSelectPlanet: (id: string | null) => void;
  isOverview: boolean;
  controlsEnabled: boolean;
}

function TimeTracker({ onTimeUpdate }: { onTimeUpdate: (t: number) => void }) {
  useFrame((state) => {
    onTimeUpdate(state.clock.elapsedTime);
  });
  return null;
}

function Scene({ selectedPlanet, onSelectPlanet, isOverview, controlsEnabled }: UniverseProps) {
  const [time, setTime] = useState(0);

  const handleTimeUpdate = useCallback((t: number) => {
    setTime(t);
  }, []);

  return (
    <>
      <CameraController selectedPlanet={selectedPlanet} isOverview={isOverview} time={time} />
      <TimeTracker onTimeUpdate={handleTimeUpdate} />
      
      {/* Very subtle ambient for fill */}
      <ambientLight intensity={0.03} color="#1a1a3a" />
      
      {/* Background elements */}
      <StarField count={4000} />
      <Nebula />
      <CosmicDust count={600} />
      
      {/* Central star with realistic shader */}
      <CentralStar />
      
      {/* Orbit paths */}
      <OrbitPaths planets={planets} />
      
      {/* Planets with custom shaders */}
      {planets.map((planet) => (
        <PlanetMesh
          key={planet.id}
          planet={planet}
          isSelected={selectedPlanet?.id === planet.id}
          onSelect={onSelectPlanet}
          time={time}
        />
      ))}

      {/* Camera controls */}
      {controlsEnabled && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={4}
          maxDistance={80}
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.1}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.5}
        />
      )}
    </>
  );
}

export function Universe({ selectedPlanet, onSelectPlanet, isOverview, controlsEnabled }: UniverseProps) {
  return (
    <Canvas
      camera={{ position: [0, 12, 30], fov: 55, near: 0.1, far: 500 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 1.5]}
      style={{ background: '#020008' }}
      onPointerMissed={() => onSelectPlanet(null)}
    >
      <color attach="background" args={['#020008']} />
      <fog attach="fog" args={['#020008', 70, 200]} />
      <Scene
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
        isOverview={isOverview}
        controlsEnabled={controlsEnabled}
      />
    </Canvas>
  );
}
