import { Input } from '../constants.js';
const ALLY_HIT_RANGE = 200;
const DEFAULT_RANDOM = {
  int: (s) => (s <= 0 ? 0 : Math.floor(Math.random() * s)),
};
const AllyState = {
  WAIT_DECIDE: 'wait-decide',
  WAIT: 'wait',
  ESCAPE_DECIDE: 'escape-decide',
  ESCAPE: 'escape',
  GOTO_DECIDE: 'goto-decide',
  GOTO: 'goto',
};
function newAllyMemory() {
  return {
    mode: AllyState.WAIT_DECIDE,
    wait: 0,
    gotoX: 0,
    gotoY: 0,
    wasBumped: !1,
    wasAttacked: !1,
    doRun: !1,
  };
}
function markAllyBumped(s) {
  s.wasBumped = !0;
}
function unitVector(s, e, t, i) {
  const r = t - s,
    n = i - e,
    a = Math.hypot(r, n);
  return a === 0 ? [1, 0] : [r / a, n / a];
}
function movePoint(s, e, t, i, r) {
  const [n, a] = unitVector(s, e, t, i);
  return [s + n * r, e + a * r];
}
function pointAtAngle(s, e, t, i) {
  const r = (s * Math.PI) / 180;
  return [e + Math.cos(r) * i, t + Math.sin(r) * i];
}
function clampToPlayArea(s, e) {
  (s.gotoX < e.playerMinX
    ? (s.gotoX = e.playerMinX + 1)
    : s.gotoX > e.playerMaxX && (s.gotoX = e.playerMaxX - 1),
    s.gotoY < 0 ? (s.gotoY = 1) : s.gotoY > e.floorHeight - 1 && (s.gotoY = e.floorHeight - 2));
}
function stepToward(s, e, t, i) {
  let r = Math.trunc(e),
    n = Math.trunc(t);
  const a = Math.trunc(s.x),
    o = Math.trunc(s.y);
  return (
    Math.abs(r - a) <= 9 && (r = a),
    Math.abs(n - o) <= 3 && (n = o),
    a > r && o > n
      ? {
          command: Input.UP_BACKWARD,
          arrived: !1,
        }
      : a > r && o < n
        ? {
            command: Input.DOWN_BACKWARD,
            arrived: !1,
          }
        : a < r && o > n
          ? {
              command: Input.UP_FORWARD,
              arrived: !1,
            }
          : a < r && o < n
            ? {
                command: Input.DOWN_FORWARD,
                arrived: !1,
              }
            : a > r
              ? {
                  command: i ? Input.RUN_BACKWARD : Input.BACKWARD,
                  arrived: !1,
                }
              : a < r
                ? {
                    command: i ? Input.RUN_FORWARD : Input.FORWARD,
                    arrived: !1,
                  }
                : o > n
                  ? {
                      command: Input.UP,
                      arrived: !1,
                    }
                  : o < n
                    ? {
                        command: Input.DOWN,
                        arrived: !1,
                      }
                    : {
                        arrived: !0,
                      }
  );
}
function searchFreeSpot(s, e, t, i, r, n, a, o, l) {
  for (let u = 0; u < r; u += 1) {
    const d = i.int(23) * 15,
      [f, m] = pointAtAngle(d, s.x, s.y, o + i.int(l));
    if (
      ((e.gotoX = Math.trunc(f)),
      (e.gotoY = Math.trunc(m)),
      !((s.face === 1 && e.gotoX < s.x) || (s.face === -1 && e.gotoX > s.x)) &&
        (clampToPlayArea(e, t), t.isPathClear(s, e.gotoX, e.gotoY)))
    ) {
      e.mode = n;
      return;
    }
  }
  const [c, h] = pointAtAngle(0, s.x, s.y, o);
  if (
    ((e.gotoX = Math.trunc(c)),
    (e.gotoY = Math.trunc(h)),
    clampToPlayArea(e, t),
    t.isPathClear(s, e.gotoX, e.gotoY))
  ) {
    e.mode = n;
    return;
  }
  return ((e.mode = a), Input.NOTHING);
}
function stepAllyAi(s, e, t, i = DEFAULT_RANDOM) {
  if (!s.action()?.onKeyboard) return;
  s.whoHitMe && (e.wasAttacked = !0);
  let r;
  if (
    (e.wasAttacked
      ? ((e.mode = AllyState.GOTO_DECIDE), (e.wasAttacked = !1), (e.wasBumped = !1), (e.doRun = !0))
      : e.wasBumped &&
        ((r = Input.NOTHING),
        (e.mode =
          e.mode !== AllyState.ESCAPE_DECIDE ? AllyState.ESCAPE_DECIDE : AllyState.WAIT_DECIDE),
        (e.wasBumped = !1),
        (e.doRun = !1)),
    e.mode === AllyState.WAIT_DECIDE)
  )
    return ((e.wait = 30 + i.int(90)), (e.mode = AllyState.WAIT), Input.NOTHING);
  if (e.mode === AllyState.WAIT) {
    (e.wait <= 0 && (e.mode = AllyState.GOTO_DECIDE), (e.wait -= 1));
    return;
  }
  if (e.mode === AllyState.ESCAPE_DECIDE)
    return searchFreeSpot(s, e, t, i, 4, AllyState.ESCAPE, AllyState.WAIT_DECIDE, 50, 80) ?? r;
  if (e.mode === AllyState.ESCAPE) {
    const a = stepToward(s, e.gotoX, e.gotoY, e.doRun);
    return (a.arrived && (e.mode = AllyState.GOTO_DECIDE), a.command ?? r);
  }
  if (e.mode === AllyState.GOTO_DECIDE) {
    if (s.whoHitMe) {
      const [a, o] = unitVector(s.whoHitMe.x, s.whoHitMe.y, s.x, s.y),
        l = 50 + i.int(150);
      ((e.gotoX = Math.trunc(s.x) + Math.trunc(a * l)),
        (e.gotoY = Math.trunc(s.y) + Math.trunc(o * l)),
        e.gotoY < 0 ? (e.gotoY = 1) : e.gotoY > t.floorHeight - 1 && (e.gotoY = t.floorHeight - 2),
        (s.whoHitMe = void 0),
        (e.mode = AllyState.GOTO));
      return;
    }
    for (let a = 0; a < 4; a += 1)
      if (
        ((e.gotoX = i.int(Math.max(0, t.sceneWidth - 1))),
        (e.gotoY = i.int(Math.max(0, t.floorHeight - 1))),
        t.isAnimalSpotClear(s, e.gotoX, e.gotoY))
      ) {
        e.mode = AllyState.GOTO;
        return;
      }
    e.mode = AllyState.WAIT_DECIDE;
    return;
  }
  const n = stepToward(s, e.gotoX, e.gotoY, e.doRun);
  return (n.arrived && (e.mode = AllyState.WAIT_DECIDE), n.command ?? r);
}
export {
  ALLY_HIT_RANGE,
  DEFAULT_RANDOM,
  clampToPlayArea,
  markAllyBumped,
  movePoint,
  newAllyMemory,
  searchFreeSpot,
  stepAllyAi,
  stepToward,
  unitVector,
};
