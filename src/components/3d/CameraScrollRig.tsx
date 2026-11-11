import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import {
  computeCameraPose,
  ROOM_INITIAL_LOOKAT,
  ROOM_INITIAL_POSITION,
} from '../../utils/cameraScrollMath';

interface CameraScrollRigProps {
  scrollProgress: number;
}

// Snappy responsiveness (18) eliminates sluggish double-damping delay on scroll
const DAMP_LAMBDA = 18;

export const CameraScrollRig: React.FC<CameraScrollRigProps> = ({
  scrollProgress,
}) => {
  const { camera, scene } = useThree();
  (window as any).__THREE_SCENE__ = scene;
  (window as any).__THREE_CAMERA__ = camera;
  const currentPosRef = useRef(
    new Vector3(ROOM_INITIAL_POSITION[0], ROOM_INITIAL_POSITION[1], ROOM_INITIAL_POSITION[2])
  );
  const currentLookAtRef = useRef(
    new Vector3(ROOM_INITIAL_LOOKAT[0], ROOM_INITIAL_LOOKAT[1], ROOM_INITIAL_LOOKAT[2])
  );
  const targetVecRef = useRef(new Vector3());
  const lookAtVecRef = useRef(new Vector3());
  const pointerTargetRef = useRef({ x: 0, y: 0 });

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
    const pose = computeCameraPose(scrollProgress, pointerTargetRef.current);

    targetVecRef.current.set(pose.position[0], pose.position[1], pose.position[2]);
    lookAtVecRef.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2]);

    currentPosRef.current.x = MathUtils.damp(
      currentPosRef.current.x,
      targetVecRef.current.x,
      DAMP_LAMBDA,
      safeDelta
    );
    currentPosRef.current.y = MathUtils.damp(
      currentPosRef.current.y,
      targetVecRef.current.y,
      DAMP_LAMBDA,
      safeDelta
    );
    currentPosRef.current.z = MathUtils.damp(
      currentPosRef.current.z,
      targetVecRef.current.z,
      DAMP_LAMBDA,
      safeDelta
    );

    currentLookAtRef.current.x = MathUtils.damp(
      currentLookAtRef.current.x,
      lookAtVecRef.current.x,
      DAMP_LAMBDA,
      safeDelta
    );
    currentLookAtRef.current.y = MathUtils.damp(
      currentLookAtRef.current.y,
      lookAtVecRef.current.y,
      DAMP_LAMBDA,
      safeDelta
    );
    currentLookAtRef.current.z = MathUtils.damp(
      currentLookAtRef.current.z,
      lookAtVecRef.current.z,
      DAMP_LAMBDA,
      safeDelta
    );

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookAtRef.current);

    if (camera instanceof PerspectiveCamera) {
      const prevFov = camera.fov;
      camera.fov = MathUtils.damp(camera.fov, pose.fov, DAMP_LAMBDA, safeDelta);
      // Only recalculate projection matrix when FOV changes noticeably
      if (Math.abs(camera.fov - prevFov) > 0.001) {
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
};
