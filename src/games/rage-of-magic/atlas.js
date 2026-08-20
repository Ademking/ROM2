import { Container, Rectangle, Sprite, Texture } from 'pixi.js';
function subTexture(s, e, t, i, r) {
  return new Texture({
    source: s.source,
    frame: new Rectangle(s.frame.x + e, s.frame.y + t, i, r),
  });
}
function trimmedTexture(s, e) {
  const t = s.textures[e],
    i = s.entry.bounds[e];
  return !t || !i ? t : subTexture(t, i.x1, i.y1, i.x2 - i.x1 + 1, i.y2 - i.y1 + 1);
}
function regionTexture(s, e, t, i, r, n) {
  const a = s.textures[e],
    o = s.entry.bounds[e];
  if (a) return subTexture(a, (o?.x1 ?? 0) + t, (o?.y1 ?? 0) + i, r, n);
}
function measureBitmapText(s, e) {
  let t = 0,
    i = 0;
  for (const r of e) {
    if (
      r ===
      `
`
    ) {
      ((i = Math.max(i, t)), (t = 0));
      continue;
    }
    if (r === ' ') {
      t += s.spaceAdvance;
      continue;
    }
    const n = s.glyphs[String(r.charCodeAt(0))];
    n && (t += n.advance);
  }
  return Math.max(i, t);
}
function buildBitmapText(s, e, t, i) {
  const r = new Container(),
    n = e.textures[s.frame];
  if (!n)
    return {
      container: r,
      width: 0,
      height: 0,
    };
  let a = 0,
    o = 0,
    l = 0,
    c = 1;
  for (const h of t) {
    if (
      h ===
      `
`
    ) {
      ((l = Math.max(l, a)), (a = 0), (o += s.height), (c += 1));
      continue;
    }
    if (h === ' ') {
      a += s.spaceAdvance;
      continue;
    }
    const u = s.glyphs[String(h.charCodeAt(0))];
    if (!u) continue;
    const d = `font:${s.frame}:${h.charCodeAt(0)}`;
    let f = i?.get(d);
    f || ((f = subTexture(n, u.x, u.y, u.width, u.height)), i?.set(d, f));
    const m = new Sprite(f);
    (m.position.set(Math.round(a), Math.round(o)), r.addChild(m), (a += u.advance));
  }
  return (
    (l = Math.max(l, a)),
    {
      container: r,
      width: l,
      height: c * s.height,
    }
  );
}
export { buildBitmapText, measureBitmapText, regionTexture, trimmedTexture };
