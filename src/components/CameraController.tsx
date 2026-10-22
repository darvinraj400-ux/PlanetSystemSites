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
  const targetPos = useRef(new THREE.Vector3(0, 15, 35));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (selectedPlanet && !isOverview) {
      // Calculate current planet position based on time
      const orbitAngle = time * selectedPlanet.orbitSpeed * 100;
      const px = Math.cos(orbitAngle) * selectedPlanet.orbitRadius;
      const pz = Math.sin(orbitAngle) * selectedPlanet.orbitRadius;
      const dist = selectedPlanet.size * 4 + 3;
      
      targetPos.current.set(px + dist * 0.7, dist * 0.4, pz + dist * 0.8);
      targetLook.current.set(px, 0, pz);
    } else {
      targetPos.current.set(0, 15, 35);
      targetLook.current.set(0, 0, 0);
    }

    camera.position.lerp(targetPos.current, 0.02);
    currentLook.current.lerp(targetLook.current, 0.02);
    camera.lookAt(currentLook.current);
  });

  return null;
}
