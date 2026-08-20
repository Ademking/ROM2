const ATTRACT_CUE_COUNT = 20;
const ATTRACT_LOOP_LIMIT = ATTRACT_CUE_COUNT * 10 + 1;
const ATTRACT_HOLD_FRAMES = 15;
const ATTRACT_CUES = new Map([
  [0, ['az', 113]],
  [2, ['wren', 114]],
  [4, ['luc', 115]],
  [6, ['tom', 113]],
  [8, ['chai', 114]],
  [10, ['puck', 115]],
  [12, ['dor', 113]],
  [14, ['mwa', 114]],
  [16, ['sda', 115]],
  [18, ['leo', 113]],
  [20, ['strd', 114]],
  [22, ['fau', 115]],
  [24, ['dlrd', 113]],
  [26, ['eva', 114]],
  [28, ['stau', 115]],
]);
function attractAction(s, e) {
  const t = Math.max(0, Math.trunc(s));
  if (t === 30)
    return {
      action: {
        kind: 'credits',
      },
      nextLoop: 0,
    };
  const i = ATTRACT_CUES.get(t);
  return i
    ? {
        action: {
          kind: 'poster-demo',
          poster: i[0],
          script: i[1],
          posterFrames: ATTRACT_HOLD_FRAMES,
        },
        nextLoop: t === 2 && !e ? 0 : t + 1,
      }
    : {
        action: {
          kind: 'intro',
        },
        nextLoop: t + 1,
      };
}
function attractFinished(s) {
  return Math.trunc(s) >= ATTRACT_LOOP_LIMIT;
}
export { attractAction, attractFinished };
