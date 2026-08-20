const NATIVE_SIZE = {
  nativeWidth: 512,
  nativeHeight: 384,
};
const GUI_ICONS = {
  atlas: 'ui.guiicon',
  sourceFrame: 0,
  across: 8,
  width: 30,
  height: 30,
  gutter: 1,
};
const GUI_PANELS = {
  atlas: 'ui.guiicon',
  sourceFrame: 1,
  across: 4,
  width: 32,
  height: 30,
  gutter: 1,
};
const PLAYER_ICONS = {
  atlas: 'ui.plricon',
  sourceFrame: 0,
  across: 7,
  width: 24,
  height: 24,
  gutter: 1,
};
/** The 24x24 hero faces the in-game stats bar uses. */
const HERO_AVATARS = {
  atlas: 'ui.stats',
  sourceFrame: 5,
  across: 3,
  width: 24,
  height: 24,
  gutter: 1,
};
const SELECT_ICONS = {
  atlas: 'ui.plricon',
  sourceFrame: 1,
  across: 5,
  width: 28,
  height: 30,
  gutter: 1,
};
const SMALL_DIGITS = {
  atlas: 'ui.plricon',
  sourceFrame: 2,
  across: 2,
  width: 11,
  height: 16,
  gutter: 1,
};
const HERO_PORTRAITS_SMALL = {
  atlas: 'ui.plricon',
  sourceFrame: 3,
  across: 3,
  width: 89,
  height: 84,
  gutter: 1,
};
const HERO_PORTRAITS = {
  atlas: 'ui.plricon',
  sourceFrame: 4,
  across: 3,
  width: 94,
  height: 92,
  gutter: 1,
};
function atlasCell(s, e, t, i, r = {}) {
  return {
    kind: 'atlas-cell',
    ...s,
    cell: e,
    x: t,
    y: i,
    ...r,
  };
}
function text(s, e, t, i, r = 'left') {
  return {
    kind: 'text',
    font: s,
    text: e,
    x: t,
    y: i,
    ...(r === 'left'
      ? {}
      : {
          anchor: r,
        }),
  };
}
export {
  GUI_ICONS,
  GUI_PANELS,
  HERO_PORTRAITS,
  HERO_PORTRAITS_SMALL,
  NATIVE_SIZE,
  HERO_AVATARS,
  PLAYER_ICONS,
  SELECT_ICONS,
  SMALL_DIGITS,
  atlasCell,
  text,
};
