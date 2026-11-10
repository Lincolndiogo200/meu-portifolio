import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bone,
  BufferAttribute,
  Color,
  Group,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  RepeatWrapping,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  computeRoomTransform,
} from '../../utils/cameraScrollMath';
import { LincolnAvatar3D } from './LincolnAvatar3D';

interface RoomEnvironment3DProps {
  scrollProgress: number;
  pointer: { x: number; y: number };
  isDark: boolean;
}

const DESKTOPS_VERTEX_SHADER = `
attribute float scrollIntensity;
attribute float messageIntensity;

varying vec2 vUv;
varying float vScrollIntensity;
varying float vMessageIntensity;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vUv = uv;
  vScrollIntensity = scrollIntensity;
  vMessageIntensity = messageIntensity;
}
`;

const DESKTOPS_FRAGMENT_SHADER = `
uniform sampler2D uTexture;
uniform float uScrollDepth;
uniform float uMessageIntensity;

varying vec2 vUv;
varying float vScrollIntensity;
varying float vMessageIntensity;

void main() {
  vec2 scrollUv = vec2(vUv.x, vUv.y + uScrollDepth * vScrollIntensity);
  vec4 color = texture2D(uTexture, scrollUv);

  vec2 messageUv = vec2(vUv.x, vUv.y + 0.5);
  vec4 messageColor = texture2D(uTexture, messageUv);

  color = mix(color, messageColor, vMessageIntensity * messageColor.a * uMessageIntensity);

  gl_FragColor = vec4(color.rgb, 1.0);
}
`;

const SHADOW_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vUv = uv;
}
`;

const SHADOW_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec3 uColorBackground;
uniform vec3 uColorShadow;

void main() {
  vec4 shadow = texture2D(uTexture, vUv);
  float intensity = shadow.r;
  vec3 color = mix(uColorShadow.rgb, uColorBackground.rgb, intensity);
  gl_FragColor = vec4(color, 1.0);
}
`;

const ROOM_MESH_NAMES = [
  'blackboard',
  'carpet',
  'chair',
  'frame',
  'mouse',
  'music',
  'plant',
  'room',
  'shelf',
  'penguin',
] as const;

export const RoomEnvironment3D: React.FC<RoomEnvironment3DProps> = ({
  scrollProgress,
  isDark,
}) => {
  const rootWrapperRef = useRef<Group>(null);
  const roomGroupRef = useRef<Group>(null);
  const chairMeshRef = useRef<Mesh | null>(null);
  const chairBasePosRef = useRef(new Vector3(0, 0.0169, 0.66));
  const mouseMeshRef = useRef<Mesh | null>(null);
  const mouseBasePosRef = useRef(new Vector3());
  const rightHandBoneRef = useRef<Bone | null>(null);
  const penguinMeshRef = useRef<Object3D | null>(null);
  const dropStartTimeRef = useRef<number | null>(null);

  const desktopsUniformsRef = useRef({
    uTexture: { value: null as Texture | null },
    uScrollDepth: { value: 0 },
    uMessageIntensity: { value: 0 },
  });

  const shadowUniformsRef = useRef({
    uTexture: { value: null as Texture | null },
    uColorBackground: { value: new Color(isDark ? '#09090b' : '#f5efe6') },
    uColorShadow: { value: new Color(isDark ? '#020617' : 'rgb(215, 194, 169)') },
  });

  useEffect(() => {
    shadowUniformsRef.current.uColorBackground.value.set(isDark ? '#09090b' : '#f5efe6');
    shadowUniformsRef.current.uColorShadow.value.set(
      isDark ? '#020617' : 'rgb(215, 194, 169)'
    );
  }, [isDark]);

  useEffect(() => {
    let isMounted = true;
    const base = import.meta.env.BASE_URL;
    const gltfLoader = new GLTFLoader();
    const texLoader = new TextureLoader();

    const loadTex = (path: string, srgb = false, flipY = false): Promise<Texture> =>
      new Promise((resolve, reject) => {
        texLoader.load(
          `${base}${path}`,
          (tex) => {
            tex.flipY = flipY;
            tex.colorSpace = srgb ? SRGBColorSpace : LinearSRGBColorSpace;
            resolve(tex);
          },
          undefined,
          reject
        );
      });

    Promise.all([
      new Promise<{ scene: Group }>((resolve, reject) => {
        gltfLoader.load(`${base}assets/models/room.glb`, resolve, undefined, reject);
      }),
      loadTex('assets/textures/room.webp', true, false),
      loadTex('assets/textures/room-shadow.webp', false, false),
      loadTex('assets/textures/desktops.webp', false, false),
    ])
      .then(([gltf, roomTex, shadowTex, desktopsTex]) => {
        if (!isMounted || !roomGroupRef.current) return;

        roomGroupRef.current.clear();

        const roomMaterial = new MeshBasicMaterial({ map: roomTex });

        // Setup baked room meshes
        for (const name of ROOM_MESH_NAMES) {
          const obj = gltf.scene.children.find((child) => child.name === name);
          if (!obj) continue;

          obj.traverse((child) => {
            if (child instanceof Mesh) {
              child.material = roomMaterial;
            }
          });

          if (name === 'carpet' && obj instanceof Mesh) {
            obj.renderOrder = -10;
            obj.onBeforeRender = () => {
              roomMaterial.depthWrite = false;
            };
            obj.onAfterRender = () => {
              roomMaterial.depthWrite = true;
            };
          }

          if (name === 'chair' && obj instanceof Mesh) {
            chairMeshRef.current = obj;
            chairBasePosRef.current.copy(obj.position);
          }

          if (name === 'mouse' && obj instanceof Mesh) {
            mouseMeshRef.current = obj;
            mouseBasePosRef.current.copy(obj.position);
          }

          if (name === 'penguin') {
            penguinMeshRef.current = obj;
          }

          roomGroupRef.current.add(obj);
        }

        // Setup shadow-catcher plane
        const shadowMesh = gltf.scene.children.find(
          (child) => child.name === 'shadow-catcher'
        ) as Mesh | undefined;
        if (shadowMesh) {
          shadowUniformsRef.current.uTexture.value = shadowTex;
          shadowMesh.material = new ShaderMaterial({
            vertexShader: SHADOW_VERTEX_SHADER,
            fragmentShader: SHADOW_FRAGMENT_SHADER,
            depthWrite: false,
            depthTest: false,
            uniforms: shadowUniformsRef.current,
          });
          shadowMesh.renderOrder = -1000;
          roomGroupRef.current.add(shadowMesh);
        }

        // Setup dual monitor screens (desktop-plane-0 & desktop-plane-1) with scrolling code shader
        const desktop1 = gltf.scene.children.find(
          (child) => child.name === 'desktop-plane-0'
        ) as Mesh | undefined;
        const desktop2 = gltf.scene.children.find(
          (child) => child.name === 'desktop-plane-1'
        ) as Mesh | undefined;

        if (desktop1 && desktop2) {
          const geom1 = desktop1.geometry.clone();
          const geom2 = desktop2.geometry.clone();
          geom1.translate(desktop1.position.x, desktop1.position.y, desktop1.position.z);
          geom2.translate(desktop2.position.x, desktop2.position.y, desktop2.position.z);

          const count1 = geom1.attributes.position.count;
          const count2 = geom2.attributes.position.count;

          geom1.setAttribute(
            'scrollIntensity',
            new BufferAttribute(new Float32Array(count1).fill(1), 1)
          );
          geom2.setAttribute(
            'scrollIntensity',
            new BufferAttribute(new Float32Array(count2).fill(0), 1)
          );

          geom1.setAttribute(
            'messageIntensity',
            new BufferAttribute(new Float32Array(count1).fill(0), 1)
          );
          geom2.setAttribute(
            'messageIntensity',
            new BufferAttribute(new Float32Array(count2).fill(1), 1)
          );

          const mergedDesktopGeom = mergeGeometries([geom1, geom2]);
          desktopsTex.wrapS = RepeatWrapping;
          desktopsTex.wrapT = RepeatWrapping;
          desktopsTex.generateMipmaps = true;
          desktopsTex.anisotropy = 16;
          desktopsUniformsRef.current.uTexture.value = desktopsTex;

          const desktopsMaterial = new ShaderMaterial({
            vertexShader: DESKTOPS_VERTEX_SHADER,
            fragmentShader: DESKTOPS_FRAGMENT_SHADER,
            uniforms: desktopsUniformsRef.current,
          });

          const desktopsMesh = new Mesh(mergedDesktopGeom, desktopsMaterial);
          roomGroupRef.current.add(desktopsMesh);
        }
      })
      .catch(() => {
        // Ignore in headless test environments
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (dropStartTimeRef.current === null) {
      dropStartTimeRef.current = t;
    }

    const roomTransform = computeRoomTransform(scrollProgress);

    // Position the unified room + avatar root wrapper
    if (rootWrapperRef.current) {
      rootWrapperRef.current.position.set(
        roomTransform.roomPosition[0],
        roomTransform.roomPosition[1],
        roomTransform.roomPosition[2]
      );
      rootWrapperRef.current.rotation.set(0, roomTransform.roomRotationY, 0);
    }

    // On scroll: Chair smoothly rolls BACKWARDS away from the desk (+X) in exact lockstep with Lincoln
    if (chairMeshRef.current) {
      chairMeshRef.current.position.set(
        chairBasePosRef.current.x + roomTransform.chairSlideOffset * 0.55,
        chairBasePosRef.current.y,
        chairBasePosRef.current.z - roomTransform.chairSlideOffset * 0.15
      );
      chairMeshRef.current.rotation.set(
        0,
        roomTransform.chairRotationY,
        0
      );
    }

    // Scroll code on the main monitor both autonomously and when user scrolls
    const idleCodeScroll = Math.sin(t * 0.4) * 0.08;
    desktopsUniformsRef.current.uScrollDepth.value =
      idleCodeScroll + roomTransform.monitorScrollDepth;

    // Subtle penguin bobbing on the shelf
    if (penguinMeshRef.current) {
      penguinMeshRef.current.rotation.z = Math.sin(t * 2.2) * 0.05;
    }

    // Sync desk mouse with avatar's right hand bone
    if (
      mouseMeshRef.current &&
      rightHandBoneRef.current &&
      roomGroupRef.current &&
      scrollProgress < 0.1
    ) {
      const worldHand = new Vector3();
      rightHandBoneRef.current.getWorldPosition(worldHand);
      roomGroupRef.current.worldToLocal(worldHand);
      if (
        worldHand.y <= 1.8 &&
        worldHand.x >= -0.9 &&
        worldHand.x <= -0.7 &&
        worldHand.z >= -0.6 &&
        worldHand.z <= -0.28
      ) {
        mouseMeshRef.current.position.set(
          worldHand.x,
          mouseBasePosRef.current.y,
          worldHand.z - 0.15
        );
      }
    }
  });

  return (
    <group ref={rootWrapperRef}>
      <group ref={roomGroupRef} />
      <LincolnAvatar3D
        scrollProgress={scrollProgress}
        onRightHandBoneReady={(bone) => {
          rightHandBoneRef.current = bone;
        }}
      />
    </group>
  );
};
