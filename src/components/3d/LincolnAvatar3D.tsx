import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Html } from '@react-three/drei';
import {
  AnimationAction,
  AnimationMixer,
  Bone,
  Box3,
  Group,
  LoopOnce,
  LoopPingPong,
  MathUtils,
  Mesh,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { computeRoomTransform, easeInOutCubic } from '../../utils/cameraScrollMath';

export const BODY_MODEL_PATH = `${import.meta.env.BASE_URL}assets/models/avatar.glb`;
export const HEAD_MODEL_PATH = `${import.meta.env.BASE_URL}models/lincoln-avatar.glb`;

useGLTF.preload(BODY_MODEL_PATH);
useGLTF.preload(HEAD_MODEL_PATH);

interface LincolnAvatar3DProps {
  scrollProgress?: number;
  onRightHandBoneReady?: (bone: Bone | null) => void;
  onSwivelChange?: (swivelY: number) => void;
}

// Swivel angles relative to facing the computer desk (Math.PI / 2):
// When looking back towards the visitor camera: -2.10 rad (~ -120 deg)
const CAMERA_SWIVEL_OFFSET = -2.10;
// When facing the computer screens: 0 rad
const COMPUTER_SWIVEL_OFFSET = 0.0;

// Greeting duration: wave for 2.8s, swivel to computer in 1.2s
const GREETING_DURATION = 2.8;
const SWIVEL_DURATION = 1.2;

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

  // Assemble full-body character with Lincoln's 3D head attached to the skeleton
  const { skinnedMesh, rightHandBone } = useMemo(() => {
    // 1. Clone animated rigged character body
    const clonedBody = cloneSkeleton(bodyGltf.scene.children[0]) as Mesh;
    clonedBody.frustumCulled = false;

    // Remove any unused meshes (e.g. brain)
    const brain = clonedBody.getObjectByName('brain');
    if (brain && brain.parent) {
      brain.parent.remove(brain);
    }

    // 2. Style body meshes & hide generic cartoon face/head
    clonedBody.traverse((child) => {
      if (child instanceof Mesh) {
        child.frustumCulled = false;
        if (child.name === 'face' || child.name === 'head') {
          // Hide generic head & face
          child.visible = false;
        } else if (child.name === 'black') {
          // Dark pants
          child.material = new MeshMatcapMaterial({ matcap: matBlack });
          child.renderOrder = 24;
        } else if (child.name === 'gray') {
          // Clean white t-shirt
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

    // 3. Attach Lincoln's real 3D head onto the character's headBone
    const headBone = clonedBody.getObjectByName('headBone') as Bone | undefined;
    if (headBone) {
      // Clear any prior attached head children
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

      // Proportional scale to fit the body's neck and shoulders perfectly
      // Lincoln's model height: ~0.98. Target head/hair height on body: ~0.96 units
      const headScale = size.y > 0 ? 0.96 / size.y : 1;

      // Position so the neck lines up seamlessly with the body collar/neck joint:
      // In Lincoln's model: center.x = 0, neck base is at y ~ 0.35, chin at y ~ 0.45.
      // In headBone local space: (0, 0, 0) is the neck joint, +Z is forward look direction.
      lincolnHead.position.set(
        -center.x * headScale,
        -0.34 * headScale,
        (-center.z + 0.08) * headScale
      );
      lincolnHead.scale.setScalar(headScale);

      // Soft natural PBR lighting for Lincoln's skin and curly hair
      lincolnHead.traverse((child) => {
        if (child instanceof Mesh && child.material) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mat = child.material as MeshStandardMaterial;
          mat.roughness = Math.max(mat.roughness ?? 0.65, 0.6);
          mat.metalness = Math.min(mat.metalness ?? 0.05, 0.08);
          mat.needsUpdate = true;
        }
      });

      headBone.add(lincolnHead);
    }

    const handBone = (clonedBody.getObjectByName('bone-right-hand') as Bone) || null;

    return {
      skinnedMesh: clonedBody,
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
      act.weight = 0;
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
      const wave = actionsRef.current.get('wave');
      if (wave) {
        wave.reset();
        wave.play();
      }
    }
    prevScrollRef.current = scrollProgress;

    // Choreograph swivel angle:
    // Starts turned around towards the camera so the visitor sees Lincoln's face,
    // waves, and then swivels to face the computer monitors.
    let currentSwivel = COMPUTER_SWIVEL_OFFSET;
    let waveWeight = 0;

    if (!isScrolling && elapsed < GREETING_DURATION) {
      // Phase 1: Waving backwards towards the camera
      currentSwivel = CAMERA_SWIVEL_OFFSET;

      if (elapsed >= 0.2) {
        const waveNorm = MathUtils.clamp((elapsed - 0.2) / (GREETING_DURATION - 0.4), 0, 1);
        waveWeight = Math.sin(waveNorm * Math.PI);
      }
    } else if (!isScrolling && elapsed < GREETING_DURATION + SWIVEL_DURATION) {
      // Phase 2: Smooth swivel from camera towards the computer screen
      const turnNorm = MathUtils.clamp((elapsed - GREETING_DURATION) / SWIVEL_DURATION, 0, 1);
      const easeTurn = easeInOutCubic(turnNorm);
      currentSwivel = MathUtils.lerp(CAMERA_SWIVEL_OFFSET, COMPUTER_SWIVEL_OFFSET, easeTurn);
      waveWeight = 0;
    } else {
      // Phase 3: Seated facing computer, coding!
      currentSwivel = COMPUTER_SWIVEL_OFFSET;
      waveWeight = 0;
    }

    // Blend animation actions
    const wave = actionsRef.current.get('wave');
    const idle = actionsRef.current.get('idle');

    if (wave) {
      wave.weight = waveWeight;
    }
    if (idle) {
      idle.weight = Math.max(0.15, 1 - waveWeight);
    }

    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.05));
    }

    // Inform parent (RoomEnvironment3D) of swivel so office chair rotates in lockstep!
    if (onSwivelChange) {
      onSwivelChange(currentSwivel);
    }

    // Update floating speech badge
    const showBadge = !isScrolling && elapsed >= 0.4 && elapsed <= 2.6;
    setBadgeOpacity(showBadge ? Math.min(1, waveWeight * 1.4) : 0);

    // Position full-body character seated in the chair
    const roomTransform = computeRoomTransform(scrollProgress);

    if (rootGroupRef.current) {
      // Slides back and aside on scroll so camera zooms past into monitor
      rootGroupRef.current.position.set(
        -0.07 - roomTransform.chairSlideOffset * 0.45,
        -0.40,
        -0.025 + roomTransform.chairSlideOffset * 0.85
      );
      // Math.PI / 2 faces computer desk; currentSwivel turns backwards to camera; chairRotationY on scroll
      rootGroupRef.current.rotation.set(
        0,
        Math.PI / 2 + roomTransform.chairRotationY + currentSwivel,
        0
      );
    }
  });

  const handleAvatarClick = () => {
    // Replay greeting wave when visitor clicks on Lincoln!
    startTimeRef.current = null;
    const wave = actionsRef.current.get('wave');
    if (wave) {
      wave.reset();
      wave.play();
    }
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
          position={[0, 4.3, 0.2]}
          center
          distanceFactor={12}
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
