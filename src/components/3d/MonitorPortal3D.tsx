import React from 'react';

interface MonitorPortal3DProps {
  scrollProgress: number;
  isDark: boolean;
}

export const MonitorPortal3D: React.FC<MonitorPortal3DProps> = ({
  scrollProgress,
  isDark,
}) => {
  // Position matches MONITOR_TARGET_LOOKAT = [0.32, 0.64, -0.24]
  return (
    <group position={[0.32, 0.64, -0.24]}>
      {/* Monitor Arm & Base */}
      <mesh position={[0, -0.28, -0.06]} castShadow receiveShadow>
        <cylinderGeometry args={[0.028, 0.035, 0.32, 16]} />
        <meshStandardMaterial color="#27272a" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.43, -0.02]} receiveShadow>
        <boxGeometry args={[0.32, 0.02, 0.22]} />
        <meshStandardMaterial color="#18181b" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Outer Ultrawide Monitor Chassis */}
      <mesh position={[0, 0, -0.022]} castShadow receiveShadow>
        <boxGeometry args={[1.08, 0.62, 0.036]} />
        <meshStandardMaterial color="#09090b" metalness={0.65} roughness={0.25} />
      </mesh>

      {/* Subtle Sky/Emerald Backlight Glow */}
      <pointLight
        position={[0, 0, 0.22]}
        intensity={isDark ? 1.35 : 0.75}
        distance={2.2}
        color="#38bdf8"
      />

      {/* Glowing Monitor Screen Canvas Surface */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.02, 0.56]} />
        <meshBasicMaterial color={isDark ? '#090d16' : '#f8fafc'} />
      </mesh>

      {/* Simulated Bento Portfolio UI Inside the 3D Monitor */}
      <group position={[0, 0, 0.004]}>
        {/* Top Navbar Pill inside Monitor */}
        <mesh position={[0, 0.22, 0]}>
          <planeGeometry args={[0.88, 0.042]} />
          <meshBasicMaterial color={isDark ? '#18181b' : '#e2e8f0'} />
        </mesh>
        {/* Sky Brand Dot */}
        <mesh position={[-0.38, 0.22, 0.002]}>
          <circleGeometry args={[0.012, 16]} />
          <meshBasicMaterial color="#0ea5e9" />
        </mesh>

        {/* Animated Content Group that scrolls upward as user scrolls */}
        <group position={[0, scrollProgress * 0.08, 0]}>
          {/* Main Hero Bento Card inside Monitor */}
          <mesh position={[-0.14, 0.04, 0]}>
            <planeGeometry args={[0.58, 0.24]} />
            <meshBasicMaterial color={isDark ? '#111827' : '#ffffff'} />
          </mesh>
          {/* Role Emerald Pill inside Hero Card */}
          <mesh position={[-0.29, 0.11, 0.002]}>
            <planeGeometry args={[0.22, 0.026]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          {/* Headline Accent Bars */}
          <mesh position={[-0.22, 0.05, 0.002]}>
            <planeGeometry args={[0.36, 0.028]} />
            <meshBasicMaterial color={isDark ? '#f8fafc' : '#0f172a'} />
          </mesh>
          <mesh position={[-0.25, 0.0, 0.002]}>
            <planeGeometry args={[0.3, 0.018]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>

          {/* Right Side Bento Cards inside Monitor */}
          <mesh position={[0.29, 0.1, 0]}>
            <planeGeometry args={[0.24, 0.11]} />
            <meshBasicMaterial color={isDark ? '#1e293b' : '#e2e8f0'} />
          </mesh>
          <mesh position={[0.29, -0.02, 0]}>
            <planeGeometry args={[0.24, 0.11]} />
            <meshBasicMaterial color={isDark ? '#1e293b' : '#e2e8f0'} />
          </mesh>

          {/* Bottom Project Bento Row inside Monitor */}
          <mesh position={[-0.3, -0.16, 0]}>
            <planeGeometry args={[0.27, 0.11]} />
            <meshBasicMaterial color={isDark ? '#0f172a' : '#e2e8f0'} />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <planeGeometry args={[0.27, 0.11]} />
            <meshBasicMaterial color={isDark ? '#0f172a' : '#e2e8f0'} />
          </mesh>
          <mesh position={[0.3, -0.16, 0]}>
            <planeGeometry args={[0.27, 0.11]} />
            <meshBasicMaterial color={isDark ? '#0f172a' : '#e2e8f0'} />
          </mesh>
        </group>

        {/* Bottom OS Dock Bar */}
        <mesh position={[0, -0.245, 0.002]}>
          <planeGeometry args={[0.34, 0.022]} />
          <meshBasicMaterial color="#0ea5e9" />
        </mesh>
      </group>
    </group>
  );
};
