import { Input } from '../constants.js';
function newWispMemory(s) {
  return {
    mode: 'follow',
    update: 4,
    targetX: s.x,
    targetY: s.y,
    targetJump: s.jump,
    speedX: 0,
    speedY: 0,
    speedJump: 0,
  };
}
function approachSpeed(s, e, t, i) {
  return s > e ? (t > 0 ? t * 0.95 : t) - i : s < e ? (t < 0 ? t * 0.95 : t) + i : t;
}
function stepWispAi(s, e) {
  if (e.nextAction !== void 0) {
    const i = e.nextAction;
    return ((e.nextAction = void 0), trackLeader(s, e), i);
  }
  const t = s.leader;
  if (!(e.mode === 'escape' || !t)) {
    if (!t.isLiving()) return ((e.mode = 'escape'), Input.ABC);
    trackLeader(s, e);
  }
}
function trackLeader(s, e) {
  const t = s.leader;
  e.mode === 'escape' ||
    !t ||
    (e.update >= 10 &&
      ((s.align = t.align),
      (s.spl = s.usedSpl = t.calculateMagicSpl()),
      (s.face = t.face),
      (e.targetX = t.x + t.face * (s.type.start[0] ?? 0)),
      (e.targetY = t.y + 1),
      (e.targetJump = t.jump + (t.type.solid[2] ?? 0) + (s.type.start[2] ?? 0)),
      (e.update = 0)),
    (e.update += 1),
    (e.speedX = approachSpeed(s.x, e.targetX, e.speedX, 0.15)),
    (e.speedY = approachSpeed(s.y, e.targetY, e.speedY, 0.05)),
    (e.speedJump = approachSpeed(s.jump, e.targetJump, e.speedJump, 0.025)),
    (s.x += e.speedX),
    (s.y += e.speedY),
    (s.jump += e.speedJump));
}
function weakestAlly(s, e) {
  let t;
  for (const i of e)
    i === s ||
      i === s.parent ||
      !s.isAlly(i) ||
      i.hp <= 0 ||
      i.hp >= i.totalHp ||
      ((!t || i.hp < t.hp) && (t = i));
  return t;
}
export { approachSpeed, newWispMemory, stepWispAi, trackLeader, weakestAlly };
