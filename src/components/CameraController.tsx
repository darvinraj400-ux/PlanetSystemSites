import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Planet } from '../data/planets';

interface CameraControllerProps {
  selectedPlanet: Planet | null;
  isOverview: boolean;
  time: number;
}

export function CameraController({ selectedPlanet, isOverview, time }: CameraControllerProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 12, 30));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const lerpSpeed = useRef(0.015);

  useFrame(() => {
    if (selectedPlanet && !isOverview) {
      // Calculate current planet position based on time
      const orbitAngle = time * selectedPlanet.orbitSpeed * 100;
      const px = Math.cos(orbitAngle) * selectedPlanet.orbitRadius;
      const pz = Math.sin(orbitAngle) * selectedPlanet.orbitRadius;
      
      // Position camera at an angle relative to the planet
      const dist = selectedPlanet.size * 3.5 + 2;
      const camAngle = orbitAngle + 0.8; // Offset angle for better view
      targetPos.current.set(
        px + Math.cos(camAngle) * dist,
        dist * 0.35,
        pz + Math.sin(camAngle) * dist
      );
      targetLook.current.set(px, 0, pz);
      lerpSpeed.current = 0.02;
    } else {
      // Overview position - cinematic angle
      targetPos.current.set(0, 12, 30);
      targetLook.current.set(0, 0, 0);
      lerpSpeed.current = 0.015;
    }

    camera.position.lerp(targetPos.current, lerpSpeed.current);
    currentLook.current.lerp(targetLook.current, lerpSpeed.current);
    camera.lookAt(currentLook.current);
  });

  return null;
}
