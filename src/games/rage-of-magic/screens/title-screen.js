const TITLE_ENTRANCE_STEPS = 18;
const TITLE_HUE_START = -255;
const TITLE_HUE_STEP = 13;
const TITLE_Y_START = -25;
const TITLE_Y_END = 18;
const TITLE_PANEL_X_START = -256;
const TITLE_PANEL_X_END = 30;
const TITLE_PLAYER_LABEL_Y = 50;
const CURSOR_BLINK_FRAMES = 6;
const HERO_CARD_WIDTH = 94;
const HERO_CARD_HEIGHT = 92;
const HERO_CARD_SPACING = HERO_CARD_HEIGHT - 1;
const HERO_CARD_TOP = 25;
const HERO_STATS = [
  {
    name: 'Azrael',
    race: 'Drow Fighter',
    weapon: 'Cleaver Sword',
    stamina: 3,
    strength: 6,
    magic: 4,
    speed: 3,
    voice: 'azhaha',
  },
  {
    name: 'Wren',
    race: 'Human Paladin',
    weapon: 'Bright Blade',
    stamina: 4,
    strength: 4,
    magic: 4,
    speed: 4,
    voice: 'wrenhaha',
  },
  {
    name: 'Lucette',
    race: 'Halfling Fighter',
    weapon: 'Twin Fangs',
    stamina: 4,
    strength: 3,
    magic: 3,
    speed: 6,
    voice: 'luceya',
  },
];
function atlasCellPosition(s, e, t, i, r = 1) {
  const n = Math.max(0, Math.trunc(s));
  return {
    x: (n % e) * (t + r) + r,
    y: Math.floor(n / e) * (i + r) + r,
  };
}
function easeOut(s, e, t, i) {
  const r = 1 - Math.max(0, Math.min(1, t / i));
  return e - (e - s) * r * r;
}
function titleScreenState(s) {
  const e = Math.max(0, Math.trunc(s));
  return {
    frame: e,
    titleY: easeOut(TITLE_Y_START, TITLE_Y_END, e, TITLE_ENTRANCE_STEPS),
    panelX: easeOut(TITLE_PANEL_X_START, TITLE_PANEL_X_END, e, TITLE_ENTRANCE_STEPS),
    hue: Math.min(0, TITLE_HUE_START + e * TITLE_HUE_STEP),
    cursorFrame: Math.floor(e / CURSOR_BLINK_FRAMES) & 1,
  };
}
export {
  HERO_CARD_HEIGHT,
  HERO_CARD_SPACING,
  HERO_CARD_TOP,
  HERO_CARD_WIDTH,
  HERO_STATS,
  TITLE_PLAYER_LABEL_Y,
  atlasCellPosition,
  titleScreenState,
};
