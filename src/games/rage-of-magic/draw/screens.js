import {
  GUI_ICONS,
  GUI_PANELS,
  HERO_PORTRAITS,
  HERO_PORTRAITS_SMALL,
  NATIVE_SIZE,
  PLAYER_ICONS,
  SELECT_ICONS,
  SMALL_DIGITS,
  atlasCell,
  text,
} from './atlas-sheets.js';
import {
  NAME_ENTRY_SCREEN,
  SUBMIT_SCREEN,
  buildCongratulations,
  highScoreKeyAt,
  nameEntryBlink,
  submitBlink,
  submitEntrance,
  submitOptions,
} from '../high-scores.js';
import { MENU_FOOTER_HEIGHT } from '../menu/layout.js';
import { OPTIONS_SCREEN, layoutOptionMenu } from '../menu/options.js';
import {
  BAR_COLORS,
  LOADING_LAYOUT,
  barFillWidth,
  loadingScreen,
} from '../screens/loading-screen.js';
import { PAUSE_SCREEN, pauseBlink, pausePlayerLabel } from '../screens/pause.js';
import {
  HERO_MAGIC,
  HERO_NAMES,
  HERO_RACES,
  HERO_SPEED,
  HERO_STAMINA,
  HERO_STRENGTH,
  HERO_WEAPONS,
  SELECT_COLUMNS,
  SELECT_SCREEN,
} from '../select/data.js';
import {
  selectControllerLines,
  selectEntrance,
  selectIconState,
  selectMessage,
} from '../select/state.js';
function drawLoadingScreen(s) {
  const e = [];
  if (s.visible === !1)
    return {
      ...NATIVE_SIZE,
      rate: 10,
      primitives: e,
    };
  const t = loadingScreen(s);
  return (
    e.push(
      {
        kind: 'clear',
        color: 0,
      },
      {
        kind: 'emboss-rect',
        ...BAR_COLORS,
        x: LOADING_LAYOUT.fill.x,
        y: LOADING_LAYOUT.fill.y,
        width: barFillWidth(s.percent),
        height: LOADING_LAYOUT.fill.height,
      },
      {
        kind: 'atlas-frame',
        atlas: 'ui.logo',
        frame: 1,
        x: LOADING_LAYOUT.bar.x,
        y: LOADING_LAYOUT.bar.y,
      },
    ),
    t.showLogo
      ? (e.push({
          kind: 'atlas-frame',
          atlas: 'ui.logo',
          frame: 0,
          x: LOADING_LAYOUT.logo.x,
          y: LOADING_LAYOUT.logo.y,
        }),
        t.owner !== void 0 &&
          e.push({
            ...text(
              t.ownerFont === 1 ? 'small-blue' : 'small-red',
              t.owner ?? '',
              256,
              LOADING_LAYOUT.footerY,
              'center',
            ),
            measureWithFont: 'small-white',
          }))
      : t.subtitle === void 0
        ? (t.owner !== void 0 &&
            e.push(text('small-white', t.owner, 256, LOADING_LAYOUT.subtitleY, 'center')),
          e.push(text('small-white', t.percent ?? '', 256, LOADING_LAYOUT.footerY, 'center')))
        : (t.title !== void 0 &&
            e.push(text('big-white', t.title, 256, LOADING_LAYOUT.titleY, 'center')),
          e.push(
            text('small-white', t.subtitle, 256, LOADING_LAYOUT.subtitleY, 'center'),
            text('small-white', t.percent ?? '', 256, LOADING_LAYOUT.footerY, 'center'),
          )),
    {
      ...NATIVE_SIZE,
      rate: 10,
      primitives: e,
    }
  );
}
function drawControlsScreen(s) {
  const e = s.player.controller <= 1,
    t = s.player.movementLabels,
    i = s.player.buttonLabels,
    r = s.player.buttonDescriptions,
    n = [
      {
        kind: 'canvas-effect',
        effect: 'copy-frozen',
      },
      {
        kind: 'canvas-effect',
        effect: 'fade-frozen',
        amount: PAUSE_SCREEN.frozenFrameFade,
      },
      {
        kind: 'atlas-frame',
        atlas: 'ui.guiform',
        frame: 13,
        x: 76,
        y: 58,
      },
      atlasCell(GUI_ICONS, e ? 2 : 3, 90, e ? 72 : 70),
      text('big-gold', pausePlayerLabel(s.playerIndex, s.player), 125, 76),
    ],
    a = 112,
    o = 121,
    l = [
      {
        x: a + 32,
        y: o,
      },
      {
        x: a + 64,
        y: o + 15,
      },
      {
        x: a + 32,
        y: o + 30,
      },
      {
        x: a,
        y: o + 15,
      },
    ];
  (t.forEach((h, u) => {
    const d = l[u];
    n.push(atlasCell(GUI_PANELS, 0, d.x, d.y), text('big-blue', h, d.x + 15, d.y + 4, 'center'));
  }),
    n.push(
      text('small-white', 'Up', 160, 109, 'center'),
      text('small-white', 'Down', 160, 183, 'center'),
      text('small-white', 'Left', 110, 146, 'right'),
      text('small-white', 'Right', 210, 146),
    ));
  for (let h = 0; h < 4; h += 1) {
    const u = 185 + h * 31;
    n.push(
      atlasCell(GUI_PANELS, 0, 235, u),
      text('big-blue', i[h] ?? '', 250, u + 4, 'center'),
      text('small-white', String(h + 1), 225, u + 11),
      text('big-white', r[h] ?? '', 271, u + 4),
    );
  }
  (PAUSE_SCREEN.hints.forEach((h, u) => n.push(text('small-blue', h, 252, 109 + u * 11))),
    n.push(
      text('small-blue', PAUSE_SCREEN.globalKeys[0], 90, 214),
      text('small-blue', PAUSE_SCREEN.globalKeys[1], 90, 225),
      {
        kind: 'atlas-frame',
        atlas: 'ui.guiform',
        frame: 12,
        x: 90,
        y: 240,
      },
      {
        kind: 'atlas-frame',
        atlas: 'ui.guiform',
        frame: 12,
        x: 90,
        y: 275,
      },
    ));
  const c = s.playerIndex === 0 ? 240 : 275;
  return (
    n.push(
      atlasCell(GUI_ICONS, 1, 104 + pauseBlink(s.drawFrame), c + 1),
      text('big-gold', 'P1', 138, 245),
      text('big-gold', 'P2', 138, 280),
    ),
    {
      ...NATIVE_SIZE,
      rate: PAUSE_SCREEN.rate,
      primitives: n,
    }
  );
}
function isLaidOutMenu(s) {
  return 'x' in s && 'rowYs' in s;
}
function sameArray(s, e) {
  return s.length === e.length && s.every((t, i) => t === e[i]);
}
function startsWithArray(s, e) {
  return s.length <= e.length && s.every((t, i) => t === e[i]);
}
function menuItemFont(s, e, t, i, r) {
  return t && e ? (i ? 6 : 5) : !t && e && r ? 5 : 3;
}
function drawMenuPanel(s, e, t, i, r, n, a) {
  const o = r + s.x,
    l = n + s.y,
    c = sameArray(e, t),
    u = [
      {
        kind: 'menu-header',
        atlas: 'ui.guiform',
        frame: s.title === void 0 ? 2 : 1,
        x: o,
        y: l,
        title: s.title,
        titleFont: 'big-gold',
        titleCenterX: o + 131,
        titleY: l + 18,
        ...(s.title === void 0
          ? {}
          : {
              pairedIcon: {
                atlas: 'ui.guiicon',
                sourceFrame: 0,
                cell: 0,
                beforeGap: 6,
                afterGap: 9,
              },
            }),
      },
    ];
  for (let d = 0; d < s.items.length; d += 1) {
    const f = s.items[d],
      m = l + s.rowYs[d],
      p = [...e, d],
      g = !c && startsWithArray(p, t),
      v = c && d === i;
    g && f.submenu && u.push(...drawMenuPanel(f.submenu, p, t, i, r, n, a));
    const x = f.title.indexOf(':'),
      b = x < 0 ? f.title : f.title.slice(0, x + 1),
      _ = x < 0 ? void 0 : f.title.slice(x + 1).trim(),
      S = v || g,
      w = menuItemFont(!1, f.submenu !== void 0, c, v, g),
      A = _ === void 0 ? void 0 : f.type === 1 ? 'key' : 'text';
    u.push({
      kind: 'menu-item',
      atlas: 'ui.guiform',
      frame: w,
      x: o,
      y: m,
      title: f.title,
      label: b,
      value: _,
      ...(_ === void 0
        ? {}
        : {
            valueKind: A,
          }),
      titleFont: S ? 'big-white' : 'big-blue',
      subtitle: void 0,
      subtitleFont: S ? 'small-white' : 'small-blue',
      textX: o + 58,
      textY: m + 5,
      valueRightX: o + 250,
      valueCenterX: o + 233,
      ...(A === 'key'
        ? {
            key: atlasCell(GUI_PANELS, 0, o + 218, m + 1),
          }
        : {}),
      ...(v
        ? {
            sword: atlasCell(GUI_ICONS, 1, o + 22 + (Math.floor(Math.max(0, a) / 10) & 1), m + 2),
          }
        : {}),
    });
  }
  return (
    u.push({
      kind: 'atlas-frame',
      atlas: 'ui.guiform',
      frame: 7,
      x: o,
      y: l + s.height - MENU_FOOTER_HEIGHT,
    }),
    u
  );
}
function drawMenuScreen(s) {
  const e = isLaidOutMenu(s.menu) ? s.menu : layoutOptionMenu(s.menu),
    t = s.cameraX ?? Math.trunc(512 / 2) - Math.trunc(e.width / 2),
    i = s.cameraY ?? Math.trunc(384 / 2) - Math.trunc(e.height / 2),
    r = [
      {
        kind: 'canvas-effect',
        effect: 'copy-frozen',
      },
      {
        kind: 'canvas-effect',
        effect: 'gray-frozen',
        amount: OPTIONS_SCREEN.frozenFrameGray,
      },
      ...drawMenuPanel(e, [], s.activePath ?? [], s.selectedIndex ?? 0, t, i, s.swordDraws ?? 0),
    ];
  return (
    s.hints !== !1 &&
      r.push({
        kind: 'hint-bar',
        y: 371,
        textY: 373,
        movementKeys: s.movementKeys ?? '',
        movementLabel: 'Move',
        actionKeys: s.selectKey ?? '',
        actionLabel: 'Select',
        rightInset: s.fullEdition === !1 ? (s.nagNotchWidth ?? 0) + 4 : 0,
        gap: 8,
      }),
    {
      ...NATIVE_SIZE,
      rate: OPTIONS_SCREEN.rate,
      primitives: r,
    }
  );
}
function drawCongratulationsScreen(s) {
  const e = s.officialEdition !== !1,
    t = buildCongratulations(s.mode, s.playerOneScore, s.playerTwoScore, e),
    r = submitEntrance(s.drawFrame).pixelOffsetY,
    n = SUBMIT_SCREEN.panel,
    a = [
      {
        kind: 'image',
        asset: SUBMIT_SCREEN.background,
        x: 0,
        y: 0,
      },
      {
        kind: 'atlas-frame',
        atlas: n.atlas,
        frame: n.frame,
        x: n.x,
        y: n.y + r,
      },
      text('big-gold', t.title, 256, SUBMIT_SCREEN.titleY + r, 'center'),
    ];
  let o = n.y + r + 14 + 25 + 17;
  (t.copy.forEach((c) => {
    (a.push(text('small-blue', c, 256, o, 'center')), (o += 12));
  }),
    (o += 12),
    a.push(text('big-white', t.scoreText, 256, o, 'center')),
    (o += 27),
    a.push(text('big-white', t.rankText, 256, o, 'center')));
  const l = submitBlink(s.drawFrame);
  return (
    submitOptions(e).forEach((c) => {
      const h = c.index,
        u = SUBMIT_SCREEN.buttonCursorXs[h],
        d = SUBMIT_SCREEN.buttonTextXs[h],
        f = SUBMIT_SCREEN.buttonY + r;
      (h === s.choice && a.push(atlasCell(GUI_ICONS, 1, u + l, f + 1)),
        a.push(text('big-gold', c.label, d, f + 4)));
    }),
    {
      ...NATIVE_SIZE,
      rate: SUBMIT_SCREEN.rate,
      primitives: a,
    }
  );
}
function drawNameEntryScreen(s) {
  const e = nameEntryBlink(s.drawFrame),
    t = NAME_ENTRY_SCREEN.panel,
    i = e.textCursorOn ? '_' : '',
    r = [
      {
        kind: 'canvas-effect',
        effect: 'copy-frozen',
      },
      {
        kind: 'canvas-effect',
        effect: 'fade-frozen',
        amount: NAME_ENTRY_SCREEN.frozenFrameFade,
      },
      {
        kind: 'atlas-frame',
        atlas: t.atlas,
        frame: t.frame,
        x: t.x,
        y: t.y,
      },
      atlasCell(
        GUI_ICONS,
        s.icon ?? 2,
        NAME_ENTRY_SCREEN.titleIcon.x,
        NAME_ENTRY_SCREEN.titleIcon.y,
      ),
      text('big-white', s.state.title, NAME_ENTRY_SCREEN.title.x, NAME_ENTRY_SCREEN.title.y),
      {
        kind: 'atlas-frame',
        atlas: NAME_ENTRY_SCREEN.textPanel.atlas,
        frame: NAME_ENTRY_SCREEN.textPanel.frame,
        x: NAME_ENTRY_SCREEN.textPanel.x,
        y: NAME_ENTRY_SCREEN.textPanel.y,
      },
      {
        ...text(
          'big-gold',
          `${s.state.value}${i}`,
          NAME_ENTRY_SCREEN.value.x,
          NAME_ENTRY_SCREEN.value.y,
        ),
        truncateFromEndAtWidth: 273,
        truncateMeasureSuffix: '_',
      },
    ];
  for (let n = 0; n < 5; n += 1)
    for (let a = 0; a < 9; a += 1) {
      const o = highScoreKeyAt(a, n),
        l = NAME_ENTRY_SCREEN.keys.x + a * NAME_ENTRY_SCREEN.keys.strideX,
        c = NAME_ENTRY_SCREEN.keys.y + n * NAME_ENTRY_SCREEN.keys.strideY,
        h = a === s.state.cursorX && n === s.state.cursorY;
      (r.push(atlasCell(GUI_PANELS, 0, l, c)),
        h && r.push(atlasCell(GUI_PANELS, e.selectedKeyOn ? 1 : 2, l, c)),
        o.kind === 'disabled'
          ? r.push(atlasCell(GUI_PANELS, 3, l, c))
          : r.push(
              text(
                h ? 'big-gold' : 'big-blue',
                String.fromCharCode(o.glyphCode ?? 0),
                l + 15,
                c + 4,
                'center',
              ),
            ));
    }
  return (
    NAME_ENTRY_SCREEN.miniHelp.lines.forEach((n, a) =>
      r.push(
        text(
          'small-blue',
          n,
          NAME_ENTRY_SCREEN.miniHelp.x,
          NAME_ENTRY_SCREEN.miniHelp.y + a * NAME_ENTRY_SCREEN.miniHelp.lineHeight,
        ),
      ),
    ),
    {
      ...NATIVE_SIZE,
      rate: NAME_ENTRY_SCREEN.rate,
      primitives: r,
    }
  );
}
function iconTreatment(s) {
  return s === 'full'
    ? {
        treatment: 'normal',
      }
    : s === 'faded'
      ? {
          treatment: 'fade',
        }
      : s === 'off'
        ? {
            treatment: 'solid',
            solidColor: SELECT_SCREEN.iconOffColor,
          }
        : {
            treatment: 'fade-solid',
            solidColor: SELECT_SCREEN.iconOffColor,
          };
}
function sideText(s, e, t, i, r) {
  return text(e, t, i, r, s === 1 ? 'right' : 'left');
}
function drawVersusSelectPanel(s, e, t, i, r) {
  const n = s.players[e],
    a = e === 1,
    o = a ? t - (HERO_PORTRAITS.width - 1) : t,
    l = [sideText(e, 'big-white', `PLAYER ${e + 1}`, t, i)];
  let c = i + 25;
  const h = s.saveMaxChapters[0] === 99999;
  for (let u = 0; u < 3; u += 1) {
    (l.push(
      {
        kind: 'canvas-effect',
        effect: 'half-rect',
        amount: 0.5,
        x: o + 2,
        y: c + 3,
        width: 90,
        height: 86,
      },
      atlasCell(HERO_PORTRAITS, 0, o, c),
    ),
      n.character === u && n.didJoin && l.push(atlasCell(HERO_PORTRAITS, 2, o, c)));
    const d = n.cursorY === u && n.didJoin,
      f = !n.didJoin || (u === 2 && !h),
      m = f ? (d ? 'solid' : 'fade-solid') : n.cursorY === u ? 'normal' : 'fade';
    if (
      (l.push(
        atlasCell(HERO_PORTRAITS_SMALL, u, o + (a ? 2 : 3), c + 3, {
          flipX: a,
          treatment: m,
          ...(f
            ? {
                solidColor: SELECT_SCREEN.iconOffColor,
              }
            : {}),
        }),
      ),
      l.push(atlasCell(HERO_PORTRAITS, 1, o, c)),
      d &&
        (l.push(
          atlasCell(SMALL_DIGITS, r, a ? o + 96 : o - 13, c + 38, {
            flipX: a,
          }),
        ),
        u === 2 && n.messages[2].delay > 0))
    ) {
      const b = a ? o + 67 : o + 47;
      l.push(
        a
          ? text('small-red', n.messages[2].text, b, c + 38, 'right')
          : text('small-red', n.messages[2].text, b, c + 38, 'center'),
      );
    }
    const p = a ? o - 6 : o + 99;
    let g = c + 8;
    const v = n.selectList[6] ?? 0,
      x = v > 0 ? `L${v} ${HERO_RACES[u]}` : HERO_RACES[u];
    ([HERO_NAMES[u], x, HERO_WEAPONS[u]].forEach((b) => {
      (l.push(sideText(e, 'small-white', b, p, g)), (g += 10));
    }),
      (g += 4),
      [
        `Stamina: ${HERO_STAMINA[u]}`,
        `Strength: ${HERO_STRENGTH[u]}`,
        `Magic: ${HERO_MAGIC[u]}`,
        `Speed: ${HERO_SPEED[u]}`,
      ].forEach((b) => {
        (l.push(sideText(e, 'small-blue', b, p, g)), (g += 10));
      }),
      (c += HERO_PORTRAITS.height - 1));
  }
  return (
    n.didJoin &&
      l.push(atlasCell(HERO_PORTRAITS, 3 + r, o, i + 25 + (HERO_PORTRAITS.height - 1) * n.cursorY)),
    l
  );
}
function pushSelectHighlight(s, e, t, i, r, n, a) {
  const l = e.players[t].selectList[i] ?? 0;
  (s.push(
    {
      kind: 'canvas-effect',
      effect: 'half-rect',
      amount: 0.5,
      x: r + 2,
      y: n + 3,
      width: 24,
      height: 23,
    },
    atlasCell(SELECT_ICONS, a ? 5 : 0, r, n),
  ),
    l > 0 && s.push(atlasCell(SELECT_ICONS, a ? 6 : 1, r, n)),
    s.push(atlasCell(PLAYER_ICONS, i, r + 2, n + 3, iconTreatment(selectIconState(e, t, i)))),
    s.push(atlasCell(SELECT_ICONS, a ? 7 : 2, r, n)),
    l > 0 &&
      s.push(
        text('small-white', String(l), r + 23, n + 16, 'right'),
        atlasCell(SELECT_ICONS, a ? 9 : 4, r, n),
      ));
}
function drawSelectPanel(s, e, t, i, r) {
  const n = s.players[e],
    a = e === 1,
    o = a ? SELECT_COLUMNS * (SELECT_ICONS.width - 1) : 0,
    l = [sideText(e, 'big-white', `PLAYER ${e + 1}`, t, i)],
    c = selectControllerLines(s, e);
  let h = i + 23;
  (c.forEach((d) => {
    (l.push(sideText(e, 'small-white', d, t, h)), (h += 11));
  }),
    (h = i + (n.didJoin ? 65 : 54)));
  for (let d = 0; d < 7; d += 1) {
    const f = t + d * 27 - o;
    pushSelectHighlight(l, s, e, d, f, h, !0);
  }
  (n.cursorY === 0 &&
    n.didJoin &&
    l.push(
      atlasCell(SELECT_ICONS, 8 + r, t + n.cursorX * 27 - o, h),
      atlasCell(SMALL_DIGITS, r, a ? t + 2 : t - 13, h + 6, {
        flipX: a,
      }),
    ),
    (h += 32),
    l.push(sideText(e, 'small-white', 'Choose Your Bonuses', t, h)),
    (h += 12),
    l.push(
      sideText(
        e,
        n.messages[0].delay > 0 ? 'small-red' : 'small-blue',
        selectMessage(s, e, 'bonus'),
        t,
        h,
      ),
    ),
    (h += 19));
  let u = 7;
  for (let d = 0; d < 4; d += 1)
    for (let f = 0; f < 7; f += 1) {
      const m = t + f * 27 - o,
        p = h + d * 29;
      (pushSelectHighlight(l, s, e, u, m, p, !1), (u += 1));
    }
  if (n.cursorY >= 1 && n.cursorY <= 4 && n.didJoin) {
    const d = h + (n.cursorY - 1) * 29;
    l.push(
      atlasCell(SELECT_ICONS, 3 + r, t + n.cursorX * 27 - o, d),
      atlasCell(SMALL_DIGITS, r, a ? t + 2 : t - 13, d + 6, {
        flipX: a,
      }),
    );
  }
  return (
    (h += 119),
    l.push(sideText(e, 'small-white', 'Choose Your Allies', t, h)),
    (h += 12),
    l.push(
      sideText(
        e,
        n.messages[1].delay > 0 ? 'small-red' : 'small-blue',
        selectMessage(s, e, 'ally'),
        t,
        h,
      ),
    ),
    (h += 19),
    l.push(sideText(e, n.selectDone ? 'big-gold' : 'big-white', 'FINISHED', t, h)),
    !n.selectDone &&
      n.cursorY === 5 &&
      n.didJoin &&
      l.push(
        atlasCell(SMALL_DIGITS, r, a ? t + 2 : t - 13, h + 2, {
          flipX: a,
        }),
      ),
    l
  );
}
function drawSelectScreen(s) {
  const e = s.state,
    t = selectEntrance(e.frame),
    i = [
      {
        kind: 'image',
        asset: SELECT_SCREEN.background,
        x: 0,
        y: 0,
      },
      text('big-gold', e.title, 256, t.titleY, 'center'),
    ];
  return (
    e.mode === 'versus' && i.push(text('small-blue', 'Both Players Required!', 256, 356, 'center')),
    e.panels.forEach((r, n) => {
      const a = e.players[n];
      a &&
        i.push(
          ...(a.mode === 0
            ? drawVersusSelectPanel(e, n, Math.trunc(r.x), Math.trunc(r.y), t.cursorFrame)
            : drawSelectPanel(e, n, Math.trunc(r.x), Math.trunc(r.y), t.cursorFrame)),
        );
    }),
    e.hints &&
      i.push({
        kind: 'hint-bar',
        y: 371,
        textY: 373,
        movementKeys: s.movementKeys ?? '',
        movementLabel: 'Move',
        actionKeys: s.actionKeys ?? 'A , W',
        actionLabel: 'Buy , Sell',
        rightInset: e.fullEdition ? 0 : (s.nagNotchWidth ?? 0) + 4,
        gap: 8,
      }),
    i.push({
      kind: 'canvas-effect',
      effect: 'hue',
      amount: t.hue,
    }),
    {
      ...NATIVE_SIZE,
      rate: 30,
      primitives: i,
    }
  );
}
export {
  drawCongratulationsScreen,
  drawControlsScreen,
  drawLoadingScreen,
  drawMenuScreen,
  drawNameEntryScreen,
  drawSelectScreen,
};
