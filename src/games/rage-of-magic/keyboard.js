import { Input } from './constants.js';
import { DEFAULT_BUTTON_MAP, DEFAULT_KEY_MAPS } from './settings.js';
function readAttackInput(s, e, t, i = DEFAULT_BUTTON_MAP) {
  const r = Math.trunc(e) === 1,
    n = t ?? DEFAULT_KEY_MAPS[r ? 1 : 0],
    a = [!r && (s.has('Space') || s.has('Enter')), !1, !1];
  for (let h = 0; h < 4; h += 1) {
    if (!s.has(n[h + 4])) continue;
    const u = i[h];
    u === 5 ? (a[0] = a[1] = a[2] = !0) : u === 3 ? (a[0] = a[1] = !0) : (a[u] = !0);
  }
  const [o, l, c] = a;
  if (o && l && c) return Input.ABC;
  if (o && l) return Input.AB;
  if (c) return Input.C;
  if (l) return Input.B;
  if (o) return Input.A;
}
function readInput(s, e, t, i = DEFAULT_BUTTON_MAP) {
  const r = readAttackInput(s, e, t, i);
  if (r !== void 0) return r;
  const n = Math.trunc(e) === 1,
    a = t ?? DEFAULT_KEY_MAPS[n ? 1 : 0],
    [o, l, c, h] = a,
    u = s.has(h) ? -1 : s.has(l) ? 1 : 0,
    d = s.has(o) ? -1 : s.has(c) ? 1 : 0;
  return u > 0 && d < 0
    ? Input.UP_FORWARD
    : u < 0 && d < 0
      ? Input.UP_BACKWARD
      : u > 0 && d > 0
        ? Input.DOWN_FORWARD
        : u < 0 && d > 0
          ? Input.DOWN_BACKWARD
          : u > 0
            ? Input.FORWARD
            : u < 0
              ? Input.BACKWARD
              : d < 0
                ? Input.UP
                : d > 0
                  ? Input.DOWN
                  : Input.NOTHING;
}
export { readInput };
