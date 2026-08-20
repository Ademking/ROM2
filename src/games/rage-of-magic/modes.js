const PLAY_MODES = new Set([
  'arcade',
  'arena',
  'practice',
  'survival',
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
