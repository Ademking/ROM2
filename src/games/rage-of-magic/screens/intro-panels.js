const PANEL_TRAVEL = 430;
const PANEL_HEIGHT = 98;
const PANEL_ENTER_FRAMES = 20;
const PANEL_EXIT_FRAMES = 15;
function panelPlacement(s) {
  return s === 0
    ? {
        x: 20,
        y: 20,
        goneX: -PANEL_TRAVEL,
        forcedFace: 1,
      }
    : s === 2
      ? {
          x: 62,
          y: 266,
          goneX: 512,
          forcedFace: -1,
        }
      : {
          x: 41,
          y: 143,
          goneX: -645,
        };
}
function easeOutTo(s, e, t, i) {
  const r = 1 - Math.max(0, Math.min(1, t / i));
  return e - (e - s) * r * r;
}
function easeInTo(s, e, t, i) {
  const r = Math.max(0, Math.min(1, t / i));
  return s + (e - s) * r * r;
}
function panelEnterX(s, e) {
  const t = panelPlacement(s);
  return easeOutTo(t.goneX, t.x, e, PANEL_ENTER_FRAMES);
}
function panelExitX(s, e) {
  const t = panelPlacement(s);
  return easeInTo(t.x, t.goneX, e, PANEL_EXIT_FRAMES);
}
export {
  PANEL_ENTER_FRAMES,
  PANEL_EXIT_FRAMES,
  PANEL_HEIGHT,
  PANEL_TRAVEL,
  panelEnterX,
  panelExitX,
  panelPlacement,
};
