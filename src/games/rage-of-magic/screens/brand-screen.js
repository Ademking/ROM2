const PRESENTS_SCREEN = {
  text: 'DRILLION RETRO PRESENTS',
  font: 0,
  cover: {
    x: 184,
    y: 236,
    width: 142,
    height: 16,
    color: 328965,
  },
  textY: 239,
};
function editionInfo(s) {
  return s
    ? {
        version: 'Full v1.47',
        owner: null,
        registrationFont: 1,
      }
    : {
        version: 'Trial v1.47',
        owner: 'Trial Version',
        registrationFont: 5,
      };
}
function brandHue(s) {
  const e = Math.max(0, Math.min(20, Math.trunc(s)));
  return e === 0 ? 0 : Math.trunc((-255 * e) / 20);
}
function brandDone(s) {
  return Math.trunc(s) > 20;
}
function fadeHue(s, e) {
  const t = Math.max(1, Math.trunc(e)),
    i = Math.max(0, Math.min(t, Math.trunc(s)));
  return i === 0 ? 0 : Math.trunc((-255 * i) / t);
}
function fadeDone(s, e) {
  return Math.trunc(s) > Math.max(1, Math.trunc(e));
}
export { PRESENTS_SCREEN, brandDone, brandHue, editionInfo, fadeDone, fadeHue };
