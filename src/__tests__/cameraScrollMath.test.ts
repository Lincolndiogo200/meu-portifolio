import { describe, it, expect } from 'vitest';
import {
  calculateScrollProgress,
  computeAvatarDropEntrance,
  computeCameraPose,
  computePortalTransitionState,
  computeRoomTransform,
  MONITOR_TARGET_LOOKAT,
  MONITOR_TARGET_POSITION,
  ROOM_INITIAL_LOOKAT,
  ROOM_INITIAL_POSITION,
} from '../utils/cameraScrollMath';

describe('cameraScrollMath', () => {
  it('clamps scroll progress between 0 and 1 across runway distances', () => {
    expect(calculateScrollProgress(-50, 800)).toBe(0);
    expect(calculateScrollProgress(0, 800)).toBe(0);
    expect(calculateScrollProgress(400, 800)).toBeCloseTo(0.5, 4);
    expect(calculateScrollProgress(800, 800)).toBe(1);
    expect(calculateScrollProgress(1400, 800)).toBe(1);
    expect(calculateScrollProgress(100, 0)).toBe(1);
  });

  it('interpolates camera pose from wide 3D room view into the monitor screen', () => {
    const startPose = computeCameraPose(0, { x: 0, y: 0 });
    expect(startPose.position).toEqual(ROOM_INITIAL_POSITION);
    expect(startPose.lookAt).toEqual(ROOM_INITIAL_LOOKAT);

    const midPose = computeCameraPose(0.5, { x: 0, y: 0 });
    expect(midPose.position[2]).toBeLessThan(ROOM_INITIAL_POSITION[2]);
    expect(midPose.position[2]).toBeGreaterThan(MONITOR_TARGET_POSITION[2]);

    const endPose = computeCameraPose(1, { x: 0.8, y: -0.6 });
    expect(endPose.position[0]).toBeCloseTo(MONITOR_TARGET_POSITION[0], 4);
    expect(endPose.position[1]).toBeCloseTo(MONITOR_TARGET_POSITION[1], 4);
    expect(endPose.position[2]).toBeCloseTo(MONITOR_TARGET_POSITION[2], 4);
    expect(endPose.lookAt[0]).toBeCloseTo(MONITOR_TARGET_LOOKAT[0], 4);
    expect(endPose.lookAt[1]).toBeCloseTo(MONITOR_TARGET_LOOKAT[1], 4);
    expect(endPose.lookAt[2]).toBeCloseTo(MONITOR_TARGET_LOOKAT[2], 4);
  });

  it('guarantees pointer does not tilt lookAt, zeroes vertical Y displacement, and clamps horizontal X to ±0.10', () => {
    const neutralPose = computeCameraPose(0, { x: 0, y: 0 });
    const fullRightPose = computeCameraPose(0, { x: 1, y: 1 });
    const fullLeftPose = computeCameraPose(0, { x: -1, y: -1 });
    const extremePose = computeCameraPose(0, { x: 5, y: -10 });

    // LookAt remains 100% fixed
    expect(fullRightPose.lookAt).toEqual(neutralPose.lookAt);
    expect(fullLeftPose.lookAt).toEqual(neutralPose.lookAt);
    expect(extremePose.lookAt).toEqual(neutralPose.lookAt);

    // Y offset is strictly zero (avatar stays grounded on chair/desk)
    expect(fullRightPose.position[1]).toBe(neutralPose.position[1]);
    expect(fullLeftPose.position[1]).toBe(neutralPose.position[1]);
    expect(extremePose.position[1]).toBe(neutralPose.position[1]);

    // X offset is bounded by ±0.10
    expect(fullRightPose.position[0] - neutralPose.position[0]).toBeCloseTo(0.10, 4);
    expect(fullLeftPose.position[0] - neutralPose.position[0]).toBeCloseTo(-0.10, 4);
    expect(extremePose.position[0] - neutralPose.position[0]).toBeCloseTo(0.10, 4);

    // Attenuation decays to 0 at progress >= 0.8
    const enteringMonitorPose = computeCameraPose(0.85, { x: 1, y: 1 });
    const enteringMonitorNeutral = computeCameraPose(0.85, { x: 0, y: 0 });
    expect(enteringMonitorPose.position).toEqual(enteringMonitorNeutral.position);
  });

  it('computes HUD, monitor overlay, and inside-monitor state across scroll phases', () => {
    const atTop = computePortalTransitionState(0);
    expect(atTop.isInsideMonitor).toBe(false);
    expect(atTop.hudOpacity).toBe(1);
    expect(atTop.screenOverlayOpacity).toBe(0);
    expect(atTop.monitorZoomScale).toBeCloseTo(1, 2);

    const zooming = computePortalTransitionState(0.5);
    expect(zooming.isInsideMonitor).toBe(false);
    expect(zooming.hudOpacity).toBe(0);
    expect(zooming.screenOverlayOpacity).toBe(0);
    expect(zooming.monitorZoomScale).toBeGreaterThan(1);

    const inside = computePortalTransitionState(0.92);
    expect(inside.isInsideMonitor).toBe(true);
    expect(inside.hudOpacity).toBe(0);
    expect(inside.screenOverlayOpacity).toBeGreaterThan(0.5);
  });

  it('maintains grounded room and slides chair and avatar aside as scroll approaches monitor', () => {
    const startRoom = computeRoomTransform(0);
    expect(startRoom.roomPosition).toEqual([2, 0, 0]);
    expect(startRoom.roomRotationY).toBeCloseTo(-2.3, 3);
    expect(startRoom.chairSlideOffset).toBe(0);

    const endRoom = computeRoomTransform(1);
    expect(endRoom.roomPosition[0]).toBeCloseTo(2.0, 2);
    expect(endRoom.roomRotationY).toBeCloseTo(-2.3, 3);
    expect(endRoom.chairSlideOffset).toBeGreaterThan(1.5);
  });

  it('animates avatar dropping from above onto the chair with impact bounce and settles', () => {
    const start = computeAvatarDropEntrance(0);
    expect(start.dropY).toBeGreaterThan(1.5);
    expect(start.armsRaiseAngle).toBeGreaterThan(0.5);
    expect(start.isSettled).toBe(false);

    const midFall = computeAvatarDropEntrance(0.2);
    expect(midFall.dropY).toBeLessThan(start.dropY);
    expect(midFall.dropY).toBeGreaterThan(0.2);

    const impact = computeAvatarDropEntrance(0.46);
    expect(impact.chairCompressionY).toBeLessThan(0);
    expect(impact.squashScaleY).toBeLessThan(1);

    const settled = computeAvatarDropEntrance(1.4);
    expect(settled.dropY).toBeCloseTo(0, 3);
    expect(settled.chairCompressionY).toBeCloseTo(0, 3);
    expect(settled.squashScaleY).toBeCloseTo(1, 3);
    expect(settled.armsRaiseAngle).toBeCloseTo(0, 3);
    expect(settled.isSettled).toBe(true);
  });
});
