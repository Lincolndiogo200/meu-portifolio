import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Bone,
  CapsuleGeometry,
  Color,
  Group,
  LinearSRGBColorSpace,
  LoopOnce,
  LoopPingPong,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TorusGeometry,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { computeRoomTransform } from '../../utils/cameraScrollMath';

interface LincolnAvatar3DProps {
  scrollProgress: number;
  onRightHandBoneReady?: (bone: Bone | null) => void;
}

const FACE_VERTEX_SHADER = `
#include <skinning_pars_vertex>
varying vec2 vUv;

void main() {
  #include <skinbase_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  vUv = uv;
}
`;

const FACE_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uFrame;

#define ROWS 4.0
#define COLUMNS 4.0

void main() {
  float column = mod(uFrame, COLUMNS);
  float row = floor(uFrame / COLUMNS);
  row = (ROWS - 1.0) - row;

  vec2 uv = vUv;
  uv.x = (uv.x + column) / COLUMNS;
  uv.y = (uv.y + row) / ROWS;

  vec4 textureColor = texture2D(uTexture, uv);
  gl_FragColor = vec4(textureColor.rgb, textureColor.a);
}
`;

export const LincolnAvatar3D: React.FC<LincolnAvatar3DProps> = ({
  scrollProgress,
  onRightHandBoneReady,
}) => {
  const rootGroupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, AnimationAction>>(new Map());
  const faceUniformsRef = useRef<{ uTexture: { value: Texture | null }; uFrame: { value: number } }>({
    uTexture: { value: null },
    uFrame: { value: 12 },
  });

  const dropStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const base = import.meta.env.BASE_URL;
    const gltfLoader = new GLTFLoader();
    const texLoader = new TextureLoader();

    const loadTex = (path: string, srgb = false, flipY = true): Promise<Texture> =>
      new Promise((resolve, reject) => {
        texLoader.load(
          `${base}${path}`,
          (tex) => {
            tex.flipY = flipY;
            tex.colorSpace = srgb ? SRGBColorSpace : LinearSRGBColorSpace;
            tex.generateMipmaps = false;
            resolve(tex);
          },
          undefined,
          reject
        );
      });

    Promise.all([
      new Promise<{ scene: Group; animations: AnimationClip[] }>((resolve, reject) => {
        gltfLoader.load(`${base}assets/models/avatar.glb`, resolve, undefined, reject);
      }),
      loadTex('assets/textures/head.webp', true, false),
      loadTex('assets/textures/face-spritesheet.png', false, true),
      loadTex('assets/textures/matcap-black.webp', false, true),
      loadTex('assets/textures/matcap-gray.webp', false, true),
      loadTex('assets/textures/matcap-skin.webp', false, true),
      loadTex('assets/textures/matcap-white.webp', false, true),
    ])
      .then(([gltf, headTex, faceTex, matBlack, _matGray, matSkin, matWhite]) => {
        if (!isMounted || !rootGroupRef.current) return;

        const clonedMesh = cloneSkeleton(gltf.scene.children[0]) as Mesh;
        clonedMesh.frustumCulled = false;

        faceUniformsRef.current.uTexture.value = faceTex;
        const faceMaterial = new ShaderMaterial({
          vertexShader: FACE_VERTEX_SHADER,
          fragmentShader: FACE_FRAGMENT_SHADER,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          uniforms: faceUniformsRef.current,
        });

        const headMaterial = new MeshBasicMaterial({
          map: headTex,
        });

        const brain = clonedMesh.getObjectByName('brain');
        if (brain && brain.parent) {
          brain.parent.remove(brain);
        }

        clonedMesh.traverse((child) => {
          if (child instanceof Mesh) {
            child.frustumCulled = false;
            if (child.name === 'face') {
              child.material = faceMaterial;
              child.renderOrder = 25;
            } else if (child.name === 'head') {
              child.material = headMaterial;
              child.renderOrder = 24;
            } else if (child.name === 'black') {
              child.material = new MeshMatcapMaterial({ matcap: matBlack });
              child.renderOrder = 24;
            } else if (child.name === 'gray') {
              // Lincoln wears a clean white t-shirt as in his reference art
              child.material = new MeshMatcapMaterial({ matcap: matWhite });
              child.renderOrder = 24;
            } else if (child.name === 'skin') {
              child.material = new MeshMatcapMaterial({ matcap: matSkin });
              child.renderOrder = 24;
            } else if (child.name === 'white') {
              child.material = new MeshMatcapMaterial({ matcap: matWhite });
              child.renderOrder = 24;
            }
          }
        });

        clonedMesh.rotation.z = 0;

        // Personalize avatar with Lincoln's features parented to headBone
        const headBone = clonedMesh.getObjectByName('headBone') as Bone | undefined;
        if (headBone) {
          // ==========================================
          // 1. VOLUMINOUS CURLY / WAVY HAIR SYSTEM
          // ==========================================
          const hairMat = new MeshStandardMaterial({
            color: new Color('#140e09'),
            roughness: 0.45,
            metalness: 0.08,
          });
          const hairGroup = new Group();

          // Crown and top curly volume giving high silhouette
          const curlGeom = new TorusGeometry(0.085, 0.038, 8, 16, Math.PI * 1.4);
          const capGeom = new CapsuleGeometry(0.048, 0.13, 8, 12);
          const smallCurl = new TorusGeometry(0.055, 0.028, 8, 16, Math.PI * 1.5);

          const crownOffsets = [
            { pos: [0.0, 0.52, 0.05], rot: [0.3, 0.2, 0.4] },
            { pos: [0.12, 0.50, 0.12], rot: [0.5, -0.3, 0.2] },
            { pos: [-0.12, 0.50, 0.10], rot: [0.4, 0.4, -0.3] },
            { pos: [0.08, 0.53, -0.08], rot: [-0.2, 0.5, 0.1] },
            { pos: [-0.10, 0.52, -0.06], rot: [-0.3, -0.4, -0.2] },
            { pos: [0.20, 0.44, 0.02], rot: [0.2, 0.1, 0.8] },
            { pos: [-0.20, 0.44, 0.02], rot: [0.2, -0.1, -0.8] },
            { pos: [0.18, 0.42, 0.20], rot: [0.6, -0.4, 0.5] },
            { pos: [-0.18, 0.42, 0.18], rot: [0.6, 0.4, -0.5] },
          ];

          crownOffsets.forEach((cfg) => {
            const mesh = new Mesh(curlGeom, hairMat);
            mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
            mesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
            hairGroup.add(mesh);
          });

          // Signature Forehead Curls (wavy locks cascading over forehead matching reference art)
          const frontCurls = [
            { pos: [0.06, 0.40, 0.36], rot: [0.6, 0.4, -0.7], scale: 1.15 },
            { pos: [-0.04, 0.35, 0.39], rot: [0.7, -0.3, -0.4], scale: 1.05 },
            { pos: [0.15, 0.38, 0.33], rot: [0.5, 0.6, -0.8], scale: 0.95 },
            { pos: [-0.14, 0.36, 0.34], rot: [0.5, -0.5, 0.6], scale: 0.9 },
          ];

          frontCurls.forEach((cfg) => {
            const mesh = new Mesh(smallCurl, hairMat);
            mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
            mesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
            mesh.scale.setScalar(cfg.scale);
            hairGroup.add(mesh);

            const tuft = new Mesh(capGeom, hairMat);
            tuft.position.set(cfg.pos[0] * 0.9, cfg.pos[1] + 0.03, cfg.pos[2] - 0.04);
            tuft.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
            tuft.scale.set(0.7, 0.8, 0.7);
            hairGroup.add(tuft);
          });

          headBone.add(hairGroup);

          // ==========================================
          // 2. SHINY SILVER HOOP EARRINGS (BOTH EARS)
          // ==========================================
          const earringGeom = new TorusGeometry(0.048, 0.009, 14, 28);
          const silverMat = new MeshStandardMaterial({
            color: new Color('#f1f5f9'),
            metalness: 0.96,
            roughness: 0.12,
          });

          // Left Earring
          const leftEarring = new Mesh(earringGeom, silverMat);
          leftEarring.position.set(0.36, -0.04, 0.02);
          leftEarring.rotation.set(0, Math.PI / 2, 0);
          headBone.add(leftEarring);

          // Right Earring
          const rightEarring = new Mesh(earringGeom, silverMat);
          rightEarring.position.set(-0.36, -0.04, 0.02);
          rightEarring.rotation.set(0, Math.PI / 2, 0);
          headBone.add(rightEarring);

          // ==========================================
          // 3. STYLIZED 3D TRIMMED BEARD & MUSTACHE
          // ==========================================
          const beardMat = new MeshStandardMaterial({
            color: new Color('#16100b'),
            roughness: 0.6,
            metalness: 0.05,
          });
          const chinGeom = new CapsuleGeometry(0.065, 0.08, 8, 12);
          const chin = new Mesh(chinGeom, beardMat);
          chin.position.set(0, -0.17, 0.38);
          chin.rotation.set(0.4, 0, 0);
          headBone.add(chin);

          const jawGeom = new CapsuleGeometry(0.045, 0.16, 8, 12);
          const jawLeft = new Mesh(jawGeom, beardMat);
          jawLeft.position.set(0.18, -0.12, 0.24);
          jawLeft.rotation.set(0.3, 0.3, -0.6);
          headBone.add(jawLeft);

          const jawRight = new Mesh(jawGeom, beardMat);
          jawRight.position.set(-0.18, -0.12, 0.24);
          jawRight.rotation.set(0.3, -0.3, 0.6);
          headBone.add(jawRight);

          const mustacheGeom = new TorusGeometry(0.06, 0.022, 8, 16, Math.PI);
          const mustache = new Mesh(mustacheGeom, beardMat);
          mustache.position.set(0, -0.06, 0.44);
          mustache.rotation.set(0.2, 0, Math.PI);
          headBone.add(mustache);
        }

        rootGroupRef.current.clear();
        rootGroupRef.current.add(clonedMesh);

        const rightHandBone = (clonedMesh.getObjectByName('bone-right-hand') as Bone) || null;
        if (onRightHandBoneReady) {
          onRightHandBoneReady(rightHandBone);
        }

        const mixer = new AnimationMixer(clonedMesh);
        mixerRef.current = mixer;

        const findClip = (name: string) =>
          gltf.animations.find((clip) => clip.name === name);

        const idleClip = findClip('idle');
        const tIdleClip = findClip('t-idle');
        const waveClip = findClip('wave');

        if (idleClip) {
          const act = mixer.clipAction(idleClip);
          act.loop = LoopPingPong;
          act.weight = 1;
          act.play();
          actionsRef.current.set('desktop-idle', act);
        }

        if (tIdleClip) {
          const act = mixer.clipAction(tIdleClip);
          act.loop = LoopPingPong;
          act.weight = 0;
          act.play();
          actionsRef.current.set('t-idle', act);
        }

        if (waveClip) {
          const act = mixer.clipAction(waveClip);
          act.loop = LoopOnce;
          act.clampWhenFinished = true;
          act.weight = 0;
          act.play();
          actionsRef.current.set('wave', act);
        }
      })
      .catch(() => {
        // Ignore asset errors in non-WebGL / test environments
      });

    return () => {
      isMounted = false;
      mixerRef.current?.stopAllAction();
    };
  }, [onRightHandBoneReady]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (dropStartTimeRef.current === null) {
      dropStartTimeRef.current = t;
    }

    const elapsed = t - dropStartTimeRef.current;
    const roomTransform = computeRoomTransform(scrollProgress);

    // Initial friendly greeting wave while seated at the desk (0.4s to 2.4s)
    let wavingStrength = 0;
    if (elapsed >= 0.4 && elapsed < 2.4) {
      const waveNorm = (elapsed - 0.4) / 2.0;
      wavingStrength = Math.sin(waveNorm * Math.PI);
    }

    // Avatar is permanently seated in the chair (no flying or standing)
    const desktopIdle = actionsRef.current.get('desktop-idle');
    const tIdle = actionsRef.current.get('t-idle');
    const wave = actionsRef.current.get('wave');

    if (desktopIdle) {
      desktopIdle.weight = Math.max(0, 1 - wavingStrength);
    }
    if (tIdle) {
      tIdle.weight = 0;
    }
    if (wave) {
      wave.weight = Math.max(0, wavingStrength);
    }

    // Blinking & smiling facial expressions
    const isSmiling = elapsed < 3.2;
    const baseFrame = isSmiling ? 12 : 0;
    const blinkCycle = t % 4.2;
    let blinkOffset = 0;
    if (blinkCycle > 4.0) {
      blinkOffset = 3;
    } else if (blinkCycle > 3.92) {
      blinkOffset = 2;
    } else if (blinkCycle > 3.85) {
      blinkOffset = 1;
    }
    faceUniformsRef.current.uFrame.value = baseFrame + blinkOffset;

    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.05));
    }

    // On scroll: Lincoln and his chair smoothly roll back & aside ("se afastando")
    // so the camera zooms cleanly into the computer screen instead of his hair!
    if (rootGroupRef.current) {
      rootGroupRef.current.position.set(
        -0.07 - roomTransform.chairSlideOffset * 0.45,
        -0.40,
        -0.025 + roomTransform.chairSlideOffset * 0.85
      );
      rootGroupRef.current.rotation.set(
        0,
        Math.PI / 2 + roomTransform.chairRotationY,
        0
      );
    }
  });

  return <group ref={rootGroupRef} />;
};
