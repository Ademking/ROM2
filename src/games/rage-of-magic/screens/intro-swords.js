const INTRO_RATE = 37;
const INTRO_TOTAL_FRAMES = 1050;
const INTRO_COVER_Y = -236;
const SWORD_CUES = [
  {
    frame: 303,
    imageFrame: 1,
    side: 1,
    extra: 60,
    y: 30,
  },
  {
    frame: 383,
    imageFrame: 2,
    side: -1,
    extra: 60,
    y: 210,
  },
  {
    frame: 463,
    imageFrame: 3,
    side: 1,
    extra: 60,
    y: 30,
  },
  {
    frame: 543,
    imageFrame: 4,
    side: -1,
    extra: 60,
    y: 210,
  },
  {
    frame: 623,
    imageFrame: 5,
    side: 1,
    extra: 60,
    y: 30,
  },
  {
    frame: 703,
    imageFrame: 6,
    side: -1,
    extra: 60,
    y: 210,
  },
  {
    frame: 783,
    imageFrame: 7,
    side: 1,
    extra: 60,
    y: 30,
  },
  {
    frame: 883,
    imageFrame: 8,
    side: -1,
    extra: 0,
    y: 120,
  },
];
function lerp(s, e, t) {
  return s + (e - s) * Math.max(0, Math.min(1, t));
}
function accelerate(s, e, t, i, r) {
  const n = r ? t : i - t,
    a = Math.sign(e - s),
    o = Math.abs(e - s),
    l = Math.fround(a * ((2 * o) / Math.pow(i, 2))),
    c = Math.fround(0.5 * l * Math.pow(n, 2));
  return Math.fround(r ? s + c : e - c);
}
function accelerateOut(s, e, t, i) {
  return accelerate(s, e, Math.max(0, Math.min(i, t)), i, !1);
}
function accelerateIn(s, e, t, i) {
  return accelerate(s, e, Math.max(0, Math.min(i, t)), i, !0);
}
function introHue(s) {
  return s <= 150 ? lerp(-255, 0, s / 150) : s <= 975 ? 0 : lerp(0, 255, (s - 975) / 40);
}
function swordX(s, e) {
  const t = s.side === 1 ? 512 : -512,
    i = -s.side * s.extra,
    r = -s.side * (s.extra + 15),
    n = -t / 2;
  return e <= 10
    ? accelerateOut(t, i, e, 10)
    : e <= 40
      ? accelerateIn(i, r, e - 10, 30)
      : accelerateIn(r, n, e - 40, 10);
}
function swordFlights(s) {
  const e = Math.max(0, Math.trunc(s)),
    t = SWORD_CUES.filter((n) => e >= n.frame && e <= n.frame + 52).map((n) => {
      const a = e - n.frame;
      return {
        cue: n,
        age: a,
        x: swordX(n, a),
        hue: Math.trunc(a === 0 ? 0 : lerp(255, 0, a / 10)),
        showHead: a <= 50,
        showBand: a <= 52,
      };
    });
  let i = introHue(e);
  const r = [...SWORD_CUES].reverse().find((n) => e >= n.frame && e <= n.frame + 22);
  if (r) {
    const n = e - r.frame;
    i = n <= 2 ? lerp(i, -255, n / 2) : lerp(255, 0, (n - 2) / 20);
  }
  return {
    frame: e,
    coverY: lerp(0, INTRO_COVER_Y, e / INTRO_TOTAL_FRAMES),
    coverHue: Math.trunc(i),
    characters: t,
    done: e > INTRO_TOTAL_FRAMES,
  };
}
function introTitleHue(s) {
  return Math.min(0, -255 + Math.max(0, Math.trunc(s)) * 20);
}
function introTitleDone(s) {
  return Math.trunc(s) >= 60;
}
function introSubtitleHue(s) {
  return Math.max(0, 255 - Math.max(0, Math.trunc(s)) * 25);
}
function introSubtitleDone(s) {
  return Math.trunc(s) >= 10;
}
function introPromptBlink(s) {
  return (20 + Math.max(0, Math.trunc(s))) % 41 > 20;
}
export {
  INTRO_RATE,
  SWORD_CUES,
  introPromptBlink,
  introSubtitleDone,
  introSubtitleHue,
  introTitleDone,
  introTitleHue,
  swordFlights,
};
