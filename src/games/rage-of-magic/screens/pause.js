const PAUSE_SCREEN = {
  rate: 30,
  frozenFrameFade: 0.75,
  hints: [
    'Stand or walk forward to block',
    'Use Panic Attack when surrounded',
    'Use Super when Super bar is full',
    '[1] repeatedly for Combo Attack',
    '[1+2] also equals Special Attack',
    '[1+2+3] also equals Super Attack',
  ],
  globalKeys: ['[F1] Toggle quick help', '[Q] Show pause menu'],
};
function pauseOwner(s, e) {
  if (s >= 0) return s === 1 ? 1 : 0;
  const t = e[0]?.joined === !0,
    i = e[1]?.joined === !0;
  return !t && i ? 1 : 0;
}
function nextPauseChoice(s, e) {
  return (s + e + 2) % 2;
}
function pausePlayerLabel(s, e) {
  return `Player ${s + 1} ${e.controllerName}`;
}
function pauseBlink(s) {
  return Math.floor(Math.max(0, s) / 10) & 1;
}
export { PAUSE_SCREEN, nextPauseChoice, pauseBlink, pauseOwner, pausePlayerLabel };
