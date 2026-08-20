function hashString(s) {
  let e = 2166136261;
  for (let t = 0; t < s.length; t += 1) ((e ^= s.charCodeAt(t)), (e = Math.imul(e, 16777619)));
  return e >>> 0;
}
function seededRandom(s = 327) {
  let e = s >>> 0;
  const t = () => {
    e = (e + 1831565813) >>> 0;
    let i = e;
    return (
      (i = Math.imul(i ^ (i >>> 15), i | 1)),
      (i ^= i + Math.imul(i ^ (i >>> 7), i | 61)),
      ((i ^ (i >>> 14)) >>> 0) / 4294967296
    );
  };
  return {
    int(i) {
      const r = Math.max(0, Math.trunc(i));
      return r <= 1 ? 0 : Math.floor(t() * r);
    },
    boolean() {
      return t() >= 0.5;
    },
  };
}
function distanceBetween(s, e) {
  return Math.hypot(s.x - e.x, s.y - e.y);
}
function solidHalfWidth(s) {
  return Math.trunc((s[0] ?? 0) / 2) * 2 + 1;
}
function solidHeight(s) {
  const e = s[1] ?? 0;
  return Math.trunc(e * 0.75) + Math.trunc(e * 0.25) + 1;
}
function pointTowards(s, e, t, i, r) {
  const n = t - s,
    a = i - e,
    o = Math.hypot(n, a) || 1;
  return [s + (n / o) * r, e + (a / o) * r];
}
function sideOf(s, e) {
  return s.x > e.x ? -1 : 1;
}
function lessCrowdedSide(s, e, t) {
  let i = 0,
    r = 0;
  for (const n of t) n === s || n.target !== e || (n.x > e.x ? (r += 1) : (i += 1));
  return i === r ? (s.x > e.x ? 1 : -1) : i < r ? -1 : 1;
}
function bestTarget(s, e, t, i = () => !0) {
  let r,
    n = Number.POSITIVE_INFINITY;
  for (const a of e) {
    if (!t(s, a) || !i(a)) continue;
    let o = 0;
    for (const l of e) l.target === a && (o += 1);
    o < n && ((n = o), (r = a));
  }
  return r;
}
export {
  bestTarget,
  distanceBetween,
  hashString,
  lessCrowdedSide,
  pointTowards,
  seededRandom,
  sideOf,
  solidHalfWidth,
  solidHeight,
};
