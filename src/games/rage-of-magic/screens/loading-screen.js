const BAR_WIDTH = 200;
const BAR_HEIGHT = 10;
const BAR_COLORS = {
  light: 16718876,
  middle: 12456980,
  dark: 8719886,
};
const LOADING_LAYOUT = {
  logo: {
    x: 162,
    y: 148,
  },
  bar: {
    x: 154,
    y: 181,
  },
  fill: {
    x: 156,
    y: 183,
    height: BAR_HEIGHT,
  },
  footerY: 201,
  subtitleY: 166,
  titleY: 142,
};
function newLoadingState(s) {
  return {
    delay: 0,
    initialDelay: Math.max(0, Math.trunc(s)),
    done: !1,
    gone: !1,
  };
}
function stepLoading(s, e) {
  const t = {
    ...s,
  };
  return t.gone
    ? {
        state: t,
        action: 'gone',
      }
    : t.delay < t.initialDelay
      ? ((t.delay += 1),
        {
          state: t,
          action: 'wait-hidden',
        })
      : t.done
        ? ((t.gone = !0),
          {
            state: t,
            action: 'begin-fade',
          })
        : ((t.done = !0),
          {
            state: t,
            action: 'draw',
          });
}
function loadingScreen(s) {
  const e = `Loading ${Math.trunc(Math.max(0, Math.min(1, s.percent)) * 100)}%`,
    t = s.fullEdition ? 1 : 5,
    i = s.owner || void 0;
  return s.subtitle == null
    ? {
        showLogo: !1,
        owner: i,
        percent: e,
        ownerFont: t,
      }
    : {
        showLogo: !1,
        percent: e,
        title: s.title ?? void 0,
        subtitle: s.subtitle,
        ownerFont: t,
      };
}
function barFillWidth(s) {
  return Math.trunc(BAR_WIDTH * Math.max(0, Math.min(1, s)));
}
export { BAR_COLORS, LOADING_LAYOUT, barFillWidth, loadingScreen, newLoadingState, stepLoading };
