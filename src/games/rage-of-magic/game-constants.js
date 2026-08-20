const MENU_MUSIC = ['006a', '006b'];
const RAGE_STARTUP_SOUND = 'drillion-retro-startup';
const RAGE_HIGH_SCORE_KEY = 'drillion-retro.rage-of-magic.high-score';
const ONLINE_SCORE_URLS = {
  arcade: 'https://www.drillion.com/scores/rage-of-magic-ii?mode=arcade',
  survival: 'https://www.drillion.com/scores/rage-of-magic-ii?mode=survival',
};
const RAGE_PROGRESS_KEY = 'drillion-retro.rage-of-magic.progress';
const SPLASH_RATE = 20;
const SPLASH_FAST_RATE = 15;
const PICKUP_ICONS = {
  apple: 0,
  drumstick: 1,
  dinner: 2,
  hp: 3,
  mp: 4,
  sp: 5,
  life: 6,
  fairy: 7,
  refract: 14,
  level: 16,
  absorb: 17,
  rage: 19,
  coin: 22,
};
const HUE_RAMP = [
  {
    r: 0,
    g: 100,
    b: 255,
  },
  {
    r: 10,
    g: 150,
    b: 255,
  },
  {
    r: 150,
    g: 50,
    b: 255,
  },
  {
    r: 255,
    g: 50,
    b: 20,
  },
  {
    r: 255,
    g: -50,
    b: -20,
  },
];
const PICKUP_NAMES = new Map(Object.entries(PICKUP_ICONS).map(([s, e]) => [e, s]));
const ALLY_ACTOR_IDS = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'sol',
  'sola',
  'wolf',
  'mage',
  'aco',
  'cler',
  'knt',
  'wara',
  'warb',
  'pig',
  'amaz',
  'amaza',
  'athf',
  'amag',
  'orc',
  'orca',
  'baka',
  'grisa',
  'ogre',
  'troll',
  'dlrd',
  'tom',
  'leo',
  'puck',
  'mwa',
  'sda',
  'dor',
  'strd',
];
const GAME_KEYS = new Set([
  'Enter',
  'Space',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyW',
  'Numpad7',
  'Numpad9',
  'NumpadAdd',
  'Numpad0',
]);
const TEXT_WRAP_WIDTH = 316;
const FONT_INDEX = {
  'small-white': 0,
  'small-blue': 1,
  'big-white': 2,
  'big-gold': 3,
  'big-blue': 4,
  'small-red': 5,
};
function safeLocalStorage() {
  try {
    return typeof window > 'u' ? void 0 : window.localStorage;
  } catch {
    return;
  }
}
function newPlayerProgress(s = 0) {
  return {
    didJoin: !1,
    character: s,
    color: 0,
    selectList: Array.from(
      {
        length: 35,
      },
      () => 0,
    ),
    score: 0,
    coins: 0,
    allyCount: 0,
    actor: null,
    createdAllies: [],
  };
}
function normalizePlayerProgress(s, e = 0) {
  const t = s && typeof s == 'object' ? s : {},
    i = Array.isArray(t.selectList)
      ? Array.from(
          {
            length: 35,
          },
          (r, n) => Math.max(0, Math.trunc(Number(t.selectList?.[n]) || 0)),
        )
      : newPlayerProgress().selectList;
  return {
    didJoin: t.didJoin === !0,
    character: Math.max(0, Math.min(2, Math.trunc(Number(t.character) || e))),
    color: Math.max(0, Math.trunc(Number(t.color) || 0)),
    selectList: i,
    score: Math.max(0, Math.trunc(Number(t.score) || 0)),
    coins: Math.max(0, Math.trunc(Number(t.coins) || 0)),
    allyCount: Math.max(0, Math.trunc(Number(t.allyCount) || 0)),
    actor: null,
    createdAllies: [],
  };
}
export {
  ALLY_ACTOR_IDS,
  FONT_INDEX,
  GAME_KEYS,
  HUE_RAMP,
  MENU_MUSIC,
  ONLINE_SCORE_URLS,
  PICKUP_ICONS,
  PICKUP_NAMES,
  RAGE_HIGH_SCORE_KEY,
  RAGE_PROGRESS_KEY,
  RAGE_STARTUP_SOUND,
  SPLASH_FAST_RATE,
  SPLASH_RATE,
  TEXT_WRAP_WIDTH,
  newPlayerProgress,
  normalizePlayerProgress,
  safeLocalStorage,
};
