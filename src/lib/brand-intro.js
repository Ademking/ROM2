const BRAND_LOGO_IMAGE = '/brand/drillion-retro-logo.webp';
const BRAND_AUDIO_MANIFEST = '/audio/brand/audio.json';
const BRAND_STARTUP_SOUND = 'drillion-retro-startup';
const BRAND_LOGO_SCALE = 0.75;
const BRAND_SPLASH_SECONDS = 3;
function fadeAlphaForFrame(s, e, t) {
  const i = Math.max(1, Math.trunc(e) - 1),
    r = Math.max(0, Math.min(i, Math.trunc(s))),
    n = Math.max(1, Math.min(Math.trunc(t), Math.floor(i / 2)));
  return Math.max(0, Math.min(1, r / n, (i - r) / n));
}
export { BRAND_LOGO_IMAGE, BRAND_LOGO_SCALE };
