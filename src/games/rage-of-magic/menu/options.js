import {
  MENU_FOOTER_HEIGHT,
  MENU_INNER_WIDTH,
  MENU_ITEM_HEIGHT,
  MENU_NO_TITLE_HEIGHT,
  MENU_SLIDE_STEPS,
  MENU_SUBTITLE_ITEM_HEIGHT,
  MENU_TITLE_HEIGHT,
  MENU_WIDTH,
} from './layout.js';
const OPTIONS_SCREEN = {
  rate: 30,
  frozenFrameGray: 0.5,
  entranceSteps: MENU_SLIDE_STEPS,
  menuMoveAudio: 'movestone',
  cursorMoveAudio: 'click',
  acceptAudio: 'gling',
};
const BUTTON_COMBO_LABELS = ['1', '2', '3', '1+2', '', '1+2+3'];
const DEFAULT_BUTTON_ACTIONS = [0, 1, 2, 5];
const DEFAULT_KEY_LABELS = [
  ['', '', '', '', 'A', 'S', 'D', 'W'],
  ['', '', '', '', '', '', '', ''],
];
function optionItem(s, e, t = 0) {
  return {
    title: s,
    action: e,
    type: t,
  };
}
function optionSubmenu(s, e) {
  return {
    title: s,
    submenu: {
      items: e,
    },
  };
}
function onOff(s) {
  return s === !1 ? 'OFF' : 'ON';
}
function offOn(s) {
  return s === !0 ? 'ON' : 'OFF';
}
function keyMapMenu(s, e) {
  return {
    items: ['Up', 'Right', 'Down', 'Left', 'Button 1', 'Button 2', 'Button 3', 'Button 4'].map(
      (i, r) => optionItem(`${i}:${e[r] ?? DEFAULT_KEY_LABELS[s][r] ?? ''}`, 'remap-key', 1),
    ),
  };
}
function buttonMapMenu(s) {
  return {
    items: DEFAULT_BUTTON_ACTIONS.map((e, t) => {
      const i = s[t] ?? e;
      return optionItem(`Button ${t + 1}:${BUTTON_COMBO_LABELS[i] ?? ''}`, 'cycle-button-map');
    }),
  };
}
function buildOptionsMenu(s) {
  const e = s.players ?? [
      {
        joined: !0,
        alive: !0,
        controllerShortName: 'KEY1',
      },
      {
        joined: !1,
      },
    ],
    t = s.keyboardLabels ?? DEFAULT_KEY_LABELS,
    i = s.buttonMappings ?? [
      DEFAULT_BUTTON_ACTIONS,
      DEFAULT_BUTTON_ACTIONS,
      DEFAULT_BUTTON_ACTIONS,
      DEFAULT_BUTTON_ACTIONS,
    ],
    r = s.applicationOptions === !0,
    n = [
      {
        title: 'Keyboard 1',
        submenu: keyMapMenu(0, t[0]),
      },
      {
        title: 'Keyboard 2',
        submenu: keyMapMenu(1, t[1]),
      },
      optionItem('Restore Defaults', 'restore-keyboard'),
    ],
    a = [
      {
        title: 'Keyboard 1',
        submenu: buttonMapMenu(i[0]),
      },
      {
        title: 'Keyboard 2',
        submenu: buttonMapMenu(i[1]),
      },
    ];
  (r &&
    (a.push({
      title: 'Joystick 1',
      submenu: buttonMapMenu(i[2]),
    }),
    a.push({
      title: 'Joystick 2',
      submenu: buttonMapMenu(i[3]),
    })),
    a.push(optionItem('Restore Defaults', 'restore-button-mapping')));
  const o = [];
  (r &&
    (o.push(optionItem(`Monitor:${s.monitor ?? '512x384'}`, 'cycle-monitor')),
    o.push(optionItem(`Scale To Fit:${offOn(s.scaleToFit)}`, 'toggle-scale-fit'))),
    o.push(
      optionItem(`Show Blood:${onOff(s.showBlood)}`, 'toggle-blood'),
      optionItem(`Screen Hue:${onOff(s.screenHue)}`, 'toggle-hue'),
      optionItem(`Slow Effect:${onOff(s.slowEffect)}`, 'toggle-slow'),
      optionItem(`Mini Stats:${onOff(s.miniStats)}`, 'toggle-ministats'),
      optionItem(`Foregrounds:${onOff(s.foregrounds)}`, 'toggle-foregrounds'),
      optionItem('Restore Defaults', 'restore-graphics'),
    ));
  const l = [
    optionItem(`Music:${onOff(s.musicOn)}`, 'toggle-music'),
    optionItem(`Sounds:${onOff(s.soundsOn)}`, 'toggle-sounds'),
    optionItem(`Graphics:${s.graphics ?? 'MAX'}`, 'cycle-graphics'),
  ];
  (r && l.push(optionItem(`Full Screen:${offOn(s.fullScreen)}`, 'toggle-fullscreen')),
    l.push(
      optionSubmenu('Game Settings', [
        optionItem(`Game Speed:${s.gameSpeed ?? 'MED'}`, 'cycle-game-speed'),
        optionItem(`Difficulty:${s.difficulty ?? 'NORM'}`, 'cycle-difficulty'),
        optionItem(`Type Speed:${s.typeSpeed ?? 'MED'}`, 'cycle-type-speed'),
        optionItem(`Show Hints:${onOff(s.showHints)}`, 'toggle-hints'),
        optionItem(`Recolor Ally:${onOff(s.recolorAlly)}`, 'toggle-recolor'),
        optionItem('Restore Defaults', 'restore-game-settings'),
      ]),
      optionSubmenu('Keyboard Keys', n),
      optionSubmenu('Expert Options', [
        optionSubmenu('Graphic Detail', o),
        optionSubmenu('Button Mapping', a),
        ...(r ? [optionItem('Detect Joysticks', 'detect-joysticks')] : []),
      ]),
    ));
  const c = {
    title: 'PAUSED',
    items: [optionItem('Continue', 'continue')],
  };
  return (
    e.forEach((h, u) => {
      if (!h.joined) return;
      const d = u + 1,
        f = [];
      (s.mode === 'practice' &&
        h.alive &&
        f.push(optionItem('New Character', `new-character-${d}`)),
        f.push(optionItem('Controls Help', `controls-help-${d}`)),
        f.push(
          optionItem(`Controller:${h.controllerShortName ?? `KEY${d}`}`, `cycle-controller-${d}`),
        ),
        c.items.push(optionSubmenu(`Player ${d}`, f)));
    }),
    c.items.push(optionSubmenu('Configuration', l)),
    s.mode === 'arcade'
      ? (s.replay && c.items.push(optionItem('Select Replay', 'select-replay')),
        c.items.push(optionItem('Exit Arcade', 'exit-arcade')))
      : s.mode === 'practice'
        ? c.items.push(
            optionItem('Select Screen', 'select-screen'),
            optionItem('Exit Practice', 'exit-practice'),
          )
        : s.mode === 'survival'
          ? c.items.push(optionItem('Exit Survival', 'exit-survival'))
          : s.mode === 'tutorial'
            ? c.items.push(optionItem('Exit Tutorial', 'exit-tutorial'))
            : s.mode === 'versus'
              ? c.items.push(
                  optionItem('Select Versus', 'select-versus'),
                  optionItem('Exit Versus', 'exit-versus'),
                )
              : s.mode === 'arena' &&
                (s.replay && c.items.push(optionItem('Select Replay', 'select-replay')),
                c.items.push(optionItem('Exit Arena', 'exit-arena'))),
    c
  );
}
function optionTitleHeight(s) {
  return s === void 0 ? MENU_NO_TITLE_HEIGHT : MENU_TITLE_HEIGHT;
}
function layoutOptionMenu(s, e = 0, t = 0) {
  const i = optionTitleHeight(s.title);
  let r = i;
  const n = [],
    a = s.items.map((o) => {
      n.push(r);
      const l = {
        ...o,
        submenu: o.submenu
          ? layoutOptionMenu(
              o.submenu,
              e + MENU_INNER_WIDTH,
              t + r - optionTitleHeight(o.submenu.title),
            )
          : void 0,
      };
      return (
        (r += o.title.includes(`
`)
          ? MENU_SUBTITLE_ITEM_HEIGHT
          : MENU_ITEM_HEIGHT),
        l
      );
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
export { OPTIONS_SCREEN, buildOptionsMenu, layoutOptionMenu };
