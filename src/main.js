import { Application, UPDATE_PRIORITY } from 'pixi.js';
import './styles/game.css';
import {
  DEFAULT_UPDATE_RATE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from './games/rage-of-magic/constants.js';
import { RageOfMagicGame } from './games/rage-of-magic/game.js';
import { displayScale } from './lib/display-scale.js';

const root = document.querySelector('#game');
const host = root.querySelector('.canvas-host');
const cover = root.querySelector('.cover');

let pixelPerfect = false;
let app;
let game;
let leftover = 0;
const heldKeys = new Set();

function showCover(className, html) {
  cover.className = `cover ${className}`;
  cover.innerHTML = html;
  cover.hidden = false;
}

function fitCanvas() {
  if (!app) return;
  const box = host.getBoundingClientRect();
  const scale = displayScale(box.width, box.height, SCREEN_WIDTH, SCREEN_HEIGHT, pixelPerfect);
  app.canvas.style.width = `${SCREEN_WIDTH * scale}px`;
  app.canvas.style.height = `${SCREEN_HEIGHT * scale}px`;
  app.canvas.dataset.canvasScale = `${scale.toFixed(3)}x`;
}

function releaseHeldKeys() {
  for (const code of heldKeys) game?.keyUp(code);
  heldKeys.clear();
}

function isTyping(element) {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  );
}

function onKeyDown(event) {
  if (!app || event.metaKey || event.ctrlKey || event.altKey || isTyping(document.activeElement))
    return;
  event.preventDefault();
  heldKeys.add(event.code);
  game?.keyDown(event.code);
}

function onKeyUp(event) {
  if (heldKeys.delete(event.code)) game?.keyUp(event.code);
}

function onVisibilityChange() {
  if (document.hidden) releaseHeldKeys();
}

/** The game runs on a fixed step it can change between frames. */
function stepGame() {
  let interval = 1000 / (game?.updateRate ?? DEFAULT_UPDATE_RATE);
  leftover = Math.min(leftover + app.ticker.deltaMS, interval * 5);
  while (leftover >= interval) {
    game?.step();
    leftover -= interval;
    interval = 1000 / (game?.updateRate ?? DEFAULT_UPDATE_RATE);
  }
}

function showStartCover() {
  showCover('start-cover', '<button type="button">Play Rage of Magic II</button>');
  cover.querySelector('button').addEventListener('click', () => {
    cover.hidden = true;
    leftover = 0;
    // start() unlocks audio inside the click, then loads the rest of the assets
    // behind the game's own loading bar.
    game.start()?.catch(showError);
    app.canvas.focus();
  });
}

async function boot() {
  showCover('loading-cover', '<span class="loader"></span>Decoding the archive…');

  app = new Application();
  await app.init({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    antialias: false,
    autoDensity: false,
    background: '#000000',
    preference: 'webgl',
    resolution: 1,
    roundPixels: true,
  });
  app.canvas.style.imageRendering = pixelPerfect ? 'pixelated' : 'auto';
  app.canvas.setAttribute('aria-label', 'Rage of Magic II game canvas');
  app.canvas.tabIndex = 0;
  host.appendChild(app.canvas);
  fitCanvas();
  new ResizeObserver(fitCanvas).observe(host);

  game = new RageOfMagicGame({
    pixelPerfect,
    renderer: app.renderer,
    onStateChange: () => { },
    onOpenHighScores: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
  });
  app.stage.addChild(game.root);
  await game.load();

  app.ticker.add(stepGame, undefined, UPDATE_PRIORITY.HIGH);
  app.canvas.addEventListener('pointerdown', () => game?.skipStartupWithPointer());
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', releaseHeldKeys);
  document.addEventListener('visibilitychange', onVisibilityChange);

  showStartCover();
}

function showError(error) {
  showCover(
    'error-cover',
    `<strong>Couldn’t start Rage of Magic II.</strong><span>${error instanceof Error ? error.message : 'The game could not be loaded.'
    }</span>`,
  );
}

boot().catch(showError);
