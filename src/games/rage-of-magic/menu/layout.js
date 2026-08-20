import { BUTTON_LABELS, DEFAULT_BUTTON_MAP, DEFAULT_KEY_MAPS, keyLabel } from '../settings.js';
const MENU_SLIDE_STEPS = 5;
const MENU_IDLE_FRAMES = 501;
const CHAPTER_AUTOSELECT_FRAMES = 150;
const MENU_WIDTH = 266;
const MENU_INNER_WIDTH = MENU_WIDTH - 2;
const MENU_LOGO_HEIGHT = 58;
const MENU_TITLE_HEIGHT = 50;
const MENU_NO_TITLE_HEIGHT = 20;
const MENU_ITEM_HEIGHT = 33;
const MENU_SUBTITLE_ITEM_HEIGHT = 45;
const MENU_FOOTER_HEIGHT = 18;
const MENU_KEY_WIDTH = 32;
const MENU_MAX_HEIGHT = 366;
const MENU_CENTER_OFFSET = 50;
const MENU_ROW_HEIGHT = 33;
function pad3(s) {
  return `000${Math.trunc(s)}`.slice(-3);
}
function menuItem(s, e, t = 0) {
  return t === 0
    ? {
        title: s,
        action: e,
      }
    : {
        title: s,
        action: e,
        type: t,
      };
}
function submenuItem(s, e, t) {
  return {
    title: s,
    subtitle: t,
    submenu: {
      items: e,
    },
  };
}
function buildMainMenu(s = {}) {
  const e = s.distribution ?? 'archive',
    t = s.fullEdition !== !1,
    i = Math.max(1, Math.trunc(s.arcadeChapter ?? 1)),
    r = Math.max(1, Math.trunc(s.arenaChapter ?? 1)),
    n =
      s.arcadeProgressed || i > 1
        ? [
            menuItem(`Continue At ${pad3(i)}`, 'continue-arcade'),
            menuItem('Replay Chapter', 'replay-arcade'),
            menuItem('Restart Game', 'restart-arcade'),
          ]
        : [menuItem('Begin Arcade', 'begin-arcade')];
  n.push(menuItem('High Scores', 'hiscores-arcade'));
  const a =
    s.arenaProgressed || r > 1
      ? [
          menuItem(`Continue At ${pad3(r)}`, 'continue-arena'),
          menuItem('Replay Stage', 'replay-arena'),
          menuItem('Restart Game', 'restart-arena'),
        ]
      : [menuItem('Begin Arena', 'begin-arena')];
  a.push(menuItem('High Scores', 'hiscores-arena'));
  const o = [
      menuItem(`Game Speed:${s.gameSpeed ?? 'MED'}`, 'cycle-game-speed'),
      menuItem(`Difficulty:${s.difficulty ?? 'NORM'}`, 'cycle-difficulty'),
      menuItem(`Type Speed:${s.typeSpeed ?? 'MED'}`, 'cycle-type-speed'),
      menuItem(`Show Hints:${s.showHints === !1 ? 'OFF' : 'ON'}`, 'toggle-hints'),
      menuItem(`Recolor Ally:${s.recolorAlly === !1 ? 'OFF' : 'ON'}`, 'toggle-recolor'),
      menuItem('Restore Defaults', 'restore-game-settings'),
    ],
    l = s.keyboardMaps ?? DEFAULT_KEY_MAPS,
    c = ['Up', 'Right', 'Down', 'Left', 'Button 1', 'Button 2', 'Button 3', 'Button 4'],
    h = (g) => c.map((v, x) => menuItem(`${v}:${keyLabel(l[g][x])}`, `remap-key-${g}-${x}`, 1)),
    u = [
      submenuItem('Keyboard 1', h(0)),
      submenuItem('Keyboard 2', h(1)),
      menuItem('Restore Defaults', 'restore-keyboard'),
    ],
    d = s.buttonMaps ?? [DEFAULT_BUTTON_MAP, DEFAULT_BUTTON_MAP],
    f = (g) =>
      d[g].map((v, x) =>
        menuItem(`Button ${x + 1}:${BUTTON_LABELS[v]}`, `cycle-button-map-${g}-${x}`),
      ),
    m = [
      submenuItem('Graphic Detail', [
        menuItem(`Monitor:${s.preferredScreen ?? '512x384'}`, 'cycle-monitor'),
        menuItem(`Scale To Fit:${s.scaleToFit === !1 ? 'OFF' : 'ON'}`, 'toggle-scale-fit'),
        menuItem(`Show Blood:${s.showBlood === !1 ? 'OFF' : 'ON'}`, 'toggle-blood'),
        menuItem(`Screen Hue:${s.screenHue === !1 ? 'OFF' : 'ON'}`, 'toggle-hue'),
        menuItem(`Slow Effect:${s.slowEffect === !1 ? 'OFF' : 'ON'}`, 'toggle-slow'),
        menuItem(`Mini Stats:${s.miniStats === !1 ? 'OFF' : 'ON'}`, 'toggle-ministats'),
        menuItem(`Foregrounds:${s.foregrounds === !1 ? 'OFF' : 'ON'}`, 'toggle-foregrounds'),
        menuItem('Restore Defaults', 'restore-graphics'),
      ]),
      submenuItem('Button Mapping', [
        submenuItem('Keyboard 1', f(0)),
        submenuItem('Keyboard 2', f(1)),
        menuItem('Restore Defaults', 'restore-button-mapping'),
      ]),
      menuItem('Enter Secret Code', 'enter-secret-code'),
    ],
    p = [
      submenuItem('Arcade Mode', n, 'Story 1 Player Missions'),
      submenuItem('Arena Mode', a, 'Quick 1 or 2 Player Coop Action'),
      submenuItem('Extra Modes', [
        menuItem('Start Tutorial', 'tutorial'),
        menuItem('Practice Mode', 'practice'),
        menuItem('Player Versus', 'versus'),
        menuItem('Fight Shows', 'fight-shows'),
        menuItem('Image Gallery', 'gallery'),
        menuItem('View Credits', 'credits'),
      ]),
    ];
  return (
    e === 'official'
      ? p.push(
          submenuItem('Visit Online', [
            menuItem('Official Website', 'official-website'),
            menuItem('Fan Gear Store!', 'fan-store'),
            menuItem('Get Game Update', 'game-update'),
            menuItem('Play More Games', 'more-games'),
          ]),
        )
      : t ||
        p.push({
          title: 'Get Full Version',
        }),
    p.push(
      submenuItem('Configuration', [
        menuItem(`Music:${s.musicOn === !1 ? 'OFF' : 'ON'}`, 'toggle-music'),
        menuItem(`Sounds:${s.soundsOn === !1 ? 'OFF' : 'ON'}`, 'toggle-sounds'),
        menuItem(`Graphics:${s.graphics ?? 'MAX'}`, 'cycle-graphics'),
        menuItem(`Full Screen:${s.fullScreen ? 'ON' : 'OFF'}`, 'toggle-fullscreen'),
        submenuItem('Game Settings', o),
        submenuItem('Keyboard Keys', u),
        submenuItem('Expert Options', m),
      ]),
    ),
    {
      title: '{LOGO}',
      items: p,
    }
  );
}
function titleHeight(s) {
  return s === void 0
    ? MENU_NO_TITLE_HEIGHT
    : s === '{LOGO}'
      ? MENU_LOGO_HEIGHT
      : MENU_TITLE_HEIGHT;
}
function itemHeight(s) {
  return s.subtitle === void 0 ? MENU_ITEM_HEIGHT : MENU_SUBTITLE_ITEM_HEIGHT;
}
function itemTextLayout(s, e) {
  const t = Math.max(0, Math.trunc(s));
  return e === 1
    ? {
        textX: MENU_WIDTH - Math.trunc(t / 2) - Math.trunc(MENU_KEY_WIDTH / 2) - 17,
        keyX: MENU_WIDTH - MENU_KEY_WIDTH - 16,
      }
    : {
        textX: MENU_WIDTH - t - 16,
      };
}
function layoutMenu(s, e = 0, t = 0) {
  const i = titleHeight(s.title);
  let r = i;
  const n = [],
    a = s.items.map((o) => {
      n.push(r);
      const l = o.submenu ? titleHeight(o.submenu.title) : 0,
        c = {
          ...o,
          submenu: o.submenu ? layoutMenu(o.submenu, e + MENU_INNER_WIDTH, t + r - l) : void 0,
        };
      return ((r += itemHeight(o)), c);
    });
  return {
    ...s,
    items: a,
    x: e,
    y: t,
    width: MENU_WIDTH,
    height: r + MENU_FOOTER_HEIGHT,
    headerHeight: i,
    rowYs: n,
  };
}
function submenuAt(s, e) {
  let t = s;
  for (const i of e) {
    const r = t.items[i]?.submenu;
    if (!r) break;
    t = r;
  }
  return t;
}
function centerMenu(s, e = 512, t = 384) {
  return {
    x: -s.x + Math.trunc(e / 2) - Math.trunc(s.width / 2),
    y: -s.y + Math.trunc(t / 2) - Math.trunc(s.height / 2),
  };
}
function easeIn(s, e, t, i) {
  const r = Math.max(1, i),
    n = Math.max(0, Math.min(r, t));
  return s + (e - s) * ((n * n) / (r * r));
}
function menuTopY(s, e = 384) {
  return e / 2 - MENU_CENTER_OFFSET - s * MENU_ROW_HEIGHT - 16;
}
function menuSlide(s, e, t = 384) {
  const i = Math.max(0, s),
    r = menuTopY(i, t);
  return s < 0
    ? {
        y: t,
        targetY: r,
        steps: MENU_SLIDE_STEPS,
      }
    : e
      ? {
          y: t / 2 - MENU_CENTER_OFFSET - i * MENU_ROW_HEIGHT - 1,
          targetY: t / 2 - MENU_CENTER_OFFSET - i * MENU_ROW_HEIGHT - 1,
          steps: 0,
        }
      : {
          y: t / 2 - MENU_CENTER_OFFSET - (i - 1) * MENU_ROW_HEIGHT - 1,
          targetY: r,
          steps: MENU_SLIDE_STEPS * 2,
        };
}
function lockedMessage(s) {
  return s === 'arcade'
    ? 'Locked Arcade Stage'
    : s === 'arena'
      ? 'Locked Arena Stage'
      : s === 'versus'
        ? 'Locked Coin Amount'
        : s === 'gallery'
          ? 'Locked Gallery Poster*'
          : 'Locked Fight Show*';
}
export {
  CHAPTER_AUTOSELECT_FRAMES,
  MENU_CENTER_OFFSET,
  MENU_FOOTER_HEIGHT,
  MENU_IDLE_FRAMES,
  MENU_INNER_WIDTH,
  MENU_ITEM_HEIGHT,
  MENU_MAX_HEIGHT,
  MENU_NO_TITLE_HEIGHT,
  MENU_ROW_HEIGHT,
  MENU_SLIDE_STEPS,
  MENU_SUBTITLE_ITEM_HEIGHT,
  MENU_TITLE_HEIGHT,
  MENU_WIDTH,
  buildMainMenu,
  centerMenu,
  easeIn,
  itemHeight,
  itemTextLayout,
  layoutMenu,
  lockedMessage,
  menuSlide,
  menuTopY,
  pad3,
  submenuAt,
};
