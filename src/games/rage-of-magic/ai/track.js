import { ALLY_HIT_RANGE } from './ally.js';
import { approachSpeed } from './wisp.js';
import { Input } from '../constants.js';
function newTrackMemory() {
  return {
    mode: 'decide',
    hit: new Set(),
    speedX: 0,
    speedY: 0,
    speedJump: 0,
  };
}
function pickTrackTarget(s, e, t) {
  const i = ALLY_HIT_RANGE + Math.min(s.level, 10) * 10;
  let r;
  for (const n of e)
    n === s ||
      n === s.parent ||
      t.hit.has(n) ||
      !s.isAlly(n) ||
      n.hp <= 0 ||
      n.hp >= n.totalHp ||
      Math.hypot(n.x - s.x, n.y - s.y) >= i ||
      ((!r || n.hp < r.hp) && (r = n));
  return r;
}
function stepTrackAi(s, e, t) {
  const i = decideTrackAction(s, t);
  return (moveTracker(s, e, t), i);
}
function decideTrackAction(s, e) {
  if (e.mode !== 'die' && e.mode === 'try-die' && s.action()?.onKeyboard)
    return ((e.mode = 'die'), Input.ABC);
}
function actorCenterY(s) {
  const e = s.frame()?.body,
    t = e ? e.y2 - e.y1 + 1 : 0;
  return s.jump + t * 0.75;
}
function moveTracker(s, e, t) {
  if (t.mode === 'try-die' || t.mode === 'die') return;
  if (s.hp <= 0) {
    t.mode = 'try-die';
    return;
  }
  if (t.mode === 'decide') {
    ((t.target = pickTrackTarget(s, e, t)),
      (s.target = t.target),
      t.target ? (t.mode = 'go') : (t.mode = 'try-die'));
    return;
  }
  const i = t.target;
  if (!i?.isLiving()) {
    ((t.mode = 'decide'), (t.target = void 0), (s.target = void 0));
    return;
  }
  if (s.didContact) {
    (t.hit.add(i), (s.y = i.y + 1), (t.mode = 'try-die'));
    return;
  }
  ((t.speedX = approachSpeed(s.x, i.x, t.speedX, 0.1)),
    (t.speedY = approachSpeed(s.y, i.y, t.speedY, 0.05)));
  const r = actorCenterY(i);
  ((t.speedJump = approachSpeed(s.jump, r, t.speedJump, 0.025)),
    (s.x += t.speedX),
    (s.y += t.speedY),
    (s.jump += t.speedJump));
}
function isAutoController(s) {
  return s === 'animal' || s === 'fairy' || s === 'wisp' || s === 'circle' || s === 'track';
}
export { isAutoController, moveTracker, newTrackMemory, stepTrackAi };
