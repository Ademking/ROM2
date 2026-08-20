const PLAY_MODES = new Set([
  'arcade',
  'arena',
  'practice',
  'tutorial',
  'versus',
  'show',
  'gallery',
  'movie',
  'preview',
]);
function normalizeMode(s) {
  return s && PLAY_MODES.has(s) ? s : 'demo';
}
function isTrialEdition(s) {
  return s !== 'full';
}
export { isTrialEdition, normalizeMode };
