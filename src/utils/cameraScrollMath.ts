export type Vec3Tuple = [number, number, number];

export interface CameraPose {
  position: Vec3Tuple;
  lookAt: Vec3Tuple;
  fov: number;
}

export interface RoomTransformState {
  roomPosition: Vec3Tuple;
  roomRotationY: number;
  avatarPosition: Vec3Tuple;
  avatarRotationY: number;
  chairSlideOffset: number;
  chairRotationY: number;
  monitorScrollDepth: number;
}

export interface PortalTransitionState {
  progress: number;
  hudOpacity: number;
  screenOverlayOpacity: number;
  canvasOpacity: number;
  monitorZoomScale: number;
  isInsideMonitor: boolean;
}

export interface AvatarDropState {
  dropY: number;
  squashScaleY: number;
  squashScaleXZ: number;
  chairCompressionY: number;
  chairSpinYaw: number;
  armsRaiseAngle: number;
  isSettled: boolean;
}

// Exact David Heckhoff hero camera pose: [0, 6, 10] looking at [0, 3, 0], fov 38
export const ROOM_INITIAL_POSITION: Vec3Tuple = [0, 6, 10];
export const ROOM_INITIAL_LOOKAT: Vec3Tuple = [0, 3, 0];

// Target pose zoomed squarely into desktop-plane-0 main monitor screen in world space
export const MONITOR_TARGET_POSITION: Vec3Tuple = [2.465, 2.790, 0.393];
export const MONITOR_TARGET_LOOKAT: Vec3Tuple = [3.740, 2.559, -1.131];

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function easeInOutCubic(t: number): number {
  const clamped = clamp(t, 0, 1);
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

export function lerpNumber(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function calculateScrollProgress(scrollY: number, runwayHeight: number): number {
  if (runwayHeight <= 0) return 1;
  return clamp(scrollY / runwayHeight, 0, 1);
}

export function computeCameraPose(
  progress: number,
  pointer: { x: number; y: number } = { x: 0, y: 0 }
): CameraPose {
  const clampedProgress = clamp(progress, 0, 1);
  const t = easeInOutCubic(clampedProgress);

  // 1. Base camera pose from scroll interpolation
  const basePosition: Vec3Tuple = [
    lerpNumber(ROOM_INITIAL_POSITION[0], MONITOR_TARGET_POSITION[0], t),
    lerpNumber(ROOM_INITIAL_POSITION[1], MONITOR_TARGET_POSITION[1], t),
    lerpNumber(ROOM_INITIAL_POSITION[2], MONITOR_TARGET_POSITION[2], t),
  ];

  // Fixed lookAt target determined strictly by scroll; unaffected by pointer
  const lookAt: Vec3Tuple = [
    lerpNumber(ROOM_INITIAL_LOOKAT[0], MONITOR_TARGET_LOOKAT[0], t),
    lerpNumber(ROOM_INITIAL_LOOKAT[1], MONITOR_TARGET_LOOKAT[1], t),
    lerpNumber(ROOM_INITIAL_LOOKAT[2], MONITOR_TARGET_LOOKAT[2], t),
  ];

  const fov = lerpNumber(38, 28, t);

  // 2. The pointer effect MUST NOT move the camera during zoom (user requirement):
  // "o movimento do ponteiro NÃO pode mexer na câmera durante o zoom"
  const pointerWeight = clampedProgress < 0.01 ? 1 : Math.max(0, 1 - clampedProgress * 15);

  // 3. Pointer offset applied AFTER base scroll pose:
  // Offset X: maximum ±0.10. Offset Y: zeroed (no vertical elevation to keep avatar seated).
  const offsetX = clamp(pointer.x, -1, 1) * 0.10 * pointerWeight;
  const offsetY = 0;

  const position: Vec3Tuple = [
    basePosition[0] + offsetX,
    basePosition[1] + offsetY,
    basePosition[2],
  ];

  return { position, lookAt, fov };
}

export function computeRoomTransform(progress: number): RoomTransformState {
  const p = clamp(progress, 0, 1);
  const slideProgress = easeInOutCubic(clamp(p / 0.75, 0, 1));
  const chairSlideOffset = slideProgress * 1.8;
  const chairRotationY = -slideProgress * 0.45;

  return {
    roomPosition: [2.0, 0, 0],
    roomRotationY: -2.3,
    avatarPosition: [2.0, 0, 0],
    avatarRotationY: -2.3 + Math.PI / 2,
    chairSlideOffset,
    chairRotationY,
    monitorScrollDepth: p * 0.65,
  };
}

export function computePortalTransitionState(progress: number): PortalTransitionState {
  const p = clamp(progress, 0, 1);
  // HUD card fades out cleanly as soon as zoom begins (completely gone by p = 0.20)
  const hudOpacity = clamp(1 - p / 0.20, 0, 1);
  // Screen overlay box only fades in when camera reaches monitor screen (p > 0.72)
  const screenOverlayOpacity = clamp((p - 0.72) / 0.22, 0, 1);
  // 3D scene smoothly crossfades into the portfolio between 0.88 and 1.0
  const canvasOpacity = clamp(1 - (p - 0.88) / 0.12, 0, 1);
  const monitorZoomScale = 1 + easeInOutCubic(p) * 1.85;
  const isInsideMonitor = p >= 0.85;

  return {
    progress: p,
    hudOpacity,
    screenOverlayOpacity,
    canvasOpacity,
    monitorZoomScale,
    isInsideMonitor,
  };
}

export function computeAvatarDropEntrance(elapsedSeconds: number): AvatarDropState {
  const t = Math.max(0, elapsedSeconds);
  const fallDuration = 0.42;
  const totalDuration = 1.25;

  if (t >= totalDuration) {
    return {
      dropY: 0,
      squashScaleY: 1,
      squashScaleXZ: 1,
      chairCompressionY: 0,
      chairSpinYaw: 0,
      armsRaiseAngle: 0,
      isSettled: true,
    };
  }

  if (t < fallDuration) {
    // Free-fall phase with quadratic gravity acceleration from height 3.2
    const normFall = t / fallDuration;
    const dropY = 3.2 * (1 - normFall * normFall);
    const stretch = 0.08 * normFall;
    return {
      dropY,
      squashScaleY: 1 + stretch,
      squashScaleXZ: 1 - stretch * 0.5,
      chairCompressionY: 0,
      chairSpinYaw: -0.35 * (1 - normFall),
      armsRaiseAngle: 0.95 * (1 - normFall * 0.35),
      isSettled: false,
    };
  }

  // Impact & damped spring bounce phase on the chair [0.48s -> 1.30s]
  const bounceTime = t - fallDuration;
  const decay = Math.exp(-5.8 * bounceTime);
  const wave = Math.sin(bounceTime * 16.0);

  const dropY = -0.14 * wave * decay;
  const chairCompressionY = -Math.max(0, wave) * 0.09 * decay;
  const squashDelta = -0.14 * wave * decay;
  const chairSpinYaw = 0.22 * Math.sin(bounceTime * 9.5) * decay;
  const armsSettleProgress = clamp(bounceTime / 0.38, 0, 1);
  const armsRaiseAngle = 0.62 * (1 - easeInOutCubic(armsSettleProgress));

  return {
    dropY,
    squashScaleY: 1 + squashDelta,
    squashScaleXZ: 1 - squashDelta * 0.5,
    chairCompressionY,
    chairSpinYaw,
    armsRaiseAngle,
    isSettled: false,
  };
}
