import { ColorMatrixFilter, Container, Rectangle, Texture } from 'pixi.js';
import { SHADOW_ORIGIN_X } from './constants.js';
const SHADOW_SCALE = 4;
const FADE_FRAMES = 200;
const FADE_BASE = 0.75;
const FADE_RANGE = 0.2;
const SHADOW_HALF_SCALE = SHADOW_SCALE / 2;
function createLayer() {
  return {
    container: new Container(),
  };
}
function ensureOpacityFilter(
  s,
  e = () =>
    new ColorMatrixFilter({
      padding: 0,
    }),
) {
  if (s.opacityFilter) return s.opacityFilter;
  const t = e();
  return ((s.opacityFilter = t), (s.container.filters = [t]), t);
}
function opacityMatrix(s) {
  return [0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1, 0];
}
function blackMatrix() {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
}
function applyLayerOpacity(s, e, t, i) {
  const r = layerOpacity(e, t, i);
  return (
    (s.container.alpha = 1),
    s.opacityFilter && (s.opacityFilter.matrix = opacityMatrix(r)),
    r
  );
}
function destroyLayer(s) {
  ((s.container.filters = []),
    s.opacityFilter?.destroy(),
    (s.opacityFilter = void 0),
    s.container.destroy({
      children: !0,
    }));
}
function layerOpacity(s, e, t) {
  if (e === -1) return 0;
  let i = FADE_BASE + (Math.min(s, FADE_FRAMES) / FADE_FRAMES) * FADE_RANGE;
  return (e === 2 && (i += (1 - i) * (1 - t)), Math.max(0, Math.min(1, 1 - i)));
}
function shadowPlacement(s, e, t, i) {
  if (s.type !== 0) return;
  const r = e ?? {
      x1: 0,
      y1: 0,
      y2: i - 1,
    },
    n = r.y2 - r.y1 + 1;
  return {
    x: s.x + r.x1 - SHADOW_ORIGIN_X,
    y: Math.trunc(s.y / SHADOW_SCALE) + Math.floor(n / SHADOW_SCALE),
    scaleY: -1 / SHADOW_SCALE,
  };
}
function spriteFrameRect(s, e, t, i) {
  const r = e ?? {
      x1: 0,
      y1: 0,
      x2: t - 1,
      y2: i - 1,
    },
    n = r.y2 - r.y1 + 1;
  return {
    x: s.x + r.x1,
    y: s.y + r.y1 - SHADOW_HALF_SCALE,
    width: r.x2 - r.x1 + 1,
    height: Math.ceil(n / SHADOW_SCALE) * SHADOW_SCALE,
  };
}
function isFrameClipped(s, e, t, i, r, n) {
  const a = Math.floor(i / SHADOW_SCALE);
  return !(s > 0 && s + t < r && e > 0 && e + a < n);
}
function shadowFrameRect(s, e, t, i) {
  const r = e ?? {
      x1: 0,
      y1: 0,
      x2: t - 1,
      y2: i - 1,
    },
    n = r.y2 - r.y1 + 1,
    a = Math.floor(n / SHADOW_SCALE) * SHADOW_SCALE;
  if (a !== 0)
    return {
      x: s.x + r.x1,
      y: s.y + r.y1 - SHADOW_HALF_SCALE,
      width: r.x2 - r.x1 + 1,
      height: a,
    };
}
function spriteTexture(s, e, t, i) {
  const r = spriteFrameRect(s.frame, e, t, i);
  return new Texture({
    source: s.source,
    frame: new Rectangle(r.x, r.y, r.width, r.height),
  });
}
function shadowTexture(s, e, t, i) {
  const r = shadowFrameRect(s.frame, e, t, i);
  if (r)
    return new Texture({
      source: s.source,
      frame: new Rectangle(r.x, r.y, r.width, r.height),
    });
}
export {
  applyLayerOpacity,
  blackMatrix,
  createLayer,
  destroyLayer,
  ensureOpacityFilter,
  isFrameClipped,
  shadowPlacement,
  shadowTexture,
  spriteTexture,
};
