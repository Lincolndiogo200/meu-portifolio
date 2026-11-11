import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import {
  AnimationAction,
  AnimationMixer,
  Bone,
  Box3,
  Group,
  LinearSRGBColorSpace,
  LoopPingPong,
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

    // Attach Lincoln's real 3D head (torso/tronco removed) onto the character's headBone
    const headBone = clonedArmature.getObjectByName('headBone') as Bone | undefined;
    if (headBone) {
      while (headBone.children.length > 0) {
        headBone.remove(headBone.children[0]);
      }

      const lincolnHead = headGltf.scene.clone(true);

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
          child.castShadow = false;
          child.receiveShadow = false;
          const mat = child.material as MeshStandardMaterial;
          mat.roughness = 0.72;
          mat.metalness = 0.02;
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

    if (idleClip) {
      const act = mixer.clipAction(idleClip);
      act.loop = LoopPingPong;
      act.weight = 1;
      act.play();
      actionsRef.current.set('idle', act);
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

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.05));
    }

    // Inform parent (RoomEnvironment3D) of swivel (kept aligned at 0 with chair)
    if (onSwivelChange) {
      onSwivelChange(0);
    }

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

  return (
    <group ref={rootGroupRef}>
      <primitive object={skinnedMesh} />
    </group>
  );
};
