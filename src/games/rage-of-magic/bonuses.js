import { toNumber } from './document-parse.js';
const COMBO_TICKS = 40;
const MIN_COMBO_HITS = 10;
const BONUS_BY_NAME = {
  sp: 0,
  rage: 1,
  refract: 2,
  absorb: 3,
  fairy: 4,
  life: 5,
};
function parseArenaTiers(s) {
  return s
    ? Object.entries(s)
        .filter(([e]) => /^\d+$/.test(e))
        .sort(([e], [t]) => Number(e) - Number(t))
        .flatMap(([, e]) => {
          const [t, i, r, n] = e.split('|');
          return t === void 0 || i === void 0 || r === void 0 || n === void 0
            ? []
            : [
                {
                  title: t,
                  hits: toNumber(i),
                  score: toNumber(r),
                  bonus: BONUS_BY_NAME[n.toLowerCase()] ?? -1,
                },
              ];
        })
    : [];
}
function arenaTierFor(s, e) {
  const t = s.findIndex((i) => e >= i.hits);
  if (!(t < 0))
    return {
      tier: s[t],
      arenaCoins: s.length - t,
    };
}
export { COMBO_TICKS, MIN_COMBO_HITS, arenaTierFor, parseArenaTiers };
