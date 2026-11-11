import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils, Mesh } from 'three';

interface RubberDuck3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Classic yellow rubber duck mascot ("Rubber Duck Debugging").
 * Sits playfully on Lincoln's workstation desk in place of the penguin,
 * with subtle idle bobbing and interactive squish/bounce animation.
 */
export const RubberDuck3D: React.FC<RubberDuck3DProps> = ({
  position = [-0.20, 1.493, 2.62],
  rotation = [0, 0.48, 0],
  scale = 1.0,
}) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const squishRef = useRef(0);

  const handleClick = (e: any) => {
    e.stopPropagation();
    squishRef.current = 1.0;
  };

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;

    // Gentle idle bobbing motion (rubber duck floating rhythm)
    const idleRoll = Math.sin(t * 2.4) * 0.05;
    const idlePitch = Math.cos(t * 1.8) * 0.03;
    const idleY = Math.abs(Math.sin(t * 2.8)) * 0.008;

    groupRef.current.position.y = position[1] + idleY;
    groupRef.current.rotation.z = rotation[2] + idleRoll;
    groupRef.current.rotation.x = rotation[0] + idlePitch;

    // Squish & bounce when clicked or hovered
    squishRef.current = MathUtils.damp(squishRef.current, isHovered ? 0.25 : 0, 8, delta);
    const squishScaleY = 1.0 - squishRef.current * 0.22;
    const squishScaleXZ = 1.0 + squishRef.current * 0.14;
    groupRef.current.scale.set(
      scale * squishScaleXZ,
      scale * squishScaleY,
      scale * squishScaleXZ
    );
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setIsHovered(false);
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'auto';
        }
      }}
    >
      {/* Duck Body */}
      <mesh ref={bodyRef} position={[0, 0.15, 0]} scale={[1.15, 0.92, 1.3]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.28}
          metalness={0.04}
        />
      </mesh>

      {/* Duck Tail Tip */}
      <mesh position={[0, 0.20, 0.18]} rotation={[0.65, 0, 0]} scale={[0.8, 0.7, 1.2]}>
        <coneGeometry args={[0.07, 0.14, 16]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.28}
          metalness={0.04}
        />
      </mesh>

      {/* Left Wing */}
      <mesh
        position={[-0.17, 0.16, -0.01]}
        rotation={[0.1, 0.25, -0.22]}
        scale={[0.26, 0.65, 0.95]}
      >
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.3}
          metalness={0.04}
        />
      </mesh>

      {/* Right Wing */}
      <mesh
        position={[0.17, 0.16, -0.01]}
        rotation={[0.1, -0.25, 0.22]}
        scale={[0.26, 0.65, 0.95]}
      >
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.3}
          metalness={0.04}
        />
      </mesh>

      {/* Duck Neck & Chest */}
      <mesh position={[0, 0.26, -0.11]} scale={[0.9, 1.0, 0.9]}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.28}
          metalness={0.04}
        />
      </mesh>

      {/* Duck Head */}
      <mesh position={[0, 0.37, -0.13]}>
        <sphereGeometry args={[0.135, 24, 24]} />
        <meshStandardMaterial
          color="#facc15"
          roughness={0.28}
          metalness={0.04}
        />
      </mesh>

      {/* Orange Duck Bill / Beak */}
      <mesh
        position={[0, 0.34, -0.26]}
        rotation={[0.12, 0, 0]}
        scale={[1.25, 0.45, 1.15]}
      >
        <boxGeometry args={[0.13, 0.07, 0.14]} />
        <meshStandardMaterial
          color="#ea580c"
          roughness={0.32}
          metalness={0.02}
        />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.088, 0.40, -0.22]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial
          color="#09090b"
          roughness={0.08}
          metalness={0.2}
        />
      </mesh>
      {/* Left Eye Specular Glint */}
      <mesh position={[-0.096, 0.41, -0.238]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.088, 0.40, -0.22]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial
          color="#09090b"
          roughness={0.08}
          metalness={0.2}
        />
      </mesh>
      {/* Right Eye Specular Glint */}
      <mesh position={[0.096, 0.41, -0.238]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
