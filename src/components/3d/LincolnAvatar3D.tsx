import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Html } from '@react-three/drei';
import {
  AnimationAction,
  AnimationMixer,
  Bone,
  Box3,
  Group,
  LinearSRGBColorSpace,
  LoopOnce,
  LoopPingPong,
  MathUtils,
  Mesh,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { computeRoomTransform } from '../../utils/cameraScrollMath';

export const BODY_MODEL_PATH = `${import.meta.env.BASE_URL}assets/models/avatar.glb`;
export const HEAD_MODEL_PATH = `${import.meta.env.BASE_URL}models/lincoln-avatar.glb`;

useGLTF.preload(BODY_MODEL_PATH);
useGLTF.preload(HEAD_MODEL_PATH);

interface LincolnAvatar3DProps {
  scrollProgress?: number;
  onRightHandBoneReady?: (bone: Bone | null) => void;
  onSwivelChange?: (swivelY: number) => void;
}

// Natural wave clip duration in avatar.glb is ~2.7s
const WAVE_DURATION = 2.7;

// Workstation orientation offset (90 deg): aligns Lincoln squarely seated in the office chair
// with his back against the backrest and facing forward toward the computer monitors
const AVATAR_FACING_ROTATION = Math.PI / 2;

export const LincolnAvatar3D: React.FC<LincolnAvatar3DProps> = ({
  scrollProgress = 0,
  onRightHandBoneReady,
  onSwivelChange,
}) => {
  const rootGroupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, AnimationAction>>(new Map());
  const startTimeRef = useRef<number | null>(null);
  const prevScrollRef = useRef(0);
  const [badgeOpacity, setBadgeOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Load animated body model and Lincoln's realistic 3D head model
  const bodyGltf = useGLTF(BODY_MODEL_PATH);
  const headGltf = useGLTF(HEAD_MODEL_PATH);

  // Load matcaps for full-body clothing and skin
  const [matBlack, matSkin, matWhite] = useTexture([
    `${import.meta.env.BASE_URL}assets/textures/matcap-black.webp`,
    `${import.meta.env.BASE_URL}assets/textures/matcap-skin.webp`,
    `${import.meta.env.BASE_URL}assets/textures/matcap-white.webp`,
  ]);

  useMemo(() => {
    matBlack.colorSpace = LinearSRGBColorSpace;
    matSkin.colorSpace = LinearSRGBColorSpace;
    matWhite.colorSpace = LinearSRGBColorSpace;
  }, [matBlack, matSkin, matWhite]);

  // Assemble full-body character with Lincoln's personalized 3D head attached to the skeleton
  const { skinnedMesh, rightHandBone } = useMemo(() => {
    const clonedArmature = cloneSkeleton(bodyGltf.scene.children[0]) as Mesh;
    clonedArmature.frustumCulled = false;

    // Setting rotation.z = 0 aligns avatar forward facing directly towards the monitors (-Z)
    clonedArmature.rotation.z = 0;

    // Remove any unused meshes (e.g. brain)
    const brain = clonedArmature.getObjectByName('brain');
    if (brain && brain.parent) {
      brain.parent.remove(brain);
    }

    // Style body meshes & hide generic cartoon face/head
    clonedArmature.traverse((child) => {
      if (child instanceof Mesh) {
        child.frustumCulled = false;
        if (child.name === 'face' || child.name === 'head') {
          // Hide cartoon head & face so Lincoln's realistic 3D head takes its place
          child.visible = false;
        } else if (child.name === 'black') {
          // Dark pants
          child.material = new MeshMatcapMaterial({ matcap: matBlack });
          child.renderOrder = 24;
        } else if (child.name === 'gray') {
          // Clean white t-shirt as in Lincoln's profile
          child.material = new MeshMatcapMaterial({ matcap: matWhite });
          child.renderOrder = 24;
        } else if (child.name === 'white') {
          // White sneakers
          child.material = new MeshMatcapMaterial({ matcap: matWhite });
          child.renderOrder = 24;
        } else if (child.name === 'skin') {
          // Skin arms & hands
          child.material = new MeshMatcapMaterial({ matcap: matSkin });
          child.renderOrder = 24;
        }
      }
    });

    // Attach Lincoln's real 3D head onto the character's headBone with anatomical proportions
    const headBone = clonedArmature.getObjectByName('headBone') as Bone | undefined;
    if (headBone) {
      while (headBone.children.length > 0) {
        headBone.remove(headBone.children[0]);
      }

      const lincolnHead = headGltf.scene.clone(true);

      // Measure bounding box of Lincoln's head model
      const box = new Box3().setFromObject(lincolnHead);
      const size = new Vector3();
      const center = new Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Balanced head scale:
      // In the original body, the stylized head height is 1.25.
      // Lincoln's model height is 0.98. Target height on body: ~1.24 units.
      const headScale = size.y > 0 ? 1.24 / size.y : 1.26;

      // Position so the neck lines up seamlessly inside the body t-shirt collar:
      lincolnHead.position.set(
        -center.x * headScale,
        -0.41,
        -0.065 * headScale
      );
      lincolnHead.scale.setScalar(headScale);

      // Soft natural PBR lighting for Lincoln's skin and curly hair
      lincolnHead.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mat = child.material as MeshStandardMaterial;
          mat.roughness = Math.max(mat.roughness ?? 0.65, 0.6);
          mat.metalness = Math.min(mat.metalness ?? 0.05, 0.06);
          mat.needsUpdate = true;
        }
      });

      headBone.add(lincolnHead);
    }

    // Harmonize arm bone proportions so arms look naturally balanced with the human head
    const leftArm = clonedArmature.getObjectByName('leftArmBone') as Bone | undefined;
    const leftForeArm = clonedArmature.getObjectByName('leftForeArmBone') as Bone | undefined;
    const rightArm = clonedArmature.getObjectByName('rightarmBone') as Bone | undefined;
    const rightForeArm = clonedArmature.getObjectByName('rightForearmBone') as Bone | undefined;

    // Subtle 8% thickness adjustment on the arm bones prevents cartoon bulge
    const armThickness = 0.94;
    if (leftArm) leftArm.scale.set(armThickness, 1, armThickness);
    if (leftForeArm) leftForeArm.scale.set(armThickness, 1, armThickness);
    if (rightArm) rightArm.scale.set(armThickness, 1, armThickness);
    if (rightForeArm) rightForeArm.scale.set(armThickness, 1, armThickness);

    const handBone = (clonedArmature.getObjectByName('bone-right-hand') as Bone) || null;

    return {
      skinnedMesh: clonedArmature,
      rightHandBone: handBone,
    };
  }, [bodyGltf.scene, headGltf.scene, matBlack, matSkin, matWhite]);

  // Setup AnimationMixer and animation actions
  useEffect(() => {
    if (onRightHandBoneReady) {
      onRightHandBoneReady(rightHandBone);
    }

    if (!skinnedMesh) return;

    const mixer = new AnimationMixer(skinnedMesh);
    mixerRef.current = mixer;

    const findClip = (name: string) =>
      bodyGltf.animations.find((clip) => clip.name === name);

    const idleClip = findClip('idle');
    const waveClip = findClip('wave');

    if (idleClip) {
      const act = mixer.clipAction(idleClip);
      act.loop = LoopPingPong;
      act.weight = 1;
      act.play();
      actionsRef.current.set('idle', act);
    }

    if (waveClip) {
      const act = mixer.clipAction(waveClip);
      act.loop = LoopOnce;
      act.clampWhenFinished = true;
      act.weight = 1;
      act.play();
      actionsRef.current.set('wave', act);
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [skinnedMesh, rightHandBone, bodyGltf.animations, onRightHandBoneReady]);

  // Reset body style cursor on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'auto';
      }
    };
  }, []);

  const triggerWave = () => {
    const wave = actionsRef.current.get('wave');
    if (wave) {
      wave.reset();
      wave.play();
    }
  };

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    if (startTimeRef.current === null) {
      startTimeRef.current = t;
    }

    const elapsed = t - startTimeRef.current;
    const isScrolling = scrollProgress > 0.02;

    // If user scrolled down and returned to top, replay greeting wave!
    if (prevScrollRef.current > 0.15 && scrollProgress <= 0.01) {
      startTimeRef.current = t;
      triggerWave();
    }
    prevScrollRef.current = scrollProgress;

    // Choreograph wave weight:
    // Wave action smoothly takes over for WAVE_DURATION (~2.7s), then blends back to idle
    let waveWeight = 0;
    if (!isScrolling && elapsed < WAVE_DURATION) {
      if (elapsed < 0.2) {
        waveWeight = elapsed / 0.2;
      } else if (elapsed < WAVE_DURATION - 0.4) {
        waveWeight = 1;
      } else {
        waveWeight = Math.max(0, (WAVE_DURATION - elapsed) / 0.4);
      }
    }

    const idleWeight = 1 - waveWeight;

    const wave = actionsRef.current.get('wave');
    const idle = actionsRef.current.get('idle');

    if (wave) {
      wave.weight = waveWeight;
    }
    if (idle) {
      idle.weight = idleWeight;
    }

    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.05));
    }

    // Inform parent (RoomEnvironment3D) of swivel (kept aligned at 0 with chair)
    if (onSwivelChange) {
      onSwivelChange(0);
    }

    // Update floating speech badge
    const showBadge = !isScrolling && waveWeight > 0.35;
    setBadgeOpacity(MathUtils.lerp(badgeOpacity, showBadge ? 1 : 0, 0.15));

    // Position character seated squarely in the office chair:
    // With AVATAR_FACING_ROTATION (Math.PI / 2):
    // Character sits facing forward looking straight at the monitor screens!
    // On scroll: slides back & rotates in lockstep with the chair.
    const roomTransform = computeRoomTransform(scrollProgress);

    if (rootGroupRef.current) {
      rootGroupRef.current.position.set(
        -roomTransform.chairSlideOffset * 0.45,
        0,
        roomTransform.chairSlideOffset * 0.85
      );
      rootGroupRef.current.rotation.set(
        0,
        roomTransform.chairRotationY + AVATAR_FACING_ROTATION,
        0
      );
    }
  });

  const handleAvatarClick = () => {
    // Replay greeting wave when visitor clicks on Lincoln!
    startTimeRef.current = null;
    triggerWave();
  };

  return (
    <group
      ref={rootGroupRef}
      onClick={handleAvatarClick}
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
      <primitive object={skinnedMesh} />

      {/* Floating Greeting Speech Badge */}
      {badgeOpacity > 0.02 && (
        <Html
          position={[0, 3.2, 0.4]}
          center
          distanceFactor={11}
          zIndexRange={[100, 0]}
        >
          <div
            style={{
              opacity: badgeOpacity,
              transition: 'opacity 0.2s ease',
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#f8fafc',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              boxShadow:
                '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              userSelect: 'none',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: '15px' }}>👋</span>
            <span>Oi! Sou o Lincoln</span>
          </div>
        </Html>
      )}
    </group>
  );
};
