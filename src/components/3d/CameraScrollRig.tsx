import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import {
  computeCameraPose,
  ROOM_INITIAL_LOOKAT,
  ROOM_INITIAL_POSITION,
} from '../../utils/cameraScrollMath';

interface CameraScrollRigProps {
  scrollProgress: number;
  pointer: { x: number; y: number };
}

export const CameraScrollRig: React.FC<CameraScrollRigProps> = ({
  scrollProgress,
  pointer,
}) => {
  const { camera } = useThree();
  const currentPosRef = useRef(
    new Vector3(ROOM_INITIAL_POSITION[0], ROOM_INITIAL_POSITION[1], ROOM_INITIAL_POSITION[2])
  );
  const currentLookAtRef = useRef(
    new Vector3(ROOM_INITIAL_LOOKAT[0], ROOM_INITIAL_LOOKAT[1], ROOM_INITIAL_LOOKAT[2])
  );
  const targetVecRef = useRef(new Vector3());
  const lookAtVecRef = useRef(new Vector3());

  useFrame(() => {
    const pose = computeCameraPose(scrollProgress, pointer);

    targetVecRef.current.set(pose.position[0], pose.position[1], pose.position[2]);
    lookAtVecRef.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2]);

    currentPosRef.current.lerp(targetVecRef.current, 0.14);
    currentLookAtRef.current.lerp(lookAtVecRef.current, 0.14);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookAtRef.current);

    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - pose.fov) > 0.05) {
      camera.fov += (pose.fov - camera.fov) * 0.14;
      camera.updateProjectionMatrix();
    }
  });

  return null;
};
