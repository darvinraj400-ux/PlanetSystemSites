import { useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
      
      <ambientLight intensity={0.08} />
      
      <StarField count={2500} />
      <Nebula />
      <CosmicDust count={400} />
      
      <CentralStar />
      <OrbitPaths planets={planets} />
      
      {planets.map((planet) => (
        <PlanetMesh
          key={planet.id}
          planet={planet}
          isSelected={selectedPlanet?.id === planet.id}
          onSelect={onSelectPlanet}
          time={time}
        />
      ))}

      {controlsEnabled && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={80}
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.1}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      )}
    </>
  );
}

export function Universe({ selectedPlanet, onSelectPlanet, isOverview, controlsEnabled }: UniverseProps) {
  return (
    <Canvas
      camera={{ position: [0, 15, 35], fov: 60, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ background: '#030010' }}
      onPointerMissed={() => onSelectPlanet(null)}
    >
      <color attach="background" args={['#030010']} />
      <fog attach="fog" args={['#030010', 60, 200]} />
      <Scene
        selectedPlanet={selectedPlanet}
        onSelectPlanet={onSelectPlanet}
        isOverview={isOverview}
        controlsEnabled={controlsEnabled}
      />
    </Canvas>
  );
}
