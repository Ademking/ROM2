const SETTINGS_STORAGE_KEY = 'drillion-retro.rage-of-magic.settings';
const DEFAULT_KEY_MAPS = [
  ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'KeyA', 'KeyS', 'KeyD', 'KeyW'],
  ['Numpad8', 'Numpad6', 'Numpad5', 'Numpad4', 'Numpad7', 'Numpad9', 'NumpadAdd', 'Numpad0'],
];
const DEFAULT_BUTTON_MAP = [0, 1, 2, 5];
const BUTTON_LABELS = {
  0: '1',
  1: '2',
  2: '3',
  3: '1+2',
  5: '1+2+3',
};
const BUTTON_DESCRIPTIONS = {
  0: 'Combo Attack',
  1: 'Magic Attack',
  2: 'Panic Attack',
  3: 'Special Attack',
  5: 'Super Attack',
};
const NAME_ENTRY_CHARS = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@.-=_+ \b
`;
function normalizeKeyMap(s, e) {
  return Array.from(
    {
      length: 8,
    },
    (t, i) => {
      const r = String(s[i] ?? e[i]);
      return r === 'KeyQ' ? e[i] : r;
    },
  );
}
function normalizeButtonMap(s) {
  const e = new Set([0, 1, 2, 3, 5]);
  return Array.from(
    {
      length: 4,
    },
    (t, i) => {
      const r = Math.trunc(Number(s[i]));
      return e.has(r) ? r : DEFAULT_BUTTON_MAP[i];
    },
  );
}
function defaultSettings() {
  return {
    gameSpeedIndex: 1,
    difficultyIndex: 1,
    typeSpeedIndex: 1,
    graphicsIndex: 2,
    hints: !0,
    recolorAllies: !0,
    blood: !0,
    hue: !0,
    slow: !0,
    miniStats: !0,
    foregrounds: !0,
    preferredScreen: '512x384',
    scaleToFit: !0,
    musicMuted: !1,
    soundsMuted: !1,
    keyboardMaps: [
      normalizeKeyMap(DEFAULT_KEY_MAPS[0], DEFAULT_KEY_MAPS[0]),
      normalizeKeyMap(DEFAULT_KEY_MAPS[1], DEFAULT_KEY_MAPS[1]),
    ],
    buttonMaps: [normalizeButtonMap(DEFAULT_BUTTON_MAP), normalizeButtonMap(DEFAULT_BUTTON_MAP)],
    secretCode: '',
  };
}
function clampSettingIndex(s, e) {
  const t = Math.trunc(Number(s));
  return t >= 0 && t <= 2 ? t : e;
}
function toBooleanSetting(s, e) {
  return typeof s == 'boolean' ? s : e;
}
function normalizeSettings(s) {
  const e = defaultSettings(),
    t = s && typeof s == 'object' ? s : {},
    i = Array.isArray(t.keyboardMaps) ? t.keyboardMaps : e.keyboardMaps,
    r = Array.isArray(t.buttonMaps) ? t.buttonMaps : e.buttonMaps;
  return {
    gameSpeedIndex: clampSettingIndex(t.gameSpeedIndex, e.gameSpeedIndex),
    difficultyIndex: clampSettingIndex(t.difficultyIndex, e.difficultyIndex),
    typeSpeedIndex: clampSettingIndex(t.typeSpeedIndex, e.typeSpeedIndex),
    graphicsIndex: clampSettingIndex(t.graphicsIndex, e.graphicsIndex),
    hints: toBooleanSetting(t.hints, e.hints),
    recolorAllies: toBooleanSetting(t.recolorAllies, e.recolorAllies),
    blood: toBooleanSetting(t.blood, e.blood),
    hue: toBooleanSetting(t.hue, e.hue),
    slow: toBooleanSetting(t.slow, e.slow),
    miniStats: toBooleanSetting(t.miniStats, e.miniStats),
    foregrounds: toBooleanSetting(t.foregrounds, e.foregrounds),
    preferredScreen: t.preferredScreen === '640x480' ? '640x480' : '512x384',
    scaleToFit: toBooleanSetting(t.scaleToFit, e.scaleToFit),
    musicMuted: toBooleanSetting(t.musicMuted, e.musicMuted),
    soundsMuted: toBooleanSetting(t.soundsMuted, e.soundsMuted),
    keyboardMaps: [
      normalizeKeyMap(Array.isArray(i[0]) ? i[0] : e.keyboardMaps[0], e.keyboardMaps[0]),
      normalizeKeyMap(Array.isArray(i[1]) ? i[1] : e.keyboardMaps[1], e.keyboardMaps[1]),
    ],
    buttonMaps: [
      normalizeButtonMap(Array.isArray(r[0]) ? r[0] : e.buttonMaps[0]),
      normalizeButtonMap(Array.isArray(r[1]) ? r[1] : e.buttonMaps[1]),
    ],
    secretCode: typeof t.secretCode == 'string' ? t.secretCode.slice(0, 16) : '',
  };
}
function loadSettings(s) {
  if (!s) return defaultSettings();
  try {
    return normalizeSettings(JSON.parse(s.getItem(SETTINGS_STORAGE_KEY) ?? '{}'));
  } catch {
    return defaultSettings();
  }
}
function saveSettings(s, e) {
  if (s)
    try {
      s.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalizeSettings(e)));
    } catch {}
}
function nextButtonAction(s) {
  const e = s + 1;
  return e === 4 ? 5 : e > 5 ? 0 : e;
}
function isAssignableKey(s) {
  return (
    s.length > 0 &&
    !new Set([
      'KeyQ',
      'Escape',
      'AltLeft',
      'AltRight',
      'NumLock',
      'F1',
      'F10',
      'F12',
      'Space',
      'Enter',
      'NumpadEnter',
    ]).has(s)
  );
}
function keyLabel(s) {
  const e = {
    Backspace: '',
    ShiftLeft: '',
    ShiftRight: '',
    ControlLeft: '',
    ControlRight: '',
    Pause: '',
    CapsLock: '',
    PageUp: '',
    PageDown: '',
    End: '',
    Home: '',
    ArrowLeft: '',
    ArrowUp: '',
    ArrowRight: '',
    ArrowDown: '',
    Numpad0: '',
    Numpad1: '',
    Numpad2: '',
    Numpad3: '',
    Numpad4: '',
    Numpad5: '',
    Numpad6: '',
    Numpad7: '',
    Numpad8: '',
    Numpad9: '',
    NumpadMultiply: '',
    NumpadAdd: '',
    NumpadSubtract: '',
    NumpadDecimal: '',
    NumpadDivide: '',
    Delete: '«',
    ScrollLock: '­',
    Insert: '®',
    Comma: ',',
    Minus: '-',
    Period: '.',
    Slash: '/',
    Equal: '=',
    Semicolon: ';',
    BracketLeft: '[',
    Backslash: '\\',
    BracketRight: ']',
    Backquote: '`',
    Quote: "'",
  };
  return e[s]
    ? e[s]
    : /^F([1-9]|1[0-2])$/.test(s)
      ? String.fromCharCode(158 + Number(s.slice(1)))
      : /^Key[A-Z]$/.test(s)
        ? s.slice(3)
        : /^Digit\d$/.test(s)
          ? s.slice(5)
          : '¯';
}
export {
  BUTTON_DESCRIPTIONS,
  BUTTON_LABELS,
  DEFAULT_BUTTON_MAP,
  DEFAULT_KEY_MAPS,
  NAME_ENTRY_CHARS,
  isAssignableKey,
  keyLabel,
  loadSettings,
  nextButtonAction,
  saveSettings,
};
