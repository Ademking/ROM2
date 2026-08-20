import { Input } from '../constants.js';
function controllerKindOf(s, e) {
  const t = s.controllerKind;
  return t === 'script'
    ? 'script'
    : t === 'animal' || t === 'fairy' || t === 'wisp' || t === 'circle' || t === 'track'
      ? 'ai'
      : e === 'script'
        ? 'script'
        : t === 'player'
          ? 'player'
          : 'ai';
}
function newFollowMemory(s) {
  const e = s.leader ?? (s.parent !== s ? s.parent : void 0);
  return {
    mode: 'follow',
    yDistance: e?.type.solid[1] ?? 0,
    jumpDistance: (e?.type.solid[2] ?? 0) / 2,
  };
}
function circleSiblings(s, e, t) {
  const i = e.filter(
    (n) => n !== t && !n.removed && n.controllerKind === 'circle' && n.leader === s,
  );
  if (i.length === 0) return i;
  const r = 360 / i.length;
  return (
    i.forEach((n, a) => {
      const o = a * r;
      ((n.circleAngleX = o), (n.circleAngleY = o), (n.circleAngleJump = o));
    }),
    i
  );
}
function stepCircleAi(s, e, t) {
  const i = decideCircleAction(s, e, t);
  return (followLeader(s, e), i);
}
function decideCircleAction(s, e, t) {
  if (e.mode === 'escape') return;
  const i = s.leader ?? (s.parent !== s ? s.parent : void 0);
  if (i && (i.hp <= 0 || s.hp <= 0) && s.action()?.onKeyboard)
    return ((e.mode = 'escape'), circleSiblings(i, t, s), Input.ABC);
}
function followLeader(s, e) {
  if (e.mode !== 'follow') return;
  const t = s.leader ?? (s.parent !== s ? s.parent : void 0);
  if (!t) return;
  const i = 4 + t.spl / 2;
  ((s.circleAngleX += i),
    s.circleAngleX >= 360 && (s.circleAngleX -= 360),
    (s.circleAngleY += i),
    s.circleAngleY >= 360 && (s.circleAngleY -= 360),
    (s.circleAngleJump += i),
    s.circleAngleJump >= 360 && (s.circleAngleJump -= 360),
    (s.spl = s.usedSpl = t.calculateMagicSpl()));
  const r = (a) => (a * Math.PI) / 180,
    n = (t.type.solid[0] ?? 0) + t.spl * 5;
  ((s.x = t.x + Math.cos(r(s.circleAngleX)) * n),
    (s.y = t.y + Math.sin(r(s.circleAngleY)) * e.yDistance),
    (s.jump = t.jump + Math.sin(r(s.circleAngleJump)) * (e.jumpDistance / 3) + e.jumpDistance),
    (s.face = t.face));
}
export { circleSiblings, controllerKindOf, followLeader, newFollowMemory, stepCircleAi };
