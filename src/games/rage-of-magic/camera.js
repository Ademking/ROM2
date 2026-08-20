const DEFAULT_VIEWPORT_WIDTH = 512;
const DEFAULT_VIEWPORT_HEIGHT = 384;
const DEFAULT_SCENE_HEIGHT = 392;
const CAMERA_SNAP_DISTANCE = 15;
const DEFAULT_FLOOR_WIGGLE = 8;
const CAMERA_GLIDE_STEPS = 10;
const trunc = Math.trunc;
function clamp(s, e, t) {
  return s < e ? e : s > t ? t : s;
}
function distance(s, e, t, i) {
  return Math.hypot(t - s, i - e);
}
function floorOffset(s, e) {
  return trunc(s.floorWiggle * (1 - e / (s.floorHeight + s.floorWiggle)));
}
function createCamera(s) {
  const e = s.viewportWidth ?? DEFAULT_VIEWPORT_WIDTH,
    t = s.viewportHeight ?? DEFAULT_VIEWPORT_HEIGHT,
    i = s.sceneHeight ?? DEFAULT_SCENE_HEIGHT,
    r = s.floorWiggle ?? DEFAULT_FLOOR_WIGGLE,
    n = s.floorHeight ?? 113,
    a = s.sceneMaxX ?? s.sceneWidth - 1,
    o = s.sceneMinX ?? 0,
    l = s.playerMinX ?? o,
    c = s.playerMaxX ?? a,
    h = s.pushX1 ?? trunc(e * 0.25),
    u = s.pushX2 ?? e - h,
    d = {
      floorHeight: n,
      floorWiggle: r,
    };
  return {
    x: s.x ?? 0,
    y: s.y ?? floorOffset(d, n / 2),
    mode: 'none',
    actorId: null,
    sceneWidth: s.sceneWidth,
    sceneHeight: i,
    viewportWidth: e,
    viewportHeight: t,
    floorHeight: n,
    floorWiggle: r,
    sceneMinX: o,
    sceneMaxX: a,
    playerMinX: l,
    playerMaxX: c,
    pushX1: h,
    pushX2: u,
    targetX: 0,
    targetY: 0,
    targetAccelerationX: 0,
    targetAccelerationY: 0,
    targetSteps: 0,
    targetStep: 0,
    targetDoneMode: 'none',
  };
}
function withSceneBounds(s, e, t, i = !0) {
  const r = Math.max(0, trunc(e)),
    n = Math.min(s.sceneWidth - 1, trunc(t));
  return {
    ...s,
    sceneMinX: r,
    sceneMaxX: n,
    playerMinX: i ? r : s.playerMinX,
    playerMaxX: i ? n : s.playerMaxX,
  };
}
function withPlayerBounds(s, e, t) {
  return {
    ...s,
    playerMinX: trunc(e),
    playerMaxX: trunc(t),
  };
}
function moveCameraTo(s, e, t) {
  const i = clamp(trunc(e), 0, s.sceneWidth - s.viewportWidth),
    r = clamp(trunc(t), 0, s.sceneHeight - s.viewportHeight);
  return {
    ...s,
    x: i,
    y: r,
    mode: 'none',
  };
}
function moveCameraToQuadrant(s, e) {
  return moveCameraTo(s, trunc((e - 1) * s.viewportWidth), 0);
}
function centerCameraOnActor(s, e) {
  return e
    ? {
        ...s,
        actorId: e.id,
        mode: 'actor-center',
      }
    : s;
}
function pushCameraWithActor(s, e) {
  return e
    ? {
        ...s,
        actorId: e.id,
        mode: 'actor-push',
      }
    : s;
}
function glideCameraTo(s, e, t, i, r = 'none') {
  const n = trunc(e),
    a = trunc(t);
  if (
    (n === s.x && a === s.y) ||
    (n === s.targetX && a === s.targetY) ||
    distance(s.x, s.y, n, a) < CAMERA_SNAP_DISTANCE
  )
    return {
      ...s,
      x: n,
      y: a,
      mode: r,
    };
  const o = clamp(n, 0, s.sceneWidth - s.viewportWidth),
    l = clamp(a, 0, s.sceneHeight - s.viewportHeight),
    c = trunc(i);
  if (c <= 0)
    return {
      ...s,
      x: o,
      y: l,
      mode: r,
    };
  const h = o - s.x,
    u = l - s.y,
    d = c ** 2;
  return {
    ...s,
    mode: 'target',
    targetX: o,
    targetY: l,
    targetAccelerationX: h === 0 ? 0 : (2 * h) / d,
    targetAccelerationY: u === 0 ? 0 : (2 * u) / d,
    targetSteps: c,
    targetStep: 0,
    targetDoneMode: r,
  };
}
function centerCameraOn(s, e, t) {
  return e ? glideCameraTo(s, trunc(e.x) - trunc(s.viewportWidth / 2), trunc(e.y), t, 'none') : s;
}
function actorSpread(s, e) {
  let t = 99999,
    i = 0,
    r = 0,
    n = 0;
  for (const a of s) {
    if (a.removed || a.hp <= 0) continue;
    if (e) {
      if (a.joined === !1) continue;
    } else if (a.cameraExcluded || a.role === 'none' || a.role === 'pickup') continue;
    const o = trunc(a.x);
    (o > i && (i = o), o < t && (t = o), (r += a.y), n++);
  }
  if (n !== 0)
    return {
      count: n,
      minX: t,
      maxX: i,
      averageY: r / n,
    };
}
function fitSpreadToViewport(s, e) {
  let t = e.minX,
    i = e.maxX;
  const r = s.viewportWidth - (i - t);
  r < 0 && ((t = trunc(t - r / 2)), (i = trunc(i + r / 2)));
  let n = trunc(s.x);
  return (
    r > s.pushX1 * 2
      ? t < s.x + s.pushX1
        ? (n = t - s.pushX1)
        : i > s.x + s.pushX2 && (n = i - s.pushX2)
      : (n = trunc((i + t) / 2) - trunc(s.viewportWidth / 2)),
    (n = clamp(n, s.sceneMinX, s.sceneMaxX - s.viewportWidth + 1)),
    {
      x: n,
      y: floorOffset(s, e.averageY),
    }
  );
}
function trackAllActors(s, e) {
  const t = {
      ...s,
      mode: 'target-actors',
    },
    i = actorSpread(e, !1);
  if (!i) return t;
  const r = fitSpreadToViewport(t, i);
  return glideCameraTo(t, r.x, r.y, CAMERA_GLIDE_STEPS, 'target-actors');
}
function trackPlayers(s, e) {
  let t = {
    ...s,
    mode: 'target-players',
  };
  const i = actorSpread(e, !0);
  if (!i) return t;
  i.count >= 2 &&
    i.maxX - i.minX >= s.viewportWidth &&
    (t = {
      ...t,
      playerMinX: i.minX,
      playerMaxX: i.maxX,
    });
  const r = fitSpreadToViewport(t, i);
  return glideCameraTo(t, r.x, r.y, CAMERA_GLIDE_STEPS, 'target-players');
}
function trackPlayersClamped(s, e) {
  let t = {
    ...s,
    mode: 'target-players',
  };
  const i = actorSpread(e, !0);
  if (!i) return t;
  i.count >= 2 &&
    i.maxX - i.minX >= s.viewportWidth &&
    (t = {
      ...t,
      playerMinX: i.minX,
      playerMaxX: i.maxX,
    });
  const r = clamp(i.minX - t.pushX1, t.sceneMinX, t.sceneMaxX - t.viewportWidth + 1);
  return glideCameraTo(t, r, floorOffset(t, i.averageY), CAMERA_GLIDE_STEPS, 'target-players');
}
function followPlayer(s, e) {
  let t = e.x - s.viewportWidth / 2;
  return (
    t < s.playerMinX
      ? (t = s.playerMinX)
      : t > s.playerMaxX - s.viewportWidth && (t = s.playerMaxX - s.viewportWidth),
    {
      ...s,
      x: t,
      y: floorOffset(s, e.y),
    }
  );
}
function pushWithPlayer(s, e) {
  let t = s.x;
  return (
    e.x < t + s.pushX1 ? (t = e.x - s.pushX1) : e.x > t + s.pushX2 && (t = e.x - s.pushX2),
    t < s.sceneMinX
      ? (t = s.playerMinX)
      : t > s.sceneMaxX - (s.viewportWidth - 1) && (t = s.playerMaxX - (s.viewportWidth - 1)),
    {
      ...s,
      x: t,
      y: floorOffset(s, e.y),
    }
  );
}
function stepCameraGlide(s) {
  if (s.targetStep < s.targetSteps) {
    const e = s.targetSteps - s.targetStep;
    return {
      ...s,
      x: s.targetX - 0.5 * s.targetAccelerationX * e ** 2,
      y: s.targetY - 0.5 * s.targetAccelerationY * e ** 2,
      targetStep: s.targetStep + 1,
    };
  }
  return {
    ...s,
    x: s.targetX,
    y: s.targetY,
    mode: s.targetDoneMode,
  };
}
function stepCamera(s, e = {}) {
  const t = e.actors ?? [],
    i = e.players ?? t.filter((r) => r.role === 'player');
  if (s.mode === 'actor-center' || s.mode === 'actor-push') {
    const r = [...t, ...i].find((n) => n.id === s.actorId);
    return r ? (s.mode === 'actor-center' ? followPlayer(s, r) : pushWithPlayer(s, r)) : s;
  }
  return s.mode === 'target-actors'
    ? trackAllActors(s, t)
    : s.mode === 'target-players'
      ? trackPlayers(s, i)
      : s.mode === 'target'
        ? stepCameraGlide(s)
        : s;
}
export {
  centerCameraOn,
  centerCameraOnActor,
  createCamera,
  glideCameraTo,
  moveCameraTo,
  moveCameraToQuadrant,
  pushCameraWithActor,
  stepCamera,
  trackAllActors,
  trackPlayers,
  trackPlayersClamped,
  withPlayerBounds,
  withSceneBounds,
};
