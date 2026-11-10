import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Group, MathUtils, Vector3 } from 'three';

export const AVATAR_MODEL_PATH = `${import.meta.env.BASE_URL}models/avatar.glb`;

useGLTF.preload(AVATAR_MODEL_PATH);

interface LincolnAvatar3DProps {
  scrollProgress?: number;
  onRightHandBoneReady?: (bone: null) => void;
}

// Desk location in room space:
// Desk surface top is at y = 1.58.
// Main monitor is at x = -2.00, z = -0.54.
// Position on desk between monitors: x = -1.10, y = 1.58, z = 0.60.
// Base rotation pointing face towards camera: -1.043 rad (-59.7 deg).
const DESK_AVATAR_POSITION: [number, number, number] = [-1.10, 1.58, 0.60];
const BASE_ROTATION_Y = -1.043;
const BASE_ROTATION_X = 0;

export const LincolnAvatar3D: React.FC<LincolnAvatar3DProps> = ({
  onRightHandBoneReady,
}) => {
  const { scene } = useGLTF(AVATAR_MODEL_PATH);
  const bustRef = useRef<Group>(null);
  const pointerTargetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (onRightHandBoneReady) {
      onRightHandBoneReady(null);
    }
  }, [onRightHandBoneReady]);

  // Center pivot via Box3 and compute scale dynamically from model bounding box
  const { clonedScene, dynamicScale, centerOffset } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Target desk bust height: ~0.50 units (harmonious with desk and monitor scale)
    const targetHeight = 0.50;
    const scale = size.y > 0 ? targetHeight / size.y : 1;

    // Center pivot at base of model so its bottom sits right on the surface:
    // center.x, box.min.y, center.z
    const offset = new Vector3(-center.x, -box.min.y, -center.z);

    return {
      clonedScene: cloned,
      dynamicScale: scale,
      centerOffset: offset,
    };
  }, [scene]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width <= 0 || height <= 0) return;
      const x = (e.clientX / width) * 2 - 1;
      const y = -((e.clientY / height) * 2 - 1);
      pointerTargetRef.current.x = Math.max(-1, Math.min(1, x));
      pointerTargetRef.current.y = Math.max(-1, Math.min(1, y));
    };

    const handleResetNeutral = () => {
      pointerTargetRef.current.x = 0;
      pointerTargetRef.current.y = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handleResetNeutral);
    window.addEventListener('blur', handleResetNeutral);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handleResetNeutral);
      window.removeEventListener('blur', handleResetNeutral);
    };
  }, []);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1);

    if (bustRef.current) {
      // Clamped subtle head tracking: ±15° in Y, ±8° in X
      const targetRotY = BASE_ROTATION_Y + pointerTargetRef.current.x * MathUtils.degToRad(15);
      const targetRotX = BASE_ROTATION_X - pointerTargetRef.current.y * MathUtils.degToRad(8);

      bustRef.current.rotation.y = MathUtils.damp(
        bustRef.current.rotation.y,
        targetRotY,
        5,
        safeDelta
      );
      bustRef.current.rotation.x = MathUtils.damp(
        bustRef.current.rotation.x,
        targetRotX,
        5,
        safeDelta
      );
    }
  });

  return (
    // Positioned solidly on the desk surface next to the monitor, facing the visitor
    <group position={DESK_AVATAR_POSITION} ref={bustRef}>
      <primitive
        object={clonedScene}
        position={[
          centerOffset.x * dynamicScale,
          centerOffset.y * dynamicScale,
          centerOffset.z * dynamicScale,
        ]}
        scale={dynamicScale}
      />
    </group>
  );
};
