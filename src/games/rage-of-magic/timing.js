const TIMING = Object.freeze({
  captionCloseFrames: 6,
  missionCloseFrames: 6,
  lineCloseFrames: 11,
  dialogCloseFrames: 16,
  markerSeconds: 3,
  goDelayFrames: 1,
  goAnimationLoops: 6,
  goAnimationSpeed: 0.25,
  goAnimationFrameCount: 4,
  quakeEase: 0.75,
});
const GO_TOTAL_FRAMES =
  TIMING.goDelayFrames +
  Math.ceil((TIMING.goAnimationLoops * TIMING.goAnimationFrameCount) / TIMING.goAnimationSpeed);
function noQuake() {
  return {
    active: !1,
    done: !1,
    size: 0,
    direction: 1,
    offsetY: 0,
  };
}
function startQuake(s) {
  return s === 0
    ? noQuake()
    : {
        active: !0,
        done: !1,
        size: s,
        direction: 1,
        offsetY: 0,
      };
}
function stepQuake(s) {
  if (!s.active)
    return s.offsetY === 0
      ? s
      : {
          ...s,
          offsetY: 0,
        };
  const e = Math.trunc(s.size * s.direction);
  return e === 0
    ? {
        ...s,
        active: !1,
        done: !0,
        offsetY: 0,
      }
    : {
        ...s,
        size: s.size * TIMING.quakeEase,
        direction: s.direction === 1 ? -1 : 1,
        offsetY: e,
      };
}
function toInt32(s) {
  return Number.isNaN(s)
    ? 0
    : s >= 2147483647
      ? 2147483647
      : s <= -2147483648
        ? -2147483648
        : Math.trunc(s);
}
function parallaxX(s) {
  const e = toInt32(s.sceneWidth / 2),
    t = toInt32(s.viewportWidth / 2),
    i = (e - (s.cameraX + t)) / (e - t);
  let r = toInt32(-s.cameraX + s.foreX + i * s.distance);
  return (
    s.anchor === 'right'
      ? (r -= toInt32(s.imageWidth))
      : s.anchor !== 'left' && (r -= toInt32(s.imageWidth / 2)),
    r
  );
}
export { GO_TOTAL_FRAMES, TIMING, noQuake, parallaxX, startQuake, stepQuake };
