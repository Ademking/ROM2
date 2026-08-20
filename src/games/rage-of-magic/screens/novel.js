const NOVEL_LINE_HEIGHT = 33;
const NOVEL_SCROLL_SPEED = 0.4;
const NOVEL_PAGE_GAP = 10;
const NOVEL_TEXT_FADE_STEP = 0.005;
const NOVEL_FONT = 16;
const NOVEL_PAGE_DELAY_FRAMES = 15;
const NOVEL_PAGE_FADE_STEP = 0.025;
const NOVEL_PAGE_MARGIN = 5;
function formatScore(s) {
  return Math.trunc(s).toLocaleString('en-US');
}
function expandNovelToken(s, e) {
  if (s === '{arena-win-p1}')
    return e.player1 === 0 ? void 0 : `$PLAYER 1 SCORE : ${formatScore(e.player1)}`;
  if (s !== '{arena-win-p2}' && s !== '{arena-win-total}')
    return s === '{arcade-win-p1}'
      ? e.player1 === 0
        ? void 0
        : `$FINAL SCORE : ${formatScore(e.player1)}`
      : s;
}
function buildNovelLines(s, e, t = [10, 10, 25, 25]) {
  const i = [];
  let r = 0,
    n = 0,
    a = -1;
  for (let o = 1; s?.[String(o)] !== void 0; o += 1) {
    const l = expandNovelToken(s[String(o)], e);
    if (l === void 0) continue;
    const c = l.startsWith('*'),
      h = l.startsWith('$');
    c || h
      ? (a === 1 && ((r += (t[1] ?? 10) + NOVEL_FONT), (n += (t[1] ?? 10) + NOVEL_FONT)),
        i.push({
          kind: c ? 'heading' : 'score',
          text: l.slice(1),
          font: c ? 3 : 2,
          measureFont: 3,
          y: r,
        }),
        (r += (t[c ? 3 : 2] ?? 25) + NOVEL_FONT),
        (n += (t[3] ?? 25) + NOVEL_FONT),
        (a = 2))
      : (i.push({
          kind: 'body',
          text: l,
          font: 1,
          measureFont: 0,
          y: r,
        }),
        (r += (t[1] ?? 10) + NOVEL_FONT),
        (n += (t[1] ?? 10) + NOVEL_FONT),
        (a = 1));
  }
  return {
    height: n - (t[1] ?? 10) + NOVEL_FONT,
    lines: i,
  };
}
function newScrollState(s, e = 384, t = !0) {
  return {
    y: e,
    height: s,
    textPct: 0,
    hue: t ? -255 : 0,
    anim: 0,
    manual: !1,
  };
}
function stepNovelScroll(s) {
  const e = {
    ...s,
  };
  return (
    e.hue < 0 && (e.hue = Math.min(0, e.hue + 15)),
    (e.textPct = Math.min(1, e.textPct + NOVEL_TEXT_FADE_STEP)),
    e.manual || (e.y -= NOVEL_SCROLL_SPEED),
    (e.anim += 1),
    {
      state: e,
      done: !e.manual && e.y <= -e.height,
    }
  );
}
function advanceNovel(s, e) {
  const t = {
    ...s,
  };
  if (e === 'skip' || (e === 'action' && t.manual))
    return {
      state: t,
      done: !0,
      enteredManual: !1,
      sound: 'gling',
    };
  if (e === 'action')
    return (
      (t.textPct = 1),
      (t.y -= NOVEL_PAGE_GAP),
      {
        state: t,
        done: !1,
        enteredManual: !1,
      }
    );
  const i = !t.manual;
  return (
    (t.manual = !0),
    (t.textPct = 1),
    e === 'down'
      ? (t.y = Math.max(-t.height, t.y - NOVEL_PAGE_GAP))
      : (t.y = Math.min(t.height, t.y + NOVEL_PAGE_GAP)),
    {
      state: t,
      done: !1,
      enteredManual: i,
      sound: i ? 'blip' : void 0,
    }
  );
}
function newPageState(s) {
  return {
    delayFrames: NOVEL_PAGE_DELAY_FRAMES * Math.max(0, Math.trunc(s)),
    delayCount: 0,
    textPct: 0,
    hue: -255,
    anim: 0,
  };
}
function stepNovelPage(s, e) {
  const t = {
    ...s,
  };
  return (
    t.hue < 0 && (t.hue = Math.min(0, t.hue + 15)),
    (t.textPct = Math.min(1, t.textPct + NOVEL_PAGE_FADE_STEP)),
    (t.anim += 1),
    e
      ? {
          state: t,
          done: !1,
        }
      : ((t.delayCount += 1),
        {
          state: t,
          done: t.delayCount > t.delayFrames,
        })
  );
}
function buildPageLines(s, e = [10, 10, 25, 25], t = !0) {
  if (!s?.title) return [];
  const i = [];
  let r = 0;
  (i.push({
    text: s.title.toUpperCase(),
    font: 3,
    measureFont: 2,
    y: r,
  }),
    (r += (e[3] ?? 25) + NOVEL_PAGE_MARGIN),
    s.subtitle &&
      (i.push({
        text: s.subtitle.toUpperCase(),
        font: 0,
        measureFont: 0,
        y: r,
      }),
      (r += (e[0] ?? 10) + NOVEL_PAGE_MARGIN * 3)));
  let n = 0;
  for (let a = 1; s[String(a)] !== void 0; a += 1)
    (i.push({
      text: s[String(a)],
      font: 1,
      measureFont: 0,
      y: r,
    }),
      (r += (e[1] ?? 10) + NOVEL_PAGE_MARGIN),
      (n += 1));
  return (
    n > 0 && (r += (e[0] ?? 10) * 3),
    t &&
      i.push({
        text: '... Press Any Button ...',
        font: 0,
        measureFont: 0,
        y: r,
      }),
    i
  );
}
function parseNovelPages(s) {
  return s
    ? Object.entries(s)
        .filter(([e]) => /^\d+$/.test(e))
        .sort(([e], [t]) => Number(e) - Number(t))
        .map(([e, t]) => {
          const [i = '', r = 'cover'] = t.split('|');
          return {
            number: Number(e),
            title: i,
            poster: r,
          };
        })
    : [];
}
function novelHoldFrames(s, e, t) {
  return s ? (e && t ? 99999 : e ? 16 : 3) : 3;
}
export {
  NOVEL_LINE_HEIGHT,
  NOVEL_PAGE_DELAY_FRAMES,
  advanceNovel,
  buildNovelLines,
  buildPageLines,
  newPageState,
  newScrollState,
  novelHoldFrames,
  parseNovelPages,
  stepNovelPage,
  stepNovelScroll,
};
