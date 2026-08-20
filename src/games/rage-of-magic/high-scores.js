import { easeIn } from './menu/layout.js';
const HIGH_SCORE_MODES = ['arcade', 'arena'];
const HIGH_SCORE_SLOTS = 10;
const DEFAULT_HIGH_SCORE_NAME = 'DRILLION';
const HIGH_SCORE_CHARS = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\0.-=_+\0\b
`;
const HIGH_SCORE_SCREEN = {
  moveSteps: 10,
  background: 'bg-skull-1',
  music: '100a',
  trophyAtlas: 'score',
  hueStart: -255,
  hueStep: 25,
  centerShade: {
    x: 59,
    y: 0,
    width: 394,
    height: 384,
  },
  borderXs: {
    left: [
      {
        x: 56,
        color: 'gray',
      },
      {
        x: 57,
        color: 'white',
      },
      {
        x: 58,
        color: 'black',
      },
    ],
    right: [
      {
        x: 453,
        color: 'black',
      },
      {
        x: 454,
        color: 'white',
      },
      {
        x: 455,
        color: 'gray',
      },
    ],
  },
  layout: {
    titleY: 28,
    subtitleY: 53,
    firstRowY: 80,
    rowHeight: 26,
    rankRightX: 100,
    nameX: 115,
    scoreRightX: 400,
    trophyX: 404,
    trophyYOffset: -1,
  },
  fonts: {
    title: 3,
    subtitle: 1,
    row: 2,
  },
  hints: {
    movement: 'Scroll',
    actions: 'Quit , Reset',
  },
  resetQuestion: {
    title: 'Erase Hiscores',
    question: 'Are you sure?',
    buttons: ['Yes', 'No'],
  },
  resetPopup: {
    title: 'Erase Hiscores',
    message: 'Hiscores haven been erased ...',
    delay: 45,
    icon: 'shield',
  },
};
const SUBMIT_SCREEN = {
  rate: 30,
  background: 'bg-skull-1a',
  startAudio: ['005', 'movestone'],
  moveAudio: 'click',
  acceptAudio: 'gling',
  entranceSteps: 10,
  panel: {
    atlas: 'ui.guiform',
    frame: 17,
    x: 62,
    y: 76,
  },
  titleY: 90,
  buttonY: 258,
  buttonCursorXs: [72, 200, 328],
  buttonTextXs: [106, 234, 362],
  invalidLocalPopup: {
    title: 'Submit Local',
    message: 'That name was not valid!',
    delay: 50,
    icon: 'shield',
  },
  successLocalPopup: {
    title: 'Submit Local',
    message: 'Your name was submitted!',
    delay: 75,
    icon: 'shield',
  },
  abortQuestion: {
    title: 'Abort Hiscore',
    question: 'Are you sure?',
    buttons: ['Yes', 'No'],
    defaultChoice: 1,
  },
};
const NAME_ENTRY_SCREEN = {
  rate: 30,
  frozenFrameFade: 0.75,
  startAudio: 'click',
  moveAudio: 'click',
  panel: {
    atlas: 'ui.guiform',
    frame: 13,
    x: 76,
    y: 58,
  },
  textPanel: {
    atlas: 'ui.guiform',
    frame: 14,
    x: 119,
    y: 100,
  },
  titleIcon: {
    x: 86,
    y: 70,
  },
  title: {
    x: 122,
    y: 73,
  },
  value: {
    x: 122,
    y: 102,
  },
  keys: {
    x: 118,
    y: 131,
    strideX: 33,
    strideY: 30,
  },
  miniHelp: {
    x: 122,
    y: 287,
    lineHeight: 11,
    lines: [
      'Use your controller to move to a letter and select it.',
      'When you are done, click the last return arrow button.',
    ],
  },
  help: {
    title: 'Input Controls',
    body: "You can't use the normal|keyboard for this entry|screen.  Move the cursor to|the letter you want and|press button 1 to select it,|press button 4 to do a|backspace.  When finished,|click on the return arrow.",
    buttons: ['Select', 'Erase'],
  },
};
function toInt(s) {
  return Number.isFinite(s) ? Math.trunc(s) : 0;
}
function readHighScore(s, e, t) {
  const i = s.read(e, t);
  return !i || typeof i.name != 'string' || !Number.isFinite(i.score)
    ? null
    : {
        name: i.name,
        score: Math.trunc(i.score),
      };
}
function titleCase(s) {
  return s.length === 0 ? '' : s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}
function buildHighScorePage(s, e, t = null) {
  const i = HIGH_SCORE_MODES.indexOf(e),
    r = Array.from(
      {
        length: HIGH_SCORE_SLOTS,
      },
      (n, a) => {
        const o = readHighScore(s, e, a),
          c = (o?.name ?? DEFAULT_HIGH_SCORE_NAME).toUpperCase(),
          h = o?.score ?? (HIGH_SCORE_SLOTS - a) * 10,
          u = a + 1,
          d = u === 1 ? 'gold' : u <= 4 ? 'silver' : 'bronze';
        return {
          rank: u,
          rankLabel: `${o && t !== null && t.toUpperCase() === o.name ? '*' : ''}${u}.`,
          name: c,
          displayName: titleCase(c),
          score: h,
          highlighted: o !== null && t !== null && t.toUpperCase() === o.name,
          trophy: d,
          trophyFrame: d === 'gold' ? 0 : d === 'silver' ? 1 : 2,
          y: HIGH_SCORE_SCREEN.layout.firstRowY + a * HIGH_SCORE_SCREEN.layout.rowHeight,
        };
      },
    );
  return {
    mode: e,
    page: i + 1,
    title: `${e.toUpperCase()} LOCAL HISCORES`,
    subtitle: `TOP ${HIGH_SCORE_SLOTS} SCORES ON THIS COMPUTER - PAGE ${i + 1} OF ${HIGH_SCORE_MODES.length}`,
    entries: r,
  };
}
function buildHighScorePages(s, e = null) {
  return [buildHighScorePage(s, 'arcade', e), buildHighScorePage(s, 'arena', e)];
}
function lowestHighScore(s, e) {
  let t = 9999999;
  for (let i = 0; i < HIGH_SCORE_SLOTS; i += 1) {
    const r = readHighScore(s, e, i);
    r && r.score < t && (t = r.score);
  }
  return t === 9999999 ? 0 : t;
}
function writeHighScore(s, e, t, i) {
  const r = toInt(i),
    n = [];
  for (let l = 0; l < HIGH_SCORE_SLOTS; l += 1) {
    const c = readHighScore(s, e, l);
    if (c && c.name === t && r < c.score)
      return {
        wrote: !1,
        placed: !1,
        slot: null,
        reason: 'lower-than-existing-name',
        entries: Array.from(
          {
            length: HIGH_SCORE_SLOTS,
          },
          (h, u) =>
            readHighScore(s, e, u) ?? {
              name: DEFAULT_HIGH_SCORE_NAME,
              score: (u + 1) * 100,
            },
        ),
      };
    n.push({
      ...(c ?? {
        name: DEFAULT_HIGH_SCORE_NAME,
        score: (l + 1) * 100,
      }),
      order: l,
      submitted: !1,
    });
  }
  n.push({
    name: t,
    score: r,
    order: HIGH_SCORE_SLOTS,
    submitted: !0,
  });
  for (let l = n.length; --l >= 0;) {
    let c = !1;
    for (let h = 0; h < l; h += 1)
      n[h].score < n[h + 1].score && (([n[h], n[h + 1]] = [n[h + 1], n[h]]), (c = !0));
    if (!c) break;
  }
  const a = n.slice(0, HIGH_SCORE_SLOTS);
  (a.forEach((l, c) =>
    s.write(e, c, {
      name: l.name,
      score: l.score,
    }),
  ),
    s.writePreferredName(t),
    s.flush?.());
  const o = a.findIndex((l) => l.submitted);
  return {
    wrote: !0,
    placed: o >= 0,
    slot: o >= 0 ? o : null,
    reason: 'saved',
    entries: a.map(({ name: l, score: c }) => ({
      name: l,
      score: c,
    })),
  };
}
function clearHighScores(s, e) {
  for (let t = 0; t < HIGH_SCORE_SLOTS; t += 1) s.clear(e, t);
}
function resetHighScores(s, e) {
  return (
    clearHighScores(s, e),
    {
      popup: HIGH_SCORE_SCREEN.resetPopup,
      refreshVisiblePage: !1,
    }
  );
}
function shiftHighScoreMode(s, e) {
  const t = HIGH_SCORE_MODES.indexOf(s),
    i = Math.max(0, Math.min(HIGH_SCORE_MODES.length - 1, t + e));
  return HIGH_SCORE_MODES[i];
}
function highScorePageSlide(s, e, t) {
  const i = HIGH_SCORE_MODES.indexOf(s),
    r = HIGH_SCORE_MODES.indexOf(e),
    n = i === 0 ? 0 : i * -512,
    a = r === 0 ? 0 : r * -512,
    o = Math.min(HIGH_SCORE_SCREEN.moveSteps, Math.max(0, Math.trunc(t) - 1));
  return easeIn(n, a, o, HIGH_SCORE_SCREEN.moveSteps);
}
function highScoreHue(s) {
  return Math.min(
    0,
    HIGH_SCORE_SCREEN.hueStart + Math.max(0, Math.trunc(s)) * HIGH_SCORE_SCREEN.hueStep,
  );
}
const RANK_TITLES = {
  arcade: [
    {
      title: 'Majin',
      score: 7100,
    },
    {
      title: 'Adept',
      score: 6900,
    },
    {
      title: 'Warlocke',
      score: 6700,
    },
    {
      title: 'Master',
      score: 6400,
    },
    {
      title: 'Destroyer',
      score: 6200,
    },
    {
      title: 'Champion',
      score: 6e3,
    },
    {
      title: 'Apprentice',
      score: 5800,
    },
    {
      title: 'Squire',
      score: 5600,
    },
    {
      title: 'Newbie',
      score: 0,
    },
  ],
  arena: [
    {
      title: 'Majin',
      score: 3e5,
    },
    {
      title: 'Adept',
      score: 27e4,
    },
    {
      title: 'Warlocke',
      score: 25e4,
    },
    {
      title: 'Master',
      score: 24e4,
    },
    {
      title: 'Destroyer',
      score: 23e4,
    },
    {
      title: 'Champion',
      score: 22e4,
    },
    {
      title: 'Apprentice',
      score: 21e4,
    },
    {
      title: 'Squire',
      score: 2e5,
    },
    {
      title: 'Newbie',
      score: 0,
    },
  ],
};
function rankTitleFor(s, e) {
  const t = toInt(e);
  return RANK_TITLES[s].find((i) => t >= i.score)?.title ?? null;
}
function buildCongratulations(s, e, t, i = !0) {
  const r = toInt(t),
    n = toInt(e) + r,
    a = r > 0 ? 'Combined' : 'Final',
    o = rankTitleFor(s, n),
    l = [`Congratulations, you have acheived a hiscore for ${s} mode!`];
  return (
    i &&
      l.push(
        'You can submit your hiscore name locally only or to both locally',
        'and the world using the internet.  Be competitive and try your',
        'score against everyone else.  Who is the strongest fighter?',
      ),
    {
      title: `${s.toUpperCase()} SUBMIT SCORE`,
      copy: l,
      score: n,
      scoreLabel: a,
      scoreText: `${a} Score: ${n.toLocaleString('en-US')}`,
      rank: o,
      rankText: `Rank: ${o ?? ''}`,
    }
  );
}
function submitOptions(s = !0) {
  return s
    ? [
        {
          index: 0,
          label: 'Local',
        },
        {
          index: 1,
          label: 'World',
        },
        {
          index: 2,
          label: 'None',
        },
      ]
    : [
        {
          index: 0,
          label: 'Submit',
        },
        {
          index: 2,
          label: 'Cancel',
        },
      ];
}
function nextSubmitOption(s, e, t = !0) {
  const i = submitOptions(t).map((a) => a.index),
    r = i.indexOf(s),
    n = (Math.max(0, r) + e + i.length) % i.length;
  return i[n];
}
function submitPrompt(s, e, t = !0) {
  return s === 0
    ? {
        kind: 'input',
        title: 'Local Hiscore Name',
        value: e ?? '',
        maxLength: 11,
        charList: HIGH_SCORE_CHARS,
      }
    : s === 1
      ? t
        ? {
            kind: 'input',
            title: 'World Hiscore Name',
            value: e ?? '',
            maxLength: 11,
            charList: HIGH_SCORE_CHARS,
          }
        : {
            kind: 'popup',
            title: 'Submit World',
            message: 'This is only in the full version!',
            delay: 75,
            icon: 'shield',
          }
      : {
          kind: 'question',
          ...SUBMIT_SCREEN.abortQuestion,
          onYes: 'abort-hiscore',
        };
}
function submitLocalScore(s, e, t, i) {
  return t.length === 0
    ? {
        kind: 'popup',
        ...SUBMIT_SCREEN.invalidLocalPopup,
      }
    : (writeHighScore(s, e, t, i),
      {
        kind: 'popup',
        ...SUBMIT_SCREEN.successLocalPopup,
        afterClose: {
          kind: 'scores',
          mode: e,
          highlightName: t,
        },
      });
}
function submitEntrance(s) {
  const e = Math.max(0, Math.trunc(s)),
    t = Math.min(SUBMIT_SCREEN.entranceSteps, Math.max(0, e - 1)),
    i = easeIn(-384, 0, t, SUBMIT_SCREEN.entranceSteps);
  return {
    drawFrame: e,
    panelOffsetY: i,
    pixelOffsetY: Math.trunc(i),
    inputReady: !0,
  };
}
function submitBlink(s) {
  return Math.floor(Math.max(0, s) / 10) & 1;
}
function highScoreKeyAt(s, e) {
  const t = ((Math.trunc(s) % 9) + 9) % 9,
    i = ((Math.trunc(e) % 5) + 5) % 5,
    r = i * 9 + t,
    n = HIGH_SCORE_CHARS[r],
    a =
      n === '\0'
        ? 'disabled'
        : n === '\b'
          ? 'backspace'
          : n ===
              `
`
            ? 'enter'
            : 'character',
    o =
      n === '\0'
        ? null
        : n === '\b'
          ? 127
          : n ===
              `
`
            ? 128
            : n.charCodeAt(0);
  return {
    x: t,
    y: i,
    index: r,
    raw: n,
    kind: a,
    glyphCode: o,
  };
}
function newHighScoreNameEntry(s, e = 'Local Hiscore Name', t = 11) {
  return {
    title: e,
    value: (s ?? '').toUpperCase(),
    maxLength: t,
    cursorX: 8,
    cursorY: 4,
  };
}
function moveHighScoreCursor(s, e) {
  let t = s.cursorX,
    i = s.cursorY;
  return (
    (e.x ?? 0) > 0
      ? (t = (t + 1) % 9)
      : (e.x ?? 0) < 0
        ? (t = (t + 8) % 9)
        : (e.y ?? 0) > 0
          ? (i = (i + 1) % 5)
          : (e.y ?? 0) < 0 && (i = (i + 4) % 5),
    {
      ...s,
      cursorX: t,
      cursorY: i,
    }
  );
}
function typeHighScoreCharacter(s, e = null) {
  const t = highScoreKeyAt(s.cursorX, s.cursorY);
  return t.kind === 'backspace' || e === 3
    ? s.value.length === 0
      ? {
          state: s,
          outcome: 'error',
          audio: 'error',
        }
      : {
          state: {
            ...s,
            value: s.value.slice(0, -1),
          },
          outcome: 'backspace',
          audio: 'blip',
        }
    : t.kind === 'enter'
      ? {
          state: s,
          outcome: 'complete',
          audio: 'gling',
          command: `${s.title}|${s.value}`,
        }
      : s.value.length > s.maxLength || t.kind === 'disabled'
        ? {
            state: s,
            outcome: 'error',
            audio: 'error',
          }
        : {
            state: {
              ...s,
              value: s.value + t.raw,
            },
            outcome: 'append',
            audio: 'gling',
          };
}
function nameEntryBlink(s) {
  const e = ((Math.max(0, Math.trunc(s)) % 52) + 52) % 52,
    t = e > 50 ? 0 : e + 1;
  return {
    textCursorOn: e > 10,
    selectedKeyOn: t > 10,
    preIncrementCounter: e,
    keyCounter: t,
  };
}
export {
  HIGH_SCORE_SCREEN,
  NAME_ENTRY_SCREEN,
  SUBMIT_SCREEN,
  buildCongratulations,
  buildHighScorePages,
  highScoreHue,
  highScoreKeyAt,
  highScorePageSlide,
  lowestHighScore,
  moveHighScoreCursor,
  nameEntryBlink,
  newHighScoreNameEntry,
  nextSubmitOption,
  resetHighScores,
  shiftHighScoreMode,
  submitBlink,
  submitEntrance,
  submitLocalScore,
  submitOptions,
  submitPrompt,
  typeHighScoreCharacter,
};
