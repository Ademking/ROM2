import { REACH_PADDING, SPRITE_ORIGIN_X, SPRITE_ORIGIN_Y } from './constants.js';
function worldBox(s, e, t, i, r) {
  const n = SPRITE_ORIGIN_X - s.x1,
    a = s.x2 - SPRITE_ORIGIN_X,
    o = s.x2 - s.x1 + 1,
    l = s.y2 - s.y1 + 1,
    c = Math.trunc(t) - (e === 1 ? n : a),
    h = Math.trunc(i) - (SPRITE_ORIGIN_Y - s.y1) - Math.trunc(r);
  return {
    x1: c,
    y1: h,
    x2: c + o - 1,
    y2: h + l - 1,
  };
}
function footprintBox(s, e, t) {
  if (s.length < 2) return;
  const i = s[0],
    r = s[1],
    n = Math.trunc(e),
    a = Math.trunc(t);
  return {
    x1: n - Math.trunc(i / 2),
    y1: a - Math.trunc(r * 0.75),
    x2: n + Math.trunc(i / 2),
    y2: a + Math.trunc(r * 0.25),
  };
}
function solidBox(s, e, t, i) {
  if (s.length < 3) return;
  const r = s[0],
    n = s[2],
    a = Math.trunc(e),
    o = Math.trunc(t),
    l = Math.trunc(i);
  return {
    x1: a - Math.trunc(r / 2),
    y1: o - n - l,
    x2: a + Math.trunc(r / 2),
    y2: o - l,
  };
}
function boxesOverlap(s, e) {
  return !!(s && e && s.x1 <= e.x2 && s.x2 >= e.x1 && s.y1 <= e.y2 && s.y2 >= e.y1);
}
function withinVerticalReach(s, e, t, i, r) {
  if (s.length < 2 || t.length < 2) return !0;
  const n = 1 + r + REACH_PADDING,
    a = footprintBox(s, 0, e),
    o = footprintBox(t, 0, i);
  return a.y1 - n <= o.y2 && a.y2 + n >= o.y1;
}
function keyboardAction(s, e) {
  return s?.onKeyboard?.[e] ?? -1;
}
export { boxesOverlap, footprintBox, keyboardAction, solidBox, withinVerticalReach, worldBox };
