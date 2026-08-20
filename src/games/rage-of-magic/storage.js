const RAGE_STORAGE_PREFIX = 'drillion-retro.rage-of-magic';
function highScoreKey(s, e) {
  return `${RAGE_STORAGE_PREFIX}.${s}-score-${e + 1}`;
}
function createHighScoreStore(s) {
  const e = new Map(),
    t = (n) => {
      try {
        return s?.getItem(n) ?? e.get(n) ?? null;
      } catch {
        return e.get(n) ?? null;
      }
    },
    i = (n, a) => {
      e.set(n, a);
      try {
        s?.setItem(n, a);
      } catch {}
    },
    r = (n) => {
      e.delete(n);
      try {
        s?.removeItem(n);
      } catch {}
    };
  return {
    read(n, a) {
      const o = t(highScoreKey(n, a));
      if (!o) return null;
      const l = o.lastIndexOf('|');
      if (l < 0) return null;
      const c = Number(o.slice(l + 1));
      return Number.isFinite(c)
        ? {
            name: o.slice(0, l),
            score: Math.trunc(c),
          }
        : null;
    },
    write(n, a, o) {
      i(highScoreKey(n, a), `${o.name}|${Math.trunc(o.score)}`);
    },
    clear(n, a) {
      r(highScoreKey(n, a));
    },
    readPreferredName() {
      return t(`${RAGE_STORAGE_PREFIX}.hiscore-name`);
    },
    writePreferredName(n) {
      i(`${RAGE_STORAGE_PREFIX}.hiscore-name`, n);
    },
  };
}
export { createHighScoreStore };
