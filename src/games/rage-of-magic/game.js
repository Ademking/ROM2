import {
  ColorMatrixFilter,
  Container,
  Graphics,
  Rectangle,
  RenderTexture,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';
import { Actor, MIN_HIT_OVERLAP } from './actor.js';
import { markAllyBumped, newAllyMemory, stepAllyAi } from './ai/ally.js';
import { markAnimalBumped, newAnimalMemory, stepAnimalAi } from './ai/animal.js';
import {
  circleSiblings,
  controllerKindOf,
  followLeader,
  newFollowMemory,
  stepCircleAi,
} from './ai/circle.js';
import { EnemyAi } from './ai/enemy.js';
import { FairyBonus, moveFairy, newFairyMemory, stepFairyAi } from './ai/fairy.js';
import { isAutoController, moveTracker, newTrackMemory, stepTrackAi } from './ai/track.js';
import { newWispMemory, stepWispAi, trackLeader } from './ai/wisp.js';
import { buildBitmapText, measureBitmapText, regionTexture, trimmedTexture } from './atlas.js';
import { arenaTierFor, parseArenaTiers } from './bonuses.js';
import { boxesOverlap, worldBox } from './bounds.js';
import {
  centerCameraOn,
  centerCameraOnActor,
  createCamera,
  glideCameraTo,
  moveCameraTo,
  moveCameraToQuadrant,
  pushCameraWithActor,
  stepCamera,
  trackAllActors,
  trackPlayers,
  trackPlayersClamped,
  withPlayerBounds,
  withSceneBounds,
} from './camera.js';
import { parseCheatCode } from './cheats.js';
import { grayMatrix } from './color-matrix.js';
import {
  DEFAULT_UPDATE_RATE,
  HEROES,
  Input,
  SCENE_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SHADOW_ORIGIN_X,
} from './constants.js';
import { parseChapters, toNumber, toNumberList } from './document-parse.js';
import {
  drawCongratulationsScreen,
  drawControlsScreen,
  drawLoadingScreen,
  drawMenuScreen,
  drawNameEntryScreen,
  drawSelectScreen,
} from './draw/screens.js';
import {
  ALLY_ACTOR_IDS,
  FONT_INDEX,
  GAME_KEYS,
  HUE_RAMP,
  ONLINE_SCORE_URLS,
  PICKUP_ICONS,
  PICKUP_NAMES,
  RAGE_HIGH_SCORE_KEY,
  RAGE_PROGRESS_KEY,
  RAGE_STARTUP_SOUND,
  SPLASH_FAST_RATE,
  SPLASH_RATE,
  TEXT_WRAP_WIDTH,
  newPlayerProgress,
  normalizePlayerProgress,
  safeLocalStorage,
} from './game-constants.js';
import { GamepadReader } from './gamepad.js';
import {
  HIGH_SCORE_SCREEN,
  NAME_ENTRY_SCREEN,
  SUBMIT_SCREEN,
  buildHighScorePages,
  highScoreHue,
  highScorePageSlide,
  lowestHighScore,
  moveHighScoreCursor,
  nameEntryBlink,
  newHighScoreNameEntry,
  nextSubmitOption,
  resetHighScores,
  shiftHighScoreMode,
  submitLocalScore,
  submitPrompt,
  typeHighScoreCharacter,
} from './high-scores.js';
import { readInput } from './keyboard.js';
import {
  applyLayerOpacity,
  blackMatrix,
  createLayer,
  destroyLayer,
  ensureOpacityFilter,
  isFrameClipped,
  shadowPlacement,
  shadowTexture,
  spriteTexture,
} from './layers.js';
import {
  CHAPTER_AUTOSELECT_FRAMES,
  MENU_CENTER_OFFSET,
  MENU_IDLE_FRAMES,
  MENU_MAX_HEIGHT,
  MENU_ROW_HEIGHT,
  MENU_SLIDE_STEPS,
  buildMainMenu,
  centerMenu,
  easeIn,
  itemHeight,
  itemTextLayout,
  layoutMenu,
  lockedMessage,
  menuSlide,
  menuTopY,
  pad3,
  submenuAt,
} from './menu/layout.js';
import { OPTIONS_SCREEN, buildOptionsMenu, layoutOptionMenu } from './menu/options.js';
import { isTrialEdition, normalizeMode } from './modes.js';
import { moveNameCursor, newNameEntry, typeNameCharacter } from './name-entry.js';
import { nextRouteAfterPlay } from './routing.js';
import {
  RESULT_LAYOUT,
  RESULT_SCREEN,
  SELECT_SLOT,
  buildResultReport,
  buildStageResult,
  moveResultChoice,
  nextArcadeStage,
  quitOrSaveEffects,
  resultBlink,
  resultChoiceEffects,
  resultPanelY,
  saveQuestionEffects,
} from './scoring.js';
import { attractAction, attractFinished } from './screens/attract.js';
import {
  PRESENTS_SCREEN,
  brandDone,
  brandHue,
  editionInfo,
  fadeDone,
  fadeHue,
} from './screens/brand-screen.js';
import {
  PANEL_ENTER_FRAMES,
  PANEL_EXIT_FRAMES,
  PANEL_HEIGHT,
  PANEL_TRAVEL,
  panelEnterX,
  panelExitX,
  panelPlacement,
} from './screens/intro-panels.js';
import {
  INTRO_RATE,
  SWORD_CUES,
  introPromptBlink,
  introSubtitleDone,
  introSubtitleHue,
  introTitleDone,
  introTitleHue,
  swordFlights,
} from './screens/intro-swords.js';
import { newLoadingState, stepLoading } from './screens/loading-screen.js';
import {
  NOVEL_LINE_HEIGHT,
  NOVEL_PAGE_DELAY_FRAMES,
  advanceNovel,
  buildNovelLines,
  buildPageLines,
  newPageState,
  newScrollState,
  novelHoldFrames,
  parseNovelPages,
  stepNovelPage,
  stepNovelScroll,
} from './screens/novel.js';
import { nextPauseChoice, pauseOwner } from './screens/pause.js';
import {
  MESSAGE_LAYOUT,
  QUESTION_DIM,
  QUESTION_LAYOUT,
  newMessage,
  newQuestion,
  questionBlink,
  stepMessage,
  stepQuestion,
} from './screens/question.js';
import {
  HERO_CARD_HEIGHT,
  HERO_CARD_SPACING,
  HERO_CARD_TOP,
  HERO_CARD_WIDTH,
  HERO_STATS,
  TITLE_PLAYER_LABEL_Y,
  atlasCellPosition,
  titleScreenState,
} from './screens/title-screen.js';
import { HERO_NAMES, HERO_PALETTES, HERO_RACES } from './select/data.js';
import { newSelectPlayer, newSelectState, stepSelect } from './select/state.js';
import {
  BUTTON_DESCRIPTIONS,
  DEFAULT_BUTTON_MAP,
  DEFAULT_KEY_MAPS,
  NAME_ENTRY_CHARS,
  isAssignableKey,
  keyLabel,
  loadSettings,
  nextButtonAction,
  saveSettings,
} from './settings.js';
import { createHighScoreStore } from './storage.js';
import { GO_TOTAL_FRAMES, TIMING, noQuake, parallaxX, startQuake, stepQuake } from './timing.js';
import {
  VERSUS_LAYOUT,
  newVersusEndFlow,
  routeFromCommand,
  routeFromScreenName,
  stepVersusEndFlow,
  versusEndView,
  versusTitleLayout,
} from './versus.js';
import { assetPath } from '../../lib/asset-path.js';
import { AudioLibrary } from '../../lib/audio-library.js';
import { BRAND_LOGO_IMAGE, BRAND_LOGO_SCALE } from '../../lib/brand-intro.js';
import {
  SURVIVAL_CHARACTERS,
  SURVIVAL_RESULT,
  SURVIVAL_DATA_NAME,
  SURVIVAL_DEATH_SOUND,
  SURVIVAL_IMAGES,
  SURVIVAL_SCRIPT,
  WAVE_BREAK_FRAMES,
  WAVE_CAPTION_FRAMES,
  formatSurvivalTime,
  survivalResultColumns,
  survivalScene,
  survivalWave,
} from './survival.js';
import { centeredFitRect } from '../../lib/canvas-fit.js';
class RageOfMagicGame {
  root = new Container();
  onStateChange;
  onOpenHighScores;
  edition;
  renderer;
  audio = new AudioLibrary();
  textureSources = new Set();
  atlases = new Map();
  images = new Map();
  sourceTextureCache = new Map();
  actors = [];
  pendingActors = [];
  actorViews = new Map();
  actorLayerDisplays = new Map();
  actorShadows = new Map();
  actorShadowLayerDisplays = new Map();
  viewFrames = new Map();
  keys = new Set();
  screenControllerKeys = new Set();
  screenReleaseLatch = new GamepadReader();
  triggers = [];
  newTriggers = [];
  pendingScripts = [];
  actionSeen = new Map();
  fighterControllers = new Map();
  scriptProcessorBumps = new Set();
  animalProcessors = new Map();
  clericProcessors = new Map();
  fairyProcessors = new Map();
  wispProcessors = new Map();
  circleProcessors = new Map();
  trackProcessors = new Map();
  sceneLayer = new Container();
  backgroundLayer = new Container();
  shadowLayer = new Container();
  shadowSceneFilter;
  actorLayer = new Container();
  foregroundLayer = new Container();
  effectLayer = new Container();
  hudLayer = new Container();
  dialogLayer = new Container();
  screenLayer = new Container();
  fadeLayer = new Container();
  superLayer = new Container();
  overlayLayer = new Container();
  sceneHueFilter;
  sceneTransitionFilter;
  manifest;
  loaded = !1;
  startupStarted = !1;
  destroyed = !1;
  settingsStorage = safeLocalStorage();
  settings = loadSettings(this.settingsStorage);
  paused = !1;
  pauseMenu;
  pausePath = [];
  pauseIndex = 0;
  pauseCameraX = 0;
  pauseCameraY = 0;
  pauseMove;
  pauseModal;
  pauseFrozenTexture;
  pauseComposite;
  pauseUi;
  pauseGrayFilter;
  helpFrozenTexture;
  helpComposite;
  helpUi;
  helpFadeFilter;
  pauseSwordDraws = 0;
  pauseHints = this.settings.hints;
  recolorAllies = this.settings.recolorAllies;
  gameSpeedIndex = this.settings.gameSpeedIndex;
  difficultyIndex = this.settings.difficultyIndex;
  typeSpeedIndex = this.settings.typeSpeedIndex;
  graphicsIndex = this.settings.graphicsIndex;
  bloodEnabled = this.settings.blood;
  hueEnabled = this.settings.hue;
  slowEnabled = this.settings.slow;
  controlsHelpPlayer = 0;
  controlsHelpFrame = 0;
  pixelPerfect;
  screen = 'loading';
  frame = 0;
  screenFrame = 0;
  menuIndex = 0;
  menuIdleFrames = 0;
  pendingMenuReleasedCode;
  menuPath = [];
  menuRoot;
  menuMove;
  heroIndex = 0;
  heroDestination;
  selectState;
  selectRawInput;
  selectedPlayers = [];
  selectModal;
  chapterIndex = 0;
  chapterSession;
  chapterEntryIndex = 0;
  chapterMove;
  chapterIdleFrames = 0;
  chapterPanel;
  chapterCursor;
  chapterFadeOverlay;
  chapterLetterbox;
  chapterHintLayer;
  chapterPopup;
  mode = 'arcade';
  sourceMode = 'arcade';
  dataName = 'arcade';
  startScript = 1;
  currentScript = 1;
  gameChapter = 0;
  currentSection;
  sceneGeneration = 0;
  sceneTransition;
  sceneWidth = SCREEN_WIDTH;
  floorTop = 267;
  floorHeight = 113;
  cameraX = 0;
  cameraY = 4;
  sourceCamera = createCamera({
    sceneWidth: SCREEN_WIDTH,
  });
  sceneMinX = 0;
  sceneMaxX = SCREEN_WIDTH - 1;
  playerMinX = 0;
  playerMaxX = SCREEN_WIDTH - 1;
  sceneDamage = !0;
  sceneStops = [];
  statsOn = !1;
  statsVisible = !1;
  miniStats = this.settings.miniStats;
  hudStartDelay = [0, 0];
  hudStatMode = ['start', 'start'];
  hudChoice = [0, 0];
  hudChoiceTouched = [!1, !1];
  hudLoadReady = [!1, !1];
  hudLoadToken = [0, 0];
  timer = 0;
  timerTick = 0;
  timerRunning = !1;
  player;
  sourcePlayerActors = new Map();
  focusEnemy;
  dialogs = new Map();
  dialogActors = new Map();
  dialogTexts = new Map();
  dialogCloseFrames = new Map();
  caption;
  mission;
  lines = new Map();
  interstitial;
  suspendedScript;
  statsTransitionFrames = 0;
  statsTransitionTotal = 0;
  statsTransitionOpening = !1;
  helpFrames = 0;
  helpTotalFrames = 0;
  helpClosingFrames = 0;
  helpHintShown = !1;
  goFrames = 0;
  markerFrames = new Map();
  quake = noQuake();
  hue = this.clearHueState(!0);
  score = 0;
  highScore = this.loadHighScore();
  localScores = createHighScoreStore(safeLocalStorage());
  scoreMode = 'arcade';
  scoreHighlight = null;
  scoreTransition;
  scorePanel;
  scoreFilter;
  scoreHintLayer;
  scoreModal;
  scorePages;
  submitChoice = 0;
  submitFrame = 0;
  submitPlayerScores = [0, 0];
  hiscoreInput;
  scoreFlowModal;
  pendingSubmit;
  progress = this.loadProgress();
  statusValue = 0;
  lastState = '';
  sceneTitle = '';
  sceneSubtitle = '';
  playerInputStates = new Map();
  pendingActorInputs = [];
  pendingSuperStart;
  superActor;
  pendingSuperEnd;
  slowAmount = 0;
  slowDecay = 0;
  sourceUpdateRate = DEFAULT_UPDATE_RATE;
  currentMusic;
  musicMuted = this.settings.musicMuted;
  soundsMuted = this.settings.soundsMuted;
  musicPlaybackRequested = !1;
  superMusicSnapshot;
  logoVoice;
  introVoice;
  logoLayer;
  logoFilter;
  introCover;
  introCoverFilter;
  introBootstrap = !1;
  introSkipRequested = !1;
  logoSkipRequested = !1;
  introCharacterViews = new Map();
  startupLoad;
  /** Which survival wave is on the field; 0 before the first one drops. */
  survivalWave = 0;
  survivalBreak = 0;
  survivalSeconds = 0;
  survivalTick = 0;
  /** Set when the run is over; the summary is up and waiting for a button. */
  survivalResult;
  /** 0..1 across every asset loadAssets() fetches. Drives the loading bar. */
  assetProgress = 0;
  assetLoad;
  splashLayer;
  splashFilter;
  splashPrompt;
  splashHeldActions = new Set();
  splashAdvanceRequested = !1;
  splashMusicCleared = !1;
  introLoop = 0;
  pendingAttractAction;
  pendingAttractDemoScript;
  startupFade;
  startupFadeFilter;
  menuPanel;
  menuFadeOverlay;
  menuSword;
  menuHintLayer;
  menuSwordBaseX = 0;
  menuQuestion;
  menuKeyCapture;
  menuKeyCaptureLayer;
  menuSecretInput;
  menuPopup;
  menuSecretFade;
  secretAdmin = !1;
  rankedScoreEligible = !0;
  heroSelectLayer;
  heroSelectFilter;
  heroSelectTitle;
  heroSelectPanel;
  heroSelectArrow;
  heroSelectHighlight;
  heroSelectConfirmedIndex = 0;
  heroSelectLockedFrames = 0;
  heroSelectLockedMessage;
  heroSelectPortraits = [];
  heroSelectConfirmedFrames = [];
  endResult;
  endChoice = 0;
  endFrame = 0;
  endPanel;
  endSword;
  endSwordBaseX = 0;
  endQuestion;
  endQuestionState;
  endPopup;
  endOutcomeVoice;
  versusEndFlow;
  versusEndOutcomeVoice;
  versusEndInput;
  versusEndEscape = !1;
  playQuestion;
  uiScreenFade;
  playExitFade;
  playSplashFade;
  endRouteFade;
  playerKills = 0;
  playerKillCounts = new Map();
  sourceAllyTypes = new Map();
  playAbortRequested = !1;
  playEscapeRequested = !1;
  playHelpRequested = !1;
  playersChanged = !1;
  constructor(e = {}) {
    ((this.pixelPerfect = e.pixelPerfect ?? !1),
      (this.edition = e.edition ?? 'full'),
      (this.renderer = e.renderer),
      (this.onStateChange = e.onStateChange),
      (this.onOpenHighScores = e.onOpenHighScores),
      (this.actorLayer.sortableChildren = !0),
      (this.shadowLayer.sortableChildren = !0),
      (this.foregroundLayer.visible = this.settings.foregrounds),
      (this.sourceUpdateRate = this.sourceGameRate()),
      this.sceneLayer.addChild(
        this.backgroundLayer,
        this.shadowLayer,
        this.actorLayer,
        this.foregroundLayer,
        this.effectLayer,
      ),
      this.root.addChild(
        this.sceneLayer,
        this.fadeLayer,
        this.superLayer,
        this.hudLayer,
        this.dialogLayer,
        this.screenLayer,
        this.overlayLayer,
      ));
  }
  get updateRate() {
    return this.startupLoad
      ? 10
      : this.interstitial?.kind === 'novel'
        ? NOVEL_LINE_HEIGHT
        : this.interstitial?.kind === 'poster'
          ? NOVEL_PAGE_DELAY_FRAMES
          : this.sceneTransition?.kind === 'load' &&
              ['loading', 'loading-fade-out', 'activate'].includes(this.sceneTransition.phase)
            ? 10
            : this.screen === 'logo'
              ? 20
              : this.screen === 'intro'
                ? INTRO_RATE
                : this.screen === 'splash'
                  ? 20
                  : this.screen === 'paused' ||
                      this.screen === 'help' ||
                      this.screen === 'menu' ||
                      this.screen === 'hero' ||
                      this.screen === 'select' ||
                      this.screen === 'chapters' ||
                      this.screen === 'scores' ||
                      this.playQuestion ||
                      this.versusEndFlow
                    ? 30
                    : this.endResult
                      ? RESULT_SCREEN.rate
                      : this.sourceUpdateRate;
  }
  /**
   * Only what the in-game loading screen itself needs to draw. Everything else
   * is fetched by loadAssets() while that screen is up, so its bar is real.
   */
  async load() {
    const e = await fetch(assetPath('/games/rage-of-magic-ii/manifest.json', 'Game manifest'));
    if (!e.ok) throw new Error(`Could not load Rage of Magic II assets: ${e.status}`);
    if (
      ((this.manifest = await e.json()),
      this.manifest.nativeWidth !== SCREEN_WIDTH || this.manifest.nativeHeight !== SCREEN_HEIGHT)
    )
      throw new Error('Rage of Magic II manifest has an invalid native resolution');
    // Survival is ours, not Tony's: its scene and background live in source and
    // join the shipped data here, so the rest of the engine cannot tell the
    // difference.
    for (const [t, i] of Object.entries(survivalScene()))
      this.manifest.data[SURVIVAL_DATA_NAME][`Script:${t}`] = i;
    for (const [t, i] of Object.entries(SURVIVAL_IMAGES)) this.manifest.images[t] ??= i;
    // The sound files themselves are decoded by loadAssets(); the manifest is
    // cheap and lists what there is to load.
    (await Promise.all([
      this.audio.load('/audio/rage-of-magic/audio.json'),
      this.ensureAtlas('ui.fonts'),
    ]),
      (this.loaded = !0),
      this.emitState(!0));
  }
  /** Every remaining asset, reported through assetProgress as 0..1. */
  async loadAssets() {
    let failedSounds = 0;
    const tasks = [
      ...[...this.audio.configs.keys()].map((t) =>
        this.audio.preload([t]).catch(() => {
          failedSounds += 1;
        }),
      ),
      this.loadTexture(BRAND_LOGO_IMAGE).then((t) => this.images.set(RAGE_STARTUP_SOUND, t)),
      this.ensureImage('cover'),
      this.ensureImage('splash'),
      this.ensureImage('bg-castle'),
      this.ensureImage('bg-select-1'),
      this.ensureImage('bg-select-1a'),
      this.ensureImage('bg-skull-1'),
      this.ensureImage('bg-skull-1a'),
      this.ensureImage('sc-cliff-1a'),
      this.ensureImage('sc-arena-1a'),
      this.ensureImage('sc-cast-roof-1a'),
      this.ensureAtlas('ui.flash'),
      this.ensureAtlas('ui.logo'),
      this.ensureAtlas('ui.fonts'),
      this.ensureAtlas('ui.guiform'),
      this.ensureAtlas('ui.guiicon'),
      this.ensureAtlas('ui.plricon'),
      this.ensureAtlas('ui.stats'),
      this.ensureAtlas('ui.score'),
      this.ensureImage('dialog'),
      this.ensureAtlas('pickup'),
      ...HEROES.map((t) => this.ensureAtlas(t.id)),
    ];
    let done = 0;
    (await Promise.all(
      tasks.map((t) => t.then(() => (this.assetProgress = ++done / tasks.length))),
    ),
      failedSounds > 0 &&
        console.warn(
          `${failedSounds} sound(s) could not be preloaded; they will load on first use`,
        ),
      (this.assetProgress = 1));
  }
  start() {
    !this.loaded ||
      this.destroyed ||
      this.startupStarted ||
      ((this.startupStarted = !0),
      this.audio.unlock(),
      this.startInitialLoad(),
      (this.assetLoad = this.loadAssets()));
    return this.assetLoad;
  }
  step() {
    if (!(!this.loaded || !this.startupStarted || this.destroyed)) {
      if (((this.frame += 1), (this.screenFrame += 1), this.uiScreenFade)) {
        (this.stepUiScreenFade(), this.emitState());
        return;
      }
      if (this.screen === 'help') {
        ((this.controlsHelpFrame += 1), this.renderControlsHelp(), this.emitState());
        return;
      }
      if (this.screen === 'paused') {
        (this.stepPauseMenu(), this.emitState());
        return;
      }
      if (!this.paused) {
        if (this.startupLoad) {
          (this.stepStartupLoad(), this.emitState());
          return;
        }
        if (this.sceneTransition) {
          (this.stepSceneTransition(), this.emitState());
          return;
        }
        if (this.startupFade) {
          (this.stepStartupFade(), this.emitState());
          return;
        }
        if (this.interstitial) {
          (this.stepInterstitial(), this.emitState());
          return;
        }
        if (this.playSplashFade) {
          (this.stepPlaySplashFade(), this.emitState());
          return;
        }
        if (this.endRouteFade) {
          (this.stepEndRouteFade(), this.emitState());
          return;
        }
        if (this.playExitFade) {
          (this.stepPlayExitFade(), this.emitState());
          return;
        }
        if (this.playQuestion) {
          (this.stepPlayQuestion(), this.emitState());
          return;
        }
        if (this.versusEndFlow) {
          (this.stepVersusEndFlow(), this.emitState());
          return;
        }
        (this.screen === 'logo'
          ? this.stepLogo()
          : this.screen === 'intro'
            ? this.stepIntro()
            : this.screen === 'splash'
              ? this.stepSplash()
              : this.screen === 'menu'
                ? this.stepMenu()
                : this.screen === 'hero'
                  ? this.stepHeroSelection()
                  : this.screen === 'select'
                    ? this.stepSourceSelectScreen()
                    : this.screen === 'chapters'
                      ? this.stepChapterScreen()
                      : this.screen === 'scores'
                        ? this.stepScores()
                        : this.screen === 'submit' || this.screen === 'input'
                          ? this.stepScoreFlow()
                          : this.screen === 'playing'
                            ? this.stepPlaying()
                            : this.endResult &&
                              (this.screen === 'clear' || this.screen === 'defeated') &&
                              this.stepEndScreen(),
          this.emitState());
      }
    }
  }
  isSourceControllerCode(e) {
    return e === 'Enter' || e === 'Space' || this.settings.keyboardMaps.some((t) => t.includes(e));
  }
  isSourceControllerButtonCode(e) {
    return (
      e === 'Enter' ||
      e === 'Space' ||
      this.settings.keyboardMaps.some((t) => t.slice(4).includes(e))
    );
  }
  sourceControllerSnapshots() {
    const e = this.screenControllerKeys;
    return [0, 1].map((t) => {
      const i = this.settings.keyboardMaps[t],
        r = this.settings.buttonMaps[t],
        n = [t === 0 && (e.has('Enter') || e.has('Space')), !1, !1];
      for (let a = 0; a < 4; a += 1) {
        if (!e.has(i[a + 4])) continue;
        const o = r[a];
        o === 5 ? (n[0] = n[1] = n[2] = !0) : o === 3 ? (n[0] = n[1] = !0) : (n[o] = !0);
      }
      return {
        index: t,
        x: e.has(i[3]) ? -1 : e.has(i[1]) ? 1 : 0,
        y: e.has(i[0]) ? -1 : e.has(i[2]) ? 1 : 0,
        buttons: n,
      };
    });
  }
  sourceControllerPressedAnyButton() {
    return this.sourceControllerSnapshots().some((e) => e.buttons.some(Boolean));
  }
  sourceControllerStarted() {
    return this.sourceControllerPressedAnyButton();
  }
  sourceReleasedCode(e) {
    const t = e.index === 1;
    if (e.y < 0) return t ? 'Numpad8' : 'ArrowUp';
    if (e.y > 0) return t ? 'Numpad5' : 'ArrowDown';
    if (e.x < 0) return t ? 'Numpad4' : 'ArrowLeft';
    if (e.x > 0) return t ? 'Numpad6' : 'ArrowRight';
    if (e.buttons[0] && e.buttons[1] && e.buttons[2]) return t ? 'Numpad0' : 'KeyW';
    if (e.buttons[2]) return t ? 'NumpadAdd' : 'KeyD';
    if (e.buttons[1]) return t ? 'Numpad9' : 'KeyS';
    if (e.buttons[0]) return t ? 'Numpad7' : 'KeyA';
  }
  clearAllSourceInputs() {
    (this.keys.clear(),
      this.screenControllerKeys.clear(),
      this.screenReleaseLatch.reset(),
      (this.pendingMenuReleasedCode = void 0));
  }
  beginUiScreenFade(e, t = !1) {
    this.uiScreenFade ||
      (this.clearAllSourceInputs(),
      (this.uiScreenFade = {
        step: 0,
        steps: SPLASH_RATE,
        continuation: e,
        stopMusicOnFirstStep: t,
        filter:
          typeof document > 'u'
            ? void 0
            : new ColorMatrixFilter({
                padding: 0,
              }),
      }));
  }
  beginMenuScreenFade(e) {
    this.beginUiScreenFade(e, !0);
  }
  stepUiScreenFade() {
    const e = this.uiScreenFade;
    if (!e) return;
    if (
      (e.stopMusicOnFirstStep && ((e.stopMusicOnFirstStep = !1), this.stopCurrentMusic()),
      !fadeDone(e.step, e.steps))
    ) {
      (e.filter && this.setDisplayAdditiveHue(this.root, e.filter, fadeHue(e.step, e.steps)),
        (e.step += 1));
      return;
    }
    const t = e.continuation;
    ((this.root.filters = []), (this.uiScreenFade = void 0), t());
  }
  keyDown(e) {
    if (!this.uiScreenFade && !this.playSplashFade && !this.endRouteFade) {
      if (this.menuKeyCapture) {
        this.handleMenuKeyCapture(e);
        return;
      }
      if (
        (this.isSourceControllerCode(e) &&
          (this.screenControllerKeys.add(e),
          this.screenReleaseLatch.poll(this.sourceControllerSnapshots())),
        !this.menuSecretFade)
      ) {
        if (this.menuSecretInput) {
          (this.keys.add(e),
            e === 'KeyQ'
              ? this.menuSecretInput.help
                ? ((this.menuSecretInput.help = !1), this.renderMenuSecretInput())
                : this.closeMenuSecretInput()
              : e === 'F1' &&
                ((this.menuSecretInput.help = !this.menuSecretInput.help),
                this.clearAllSourceInputs(),
                this.renderMenuSecretInput()));
          return;
        }
        if (this.menuPopup) {
          (this.keys.add(e), e === 'KeyQ' && this.closeMenuPopup());
          return;
        }
        if (!(this.sceneTransition || this.startupLoad) && !this.startupFade) {
          if (this.screen === 'logo' && (e === 'KeyQ' || this.sourceControllerStarted())) {
            this.logoSkipRequested = !0;
            return;
          }
          if (this.screen === 'intro' && (e === 'KeyQ' || this.sourceControllerStarted())) {
            this.introSkipRequested = !0;
            return;
          }
          if (this.screen === 'splash' && e === 'KeyQ') {
            this.splashAdvanceRequested = !0;
            return;
          }
          if (this.screen === 'splash' && this.sourceControllerPressedAnyButton()) {
            this.isSourceControllerButtonCode(e) && this.splashHeldActions.add(e);
            return;
          }
          if (this.interstitial) {
            this.handleInterstitialKey(e);
            return;
          }
          if (this.endResult && (this.screen === 'clear' || this.screen === 'defeated')) {
            (this.keys.add(e),
              e === 'KeyQ' &&
                resultPanelY(this.endFrame).inputReady &&
                (this.endQuestion || this.endPopup
                  ? this.closeEndModal()
                  : (this.clearAllSourceInputs(),
                    this.applySourceEndEffects(saveQuestionEffects(this.endResult.mode)))));
            return;
          }
          if (this.playQuestion) {
            (this.keys.add(e), e === 'KeyQ' && this.handlePlayQuestionInput('escape'));
            return;
          }
          if (this.menuQuestion) {
            (this.keys.add(e), e === 'KeyQ' && this.handleMenuQuestionInput('escape'));
            return;
          }
          if (this.versusEndFlow) {
            (this.keys.add(e), e === 'KeyQ' && (this.versusEndEscape = !0));
            return;
          }
          if (this.screen === 'scores') {
            (this.keys.add(e),
              e === 'KeyQ'
                ? this.scoreModal
                  ? this.closeScoresModal()
                  : this.beginPlayExitFade()
                : e === 'F1' && !this.scoreModal && this.toggleSourceHints());
            return;
          }
          if (this.screen === 'submit' || this.screen === 'input') {
            (this.keys.add(e),
              e === 'KeyQ' &&
                (this.scoreFlowModal
                  ? this.closeScoreFlowModal()
                  : this.screen === 'input'
                    ? this.returnToSubmit()
                    : this.openScoreAbortQuestion()));
            return;
          }
          if (this.screen === 'select') {
            if ((this.keys.add(e), this.selectModal)) {
              e === 'KeyQ' &&
                ((this.selectModal = void 0),
                this.clearAllSourceInputs(),
                this.renderSourceSelectScreen());
              return;
            }
            e === 'KeyQ'
              ? (this.selectRawInput = 'escape')
              : e === 'F1' && (this.selectRawInput = 'f1');
            return;
          }
          if (this.screen === 'help') {
            (this.keys.add(e), e === 'KeyQ' && this.closeControlsHelp());
            return;
          }
          if (this.screen === 'paused') {
            (this.keys.add(e),
              e === 'KeyQ'
                ? this.handlePauseEscape()
                : e === 'F1' && (this.toggleSourceHints(), this.renderPause()));
            return;
          }
          if (
            this.screen === 'playing' &&
            this.hasActiveDialog() &&
            this.isSourceControllerCode(e) &&
            this.sourceControllerPressedAnyButton()
          ) {
            this.keys.add(e);
            return;
          }
          if (this.screen === 'playing' && e === 'F1') {
            this.playHelpRequested = !0;
            return;
          }
          if (this.screen === 'playing' && e === 'KeyQ') {
            this.playEscapeRequested = !0;
            return;
          }
          if (
            (this.screen === 'playing' &&
              ['demo', 'show', 'preview'].includes(this.sourceMode) &&
              this.isSourceControllerCode(e) &&
              (this.playAbortRequested = !0),
            this.keys.add(e),
            this.screen === 'menu')
          ) {
            e === 'KeyQ' ? this.handleMenuKey(e) : e === 'F1' && this.toggleSourceHints();
            return;
          }
          if (this.screen === 'hero') {
            e === 'KeyQ' && this.openMenu();
            return;
          }
          if (this.screen === 'chapters') {
            if (this.chapterPopup && e === 'KeyQ') {
              this.closeChapterPopup();
              return;
            }
            if (e === 'KeyQ') {
              this.chapterSession?.replay
                ? (this.stopCurrentMusic(), this.beginUiScreenFade(() => this.openMenu()))
                : this.chooseChapter();
              return;
            }
            e === 'F1' && this.chapterSession?.replay && this.toggleSourceHints();
            return;
          }
          (this.screen === 'clear' || this.screen === 'defeated') &&
            (e === 'Enter' || e === 'Space') &&
            this.openMenu();
        }
      }
    }
  }
  keyUp(e) {
    if (this.uiScreenFade || this.endRouteFade || this.menuKeyCapture || this.menuSecretFade)
      return;
    const t = this.keys.delete(e);
    let i, r;
    if (this.isSourceControllerCode(e)) {
      this.screenControllerKeys.delete(e);
      const n = this.screenReleaseLatch.poll(this.sourceControllerSnapshots());
      n && ((r = n), (i = this.sourceReleasedCode(n)));
    }
    if (this.menuSecretInput) {
      t && i && this.handleMenuSecretReleasedKey(i);
      return;
    }
    if (this.menuPopup) {
      t && i && GAME_KEYS.has(i) && this.closeMenuPopup();
      return;
    }
    if (this.endResult && (this.screen === 'clear' || this.screen === 'defeated')) {
      i && this.handleEndReleasedKey(i);
      return;
    }
    if (this.survivalResult) {
      i && GAME_KEYS.has(i) && this.finishSurvivalRun();
      return;
    }
    if (this.playQuestion) {
      if (!i) return;
      const n =
        i === 'ArrowLeft' || i === 'Numpad4'
          ? 'left'
          : i === 'ArrowRight' || i === 'Numpad6'
            ? 'right'
            : GAME_KEYS.has(i)
              ? 'accept'
              : 'none';
      n !== 'none' && this.handlePlayQuestionInput(n);
      return;
    }
    if (this.menuQuestion) {
      if (!i) return;
      const n =
        i === 'ArrowLeft' || i === 'Numpad4'
          ? 'left'
          : i === 'ArrowRight' || i === 'Numpad6'
            ? 'right'
            : GAME_KEYS.has(i)
              ? 'accept'
              : 'none';
      n !== 'none' && this.handleMenuQuestionInput(n);
      return;
    }
    if (this.versusEndFlow) {
      if (!r) return;
      const n = r.x,
        a = r.buttons.some(Boolean);
      (n !== 0 || a) &&
        (this.versusEndInput = {
          x: n,
          pressedAnyButton: a,
        });
      return;
    }
    if (this.screen === 'splash' && !this.startupFade && this.isSourceControllerCode(e)) {
      (this.splashHeldActions.delete(e),
        r?.buttons.some(Boolean) && (this.splashAdvanceRequested = !0));
      return;
    }
    if (t && !(this.screen === 'playing' && r && this.handleHudControllerRelease(r))) {
      if (this.screen === 'playing' && this.hasActiveDialog() && this.isSourceControllerCode(e)) {
        r?.buttons.some(Boolean) && this.advanceDialogs();
        return;
      }
      i &&
        (this.screen === 'menu'
          ? (this.pendingMenuReleasedCode = i)
          : this.screen === 'hero'
            ? this.handleHeroReleasedKey(i)
            : this.screen === 'chapters'
              ? this.handleChapterReleasedKey(i)
              : this.screen === 'scores'
                ? this.handleScoresReleasedKey(i)
                : this.screen === 'select'
                  ? this.handleSelectReleasedKey(i)
                  : this.screen === 'submit' || this.screen === 'input'
                    ? this.handleScoreFlowReleasedKey(i)
                    : this.screen === 'paused'
                      ? this.handlePauseReleasedKey(i)
                      : this.screen === 'help' && this.handleControlsHelpReleasedKey(i, r));
    }
  }
  skipStartupWithPointer() {
    this.uiScreenFade ||
      this.sceneTransition ||
      this.startupLoad ||
      this.startupFade ||
      (this.screen === 'logo'
        ? (this.logoSkipRequested = !0)
        : this.screen === 'intro' && (this.introSkipRequested = !0));
  }
  togglePause() {
    if (
      this.uiScreenFade ||
      this.sceneTransition ||
      (this.screen !== 'playing' && this.screen !== 'paused')
    )
      return;
    const e = this.screen === 'playing';
    if (((this.paused = e), (this.screen = e ? 'paused' : 'playing'), e)) {
      for (const t of this.actors)
        t.role === 'player' &&
          !t.removed &&
          this.markerFrames.set(t, this.sourceGameRate() * TIMING.markerSeconds);
      this.openPauseMenu();
    } else this.clearPauseMenu();
    (this.renderPause(), this.emitState(!0));
  }
  sourcePauseMode() {
    return [
      'arcade',
      'arena',
      'practice',
      'survival',
      'tutorial',
      'versus',
      'show',
      'demo',
      'movie',
      'preview',
    ].includes(this.sourceMode)
      ? this.sourceMode
      : 'show';
  }
  pausePlayerActors() {
    return [
      this.actors.find((e) => e.id === 'p1') ?? this.player,
      this.actors.find((e) => e.id === 'p2'),
    ];
  }
  sourceSpeedName(e) {
    return ['LOW', 'MED', 'MAX'][Math.max(0, Math.min(2, Math.trunc(e)))];
  }
  sourceGameRate() {
    return [35, 40, 45][this.gameSpeedIndex];
  }
  buildPauseMenu() {
    const e = this.pausePlayerActors(),
      t = this.selectedPlayers[1]?.didJoin === !0 || e[1] !== void 0;
    return layoutOptionMenu(
      buildOptionsMenu({
        mode: this.sourcePauseMode(),
        replay: this.chapterSession?.replay === !0,
        players: [
          {
            joined: !0,
            alive: e[0]?.hp !== 0,
            controllerShortName: `KEY ${(this.selectedPlayers[0]?.controller ?? 0) + 1}`,
          },
          {
            joined: t,
            alive: e[1]?.hp !== 0,
            controllerShortName: `KEY ${(this.selectedPlayers[1]?.controller ?? 1) + 1}`,
          },
        ],
        musicOn: !this.musicMuted,
        soundsOn: !this.soundsMuted,
        graphics: this.sourceSpeedName(this.graphicsIndex),
        gameSpeed: this.sourceSpeedName(this.gameSpeedIndex),
        difficulty: ['EASY', 'NORM', 'HARD'][this.difficultyIndex],
        typeSpeed: this.sourceSpeedName(this.typeSpeedIndex),
        showHints: this.pauseHints,
        recolorAlly: this.recolorAllies,
        showBlood: this.bloodEnabled,
        screenHue: this.hueEnabled,
        slowEffect: this.slowEnabled,
        miniStats: this.miniStats,
        foregrounds: this.foregroundLayer.visible,
        fullScreen: typeof document < 'u' && document.fullscreenElement !== null,
        applicationOptions: !1,
        keyboardLabels: [
          this.settings.keyboardMaps[0].map(keyLabel),
          this.settings.keyboardMaps[1].map(keyLabel),
        ],
        buttonMappings: [
          this.settings.buttonMaps[0],
          this.settings.buttonMaps[1],
          DEFAULT_BUTTON_MAP,
          DEFAULT_BUTTON_MAP,
        ],
      }),
    );
  }
  openPauseMenu() {
    (this.clearPausePresentation(),
      (this.pauseFrozenTexture = this.captureRootFrame()),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ),
      (this.pauseMenu = this.buildPauseMenu()),
      (this.pausePath = []),
      (this.pauseIndex = 0),
      (this.pauseModal = void 0),
      (this.pauseCameraX = Math.trunc(SCREEN_WIDTH / 2) - Math.trunc(this.pauseMenu.width / 2)),
      (this.pauseCameraY = -this.pauseMenu.height - 1),
      (this.pauseMove = {
        startX: this.pauseCameraX,
        startY: this.pauseCameraY,
        targetX: this.pauseCameraX,
        targetY: Math.trunc(SCREEN_HEIGHT / 2) - Math.trunc(this.pauseMenu.height / 2),
        step: 0,
        steps: OPTIONS_SCREEN.entranceSteps,
      }),
      (this.pauseSwordDraws = 0),
      (this.screenFrame = 0),
      this.clearAllSourceInputs(),
      this.playSound(OPTIONS_SCREEN.menuMoveAudio));
  }
  clearPauseMenu() {
    (this.clearPausePresentation(),
      (this.pauseMenu = void 0),
      (this.pausePath = []),
      (this.pauseIndex = 0),
      (this.pauseModal = void 0),
      (this.pauseMove = void 0),
      this.clearAllSourceInputs());
  }
  captureRootFrame() {
    const e = this.renderer;
    if (!e) return;
    const t = RenderTexture.create({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        resolution: 1,
      }),
      i = this.overlayLayer.visible;
    try {
      ((this.overlayLayer.visible = !1),
        e.render({
          container: this.root,
          target: t,
          clear: !0,
        }));
    } finally {
      this.overlayLayer.visible = i;
    }
    return t;
  }
  clearHelpPresentation(e = !1) {
    (this.helpComposite?.parent && this.helpComposite.parent.removeChild(this.helpComposite),
      this.helpComposite?.destroy({
        children: !0,
      }),
      this.helpFrozenTexture?.destroy(!0),
      this.helpFadeFilter?.destroy(),
      (this.helpComposite = void 0),
      (this.helpUi = void 0),
      (this.helpFrozenTexture = void 0),
      (this.helpFadeFilter = void 0),
      this.pauseComposite && (this.pauseComposite.visible = e));
  }
  clearPausePresentation() {
    (this.clearHelpPresentation(!1),
      this.menuKeyCaptureLayer?.parent &&
        this.menuKeyCaptureLayer.parent.removeChild(this.menuKeyCaptureLayer),
      this.menuKeyCaptureLayer?.destroy({
        children: !0,
      }),
      (this.menuKeyCaptureLayer = void 0),
      this.pauseComposite?.parent && this.pauseComposite.parent.removeChild(this.pauseComposite),
      this.pauseComposite?.destroy({
        children: !0,
      }),
      this.pauseFrozenTexture?.destroy(!0),
      this.pauseGrayFilter?.destroy(),
      (this.pauseComposite = void 0),
      (this.pauseUi = void 0),
      (this.pauseFrozenTexture = void 0),
      (this.pauseGrayFilter = void 0));
  }
  ensurePauseComposite() {
    if (this.pauseComposite && this.pauseUi) return;
    const e = new Container();
    if (this.pauseFrozenTexture) {
      const i = new Sprite(this.pauseFrozenTexture),
        r = new ColorMatrixFilter({
          padding: 0,
        });
      ((r.matrix = grayMatrix(OPTIONS_SCREEN.frozenFrameGray)),
        (i.filters = [r]),
        (this.pauseGrayFilter = r),
        e.addChild(i));
    }
    const t = new Container();
    (e.addChild(t), (this.pauseComposite = e), (this.pauseUi = t), this.overlayLayer.addChild(e));
  }
  currentPauseMenu() {
    let e = this.pauseMenu;
    for (const t of this.pausePath) e = e?.items[t]?.submenu;
    return e;
  }
  setPauseCameraTarget(e) {
    this.pauseMove = {
      startX: this.pauseCameraX,
      startY: this.pauseCameraY,
      targetX: Math.trunc(SCREEN_WIDTH / 2) - Math.trunc(e.width / 2) - e.x,
      targetY: Math.trunc(SCREEN_HEIGHT / 2) - Math.trunc(e.height / 2) - e.y,
      step: 0,
      steps: OPTIONS_SCREEN.entranceSteps,
    };
  }
  stepPauseMenu() {
    if (this.menuKeyCapture?.origin === 'paused') {
      (this.renderPause(),
        this.renderMenuKeyCapture(),
        this.menuKeyCapture &&
          this.menuKeyCapture.errorFrames > 0 &&
          (this.menuKeyCapture.errorFrames -= 1));
      return;
    }
    if (this.pauseModal) {
      ((this.pauseModal.swordDraws += 1), this.renderPause());
      return;
    }
    const e = this.pauseMove;
    (e &&
      ((this.pauseCameraX = Math.trunc(easeIn(e.startX, e.targetX, e.step, e.steps))),
      (this.pauseCameraY = Math.trunc(easeIn(e.startY, e.targetY, e.step, e.steps))),
      e.step <= e.steps
        ? (e.step += 1)
        : ((this.pauseCameraX = Math.trunc(e.targetX)),
          (this.pauseCameraY = Math.trunc(e.targetY)),
          (this.pauseMove = void 0))),
      (this.pauseSwordDraws += 1),
      this.renderPause());
  }
  handlePauseEscape() {
    if (this.pauseModal) {
      ((this.pauseModal = void 0),
        this.playSound('gling'),
        this.clearAllSourceInputs(),
        this.renderPause());
      return;
    }
    if (this.pausePath.length > 0) {
      this.pauseIndex = this.pausePath.pop() ?? 0;
      const e = this.currentPauseMenu();
      (e && this.setPauseCameraTarget(e),
        this.playSound(OPTIONS_SCREEN.menuMoveAudio),
        this.clearAllSourceInputs(),
        this.renderPause());
      return;
    }
    this.togglePause();
  }
  handlePauseReleasedKey(e) {
    if (this.pauseModal) {
      if (['ArrowLeft', 'ArrowRight', 'Numpad4', 'Numpad6'].includes(e))
        ((this.pauseModal.choice = this.pauseModal.choice === 0 ? 1 : 0),
          this.playSound(OPTIONS_SCREEN.cursorMoveAudio));
      else if (GAME_KEYS.has(e)) {
        const a = this.pauseModal;
        ((this.pauseModal = void 0),
          this.playSound(OPTIONS_SCREEN.acceptAudio),
          this.clearAllSourceInputs(),
          a.choice === 0 && this.applyPauseAction(a.action, !0));
      }
      this.renderPause();
      return;
    }
    const t = this.currentPauseMenu();
    if (!t) return;
    const i = e === 'ArrowUp' || e === 'Numpad8';
    if (i || e === 'ArrowDown' || e === 'Numpad5') {
      ((this.pauseIndex = (this.pauseIndex + (i ? -1 : 1) + t.items.length) % t.items.length),
        this.playSound(OPTIONS_SCREEN.cursorMoveAudio),
        this.renderPause());
      return;
    }
    if (e === 'ArrowLeft' || e === 'Numpad4') {
      this.pausePath.length > 0 && this.handlePauseEscape();
      return;
    }
    if (!GAME_KEYS.has(e) && e !== 'ArrowRight' && e !== 'Numpad6') return;
    const n = t.items[this.pauseIndex];
    if (n) {
      if (n.submenu) {
        (this.pausePath.push(this.pauseIndex),
          (this.pauseIndex = 0),
          this.setPauseCameraTarget(n.submenu),
          this.playSound(OPTIONS_SCREEN.menuMoveAudio),
          this.clearAllSourceInputs(),
          this.renderPause());
        return;
      }
      GAME_KEYS.has(e) &&
        n.action &&
        (this.playSound(OPTIONS_SCREEN.acceptAudio),
        this.clearAllSourceInputs(),
        this.applyPauseAction(n.action));
    }
  }
  pauseMenuPathTitles() {
    const e = [];
    let t = this.pauseMenu;
    for (const i of this.pausePath) {
      const r = t?.items[i];
      if (!r) break;
      (e.push(r.title), (t = r.submenu));
    }
    return e;
  }
  applyPauseAction(e, t = !1) {
    if (e === 'continue') {
      this.togglePause();
      return;
    }
    if (e === 'controls-help-1' || e === 'controls-help-2') {
      this.openControlsHelp(e.endsWith('2') ? 1 : 0);
      return;
    }
    if (e === 'new-character-1' || e === 'new-character-2') {
      const n = this.pausePlayerActors()[e.endsWith('2') ? 1 : 0];
      (n && n.hp > 0 && ((n.hp = n.mp = n.sp = n.spl = 0), n.changeAction(n.stance().onDeath)),
        this.togglePause());
      return;
    }
    if (e === 'cycle-controller-1' || e === 'cycle-controller-2') {
      const n = e.endsWith('2') ? 1 : 0,
        a = this.selectedPlayers[n];
      if (a) {
        a.controller = a.controller === 0 ? 1 : 0;
        const o = this.selectedPlayers[1 - n];
        o?.didJoin && o.controller === a.controller && (o.controller = a.controller === 0 ? 1 : 0);
      }
      this.helpHintShown = !1;
    }
    const i =
      e === 'restore-game-settings' ||
      e === 'restore-keyboard' ||
      e === 'restore-button-mapping' ||
      e === 'restore-graphics';
    if (!t && (e.startsWith('exit-') || i)) {
      const n = i
        ? 'Restore Defaults'
        : (this.currentPauseMenu()?.items[this.pauseIndex]?.title ?? 'Exit');
      ((this.pauseModal = {
        title: n,
        message: 'Are you sure?',
        choice: 1,
        action: e,
        swordDraws: 0,
      }),
        this.renderPause());
      return;
    }
    if (t && e.startsWith('exit-')) {
      this.applyPauseExit(e);
      return;
    }
    if (e === 'remap-key') {
      const n = this.pauseMenuPathTitles();
      if (!n.includes('Keyboard Keys')) return;
      const o = n[n.length - 1] === 'Keyboard 2' ? 1 : 0;
      this.openMenuKeyCapture('paused', o, Math.max(0, Math.min(7, this.pauseIndex)));
      return;
    }
    if (e === 'cycle-button-map') {
      const n = this.pauseMenuPathTitles();
      if (!n.includes('Button Mapping')) return;
      const a = n[n.length - 1] === 'Keyboard 2' ? 1 : 0,
        o = Math.max(0, Math.min(3, this.pauseIndex));
      ((this.settings.buttonMaps[a][o] = nextButtonAction(this.settings.buttonMaps[a][o])),
        this.persistSettings(),
        (this.pauseMenu = this.buildPauseMenu()),
        this.renderPause());
      return;
    }
    if (e === 'restore-keyboard') {
      for (const n of [0, 1])
        for (let a = 0; a < 8; a += 1) this.settings.keyboardMaps[n][a] = DEFAULT_KEY_MAPS[n][a];
      this.persistSettings();
    } else if (e === 'restore-button-mapping') {
      for (const n of [0, 1])
        for (let a = 0; a < 4; a += 1) this.settings.buttonMaps[n][a] = DEFAULT_BUTTON_MAP[a];
      this.persistSettings();
    }
    if (e === 'select-screen') {
      ((this.paused = !1),
        this.beginUiScreenFade(() => {
          (this.clearPauseMenu(),
            this.startHeroSelection('practice', {
              kind: 'scene',
              dataName: 'extra',
              script: 1,
            }));
        }));
      return;
    }
    if (e === 'select-replay') {
      this.paused = !1;
      const n = this.sourceMode === 'arena';
      this.beginUiScreenFade(() => {
        (this.clearPauseMenu(),
          this.startChapterSession(
            {
              dataName: n ? 'arena' : 'arcade',
              background: n ? 'sc-arena-1a' : 'sc-cliff-1a',
              mode: n ? 'arena' : 'arcade',
              replay: !0,
              maxUnlocked: 99999,
              heroAfterSelection: !1,
            },
            Math.max(0, this.gameChapter - 1),
          ));
      });
      return;
    }
    if (e === 'select-versus') {
      ((this.paused = !1),
        this.beginUiScreenFade(() => {
          (this.clearPauseMenu(),
            this.startHeroSelection('versus', {
              kind: 'scene',
              dataName: 'extra',
              script: 51,
            }));
        }));
      return;
    }
    (e === 'toggle-music'
      ? this.toggleMusicChannel()
      : e === 'toggle-sounds'
        ? this.toggleSoundChannel()
        : e === 'toggle-fullscreen' && typeof document < 'u'
          ? document.fullscreenElement
            ? document.exitFullscreen()
            : document.documentElement.requestFullscreen().catch(() => {})
          : e !== 'restore-keyboard' &&
            e !== 'restore-button-mapping' &&
            this.applySourceConfigurationAction(e),
      (this.pauseMenu = this.buildPauseMenu()));
    const r = this.currentPauseMenu();
    (r && (this.pauseIndex = Math.min(this.pauseIndex, Math.max(0, r.items.length - 1))),
      this.renderPause());
  }
  applyPauseExit(e) {
    (this.stopCurrentMusic(),
      (this.paused = !1),
      this.beginUiScreenFade(() => {
        (this.clearPauseMenu(), this.openMenu());
      }));
  }
  sourceHelpPlayers() {
    const e = this.pausePlayerActors();
    return [0, 1].map((t) => {
      const i = Math.max(0, Math.min(1, this.selectedPlayers[t]?.controller ?? t)),
        r = this.settings.keyboardMaps[i],
        n = this.settings.buttonMaps[i];
      return {
        joined: t === 0 || this.selectedPlayers[1]?.didJoin === !0 || e[1] !== void 0,
        controller: i,
        controllerName: `Keyboard ${i + 1}`,
        movementLabels: r.slice(0, 4).map(keyLabel),
        buttonLabels: r.slice(4, 8).map(keyLabel),
        buttonDescriptions: n.map((a) => BUTTON_DESCRIPTIONS[a]),
      };
    });
  }
  openControlsHelp(e) {
    const t = this.sourceHelpPlayers();
    ((this.controlsHelpPlayer = pauseOwner(e, t)),
      (this.controlsHelpFrame = 0),
      this.renderPause(),
      this.clearHelpPresentation(!1),
      this.renderer &&
        this.pauseComposite &&
        ((this.helpFrozenTexture = RenderTexture.create({
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          resolution: 1,
        })),
        this.renderer.render({
          container: this.pauseComposite,
          target: this.helpFrozenTexture,
          clear: !0,
        })),
      this.pauseComposite && (this.pauseComposite.visible = !this.helpFrozenTexture),
      (this.screen = 'help'),
      (this.paused = !0),
      this.clearAllSourceInputs(),
      this.renderControlsHelp());
  }
  closeControlsHelp() {
    this.screen === 'help' &&
      (this.clearHelpPresentation(!0),
      (this.screen = 'paused'),
      this.clearAllSourceInputs(),
      this.playSound('gling'),
      this.renderPause());
  }
  handleControlsHelpReleasedKey(e, t) {
    if (this.screen !== 'help') return;
    const i = t?.buttons.some(Boolean) ?? GAME_KEYS.has(e),
      r =
        t?.y ??
        (e === 'ArrowUp' || e === 'Numpad8' ? -1 : e === 'ArrowDown' || e === 'Numpad5' ? 1 : 0);
    i
      ? this.closeControlsHelp()
      : r < 0
        ? ((this.controlsHelpPlayer = nextPauseChoice(this.controlsHelpPlayer, -1)),
          this.playSound('click'),
          this.renderControlsHelp())
        : r > 0 &&
          ((this.controlsHelpPlayer = nextPauseChoice(this.controlsHelpPlayer, 1)),
          this.playSound('click'),
          this.renderControlsHelp());
  }
  toggleMute() {
    const e = !this.audio.muted;
    (this.audio.setMuted(e),
      !e &&
        this.musicPlaybackRequested &&
        !this.musicMuted &&
        this.currentMusic &&
        this.audio.playLoop(this.currentMusic),
      this.emitState(!0));
  }
  toggleMusicChannel() {
    ((this.musicMuted = !this.musicMuted),
      this.musicMuted ? this.pauseCurrentMusic() : this.playCurrentMusic(),
      this.persistSettings());
  }
  toggleSoundChannel() {
    ((this.soundsMuted = !this.soundsMuted), this.persistSettings());
  }
  setPixelPerfect(e) {
    this.pixelPerfect = e;
    for (const t of this.textureSources) t.scaleMode = e ? 'nearest' : 'linear';
  }
  restart() {
    !this.loaded ||
      !this.startupStarted ||
      this.destroyed ||
      ((this.sceneGeneration += 1),
      (this.sceneTransition = void 0),
      (this.uiScreenFade = void 0),
      (this.startupLoad = void 0),
      (this.startupFade = void 0),
      (this.startupFadeFilter = void 0),
      (this.playSplashFade = void 0),
      (this.playExitFade = void 0),
      (this.endRouteFade = void 0),
      (this.playQuestion = void 0),
      (this.interstitial = void 0),
      (this.suspendedScript = void 0),
      (this.pendingScripts.length = 0),
      (this.pendingSubmit = void 0),
      (this.selectRawInput = void 0),
      (this.selectModal = void 0),
      (this.superMusicSnapshot = void 0),
      (this.playAbortRequested = !1),
      (this.playEscapeRequested = !1),
      (this.playHelpRequested = !1),
      this.clearSceneTransitionHue(),
      (this.screenLayer.filters = []),
      (this.overlayLayer.filters = []),
      this.audio.stopAll(),
      (this.logoVoice = void 0),
      (this.introVoice = void 0),
      this.clearPauseMenu(),
      this.clearVersusEndFlow(),
      this.openMenu());
  }
  destroy() {
    ((this.destroyed = !0),
      this.audio.stopVoice(this.logoVoice),
      this.audio.stopVoice(this.introVoice),
      this.audio.destroy(),
      this.clearPausePresentation(),
      this.shadowSceneFilter &&
        ((this.shadowLayer.filters = []),
        this.shadowSceneFilter.destroy(),
        (this.shadowSceneFilter = void 0)),
      this.root.destroy({
        children: !0,
      }));
    for (const e of this.sourceTextureCache.values()) e.destroy();
    this.sourceTextureCache.clear();
    for (const e of this.textureSources) e.destroy();
    this.textureSources.clear();
  }
  openMenu() {
    (this.clearSourceEndState(),
      (this.startupLoad = void 0),
      (this.logoVoice = void 0),
      (this.introVoice = void 0),
      this.selectCurrentMusic('007'),
      this.playCurrentMusic(),
      (this.startupFade = void 0),
      (this.startupFadeFilter = void 0),
      (this.introSkipRequested = !1),
      (this.logoSkipRequested = !1),
      this.splashHeldActions.clear(),
      (this.splashAdvanceRequested = !1),
      (this.paused = !1),
      (this.screen = 'menu'),
      (this.screenFrame = 0),
      (this.progress = this.loadProgress()),
      (this.menuPath = []),
      (this.menuIndex = 0),
      (this.menuIdleFrames = 0),
      (this.menuQuestion = void 0),
      (this.menuKeyCapture = void 0),
      (this.menuSecretInput = void 0),
      (this.menuPopup = void 0),
      (this.menuSecretFade = void 0),
      (this.root.filters = []),
      (this.screenLayer.filters = []),
      (this.introLoop = 0),
      (this.pendingAttractAction = void 0),
      (this.pendingAttractDemoScript = void 0),
      (this.chapterSession = void 0),
      (this.heroDestination = void 0),
      (this.statusValue = 0),
      this.clearAllSourceInputs(),
      this.renderStaticScreen(),
      this.playSound('movestone'),
      this.emitState(!0));
  }
  startInitialLoad() {
    (this.audio.stopAll(),
      this.selectCurrentMusic(void 0, !1),
      (this.screenLayer.filters = []),
      (this.startupLoad = {
        state: newLoadingState(5),
        phase: 'load',
        fadeStep: 0,
        next: 'logo',
      }),
      (this.startupFade = void 0),
      (this.startupFadeFilter = void 0),
      (this.paused = !1),
      (this.screen = 'loading'),
      (this.screenFrame = 0),
      (this.statusValue = 0),
      this.clearAllSourceInputs(),
      this.renderStaticScreen(),
      this.emitState(!0));
  }
  stepStartupLoad() {
    const e = this.startupLoad;
    if (!e) return;
    if (e.phase === 'load') {
      const i = stepLoading(e.state);
      // Hold the bar on screen, filling, until every asset is in memory. Leaving
      // e.state alone re-runs this same decision on the next frame.
      if (i.action === 'begin-fade' && this.assetProgress < 1) {
        this.renderStaticScreen();
        return;
      }
      ((e.state = i.state),
        i.action === 'draw'
          ? this.renderStaticScreen()
          : i.action === 'begin-fade' &&
            ((e.phase = 'fade'),
            (e.fadeStep = 0),
            (e.filter =
              typeof document > 'u'
                ? void 0
                : new ColorMatrixFilter({
                    padding: 0,
                  }))));
      return;
    }
    if (!fadeDone(e.fadeStep, SPLASH_RATE)) {
      (e.filter &&
        this.setDisplayAdditiveHue(this.screenLayer, e.filter, fadeHue(e.fadeStep, SPLASH_RATE)),
        (e.fadeStep += 1));
      return;
    }
    this.screenLayer.filters = [];
    const t = e.next;
    ((this.startupLoad = void 0), t === 'intro' ? this.startIntro() : this.startLogo());
  }
  startLogo() {
    (this.audio.stopAll(),
      this.selectCurrentMusic(void 0, !1),
      (this.startupLoad = void 0),
      (this.screenLayer.filters = []),
      (this.logoVoice = this.playSound('006a')),
      (this.introVoice = void 0),
      (this.startupFade = void 0),
      (this.startupFadeFilter = void 0),
      (this.introBootstrap = !1),
      (this.introSkipRequested = !1),
      (this.logoSkipRequested = !1),
      this.splashHeldActions.clear(),
      (this.splashAdvanceRequested = !1),
      (this.paused = !1),
      (this.screen = 'logo'),
      (this.screenFrame = 0),
      (this.statusValue = 0),
      this.clearAllSourceInputs(),
      this.renderStaticScreen(),
      this.emitState(!0));
  }
  startIntro() {
    (this.screen === 'intro' && this.audio.stopVoice(this.introVoice),
      this.selectCurrentMusic(void 0, !1),
      (this.startupLoad = void 0),
      (this.screenLayer.filters = []),
      (this.logoVoice = void 0),
      (this.introVoice = void 0),
      (this.startupFade = void 0),
      (this.startupFadeFilter = void 0),
      (this.introBootstrap = !0),
      (this.introSkipRequested = !1),
      (this.logoSkipRequested = !1),
      (this.paused = !1),
      (this.screen = 'intro'),
      (this.screenFrame = 0),
      (this.statusValue = 0),
      this.clearAllSourceInputs(),
      this.renderStaticScreen(),
      (this.introVoice = this.playSound('006b')),
      (this.introBootstrap = !1),
      (this.screenFrame = -1),
      this.emitState(!0));
  }
  finishIntro() {
    this.screen === 'intro' &&
      (this.audio.stopVoice(this.introVoice), (this.introVoice = void 0), this.startSplash());
  }
  beginStartupFade(e, t = SPLASH_RATE) {
    this.startupFade ||
      (this.clearAllSourceInputs(),
      this.splashHeldActions.clear(),
      (this.startupFade = {
        step: 0,
        steps: t,
        next: e,
      }),
      (this.startupFadeFilter =
        typeof document > 'u'
          ? void 0
          : new ColorMatrixFilter({
              padding: 0,
            })));
  }
  stepStartupFade() {
    const e = this.startupFade;
    if (!e) return;
    if (!fadeDone(e.step, e.steps)) {
      (this.startupFadeFilter &&
        this.setDisplayAdditiveHue(
          this.screenLayer,
          this.startupFadeFilter,
          fadeHue(e.step, e.steps),
        ),
        (e.step += 1));
      return;
    }
    const t = e.next;
    ((this.startupFade = void 0),
      (this.startupFadeFilter = void 0),
      (this.screenLayer.filters = []),
      t === 'intro'
        ? this.startIntro()
        : t === 'attract'
          ? this.launchAttractAction()
          : this.openMenu());
  }
  startSplash() {
    (this.audio.stopVoice(this.introVoice),
      (this.introVoice = void 0),
      (this.startupLoad = void 0),
      (this.screenLayer.filters = []),
      (this.startupFade = void 0),
      (this.startupFadeFilter = void 0),
      (this.introBootstrap = !1),
      (this.introSkipRequested = !1),
      (this.logoSkipRequested = !1),
      this.splashHeldActions.clear(),
      (this.splashAdvanceRequested = !1),
      (this.splashMusicCleared = !1),
      (this.pendingAttractAction = void 0),
      (this.paused = !1),
      (this.screen = 'splash'),
      (this.screenFrame = 0),
      this.clearAllSourceInputs(),
      this.renderStaticScreen(),
      this.playSound('ting'),
      this.emitState(!0));
  }
  stepLogo() {
    (this.applyLogoHue(introTitleHue(this.screenFrame)),
      this.logoSkipRequested
        ? ((this.logoSkipRequested = !1), this.beginStartupFade('menu'))
        : introTitleDone(this.screenFrame) && this.beginStartupFade('intro'));
  }
  stepIntro() {
    this.introCover || this.renderIntro();
    const e = swordFlights(this.screenFrame);
    this.applyIntroSnapshot(e);
    for (const t of SWORD_CUES) t.frame === this.screenFrame && this.playSound('zap');
    this.introSkipRequested
      ? ((this.introSkipRequested = !1),
        this.audio.stopVoice(this.introVoice),
        (this.introVoice = void 0),
        this.beginStartupFade('menu'))
      : e.done && this.finishIntro();
  }
  stepSplash() {
    if (
      (this.applySplashHue(introSubtitleHue(this.screenFrame)),
      this.updateSplashPromptVisibility(),
      !this.splashMusicCleared &&
        introSubtitleDone(this.screenFrame) &&
        (this.selectCurrentMusic(void 0, !1), (this.splashMusicCleared = !0)),
      attractFinished(this.screenFrame + 1))
    ) {
      this.splashAdvanceRequested = !1;
      const e = attractAction(this.introLoop, this.progress.arcadeWon);
      ((this.introLoop = e.nextLoop),
        (this.pendingAttractAction = e.action),
        this.beginStartupFade(
          'attract',
          e.action.kind === 'intro' ? SPLASH_FAST_RATE : SPLASH_RATE,
        ));
    } else
      this.splashAdvanceRequested &&
        ((this.splashAdvanceRequested = !1),
        this.playSound('gling'),
        this.beginStartupFade('menu'));
  }
  launchAttractAction() {
    const e = this.pendingAttractAction;
    if (((this.pendingAttractAction = void 0), !e)) {
      this.startSplash();
      return;
    }
    if (e.kind === 'intro') {
      this.startAttractIntroLoad();
      return;
    }
    if (e.kind === 'credits') {
      this.openNovel('credits', 'splash', !1, {
        target: 255,
        steps: 20,
      });
      return;
    }
    ((this.pendingAttractDemoScript = e.script),
      this.openPoster(e.poster, e.posterFrames, 'attract-demo'));
  }
  startAttractIntroLoad() {
    ((this.screenLayer.filters = []),
      (this.sceneTitle = ''),
      (this.sceneSubtitle = ''),
      (this.startupLoad = {
        state: newLoadingState(0),
        phase: 'load',
        fadeStep: 0,
        next: 'intro',
      }),
      (this.screen = 'loading'),
      (this.screenFrame = 0),
      this.clearAllSourceInputs(),
      this.stepStartupLoad());
  }
  stepMenu() {
    if (this.menuSecretFade) {
      const i = this.menuSecretFade;
      if (!brandDone(i.step)) {
        ((i.filter ??= new ColorMatrixFilter({
          padding: 0,
        })),
          this.setDisplayAdditiveHue(this.root, i.filter, -brandHue(i.step)),
          (i.step += 1));
        return;
      }
      ((this.root.filters = []),
        (this.menuSecretFade = void 0),
        (this.menuPopup = void 0),
        this.startSplash());
      return;
    }
    if (this.menuKeyCapture?.origin === 'menu') {
      (this.renderMenuKeyCapture(),
        this.menuKeyCapture &&
          this.menuKeyCapture.errorFrames > 0 &&
          (this.menuKeyCapture.errorFrames -= 1));
      return;
    }
    if (this.menuSecretInput) {
      this.renderMenuSecretInput();
      return;
    }
    if (this.menuPopup) {
      const i = stepMessage(this.menuPopup.state, !1);
      ((this.menuPopup.state = i.state),
        i.dismiss ? this.closeMenuPopup() : this.renderMenuPopup());
      return;
    }
    if (this.menuQuestion) {
      const i = stepQuestion(this.menuQuestion.state, 'none');
      ((this.menuQuestion.state = i.state),
        i.kind === 'dismiss' ? this.closeMenuQuestion() : this.renderMenuQuestion());
      return;
    }
    if (!this.menuPanel) return;
    if (this.menuIdleFrames >= MENU_IDLE_FRAMES) {
      this.beginMenuScreenFade(() => this.startSplash());
      return;
    }
    const e = this.menuMove;
    (e &&
      (this.menuPanel.position.set(
        Math.trunc(easeIn(e.startX, e.targetX, e.step, e.steps)),
        Math.trunc(easeIn(e.startY, e.targetY, e.step, e.steps)),
      ),
      e.step <= e.steps
        ? (e.step += 1)
        : (this.menuPanel.position.set(Math.trunc(e.targetX), Math.trunc(e.targetY)),
          (this.menuMove = void 0))),
      this.menuFadeOverlay && (this.menuFadeOverlay.alpha = Math.max(0, 1 - this.screenFrame / 10)),
      this.menuSword &&
        (this.menuSword.x = this.menuSwordBaseX + (Math.floor(this.screenFrame / 10) & 1)),
      (this.menuIdleFrames += 1));
    const t = this.pendingMenuReleasedCode;
    ((this.pendingMenuReleasedCode = void 0), t && this.handleMenuKey(t));
  }
  openMenuKeyCapture(e, t, i) {
    const r = ['Up', 'Right', 'Down', 'Left', 'Button 1', 'Button 2', 'Button 3', 'Button 4'];
    ((this.menuKeyCapture = {
      origin: e,
      controller: t,
      index: i,
      message: `for Keyboard ${t + 1} ${r[i]} ...`,
      errorFrames: 0,
    }),
      this.clearAllSourceInputs(),
      this.renderMenuKeyCapture());
  }
  handleMenuKeyCapture(e) {
    const t = this.menuKeyCapture;
    if (t) {
      if (e === 'KeyQ') {
        this.closeMenuKeyCapture();
        return;
      }
      if (!isAssignableKey(e)) {
        ((t.errorFrames = 45),
          this.playSound('error'),
          this.clearAllSourceInputs(),
          this.renderMenuKeyCapture());
        return;
      }
      ((this.settings.keyboardMaps[t.controller][t.index] = e),
        this.persistSettings(),
        this.playSound('gling'),
        this.closeMenuKeyCapture());
    }
  }
  closeMenuKeyCapture() {
    const e = this.menuKeyCapture?.origin;
    ((this.menuKeyCapture = void 0),
      this.clearAllSourceInputs(),
      this.menuKeyCaptureLayer?.parent &&
        this.menuKeyCaptureLayer.parent.removeChild(this.menuKeyCaptureLayer),
      this.menuKeyCaptureLayer?.destroy({
        children: !0,
      }),
      (this.menuKeyCaptureLayer = void 0),
      e !== 'paused' &&
        this.overlayLayer.removeChildren().forEach((t) =>
          t.destroy({
            children: !0,
          }),
        ),
      e === 'paused'
        ? ((this.pauseMenu = this.buildPauseMenu()), this.renderPause())
        : this.rebuildSourceMenu());
  }
  renderMenuKeyCapture() {
    const e = this.menuKeyCapture;
    if (!e) return;
    (this.menuKeyCaptureLayer?.parent &&
      this.menuKeyCaptureLayer.parent.removeChild(this.menuKeyCaptureLayer),
      this.menuKeyCaptureLayer?.destroy({
        children: !0,
      }),
      (this.menuKeyCaptureLayer = void 0),
      e.origin !== 'paused' &&
        this.overlayLayer.removeChildren().forEach((l) =>
          l.destroy({
            children: !0,
          }),
        ));
    const t = new Container();
    t.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 0.25,
      }),
    );
    const i = 140,
      r = 152,
      n = this.sourceCroppedTexture('ui.guiform', 10);
    if (n) {
      const l = new Sprite(n);
      (l.position.set(i, r), t.addChild(l));
    }
    const a = i + 17,
      o = r + 18;
    (this.addSourceGuiIcon(t, 2, a, o, 'key-capture-icon'),
      this.addSourceBitmap(t, 2, 'Press Any Key', a + 40, o + 2),
      this.addSourceBitmap(
        t,
        1,
        e.errorFrames > 0 ? 'Sorry that key is taken!' : e.message,
        a + 40,
        o + (this.manifest?.bitmapFonts[2]?.height ?? 25) + 6,
      ),
      (this.menuKeyCaptureLayer = t),
      this.overlayLayer.addChild(t));
  }
  openMenuSecretInput() {
    ((this.menuSecretInput = {
      state: newNameEntry(),
      help: !1,
    }),
      (this.menuIdleFrames = 0),
      this.clearAllSourceInputs(),
      this.playSound(NAME_ENTRY_SCREEN.startAudio),
      this.renderMenuSecretInput());
  }
  closeMenuSecretInput() {
    ((this.menuSecretInput = void 0),
      this.clearAllSourceInputs(),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ),
      this.rebuildSourceMenu());
  }
  handleMenuSecretReleasedKey(e) {
    const t = this.menuSecretInput;
    if (!t) return;
    if (t.help) {
      GAME_KEYS.has(e) &&
        ((t.help = !1),
        this.playSound('gling'),
        this.clearAllSourceInputs(),
        this.renderMenuSecretInput());
      return;
    }
    const i =
      e === 'ArrowRight' || e === 'Numpad6'
        ? {
            x: 1,
          }
        : e === 'ArrowLeft' || e === 'Numpad4'
          ? {
              x: -1,
            }
          : e === 'ArrowDown' || e === 'Numpad5'
            ? {
                y: 1,
              }
            : e === 'ArrowUp' || e === 'Numpad8'
              ? {
                  y: -1,
                }
              : void 0;
    if (i) {
      ((t.state = moveNameCursor(t.state, i)),
        this.playSound(NAME_ENTRY_SCREEN.moveAudio),
        this.renderMenuSecretInput());
      return;
    }
    if (!GAME_KEYS.has(e)) return;
    const r = e === 'KeyW' || e === 'Numpad0' ? 3 : null,
      n = typeNameCharacter(t.state, r);
    ((t.state = n.state),
      this.playSound(n.audio),
      n.outcome === 'complete'
        ? this.applyMenuSecretCode(n.state.value)
        : this.renderMenuSecretInput());
  }
  applyMenuSecretCode(e) {
    const t = parseCheatCode(e, this.secretAdmin);
    if (
      ((this.menuSecretInput = void 0),
      t.kind !== 'invalid' && (this.rankedScoreEligible = !1),
      t.kind === 'submit')
    ) {
      (this.clearAllSourceInputs(), this.openSubmit(t.mode === 0 ? 'arcade' : 'arena', t.score));
      return;
    }
    if (t.kind === 'win-all')
      ((this.progress.arcadeChapter = 37),
        (this.progress.arcadeMaxChapter = 99999),
        (this.progress.arcadeWon = !0),
        (this.progress.arenaChapter = 101),
        (this.progress.arenaMaxChapter = 99999),
        (this.progress.arenaWon = !0),
        this.saveProgress());
    else if (t.kind === 'win-zero')
      ((this.progress.arcadeMaxChapter = 1),
        (this.progress.arenaMaxChapter = 1),
        (this.progress.arcadeWon = !1),
        (this.progress.arenaWon = !1),
        this.saveProgress());
    else if (t.kind === 'more-coins' || t.kind === 'no-coins') {
      const r = t.kind === 'more-coins' ? 9999 : 0;
      ((this.progress.arcadePlayer.coins = r),
        (this.progress.arenaPlayer.coins = r),
        (this.progress.arenaPlayer2.coins = r),
        this.saveProgress());
    } else if (t.kind === 'reset') {
      const r = {
        ...newPlayerProgress(0),
        didJoin: !0,
        coins: 10,
      };
      ((this.progress.arcadeChapter = 1),
        (this.progress.arenaChapter = 1),
        (this.progress.arcadePlayer = r),
        (this.progress.arenaPlayer = {
          ...newPlayerProgress(0),
          didJoin: !0,
          coins: 10,
        }),
        (this.progress.arenaPlayer2 = {
          ...newPlayerProgress(1),
          coins: 10,
        }),
        this.saveProgress());
    } else
      t.kind === 'dump'
        ? console.info('Rage of Magic local progress', this.progress)
        : t.kind === 'admin' && (this.secretAdmin = !0);
    const i = t.kind !== 'invalid';
    (i && this.stopCurrentMusic(),
      (this.menuPopup = {
        title: 'Secret Code',
        message: t.message,
        icon: 2,
        state: newMessage(75),
        after: i ? 'splash' : void 0,
      }),
      this.clearAllSourceInputs(),
      this.renderMenuPopup());
  }
  closeMenuPopup() {
    const e = this.menuPopup;
    if (!(!e || this.menuSecretFade)) {
      if ((this.clearAllSourceInputs(), e.after === 'splash')) {
        this.menuSecretFade = {
          step: 0,
        };
        return;
      }
      ((this.menuPopup = void 0),
        this.overlayLayer.removeChildren().forEach((t) =>
          t.destroy({
            children: !0,
          }),
        ),
        this.rebuildSourceMenu());
    }
  }
  renderMenuPopup() {
    const e = this.menuPopup;
    if (!e) return;
    this.overlayLayer.removeChildren().forEach((l) =>
      l.destroy({
        children: !0,
      }),
    );
    const t = new Container();
    t.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 0.25,
      }),
    );
    const i = 140,
      r = 152,
      n = this.sourceCroppedTexture('ui.guiform', MESSAGE_LAYOUT.form);
    if (n) {
      const l = new Sprite(n);
      (l.position.set(i, r), t.addChild(l));
    }
    const a = i + MESSAGE_LAYOUT.panelInsetX,
      o = r + MESSAGE_LAYOUT.panelInsetY;
    (this.addSourceGuiIcon(t, e.icon, a, o, 'menu-popup-icon'),
      this.addSourceBitmap(t, 2, e.title, a + 40, o),
      this.addSourceBitmap(t, 1, e.message, a + 40, o + 27),
      this.overlayLayer.addChild(t));
  }
  renderMenuSecretInput() {
    const e = this.menuSecretInput;
    if (!e) return;
    this.overlayLayer.removeChildren().forEach((o) =>
      o.destroy({
        children: !0,
      }),
    );
    const t = new Container();
    t.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 0.25,
      }),
    );
    const i = this.sourceCroppedTexture('ui.guiform', NAME_ENTRY_SCREEN.panel.frame);
    if (i) {
      const o = new Sprite(i);
      (o.position.set(NAME_ENTRY_SCREEN.panel.x, NAME_ENTRY_SCREEN.panel.y), t.addChild(o));
    }
    (this.addSourceGuiIcon(
      t,
      2,
      NAME_ENTRY_SCREEN.titleIcon.x,
      NAME_ENTRY_SCREEN.titleIcon.y,
      'secret-input-key',
    ),
      this.addSourceBitmap(
        t,
        2,
        'Enter Secret Code',
        NAME_ENTRY_SCREEN.title.x,
        NAME_ENTRY_SCREEN.title.y,
      ));
    const r = this.sourceCroppedTexture('ui.guiform', NAME_ENTRY_SCREEN.textPanel.frame);
    if (r) {
      const o = new Sprite(r);
      (o.position.set(NAME_ENTRY_SCREEN.textPanel.x, NAME_ENTRY_SCREEN.textPanel.y), t.addChild(o));
    }
    const n = nameEntryBlink(this.screenFrame);
    let a = e.state.value;
    for (; a.length > 0 && this.sourceBitmapWidth(3, `${a}_`) >= 273;) a = a.slice(1);
    this.addSourceBitmap(
      t,
      3,
      `${a}${n.textCursorOn ? '_' : ''}`,
      NAME_ENTRY_SCREEN.value.x,
      NAME_ENTRY_SCREEN.value.y,
    );
    for (let o = 0; o < 5; o += 1)
      for (let l = 0; l < 9; l += 1) {
        const c = NAME_ENTRY_CHARS[o * 9 + l],
          h = NAME_ENTRY_SCREEN.keys.x + l * NAME_ENTRY_SCREEN.keys.strideX,
          u = NAME_ENTRY_SCREEN.keys.y + o * NAME_ENTRY_SCREEN.keys.strideY,
          d = e.state.cursorX === l && e.state.cursorY === o,
          f = (v, x) => {
            const b = atlasCellPosition(v, 4, 32, 30),
              _ = this.sourceDicedTexture('ui.guiicon', 1, b.x, b.y, 32, 30, x);
            if (!_) return;
            const S = new Sprite(_);
            (S.position.set(h, u), t.addChild(S));
          };
        (f(0, 'secret-key-normal'),
          d && f(n.selectedKeyOn ? 1 : 2, `secret-key-selected-${n.selectedKeyOn ? 1 : 2}`));
        const m =
            c === '\b'
              ? ''
              : c ===
                  `
`
                ? ''
                : c,
          p = d ? 3 : 4,
          g = this.sourceBitmapWidth(p, m);
        this.addSourceBitmap(t, p, m, h + Math.trunc((32 - g) / 2) - 1, u + 4);
      }
    (NAME_ENTRY_SCREEN.miniHelp.lines.forEach((o, l) => {
      this.addSourceBitmap(
        t,
        1,
        o,
        NAME_ENTRY_SCREEN.miniHelp.x,
        NAME_ENTRY_SCREEN.miniHelp.y + l * NAME_ENTRY_SCREEN.miniHelp.lineHeight,
      );
    }),
      e.help && this.renderMenuSecretHelp(t),
      this.overlayLayer.addChild(t));
  }
  renderMenuSecretHelp(e) {
    e.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 0.25,
      }),
    );
    const t = this.sourceCroppedTexture('ui.guiform', 13);
    if (t) {
      const r = new Sprite(t);
      (r.position.set(76, 58), e.addChild(r));
    }
    (this.addSourceGuiIcon(e, 2, 86, 70, 'secret-help-key'),
      this.addSourceBitmap(e, 2, NAME_ENTRY_SCREEN.help.title, 122, 73),
      NAME_ENTRY_SCREEN.help.body
        .split('|')
        .forEach((r, n) => this.addSourceBitmap(e, 1, r, 122, 112 + n * 15)),
      this.addSourceBitmap(e, 3, NAME_ENTRY_SCREEN.help.buttons[0], 192, 294, !0),
      this.addSourceBitmap(e, 3, NAME_ENTRY_SCREEN.help.buttons[1], 320, 294, !0));
  }
  stepHeroSelection() {
    (this.heroSelectLockedFrames > 0 && (this.heroSelectLockedFrames -= 1),
      this.refreshHeroSelection());
  }
  stepSourceSelectScreen() {
    if (!this.selectState) return;
    if (this.selectModal) {
      (this.selectModal.kind === 'popup' &&
        this.selectModal.frames > 0 &&
        ((this.selectModal.frames -= 1),
        this.selectModal.frames === 0 &&
          ((this.selectModal = void 0), this.clearAllSourceInputs())),
        this.renderSourceSelectScreen());
      return;
    }
    const e = this.selectRawInput;
    ((this.selectRawInput = void 0),
      this.applySourceSelectStep(
        stepSelect(
          this.selectState,
          e
            ? {
                key: e,
              }
            : {},
        ),
      ));
  }
  handleSelectReleasedKey(e) {
    if (this.selectModal) {
      if (e === 'ArrowLeft' || e === 'ArrowRight' || e === 'Numpad4' || e === 'Numpad6')
        ((this.selectModal.choice = this.selectModal.choice === 0 ? 1 : 0),
          this.playSound('click'));
      else if (GAME_KEYS.has(e)) {
        if (
          (this.playSound('gling'),
          this.selectModal.kind === 'question' && this.selectModal.choice === 0)
        ) {
          ((this.selectModal = void 0),
            (this.introLoop = 0),
            this.stopCurrentMusic(),
            this.beginUiScreenFade(() => this.openMenu()));
          return;
        }
        ((this.selectModal = void 0), this.clearAllSourceInputs());
      }
      this.renderSourceSelectScreen();
      return;
    }
    if (!this.selectState) return;
    const t =
      e === 'ArrowLeft'
        ? {
            controller: 0,
            x: -1,
          }
        : e === 'ArrowRight'
          ? {
              controller: 0,
              x: 1,
            }
          : e === 'ArrowUp'
            ? {
                controller: 0,
                y: -1,
              }
            : e === 'ArrowDown'
              ? {
                  controller: 0,
                  y: 1,
                }
              : e === 'KeyA' || e === 'Enter' || e === 'Space'
                ? {
                    controller: 0,
                    button: 0,
                  }
                : e === 'KeyS'
                  ? {
                      controller: 0,
                      button: 1,
                    }
                  : e === 'KeyD'
                    ? {
                        controller: 0,
                        button: 2,
                      }
                    : e === 'KeyW'
                      ? {
                          controller: 0,
                          button: 3,
                        }
                      : e === 'Numpad4'
                        ? {
                            controller: 1,
                            x: -1,
                          }
                        : e === 'Numpad6'
                          ? {
                              controller: 1,
                              x: 1,
                            }
                          : e === 'Numpad8'
                            ? {
                                controller: 1,
                                y: -1,
                              }
                            : e === 'Numpad5'
                              ? {
                                  controller: 1,
                                  y: 1,
                                }
                              : e === 'Numpad7'
                                ? {
                                    controller: 1,
                                    button: 0,
                                  }
                                : e === 'Numpad9'
                                  ? {
                                      controller: 1,
                                      button: 1,
                                    }
                                  : e === 'NumpadAdd'
                                    ? {
                                        controller: 1,
                                        button: 2,
                                      }
                                    : e === 'Numpad0'
                                      ? {
                                          controller: 1,
                                          button: 3,
                                        }
                                      : void 0;
    t &&
      this.applySourceSelectStep(
        stepSelect(this.selectState, {
          controls: [t],
        }),
      );
  }
  applySourceSelectStep(e) {
    ((this.selectState = e.state),
      (this.pauseHints = e.state.hints),
      this.applySourceSelectEffects(e.effects),
      this.screen === 'select' &&
        !this.uiScreenFade &&
        !this.sceneTransition &&
        this.renderSourceSelectScreen());
  }
  applySourceSelectEffects(e) {
    for (const t of e)
      t.type === 'set-music'
        ? this.selectCurrentMusic(t.id)
        : t.type === 'play-music'
          ? this.playCurrentMusic()
          : t.type === 'stop-music'
            ? this.stopCurrentMusic()
            : t.type === 'audio'
              ? this.playSound(t.id)
              : t.type === 'set-globals'
                ? (this.introLoop = t.introLoop)
                : t.type === 'screen-call'
                  ? (this.clearAllSourceInputs(),
                    t.screen.kind === 'question'
                      ? (this.selectModal = {
                          kind: 'question',
                          title: t.screen.title,
                          message: t.screen.question,
                          choice: 1,
                          frames: 0,
                        })
                      : (this.selectModal = {
                          kind: 'popup',
                          title: t.screen.title,
                          message: 'message' in t.screen ? t.screen.message : t.screen.body,
                          choice: 0,
                          frames: 'duration' in t.screen ? t.screen.duration : 0,
                        }))
                  : (t.type === 'screen-fade' || t.type === 'screen-fade-load') &&
                    this.finishSourceSelect(t.type === 'screen-fade-load' ? 'load' : 'fade');
  }
  finishSourceSelect(e) {
    const t = this.selectState;
    if (!t) return;
    const i = t.players[0]?.allyCount ?? 0;
    this.selectedPlayers = t.players.map((a) => ({
      ...a,
      selectList: [...a.selectList],
    }));
    const r = this.selectedPlayers[0];
    if (r) {
      this.heroIndex = Math.max(0, Math.min(HEROES.length - 1, r.character));
      const a =
        this.sourceMode === 'arena'
          ? this.progress.arenaPlayer
          : this.sourceMode === 'arcade'
            ? this.progress.arcadePlayer
            : void 0;
      a &&
        ((a.didJoin = r.didJoin),
        (a.character = r.character),
        (a.color = r.color),
        (a.score = r.score),
        (a.coins = r.coins),
        (a.allyCount = i),
        (a.selectList = [...r.selectList]));
    }
    const n = this.selectedPlayers[1];
    (this.sourceMode === 'arena' &&
      n &&
      (this.progress.arenaPlayer2 = normalizePlayerProgress(
        {
          ...this.progress.arenaPlayer2,
          ...n,
          allyCount: n.selectList.slice(7).reduce((a, o) => a + o, 0),
          selectList: n.selectList,
        },
        1,
      )),
      (this.selectState = void 0),
      (this.selectModal = void 0),
      this.afterHero(e));
  }
  openScores(e, t = null) {
    (this.clearSourceEndState(),
      this.selectCurrentMusic(HIGH_SCORE_SCREEN.music),
      this.playCurrentMusic(),
      (this.scoreMode = e),
      (this.scoreHighlight = t),
      (this.scorePages = buildHighScorePages(this.localScores, t)),
      (this.scoreTransition = void 0),
      (this.scoreModal = void 0),
      (this.paused = !1),
      (this.screen = 'scores'),
      (this.screenFrame = 0),
      this.clearAllSourceInputs(),
      this.renderStaticScreen(),
      this.playSound('movestone'));
  }
  stepScores() {
    if (this.scoreModal) {
      if (this.scoreModal.kind === 'question') {
        const t = stepQuestion(this.scoreModal.state, 'none');
        ((this.scoreModal.state = t.state),
          t.kind === 'dismiss' ? this.closeScoresModal() : this.renderScoresModal());
      } else {
        const t = stepMessage(this.scoreModal.state);
        ((this.scoreModal.state = t.state), t.dismiss && this.closeScoresModal());
      }
      return;
    }
    const e = this.scoreTransition;
    (e &&
      this.scorePanel &&
      ((e.frame += 1),
      (this.scorePanel.x = highScorePageSlide(e.from, e.to, e.frame)),
      e.frame > HIGH_SCORE_SCREEN.moveSteps &&
        ((this.scoreMode = e.to),
        (this.scorePanel.x = this.scoreMode === 'arcade' ? 0 : -SCREEN_WIDTH),
        (this.scoreTransition = void 0))),
      this.scorePanel &&
        this.scoreFilter &&
        this.setDisplayAdditiveHue(
          this.scorePanel,
          this.scoreFilter,
          highScoreHue(this.screenFrame),
        ));
  }
  handleScoresReleasedKey(e) {
    if (this.scoreModal) {
      if (this.scoreModal.kind === 'popup') {
        if (GAME_KEYS.has(e)) {
          const n = stepMessage(this.scoreModal.state, !0);
          ((this.scoreModal.state = n.state), n.dismiss && this.closeScoresModal());
        }
        return;
      }
      const i =
        e === 'ArrowLeft' || e === 'Numpad4'
          ? 'left'
          : e === 'ArrowRight' || e === 'Numpad6'
            ? 'right'
            : GAME_KEYS.has(e)
              ? 'accept'
              : 'none';
      if (i === 'none') return;
      const r = stepQuestion(this.scoreModal.state, i);
      if (
        ((this.scoreModal.state = r.state),
        'sound' in r && r.sound && this.playSound(r.sound),
        r.kind === 'choose')
      ) {
        if (r.choice === 0) {
          const n = resetHighScores(this.localScores, this.scoreMode);
          ((this.scoreModal = {
            kind: 'popup',
            state: newMessage(n.popup.delay),
          }),
            this.clearAllSourceInputs(),
            this.renderScoresModal());
        } else this.closeScoresModal();
      } else r.kind === 'dismiss' ? this.closeScoresModal() : this.renderScoresModal();
      return;
    }
    if (this.scoreTransition) return;
    const t =
      e === 'ArrowRight' || e === 'Numpad6' ? 1 : e === 'ArrowLeft' || e === 'Numpad4' ? -1 : 0;
    if (t !== 0) {
      const i = shiftHighScoreMode(this.scoreMode, t);
      i !== this.scoreMode &&
        ((this.scoreTransition = {
          from: this.scoreMode,
          to: i,
          frame: 0,
        }),
        this.playSound('movestone'));
      return;
    }
    e === 'KeyW' || e === 'Numpad0'
      ? this.openScoreResetQuestion()
      : GAME_KEYS.has(e) && this.beginPlayExitFade();
  }
  openScoreResetQuestion() {
    ((this.scoreModal = {
      kind: 'question',
      state: newQuestion('Erase Hiscores Yes', null),
    }),
      this.clearAllSourceInputs(),
      this.playSound('click'),
      this.renderScoresModal());
  }
  closeScoresModal() {
    ((this.scoreModal = void 0),
      this.clearAllSourceInputs(),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ));
  }
  renderScoresModal() {
    const e = this.scoreModal;
    if (
      (this.overlayLayer.removeChildren().forEach((i) =>
        i.destroy({
          children: !0,
        }),
      ),
      !e)
    )
      return;
    const t = new Container();
    if (
      (t.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
          color: 0,
          alpha: 1 - QUESTION_DIM,
        }),
      ),
      e.kind === 'question')
    ) {
      const n = this.sourceCroppedTexture('ui.guiform', QUESTION_LAYOUT.form);
      if (n) {
        const l = new Sprite(n);
        (l.position.set(140, 134), t.addChild(l));
      }
      const a = 140 + QUESTION_LAYOUT.panelInsetX,
        o = 134 + QUESTION_LAYOUT.panelInsetY;
      (this.addSourceGuiIcon(t, QUESTION_LAYOUT.shieldIcon, a, o, 'scores-reset-shield'),
        this.addSourceBitmap(t, 2, HIGH_SCORE_SCREEN.resetQuestion.title, a + 40, o),
        this.addSourceBitmap(t, 1, HIGH_SCORE_SCREEN.resetQuestion.question, a + 40, o + 27),
        this.addSourceGuiIcon(
          t,
          QUESTION_LAYOUT.swordIcon,
          a - 4 + e.state.choice * QUESTION_LAYOUT.choiceGapX + questionBlink(e.state.swordDraws),
          o + QUESTION_LAYOUT.choicesY - 4,
          'scores-reset-sword',
        ),
        this.addSourceBitmap(
          t,
          3,
          HIGH_SCORE_SCREEN.resetQuestion.buttons[0],
          a + 34,
          o + QUESTION_LAYOUT.choicesY,
        ),
        this.addSourceBitmap(
          t,
          3,
          HIGH_SCORE_SCREEN.resetQuestion.buttons[1],
          a + 34 + QUESTION_LAYOUT.choiceGapX,
          o + QUESTION_LAYOUT.choicesY,
        ));
    } else {
      const n = this.sourceCroppedTexture('ui.guiform', MESSAGE_LAYOUT.form);
      if (n) {
        const l = new Sprite(n);
        (l.position.set(140, 152), t.addChild(l));
      }
      const a = 140 + MESSAGE_LAYOUT.panelInsetX,
        o = 152 + MESSAGE_LAYOUT.panelInsetY;
      (this.addSourceGuiIcon(t, QUESTION_LAYOUT.shieldIcon, a, o, 'scores-reset-popup-shield'),
        this.addSourceBitmap(t, 2, HIGH_SCORE_SCREEN.resetPopup.title, a + 40, o),
        this.addSourceBitmap(t, 1, HIGH_SCORE_SCREEN.resetPopup.message, a + 40, o + 27));
    }
    this.overlayLayer.addChild(t);
  }
  openSubmit(e, t, i = 0) {
    (this.clearSourceEndState(),
      this.stopCurrentMusic(),
      (this.scoreMode = e),
      (this.submitPlayerScores = [Math.trunc(t), Math.trunc(i)]),
      (this.submitChoice = 0),
      (this.submitFrame = 0),
      (this.hiscoreInput = void 0),
      (this.scoreFlowModal = void 0),
      (this.paused = !1),
      (this.screen = 'submit'),
      (this.screenFrame = 0),
      this.clearAllSourceInputs(),
      this.playSound(SUBMIT_SCREEN.startAudio[0]),
      this.playSound(SUBMIT_SCREEN.startAudio[1]),
      this.renderStaticScreen());
  }
  stepScoreFlow() {
    if (this.scoreFlowModal) {
      (this.scoreFlowModal.kind === 'popup' &&
        this.scoreFlowModal.frames > 0 &&
        ((this.scoreFlowModal.frames -= 1),
        this.scoreFlowModal.frames === 0 && this.closeScoreFlowModal()),
        this.renderScoreFlow());
      return;
    }
    ((this.submitFrame += 1), this.renderScoreFlow());
  }
  toggleSourceHints() {
    ((this.pauseHints = !this.pauseHints),
      this.keys.delete('F1'),
      this.selectState && (this.selectState.hints = this.pauseHints),
      this.menuHintLayer && (this.menuHintLayer.visible = this.pauseHints),
      this.chapterHintLayer && (this.chapterHintLayer.visible = this.pauseHints),
      this.scoreHintLayer && (this.scoreHintLayer.visible = this.pauseHints),
      this.screen === 'menu'
        ? this.rebuildSourceMenu()
        : this.screen === 'paused' && (this.pauseMenu = this.buildPauseMenu()));
  }
  applySourceConfigurationAction(e) {
    if (e === 'cycle-game-speed')
      ((this.gameSpeedIndex = (this.gameSpeedIndex + 1) % 3),
        this.slowAmount <= 0 && (this.sourceUpdateRate = this.sourceGameRate()));
    else if (e === 'cycle-difficulty') this.difficultyIndex = (this.difficultyIndex + 1) % 3;
    else if (e === 'cycle-type-speed') this.typeSpeedIndex = (this.typeSpeedIndex + 1) % 3;
    else if (e === 'toggle-hints') this.pauseHints = !this.pauseHints;
    else if (e === 'toggle-recolor') this.recolorAllies = !this.recolorAllies;
    else if (e === 'toggle-blood') this.bloodEnabled = !this.bloodEnabled;
    else if (e === 'toggle-hue') this.hueEnabled = !this.hueEnabled;
    else if (e === 'toggle-slow')
      ((this.slowEnabled = !this.slowEnabled),
        this.slowEnabled ||
          ((this.slowAmount = 0),
          (this.slowDecay = 0),
          (this.sourceUpdateRate = this.sourceGameRate())));
    else if (e === 'toggle-ministats') this.miniStats = !this.miniStats;
    else if (e === 'toggle-foregrounds')
      this.foregroundLayer.visible = !this.foregroundLayer.visible;
    else if (e === 'cycle-monitor')
      this.settings.preferredScreen =
        this.settings.preferredScreen === '512x384' ? '640x480' : '512x384';
    else if (e === 'toggle-scale-fit') this.settings.scaleToFit = !this.settings.scaleToFit;
    else if (e === 'cycle-graphics')
      ((this.graphicsIndex = (this.graphicsIndex + 1) % 3),
        this.graphicsIndex === 0
          ? ((this.hueEnabled = !1), (this.slowEnabled = !1), (this.foregroundLayer.visible = !1))
          : this.graphicsIndex === 1
            ? ((this.hueEnabled = !0), (this.slowEnabled = !1), (this.foregroundLayer.visible = !0))
            : ((this.hueEnabled = !0),
              (this.slowEnabled = !0),
              (this.foregroundLayer.visible = !0)),
        (this.settings.scaleToFit = this.graphicsIndex === 2),
        this.slowEnabled ||
          ((this.slowAmount = 0),
          (this.slowDecay = 0),
          (this.sourceUpdateRate = this.sourceGameRate())));
    else if (e === 'restore-game-settings')
      ((this.gameSpeedIndex = this.difficultyIndex = this.typeSpeedIndex = 1),
        (this.pauseHints = this.recolorAllies = !0),
        this.slowAmount <= 0 && (this.sourceUpdateRate = this.sourceGameRate()));
    else if (e === 'restore-graphics')
      ((this.bloodEnabled = this.hueEnabled = this.slowEnabled = this.miniStats = !0),
        (this.foregroundLayer.visible = !0),
        (this.graphicsIndex = 2),
        (this.settings.scaleToFit = !1));
    else return !1;
    return (this.persistSettings(), !0);
  }
  persistSettings() {
    (Object.assign(this.settings, {
      gameSpeedIndex: this.gameSpeedIndex,
      difficultyIndex: this.difficultyIndex,
      typeSpeedIndex: this.typeSpeedIndex,
      graphicsIndex: this.graphicsIndex,
      hints: this.pauseHints,
      recolorAllies: this.recolorAllies,
      blood: this.bloodEnabled,
      hue: this.hueEnabled,
      slow: this.slowEnabled,
      miniStats: this.miniStats,
      foregrounds: this.foregroundLayer.visible,
      preferredScreen: this.settings.preferredScreen,
      scaleToFit: this.settings.scaleToFit,
      musicMuted: this.musicMuted,
      soundsMuted: this.soundsMuted,
    }),
      saveSettings(this.settingsStorage, this.settings));
  }
  handleScoreFlowReleasedKey(e) {
    const t = GAME_KEYS.has(e);
    if (this.scoreFlowModal) {
      const n = this.scoreFlowModal;
      if (n.kind === 'question' && ['ArrowLeft', 'ArrowRight', 'Numpad4', 'Numpad6'].includes(e))
        ((n.choice = n.choice === 0 ? 1 : 0), this.playSound('click'));
      else if (t) {
        if ((this.playSound('gling'), n.kind === 'question' && n.choice === 0)) {
          ((this.scoreFlowModal = void 0),
            (this.introLoop = 0),
            this.stopCurrentMusic(),
            this.startSplash());
          return;
        }
        this.closeScoreFlowModal();
      }
      this.renderScoreFlow();
      return;
    }
    if (this.screen === 'submit') {
      const n =
        e === 'ArrowRight' || e === 'Numpad6' ? 1 : e === 'ArrowLeft' || e === 'Numpad4' ? -1 : 0;
      (n !== 0
        ? ((this.submitChoice = nextSubmitOption(this.submitChoice, n, !0)),
          this.playSound(SUBMIT_SCREEN.moveAudio))
        : t &&
          (this.playSound(SUBMIT_SCREEN.acceptAudio),
          this.openSubmitRoute(
            submitPrompt(
              this.submitChoice,
              this.localScores.readPreferredName(),
              this.edition === 'full',
            ),
          )),
        this.renderScoreFlow());
      return;
    }
    const i = this.hiscoreInput;
    if (!i) return;
    const r =
      e === 'ArrowRight' || e === 'Numpad6'
        ? {
            x: 1,
          }
        : e === 'ArrowLeft' || e === 'Numpad4'
          ? {
              x: -1,
            }
          : e === 'ArrowDown' || e === 'Numpad5'
            ? {
                y: 1,
              }
            : e === 'ArrowUp' || e === 'Numpad8'
              ? {
                  y: -1,
                }
              : void 0;
    if (r) ((this.hiscoreInput = moveHighScoreCursor(i, r)), this.playSound('click'));
    else if (t) {
      const a = typeHighScoreCharacter(i, e === 'KeyW' || e === 'Numpad0' ? 3 : 0);
      if (((this.hiscoreInput = a.state), this.playSound(a.audio), a.outcome === 'complete')) {
        const o = submitLocalScore(
          this.localScores,
          this.scoreMode,
          a.state.value,
          this.submitPlayerScores[0] + this.submitPlayerScores[1],
        );
        this.scoreFlowModal = {
          kind: 'popup',
          route: o,
          choice: 0,
          frames: o.delay,
        };
      }
    }
    this.renderScoreFlow();
  }
  openSubmitRoute(e) {
    e.kind === 'input'
      ? ((this.hiscoreInput = newHighScoreNameEntry(e.value, e.title, e.maxLength)),
        (this.screen = 'input'),
        (this.submitFrame = 0),
        this.clearAllSourceInputs(),
        this.playSound('click'),
        this.renderStaticScreen())
      : e.kind === 'popup'
        ? (this.clearAllSourceInputs(),
          (this.scoreFlowModal = {
            kind: 'popup',
            route: e,
            choice: 0,
            frames: e.delay,
          }),
          this.renderScoreFlow())
        : e.kind === 'question'
          ? (this.clearAllSourceInputs(),
            (this.scoreFlowModal = {
              kind: 'question',
              route: e,
              choice: e.defaultChoice,
              frames: 0,
            }),
            this.renderScoreFlow())
          : this.returnToSubmit();
  }
  openScoreAbortQuestion() {
    const e = submitPrompt(2, null, this.edition === 'full');
    e.kind === 'question' &&
      (this.clearAllSourceInputs(),
      (this.scoreFlowModal = {
        kind: 'question',
        route: e,
        choice: e.defaultChoice,
        frames: 0,
      }),
      this.renderScoreFlow());
  }
  returnToSubmit() {
    ((this.screen = 'submit'),
      (this.hiscoreInput = void 0),
      (this.scoreFlowModal = void 0),
      this.clearAllSourceInputs(),
      this.renderStaticScreen());
  }
  closeScoreFlowModal() {
    const e = this.scoreFlowModal?.route;
    if (
      ((this.scoreFlowModal = void 0),
      this.clearAllSourceInputs(),
      e?.kind === 'popup' && e.afterClose)
    ) {
      ((this.hiscoreInput = void 0),
        this.openScores(e.afterClose.mode, e.afterClose.highlightName));
      return;
    }
    this.renderScoreFlow();
  }
  handleMenuKey(e) {
    if (!this.menuRoot) return;
    const t = submenuAt(this.menuRoot, this.menuPath);
    if (e === 'ArrowUp' || e === 'Numpad8') {
      ((this.menuIdleFrames = 0),
        (this.menuIndex = (this.menuIndex + t.items.length - 1) % t.items.length),
        this.playSound('click'),
        this.renderMenuSelection());
      return;
    }
    if (e === 'ArrowDown' || e === 'Numpad5') {
      ((this.menuIdleFrames = 0),
        (this.menuIndex = (this.menuIndex + 1) % t.items.length),
        this.playSound('click'),
        this.renderMenuSelection());
      return;
    }
    if ((e === 'ArrowLeft' || e === 'Numpad4' || e === 'KeyQ') && this.menuPath.length > 0) {
      ((this.menuIdleFrames = 0), (this.menuIndex = this.menuPath.pop() ?? 0));
      const a = submenuAt(this.menuRoot, this.menuPath);
      (this.setMenuCameraTarget(a),
        this.playSound('movestone'),
        this.clearAllSourceInputs(),
        this.renderMenuSelection());
      return;
    }
    const i = e === 'ArrowRight' || e === 'Numpad6',
      r = GAME_KEYS.has(e);
    if (!i && !r) return;
    const n = t.items[this.menuIndex];
    n &&
      (n.submenu
        ? ((this.menuIdleFrames = 0),
          this.menuPath.push(this.menuIndex),
          (this.menuIndex = 0),
          this.setMenuCameraTarget(n.submenu),
          this.playSound('movestone'),
          this.clearAllSourceInputs(),
          this.renderMenuSelection())
        : r &&
          n.action &&
          ((this.menuIdleFrames = 0),
          this.playSound('gling'),
          this.clearAllSourceInputs(),
          this.chooseMenu(n.action)));
  }
  handleHeroReleasedKey(e) {
    if (e === 'ArrowLeft' || e === 'ArrowUp' || e === 'Numpad4' || e === 'Numpad8')
      ((this.heroIndex = (this.heroIndex + HEROES.length - 1) % HEROES.length),
        this.playSound('click'),
        this.refreshHeroSelection());
    else if (e === 'ArrowRight' || e === 'ArrowDown' || e === 'Numpad6' || e === 'Numpad5')
      ((this.heroIndex = (this.heroIndex + 1) % HEROES.length),
        this.playSound('click'),
        this.refreshHeroSelection());
    else if (e === 'Enter' || e === 'Space' || e === 'KeyA' || e === 'Numpad7') {
      if (this.heroIndex === 2 && !this.progress.arcadeWon) {
        (this.playSound('error'), (this.heroSelectLockedFrames = 30), this.refreshHeroSelection());
        return;
      }
      (this.playSound('gling'),
        this.playSound(HERO_STATS[this.heroIndex]?.voice),
        this.afterHero());
    }
  }
  handleChapterReleasedKey(e) {
    if (this.chapterPopup) {
      if (GAME_KEYS.has(e)) {
        const i = stepMessage(this.chapterPopup.state, !0);
        ((this.chapterPopup.state = i.state), i.dismiss && this.closeChapterPopup());
      }
      return;
    }
    if (!this.chapterSession?.replay) {
      GAME_KEYS.has(e) && this.chooseChapter();
      return;
    }
    const t = this.chapterScreenRows();
    t.length !== 0 &&
      (e === 'ArrowUp' || e === 'Numpad8'
        ? this.moveChapterCursor((this.chapterIndex + t.length - 1) % t.length)
        : e === 'ArrowDown' || e === 'Numpad5'
          ? this.moveChapterCursor((this.chapterIndex + 1) % t.length)
          : e === 'PageUp'
            ? this.moveChapterCursor(Math.max(0, this.chapterIndex - 10))
            : e === 'PageDown'
              ? this.moveChapterCursor(Math.min(t.length - 1, this.chapterIndex + 10))
              : GAME_KEYS.has(e) && (this.playSound('gling'), this.chooseChapter()));
  }
  setMenuCameraTarget(e) {
    if (!this.menuPanel) return;
    const t = centerMenu(e, SCREEN_WIDTH, SCREEN_HEIGHT);
    this.menuMove = {
      startX: this.menuPanel.x,
      startY: this.menuPanel.y,
      targetX: t.x,
      targetY: t.y,
      step: 0,
      steps: MENU_SLIDE_STEPS,
    };
  }
  openMenuQuestion(e) {
    const t = e === 'restart-arena',
      i = e.startsWith('restore-');
    ((this.menuQuestion = {
      action: e,
      title: i ? 'Restore Defaults' : e === 'exit' ? 'Exit Game' : 'Restart Game',
      question:
        i || e === 'exit' ? 'Are you sure?' : `Restart ${t ? 'arena' : 'arcade'} from beginning?`,
      yes: 'Yes',
      no: 'No',
      state: newQuestion(e, null),
    }),
      (this.menuIdleFrames = 0),
      this.clearAllSourceInputs(),
      this.playSound('click'),
      this.renderMenuQuestion());
  }
  handleMenuQuestionInput(e) {
    const t = this.menuQuestion;
    if (!t) return;
    const i = stepQuestion(t.state, e);
    if (
      ((t.state = i.state),
      'sound' in i && i.sound && this.playSound(i.sound),
      i.kind === 'dismiss')
    ) {
      this.closeMenuQuestion();
      return;
    }
    if (i.kind === 'choose') {
      const r = t.action,
        n = i.choice === 0;
      if ((this.closeMenuQuestion(), !n)) return;
      r === 'exit'
        ? this.renderTextPage('EXIT GAME', [
            'The browser owns this window.',
            'Press Enter to return to the main menu.',
          ])
        : this.chooseMenu(r, !0);
      return;
    }
    this.renderMenuQuestion();
  }
  closeMenuQuestion() {
    ((this.menuQuestion = void 0),
      this.clearAllSourceInputs(),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ));
  }
  chooseMenu(e, t = !1) {
    const i = (o, l = !1) => ({
        dataName: 'arcade',
        background: 'sc-cliff-1a',
        mode: 'arcade',
        replay: o,
        maxUnlocked: this.progress.arcadeWon
          ? 99999
          : Math.max(1, this.progress.arcadeMaxChapter - (o ? 1 : 0)),
        heroAfterSelection: l,
      }),
      r = (o, l = !1) => ({
        dataName: 'arena',
        background: 'sc-arena-1a',
        mode: 'arena',
        replay: o,
        maxUnlocked: this.progress.arenaWon
          ? 99999
          : Math.max(1, this.progress.arenaMaxChapter - (o ? 1 : 0)),
        heroAfterSelection: l,
      });
    if (!e) {
      (this.resetSourcePlayer('arcade'),
        this.resetNewMode('arcade'),
        this.startHeroSelection('arcade', {
          kind: 'chapters',
          session: i(!1),
          index: 0,
        }));
      return;
    }
    const n = /^remap-key-([01])-([0-7])$/.exec(e);
    if (n) {
      this.openMenuKeyCapture('menu', Number(n[1]), Number(n[2]));
      return;
    }
    const a = /^cycle-button-map-([01])-([0-3])$/.exec(e);
    if (a) {
      const o = Number(a[1]),
        l = Number(a[2]);
      ((this.settings.buttonMaps[o][l] = nextButtonAction(this.settings.buttonMaps[o][l])),
        this.persistSettings(),
        this.rebuildSourceMenu());
      return;
    }
    if (e === 'enter-secret-code') {
      this.openMenuSecretInput();
      return;
    }
    if (
      !t &&
      (e === 'restart-arcade' ||
        e === 'restart-arena' ||
        e === 'exit' ||
        e === 'restore-game-settings' ||
        e === 'restore-keyboard' ||
        e === 'restore-button-mapping' ||
        e === 'restore-graphics')
    ) {
      this.openMenuQuestion(e);
      return;
    }
    if (e === 'begin-arcade' || e === 'restart-arcade')
      (this.resetSourcePlayer('arcade'),
        e === 'restart-arcade' &&
          ((this.progress.arcadeChapter = 1),
          (this.progress.arcadeMaxChapter = 1),
          (this.progress.arcadeWon = !1),
          this.saveProgress()),
        this.resetNewMode('arcade'),
        (this.heroIndex = 0),
        this.beginMenuScreenFade(() => this.startChapterSession(i(!1), 0)));
    else if (e === 'continue-arcade')
      (this.resetNewMode('arcade'),
        this.progress.arcadeWon
          ? this.beginMenuScreenFade(() => this.openNovel('arcade-win', 'menu', !0))
          : this.beginMenuScreenFade(() =>
              this.startChapterSession(i(!1), Math.max(0, this.progress.arcadeChapter - 1)),
            ));
    else if (e === 'replay-arcade')
      (this.resetNewMode('arcade'),
        this.beginMenuScreenFade(() => this.startChapterSession(i(!0), 0)));
    else if (e === 'begin-arena' || e === 'restart-arena')
      (this.resetSourcePlayer('arena'),
        e === 'restart-arena' &&
          ((this.progress.arenaChapter = 1),
          (this.progress.arenaMaxChapter = 1),
          (this.progress.arenaWon = !1),
          this.saveProgress()),
        this.resetNewMode('arena'),
        this.beginMenuScreenFade(() =>
          this.startHeroSelection('arena', {
            kind: 'chapters',
            session: r(!1),
            index: 0,
          }),
        ));
    else if (e === 'continue-arena')
      (this.resetNewMode('arena'),
        this.progress.arenaWon
          ? this.beginMenuScreenFade(() => this.openNovel('arena-win', 'menu', !0))
          : this.beginMenuScreenFade(() =>
              this.startHeroSelection('arena', {
                kind: 'chapters',
                session: r(!1),
                index: Math.max(0, this.progress.arenaChapter - 1),
              }),
            ));
    else if (e === 'replay-arena')
      (this.resetNewMode('arena'),
        this.beginMenuScreenFade(() => this.startChapterSession(r(!0, !0), -1)));
    else if (e === 'tutorial')
      (this.resetNewMode('practice', 'tutorial'),
        this.beginMenuScreenFade(() =>
          this.startHeroSelection('tutorial', {
            kind: 'scene',
            dataName: 'extra',
            script: 10,
          }),
        ));
    else if (e === 'survival')
      (this.resetNewMode('practice', 'survival'),
        (this.survivalWave = 0),
        (this.survivalBreak = 0),
        (this.survivalSeconds = 0),
        (this.survivalTick = 0),
        (this.survivalResult = void 0),
        this.beginMenuScreenFade(() =>
          this.startHeroSelection('survival', {
            kind: 'scene',
            dataName: SURVIVAL_DATA_NAME,
            script: SURVIVAL_SCRIPT,
          }),
        ));
    else if (e === 'practice')
      (this.resetNewMode('practice', 'practice'),
        this.beginMenuScreenFade(() =>
          this.startHeroSelection('practice', {
            kind: 'scene',
            dataName: 'extra',
            script: 1,
          }),
        ));
    else if (e === 'fight-shows') {
      this.resetNewMode('show', 'show');
      const o =
        this.progress.arcadeWon && this.progress.arenaWon
          ? 99999
          : this.progress.arcadeWon
            ? 19
            : 2;
      this.beginMenuScreenFade(() =>
        this.startChapterSession(
          {
            dataName: 'extra',
            background: 'sc-cast-roof-1a',
            mode: 'show',
            replay: !0,
            maxUnlocked: o,
            heroAfterSelection: !1,
          },
          -1,
        ),
      );
    } else if (e === 'credits')
      this.beginMenuScreenFade(() => this.openNovel('credits', 'menu', !0));
    else if (e === 'versus') {
      (this.resetNewMode('versus', 'versus'),
        (this.gameChapter = 1),
        (this.selectedPlayers = [
          newSelectPlayer(0, {
            didJoin: !0,
            character: 0,
            controller: 0,
          }),
          newSelectPlayer(1, {
            didJoin: !1,
            character: 1,
            controller: 1,
          }),
        ]));
      const o = Number(this.progress.arcadeWon) + Number(this.progress.arenaWon);
      this.beginMenuScreenFade(() =>
        this.startChapterSession(
          {
            dataName: 'extra',
            category: 'Versus',
            background: 'sc-cast-roof-1a',
            mode: 'versus',
            replay: !0,
            maxUnlocked: Math.min(5, 3 + o),
            heroAfterSelection: !1,
          },
          -1,
        ),
      );
    } else if (e === 'gallery')
      (this.resetNewMode('gallery', 'gallery'),
        this.beginMenuScreenFade(() =>
          this.startChapterSession(
            {
              dataName: 'extra',
              category: 'Posters',
              background: 'bg-select-1a',
              mode: 'gallery',
              replay: !0,
              maxUnlocked: novelHoldFrames(
                this.edition === 'full',
                this.progress.arcadeWon,
                this.progress.arenaWon,
              ),
              heroAfterSelection: !1,
            },
            -1,
          ),
        ));
    else if (e === 'hiscores-arcade' || e === 'hiscores-arena')
      this.onOpenHighScores?.(ONLINE_SCORE_URLS[e === 'hiscores-arena' ? 'survival' : 'arcade']);
    else if (e === 'toggle-music' || e === 'toggle-sounds')
      (e === 'toggle-music' ? this.toggleMusicChannel() : this.toggleSoundChannel(),
        this.rebuildSourceMenu());
    else if (e === 'toggle-fullscreen')
      (document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen().catch(() => {}),
        this.rebuildSourceMenu());
    else if (e === 'restore-keyboard') {
      for (const o of [0, 1])
        for (let l = 0; l < 8; l += 1) this.settings.keyboardMaps[o][l] = DEFAULT_KEY_MAPS[o][l];
      (this.persistSettings(), this.rebuildSourceMenu());
    } else if (e === 'restore-button-mapping') {
      for (const o of [0, 1])
        for (let l = 0; l < 4; l += 1) this.settings.buttonMaps[o][l] = DEFAULT_BUTTON_MAP[l];
      (this.persistSettings(), this.rebuildSourceMenu());
    } else
      this.applySourceConfigurationAction(e)
        ? this.rebuildSourceMenu()
        : (e === 'official-website' ||
            e === 'fan-store' ||
            e === 'game-update' ||
            e === 'more-games') &&
          this.renderTextPage('VISIT ONLINE', [
            'The original external link is intentionally not opened automatically.',
            'All restored game media stays local.',
          ]);
  }
  resetNewMode(e, t = e) {
    ((this.score =
      e === 'arcade'
        ? this.progress.arcadePlayer.score
        : e === 'arena'
          ? this.progress.arenaPlayer.score
          : 0),
      (this.mode = e),
      (this.sourceMode = t));
  }
  resetSourcePlayer(e) {
    const t = newPlayerProgress(this.heroIndex);
    e === 'arcade'
      ? (this.progress.arcadePlayer = t)
      : ((this.progress.arenaPlayer = t), (this.progress.arenaPlayer2 = newPlayerProgress(1)));
  }
  /** The pick grid: every character, with the name the game gives it. */
  survivalCharacters() {
    return SURVIVAL_CHARACTERS.map((e) => {
      const t = this.manifest?.actors?.[e.id]?.['ActorType:0'];
      return {
        ...e,
        name: t?.name ?? e.id,
        race: t?.type ?? '',
      };
    });
  }
  /**
   * The characters with no icon are drawn from their sprite sheets, so those
   * have to be in memory. Nothing waits on this: cells fill in as they land.
   */
  preloadSurvivalAvatars() {
    for (const e of SURVIVAL_CHARACTERS)
      e.hero === void 0 && e.icon === void 0 && this.ensureAtlas(e.id).catch(() => {});
  }
  startHeroSelection(e, t) {
    (this.clearAllSourceInputs(),
      this.clearSourceEndState(),
      (this.sourceMode = e),
      (this.heroDestination = t));
    const i =
        e === 'arena' || e === 'practice' || e === 'survival' || e === 'tutorial' || e === 'versus'
          ? e
          : 'arcade',
      r = i === 'arena' ? this.progress.arenaPlayer : this.progress.arcadePlayer,
      n = i === 'arena' ? normalizePlayerProgress(this.progress.arenaPlayer2, 1) : void 0,
      a = e === 'versus' && this.selectedPlayers.length >= 2 ? this.selectedPlayers : void 0,
      o = t.kind === 'scene' ? this.sceneDefinition(t.dataName, t.script) : void 0,
      l = newSelectState({
        mode: i,
        replay: t.kind === 'chapters' ? t.session.replay : !1,
        chapter: t.kind === 'scene' ? this.gameChapter || 1 : Math.max(1, t.index + 1),
        gameMaxChapter:
          i === 'arena' ? this.progress.arenaMaxChapter : this.progress.arcadeMaxChapter,
        fullEdition: this.edition === 'full',
        saveMaxChapters: [
          this.progress.arcadeWon ? 99999 : this.progress.arcadeMaxChapter,
          this.progress.arenaWon ? 99999 : this.progress.arenaMaxChapter,
        ],
        players: [
          a?.[0]
            ? newSelectPlayer(0, {
                ...a[0],
                didJoin: !0,
                selectList: a[0].selectList,
              })
            : newSelectPlayer(0, {
                didJoin: !0,
                character: r.character,
                color: r.color,
                score: r.score,
                coins: r.coins,
                controller: 0,
                selectList: r.selectList,
              }),
          a?.[1]
            ? newSelectPlayer(1, {
                ...a[1],
                selectList: a[1].selectList,
              })
            : newSelectPlayer(1, {
                didJoin: n?.didJoin ?? !1,
                character: n?.character ?? 1,
                color: n?.color ?? 0,
                score: n?.score ?? 0,
                coins: n?.coins ?? 0,
                controller: 1,
                selectList: n?.selectList ?? newPlayerProgress(1).selectList,
              }),
        ],
        nextScreen: {
          kind: 'hero-destination',
        },
        characters: e === 'survival' ? this.survivalCharacters() : [],
        loadTitle: o ? this.replaceTextVars(o.section.title ?? '') : null,
        loadSubtitle: o?.section.subtitle ?? null,
        hints: this.pauseHints,
        controllerCount: e === 'survival' ? 1 : 2,
        carriedMaxAllies: r.allyCount,
      });
    ((this.selectState = l.state),
      e === 'survival' && this.preloadSurvivalAvatars(),
      e !== 'versus' && (this.selectedPlayers = []),
      this.applySourceSelectEffects(l.effects),
      (this.screen = 'select'),
      (this.screenFrame = 0),
      this.renderStaticScreen());
  }
  afterHero(e) {
    this.stopCurrentMusic();
    const t = this.heroDestination;
    if (((this.heroDestination = void 0), !t)) {
      e ? this.beginUiScreenFade(() => this.openMenu()) : this.openMenu();
      return;
    }
    if (this.sourceMode === 'arcade' || this.sourceMode === 'arena') {
      const i =
        this.sourceMode === 'arcade' ? this.progress.arcadePlayer : this.progress.arenaPlayer;
      ((i.didJoin = !0), (i.character = this.heroIndex));
    }
    t.kind === 'chapters'
      ? e
        ? this.beginUiScreenFade(() => this.startChapterSession(t.session, t.index))
        : this.startChapterSession(t.session, t.index)
      : e
        ? this.beginSceneTransition(e, t.script, t.dataName)
        : this.loadScene(t.dataName, t.script);
  }
  chapterChoices() {
    const e = this.manifest.data[this.dataName];
    return parseChapters(e).filter((i) => i.script > 0 && i.script !== 99999);
  }
  chapterScreenRows() {
    const e = this.chapterSession,
      t = this.manifest.data[e?.dataName ?? this.dataName];
    return e?.category === 'Posters'
      ? parseNovelPages(t.Posters).map((i) => ({
          ...i,
          script: i.number,
        }))
      : e?.category === 'Versus'
        ? Object.entries(t.Versus ?? {})
            .filter(([i]) => /^\d+$/.test(i))
            .sort(([i], [r]) => Number(i) - Number(r))
            .map(([i, r]) => {
              const [n = '', a = '0'] = r.split('|');
              return {
                number: Number(i),
                title: n,
                script: toNumber(a),
              };
            })
        : parseChapters(t).filter((i) => i.script > 0);
  }
  startChapterSession(e, t) {
    (this.clearAllSourceInputs(),
      this.clearSourceEndState(),
      this.selectCurrentMusic('008'),
      this.playCurrentMusic(),
      (this.chapterSession = e),
      (this.chapterEntryIndex = t),
      (this.dataName = e.dataName),
      (this.mode = e.mode),
      (this.sourceMode = e.mode));
    const i = this.chapterScreenRows().length;
    ((this.chapterIndex = t < 0 || t >= i ? 0 : t),
      (this.chapterIdleFrames = 0),
      (this.chapterPopup = void 0),
      (this.screen = 'chapters'),
      (this.screenFrame = 0),
      this.renderStaticScreen());
  }
  moveChapterCursor(e) {
    !this.chapterPanel ||
      !this.chapterSession ||
      ((this.chapterIndex = e),
      (this.chapterMove = {
        startX: this.chapterPanel.x,
        startY: this.chapterPanel.y,
        targetX: (SCREEN_WIDTH - MENU_MAX_HEIGHT) / 2,
        targetY: menuTopY(e, SCREEN_HEIGHT),
        step: 0,
        steps: MENU_SLIDE_STEPS,
      }),
      this.playSound('click'),
      this.refreshChapterCursor());
  }
  stepChapterScreen() {
    if (!this.chapterPanel || !this.chapterSession) return;
    if (this.chapterPopup) {
      const t = stepMessage(this.chapterPopup.state);
      ((this.chapterPopup.state = t.state), t.dismiss && this.closeChapterPopup());
      return;
    }
    const e = this.chapterMove;
    (e &&
      (this.chapterPanel.position.set(
        Math.trunc(easeIn(e.startX, e.targetX, e.step, e.steps)),
        Math.trunc(easeIn(e.startY, e.targetY, e.step, e.steps)),
      ),
      e.step <= e.steps
        ? (e.step += 1)
        : (this.chapterPanel.position.set(Math.trunc(e.targetX), Math.trunc(e.targetY)),
          (this.chapterMove = void 0))),
      this.chapterFadeOverlay &&
        (this.chapterFadeOverlay.alpha = Math.max(0, 1 - this.screenFrame / 10)),
      this.refreshChapterCursor(),
      !this.chapterSession.replay &&
        this.chapterIdleFrames++ >= CHAPTER_AUTOSELECT_FRAMES &&
        this.chooseChapter());
  }
  chooseChapter() {
    const e = this.chapterSession,
      t = this.chapterScreenRows()[this.chapterIndex];
    if (!(!e || !t)) {
      if (this.chapterIndex >= e.maxUnlocked) {
        ((this.chapterPopup = {
          title: 'Locked',
          message: 'Win more modes to unlock ...',
          icon: 6,
          state: newMessage(75),
        }),
          this.clearAllSourceInputs(),
          this.renderChapterPopup());
        return;
      }
      if ((this.stopCurrentMusic(), e.mode === 'versus')) {
        const i = Math.max(0, Math.trunc(t.script)),
          r =
            this.selectedPlayers.length >= 2
              ? this.selectedPlayers
              : [
                  newSelectPlayer(0, {
                    didJoin: !0,
                    character: 0,
                    controller: 0,
                  }),
                  newSelectPlayer(1, {
                    didJoin: !1,
                    character: 1,
                    controller: 1,
                  }),
                ];
        ((this.selectedPlayers = r.map((n, a) => ({
          ...n,
          didJoin: a === 0 ? !0 : n.didJoin,
          coins: i,
          selectList: [...n.selectList],
        }))),
          (this.gameChapter = Math.max(1, this.gameChapter)),
          this.beginUiScreenFade(() =>
            this.startHeroSelection('versus', {
              kind: 'scene',
              dataName: 'extra',
              script: 51,
            }),
          ));
        return;
      }
      if (e.mode === 'gallery' && t.poster) {
        this.beginUiScreenFade(() => this.openPoster(t.poster, 0, 'chapter', !0));
        return;
      }
      if (t.script === 99999) {
        (e.replay ||
          (e.mode === 'arcade' &&
            ((this.progress.arcadeWon = !0),
            (this.progress.arcadeChapter = t.number),
            (this.progress.arcadeMaxChapter = 99999)),
          e.mode === 'arena' &&
            ((this.progress.arenaWon = !0),
            (this.progress.arenaChapter = t.number),
            (this.progress.arenaMaxChapter = 99999)),
          this.saveProgress()),
          this.beginUiScreenFade(() =>
            this.openNovel(`${e.mode}-win`, e.replay ? 'chapter' : 'menu', !0),
          ));
        return;
      }
      if (((this.startScript = t.script), (this.gameChapter = t.number), e.heroAfterSelection)) {
        this.beginUiScreenFade(() =>
          this.startHeroSelection('arena', {
            kind: 'scene',
            dataName: 'arena',
            script: t.script,
          }),
        );
        return;
      }
      this.beginSceneTransition('load', t.script, e.dataName);
    }
  }
  async loadScene(e, t) {
    (this.clearAllSourceInputs(), this.clearSourceEndState());
    const i = ++this.sceneGeneration;
    ((this.sceneTransition = void 0), this.clearSceneTransitionHue());
    const r = this.sceneDefinition(e, t);
    ((this.sceneTitle = this.replaceTextVars(r.section.title ?? '')),
      (this.sceneSubtitle = r.section.subtitle ?? ''),
      (this.screen = 'loading'),
      (this.paused = !1),
      (this.screenFrame = 0),
      this.renderStaticScreen());
    const n = await this.prepareScene(r);
    i !== this.sceneGeneration || this.destroyed || this.activatePreparedScene(n, !1);
  }
  sceneDefinition(e, t) {
    const i = this.manifest.data[e]?.[`Script:${t}`];
    if (!i) throw new Error(`Missing sanitized ${e} script ${t}`);
    const r = (i['scene-images'] ?? '')
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);
    return {
      dataName: e,
      scriptId: t,
      section: i,
      sceneImages: r,
    };
  }
  sceneResourceIds(e) {
    const { section: t, sceneImages: i } = e,
      r = new Set([HEROES[this.heroIndex].id, 'fx', 'pickup']),
      n =
        this.selectedPlayers.length > 0
          ? this.selectedPlayers
          : [this.selectedPlayerState(1), this.selectedPlayerState(2)].filter((o) => o !== void 0);
    for (const o of n) {
      if (!o.didJoin) continue;
      const l = Math.max(0, Math.min(HEROES.length - 1, o.character)),
        c = HEROES[l].id;
      r.add(c);
      const h = o.color > 0 ? HERO_PALETTES[l]?.[o.color - 1] : void 0;
      o.characterActor && r.add(o.characterActor);
      if (
        (h && r.add(`${c}.${h}`),
        this.sourceMode === 'arena' ||
          this.sourceMode === 'survival' ||
          this.sourceMode === 'versus')
      ) {
        for (let u = 7; u < o.selectList.length; u += 1)
          if ((o.selectList[u] ?? 0) > 0 && ALLY_ACTOR_IDS[u]) {
            const d = ALLY_ACTOR_IDS[u];
            (r.add(d),
              this.recolorAllies &&
                r.add(`${d}.@${this.sourceMode === 'versus' ? n.indexOf(o) + 1 : 0}`));
          }
      }
    }
    const a = new Set(i);
    for (const [o, l] of Object.entries(t))
      if (o.startsWith('resources-'))
        for (const c of l.split(',')) {
          const h = c.trim();
          if (h.startsWith('sprite.')) r.add(h.slice(7));
          else {
            const u = /^image\.(?:block|rle)\.(.+)$/.exec(h)?.[1];
            u && a.add(u);
          }
        }
    for (const o of Object.entries(t)
      .filter(([l]) => l.startsWith('scene-foreground-'))
      .map(([, l]) => l.split(',')[0].trim())
      .filter(Boolean))
      a.add(o);
    return {
      atlasIds: r,
      imageIds: a,
    };
  }
  sceneResourcesPrepared(e) {
    const { atlasIds: t, imageIds: i } = this.sceneResourceIds(e);
    return [...t].every((r) => this.atlases.has(r)) && [...i].every((r) => this.images.has(r));
  }
  async prepareScene(e) {
    const { atlasIds: t, imageIds: i } = this.sceneResourceIds(e);
    return (
      await Promise.all([
        ...[...t].map((r) => this.ensureAtlas(r)),
        ...[...i].map((r) => this.ensureImage(r)),
      ]),
      e
    );
  }
  activatePreparedScene(e, t, i = !0) {
    (i && this.clearAllSourceInputs(),
      (this.dataName = e.dataName),
      (this.currentSection = e.section),
      (this.currentScript = e.scriptId),
      (this.startScript = e.scriptId),
      (this.sceneTitle = this.replaceTextVars(e.section.title ?? '')),
      (this.sceneSubtitle = e.section.subtitle ?? ''),
      this.resetScene(e.section, e.sceneImages),
      (this.screen = 'playing'),
      (this.screenFrame = 0),
      t
        ? this.pendingScripts.push({
            id: e.scriptId,
            line: 1,
          })
        : this.runScript(e.scriptId, 1),
      this.emitState(!0));
  }
  startSameScreenScene(e) {
    const t = this.sceneDefinition(this.dataName, e);
    ((this.sceneGeneration += 1),
      (this.sceneTransition = void 0),
      this.clearSceneTransitionHue(),
      this.activatePreparedScene(t, !0, !1));
  }
  beginSceneTransition(e, t, i = this.dataName) {
    const r = this.sceneDefinition(i, t),
      n = ++this.sceneGeneration;
    ((this.paused = !1), this.clearAllSourceInputs(), this.stopCurrentMusic());
    const a = {
      kind: e,
      dataName: i,
      scriptId: t,
      definition: r,
      generation: n,
      phase: 'fade-out',
      step: 0,
      steps: e === 'load' ? SPLASH_FAST_RATE : SPLASH_RATE,
      readyFrames: 0,
    };
    ((this.sceneTransition = a),
      this.applySceneTransitionHue(0),
      this.prepareScene(r)
        .then((o) => {
          this.sceneTransition === a &&
            n === this.sceneGeneration &&
            !this.destroyed &&
            (a.prepared = o);
        })
        .catch((o) => {
          this.sceneTransition === a && (a.error = o instanceof Error ? o : new Error(String(o)));
        }));
  }
  applySceneTransitionHue(e) {
    if (Math.abs(e) < 0.01) {
      this.root.filters = [];
      return;
    }
    if (typeof document > 'u') return;
    const t = (this.sceneTransitionFilter ??= new ColorMatrixFilter({
      padding: 0,
    }));
    this.setDisplayAdditiveHue(this.root, t, e);
  }
  clearSceneTransitionHue() {
    this.root.filters = [];
  }
  stepSceneTransition() {
    const e = this.sceneTransition;
    if (e) {
      if (e.error) throw ((this.sceneTransition = void 0), this.clearSceneTransitionHue(), e.error);
      if (e.phase === 'fade-out' || e.phase === 'loading-fade-out') {
        const t = e.steps <= 0 ? 1 : Math.min(1, e.step / e.steps);
        (this.applySceneTransitionHue(Math.trunc(-255 * t)),
          e.step >= e.steps
            ? (e.phase = e.phase === 'fade-out' ? 'switch' : 'activate')
            : (e.step += 1));
        return;
      }
      if (e.phase === 'switch') {
        if (e.kind === 'fade') {
          e.prepared ? this.activateSceneTransition(e) : (e.phase = 'waiting-assets');
          return;
        }
        ((this.sceneTitle = this.replaceTextVars(e.definition.section.title ?? '')),
          (this.sceneSubtitle = e.definition.section.subtitle ?? ''),
          (this.screen = 'loading'),
          (this.screenFrame = 0),
          (e.phase = 'loading'),
          (e.readyFrames = 0),
          this.clearSceneTransitionHue(),
          this.renderStaticScreen());
        return;
      }
      if (e.phase === 'waiting-assets') {
        e.prepared && this.activateSceneTransition(e);
        return;
      }
      if (e.phase === 'loading') {
        if (!e.prepared) return;
        (e.readyFrames === 0 && this.renderStaticScreen(),
          (e.readyFrames += 1),
          e.readyFrames >= 2 &&
            ((e.phase = 'loading-fade-out'),
            (e.step = 0),
            (e.steps = SPLASH_RATE),
            this.applySceneTransitionHue(0)));
        return;
      }
      e.phase === 'activate' && this.activateSceneTransition(e);
    }
  }
  activateSceneTransition(e) {
    const t = e.prepared;
    !t ||
      this.sceneTransition !== e ||
      ((this.sceneTransition = void 0),
      this.clearSceneTransitionHue(),
      this.activatePreparedScene(t, !1));
  }
  resetScene(e, t) {
    (this.clearActors(),
      this.sourceAllyTypes.clear(),
      (this.playerKills = 0),
      this.playerKillCounts.clear(),
      (this.playersChanged = !1),
      this.fighterControllers.clear(),
      this.scriptProcessorBumps.clear(),
      this.animalProcessors.clear(),
      this.clericProcessors.clear(),
      this.fairyProcessors.clear(),
      this.wispProcessors.clear(),
      this.circleProcessors.clear(),
      this.trackProcessors.clear(),
      (this.triggers.length = 0),
      (this.newTriggers.length = 0),
      (this.pendingScripts.length = 0),
      this.dialogs.clear(),
      this.dialogActors.clear(),
      this.dialogTexts.clear(),
      this.dialogCloseFrames.clear(),
      (this.caption = void 0),
      (this.mission = void 0),
      this.lines.clear(),
      (this.interstitial = void 0),
      (this.suspendedScript = void 0),
      (this.statsTransitionFrames = 0),
      (this.statsTransitionTotal = 0),
      (this.statsTransitionOpening = !1),
      (this.helpFrames = 0),
      (this.helpTotalFrames = 0),
      (this.helpClosingFrames = 0),
      (this.goFrames = 0),
      this.markerFrames.clear(),
      (this.quake = noQuake()),
      (this.hue = this.clearHueState(!0)),
      (this.sceneLayer.filters = []),
      (this.pendingSuperStart = void 0),
      (this.superActor = void 0),
      (this.pendingSuperEnd = void 0),
      (this.slowAmount = 0),
      (this.slowDecay = 0),
      (this.sourceUpdateRate = this.sourceGameRate()),
      (this.statusValue = 0),
      (this.playAbortRequested = !1),
      (this.playEscapeRequested = !1),
      (this.playHelpRequested = !1),
      (this.timer = 0),
      (this.timerTick = 0),
      (this.timerRunning = !1),
      (this.sceneDamage = !0),
      (this.sceneStops = []),
      (this.statsOn = !1),
      (this.statsVisible = !1),
      (this.hudStartDelay[0] = 0),
      (this.hudStartDelay[1] = 0),
      (this.hudStatMode[0] = 'start'),
      (this.hudStatMode[1] = 'start'),
      (this.hudChoice[0] = 0),
      (this.hudChoice[1] = 0),
      (this.hudChoiceTouched[0] = !1),
      (this.hudChoiceTouched[1] = !1),
      (this.hudLoadReady[0] = !1),
      (this.hudLoadReady[1] = !1),
      (this.hudLoadToken[0] += 1),
      (this.hudLoadToken[1] += 1));
    const [i = 263, r = SCREEN_HEIGHT] = toNumberList(e['scene-floor'], [263, SCREEN_HEIGHT]);
    ((this.floorTop = i + 4),
      (this.floorHeight = Math.max(1, r - i - 8)),
      (this.sceneWidth = Math.max(
        SCREEN_WIDTH,
        t.reduce((a, o) => a + (this.images.get(o)?.width ?? SCREEN_WIDTH), 0),
      )),
      (this.sceneMinX = 0),
      (this.sceneMaxX = this.sceneWidth - 1),
      (this.playerMinX = 0),
      (this.playerMaxX = this.sceneWidth - 1));
    for (let a = 1; e[`scene-block-${a}`]; a += 1) {
      const [o = 0, l = 0, c = 0, h = 0] = toNumberList(e[`scene-block-${a}`]);
      this.sceneStops.push({
        x1: o,
        y1: l,
        x2: o + c - 1,
        y2: l + h - 1,
      });
    }
    (this.applyCamera(
      createCamera({
        sceneWidth: this.sceneWidth,
        floorHeight: this.floorHeight,
        y: 8,
        sceneMinX: this.sceneMinX,
        sceneMaxX: this.sceneMaxX,
        playerMinX: this.playerMinX,
        playerMaxX: this.playerMaxX,
      }),
    ),
      this.backgroundLayer.removeChildren().forEach((a) => a.destroy()));
    let n = 0;
    for (const a of t) {
      const o = this.images.get(a);
      if (!o) continue;
      const l = new Sprite(o);
      (l.position.set(n, SCREEN_HEIGHT - SCENE_HEIGHT),
        (n += o.width),
        this.backgroundLayer.addChild(l));
    }
    this.foregroundLayer.removeChildren().forEach((a) => a.destroy());
    for (let a = 1; e[`scene-foreground-${a}`]; a += 1) {
      const [o, l = 'left', c = '0', h = '1'] = e[`scene-foreground-${a}`].split(','),
        u = this.images.get(o);
      if (!u) continue;
      const d = new Sprite(u);
      ((d.label = `foreground:${c}:${h}:${l}`), this.foregroundLayer.addChild(d));
    }
    (this.screenLayer.removeChildren().forEach((a) => a.destroy()),
      this.dialogLayer.removeChildren().forEach((a) => a.destroy()),
      this.fadeLayer.removeChildren().forEach((a) => a.destroy()),
      this.overlayLayer.removeChildren().forEach((a) => a.destroy()));
  }
  stepPlaying() {
    const e = this.pendingScripts.shift();
    if (e) {
      this.runScript(e.id, e.line);
      return;
    }
    (this.prepareSourceSceneFrame(),
      this.renderScene(),
      this.finishSourceSceneFrame(!0),
      this.processTriggers(),
      this.sourceMode === 'survival' && this.stepSurvival());
    const t = nextRouteAfterPlay({
      mode: this.sourceMode,
      gameStatus: this.statusValue,
      enemiesNull: this.nonplayerDead(!0),
      playersNull: this.sourceMode === 'versus' ? this.anyPlayerNull() : this.playersNull(),
      abortPressed: this.playAbortRequested,
      escapePressed: this.playEscapeRequested,
      helpPressed: this.playHelpRequested,
      gameReplay: this.chapterSession?.replay === !0,
      gameChapter: this.gameChapter,
    });
    ((this.playAbortRequested = !1),
      (this.playEscapeRequested = !1),
      (this.playHelpRequested = !1),
      t.resetIntroLoop && (this.introLoop = 0),
      this.applySourcePlayRoute(t.route));
  }
  /** Survival runs as long as the player does: clear the field, get another wave. */
  stepSurvival() {
    if (this.survivalResult) return;
    if (this.survivalWave > 0 && this.playersNull()) {
      this.endSurvivalRun();
      return;
    }
    // Seconds are counted the way the game's own timer counts them.
    ((this.survivalTick += 1),
      this.survivalTick > this.sourceGameRate() &&
        ((this.survivalSeconds += 1), (this.survivalTick = 0)));
    if (!this.enemiesDead(!0)) {
      this.survivalBreak = WAVE_BREAK_FRAMES;
      return;
    }
    // A breather once the field is clear, and never while a caption is still up.
    if (this.caption || this.survivalBreak > 0) {
      this.survivalBreak = Math.max(0, this.survivalBreak - 1);
      return;
    }
    this.startSurvivalWave();
  }
  /** The run is over: keep the score, put the summary up. */
  endSurvivalRun() {
    const e = this.progress.survivalBest ?? {
        waves: 0,
        seconds: 0,
      },
      t = this.survivalWave > e.waves,
      i = this.survivalSeconds > e.seconds;
    ((this.progress.survivalBest = {
      waves: Math.max(e.waves, this.survivalWave),
      seconds: Math.max(e.seconds, this.survivalSeconds),
    }),
      this.saveProgress(),
      this.audio.stopAll(),
      // Clear the fight's captions and floating lines so the summary stands alone.
      this.closeAllLines(),
      (this.caption = void 0),
      (this.mission = void 0),
      (this.survivalResult = {
        waves: this.survivalWave,
        seconds: this.survivalSeconds,
        bestWaves: this.progress.survivalBest.waves,
        bestSeconds: this.progress.survivalBest.seconds,
        record: t || i,
      }),
      this.playSound(SURVIVAL_DEATH_SOUND),
      this.renderHud());
  }
  finishSurvivalRun() {
    ((this.survivalResult = void 0), this.beginPlayExitFade());
  }
  /** Waves cleared and time survived, over on the right of the stats bar. */
  drawSurvivalStatus(e) {
    this.drawHudPrompt(
      `Wave ${this.survivalWave}   ${formatSurvivalTime(this.survivalSeconds)}`,
      SCREEN_WIDTH - 234 - 5,
      e,
      234,
    );
  }
  drawSurvivalResult() {
    const e = this.survivalResult;
    if (!e) return;
    const t = new Container(),
      { width: i, height: r, colors: n } = SURVIVAL_RESULT,
      a = Math.trunc((SCREEN_WIDTH - i) / 2),
      o = Math.trunc((SCREEN_HEIGHT - r) / 2),
      l = a + Math.trunc(i / 2),
      c = new Graphics(),
      h = (x, y, w, hh, color, alpha = 1) =>
        c.rect(x, y, w, hh).fill({
          color,
          alpha,
        });
    t.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 0.62,
      }),
    );
    (h(a, o, i, r, n.panel, 0.95),
      h(a + 1, o + 1, i - 2, SURVIVAL_RESULT.headerHeight, n.header, 0.95));
    // Frame: an outer line, an inner line, and gold corners like the game's own.
    (h(a, o, i, 1, n.border),
      h(a, o + r - 1, i, 1, n.border),
      h(a, o, 1, r, n.border),
      h(a + i - 1, o, 1, r, n.border),
      h(a + 3, o + 3, i - 6, 1, n.innerBorder),
      h(a + 3, o + r - 4, i - 6, 1, n.innerBorder),
      h(a + 3, o + 3, 1, r - 6, n.innerBorder),
      h(a + i - 4, o + 3, 1, r - 6, n.innerBorder));
    for (const [x, y] of [
      [a + 3, o + 3],
      [a + i - 13, o + 3],
      [a + 3, o + r - 4],
      [a + i - 13, o + r - 4],
    ])
      h(x, y, 10, 1, n.gold);
    for (const [x, y] of [
      [a + 3, o + 3],
      [a + i - 4, o + 3],
      [a + 3, o + r - 13],
      [a + i - 4, o + r - 13],
    ])
      h(x, y, 1, 10, n.gold);
    for (const y of SURVIVAL_RESULT.rules) h(a + 14, o + y, i - 28, 1, n.rule, 0.8);
    t.addChild(c);
    this.addSourceBitmap(t, 3, 'SURVIVAL OVER', l, o + SURVIVAL_RESULT.titleY, !0);
    // The two figures side by side, each over the record it is chasing.
    survivalResultColumns(e).forEach((u, d) => {
      const f = a + Math.trunc((i * (1 + 2 * d)) / 4);
      (this.addSourceBitmap(t, 1, u.label, f, o + SURVIVAL_RESULT.labelY, !0),
        this.addSourceBitmap(t, 2, u.value, f, o + SURVIVAL_RESULT.valueY, !0),
        this.addSourceBitmap(t, 1, u.best, f, o + SURVIVAL_RESULT.bestY, !0));
    });
    (e.record && this.addSourceBitmap(t, 5, 'A NEW BEST!', l, o + SURVIVAL_RESULT.recordY, !0),
      Math.floor(this.frame / 15) % 2 === 0 &&
        this.addSourceBitmap(
          t,
          0,
          'Press Any Button',
          l,
          o + (e.record ? SURVIVAL_RESULT.promptY : SURVIVAL_RESULT.promptOnlyY),
          !0,
        ),
      this.hudLayer.addChild(t));
  }
  startSurvivalWave() {
    this.survivalWave += 1;
    const e = this.survivalWave,
      t = Math.trunc(this.cameraX) + 24,
      i = Math.trunc(this.cameraX) + SCREEN_WIDTH - 24;
    survivalWave(e).forEach((r, n) => {
      // Alternate sides, spread them over the floor, and drop them in.
      const a = n % 2 === 0;
      this.runSceneCommand(r.boss ? 'scene-create-boss' : 'scene-create-fighter', [
        r.main,
        '0',
        r.main,
        String(r.level),
        String(r.aiLevel),
        '3',
        a ? '1' : '-1',
        String(a ? t : i),
        String(Math.trunc((this.floorHeight * (1 + (n % 4))) / 5)),
        '500',
        `w${e}-${n}`,
      ]);
    });
    (this.runSceneCommand('scene-run', []),
      this.runSceneCommand('scene-set-actor-process-ai', []),
      this.runSceneCommand('scene-caption-open', [String(WAVE_CAPTION_FRAMES), `WAVE ${e}`]),
      this.playSound('gling'));
  }
  applySourcePlayRoute(e) {
    if (e !== 'none') {
      if (e === 'help-keys') {
        this.helpFrames > 0 ? this.closeHelpKeys() : this.openHelpKeys();
        return;
      }
      if (e === 'pause') {
        this.togglePause();
        return;
      }
      if (e === 'splash') {
        this.beginPlaySplashFade();
        return;
      }
      if (e === 'end-arcade' || e === 'end-arena') {
        const t = e === 'end-arcade' ? 'arcade' : 'arena';
        this.startSourceEndScreen(t, this.statusValue === 1 && this.player?.isLiving() === !0);
        return;
      }
      if (e === 'show-chapters') {
        const t =
          this.progress.arcadeWon && this.progress.arenaWon
            ? 99999
            : this.progress.arcadeWon
              ? 19
              : 2;
        this.startChapterSession(
          {
            dataName: 'extra',
            background: 'sc-cast-roof-1a',
            mode: 'show',
            replay: !0,
            maxUnlocked: t,
            heroAfterSelection: !1,
          },
          Math.max(0, this.gameChapter - 1),
        );
        return;
      }
      if (e === 'movie-chapters') {
        (this.resetNewMode('arcade', 'arcade'),
          this.startChapterSession(
            {
              dataName: 'arcade',
              background: 'sc-cliff-1a',
              mode: 'arcade',
              replay: !0,
              maxUnlocked: this.progress.arcadeWon
                ? 99999
                : Math.max(1, this.progress.arcadeMaxChapter - 1),
              heroAfterSelection: !1,
            },
            Math.max(0, this.gameChapter - 1),
          ));
        return;
      }
      if (e === 'movie-skip') {
        this.finishSourceMovie();
        return;
      }
      if (e === 'movie-skip-question') {
        this.openPlayQuestion('Skip Movie', 'Are you sure?', 'Yes', 'No');
        return;
      }
      if (e === 'tutorial-exit') {
        this.beginPlayExitFade();
        return;
      }
      if (e === 'preview-exit') {
        this.openMenu();
        return;
      }
      e === 'end-versus' && this.startVersusEndFlow();
    }
  }
  beginPlaySplashFade() {
    this.playSplashFade ||
      (this.clearAllSourceInputs(),
      (this.playSplashFade = {
        step: 0,
        steps: 10,
        filter:
          typeof document > 'u'
            ? void 0
            : new ColorMatrixFilter({
                padding: 0,
              }),
      }));
  }
  stepPlaySplashFade() {
    const e = this.playSplashFade;
    if (e) {
      if (
        (e.audioFinalized || (this.stopCurrentMusic(), (e.audioFinalized = !0)), e.step <= e.steps)
      ) {
        const t = Math.trunc(255 * (e.step / Math.max(1, e.steps)));
        (e.filter && this.setDisplayAdditiveHue(this.root, e.filter, t), (e.step += 1));
        return;
      }
      ((this.root.filters = []), (this.playSplashFade = void 0), this.startSplash());
    }
  }
  openPlayQuestion(e, t, i, r) {
    ((this.playQuestion = {
      title: e,
      question: t,
      yes: i,
      no: r,
      state: newQuestion(i, null),
    }),
      this.clearAllSourceInputs(),
      this.playSound('click'),
      this.renderPlayQuestion());
  }
  stepPlayQuestion() {
    const e = this.playQuestion;
    if (!e) return;
    const t = stepQuestion(e.state, 'none');
    ((e.state = t.state),
      t.kind === 'dismiss' ? this.closePlayQuestion() : this.renderPlayQuestion());
  }
  handlePlayQuestionInput(e) {
    const t = this.playQuestion;
    if (!t) return;
    const i = stepQuestion(t.state, e);
    if (
      ((t.state = i.state),
      'sound' in i && i.sound && this.playSound(i.sound),
      i.kind === 'dismiss')
    ) {
      this.closePlayQuestion();
      return;
    }
    if (i.kind === 'choose') {
      const r = i.choice === 0;
      (this.closePlayQuestion(), r && this.finishSourceMovie());
      return;
    }
    this.renderPlayQuestion();
  }
  closePlayQuestion() {
    ((this.playQuestion = void 0),
      this.clearAllSourceInputs(),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ));
  }
  beginPlayExitFade() {
    this.playExitFade ||
      (this.stopCurrentMusic(),
      this.clearAllSourceInputs(),
      (this.playExitFade = {
        step: 0,
        next: 'menu',
        filter:
          typeof document > 'u'
            ? void 0
            : new ColorMatrixFilter({
                padding: 0,
              }),
      }));
  }
  stepPlayExitFade() {
    const e = this.playExitFade;
    if (e) {
      if (!brandDone(e.step)) {
        (e.filter && this.setDisplayAdditiveHue(this.root, e.filter, brandHue(e.step)),
          (e.step += 1));
        return;
      }
      ((this.root.filters = []),
        (this.playExitFade = void 0),
        (this.playQuestion = void 0),
        this.clearVersusEndFlow(),
        this.openMenu());
    }
  }
  sourceVersusPlayerSnapshot(e) {
    const t =
        this.selectedPlayers[e] ??
        newSelectPlayer(e, {
          didJoin: e === 0,
          character: e,
          controller: e,
        }),
      i = this.sourcePlayerActors.get(e + 1) ?? this.actors.find((r) => r.id === `p${e + 1}`);
    return {
      didJoin: t.didJoin,
      character: t.character,
      selectList: [...t.selectList],
      score: t.score,
      win: t.win,
      loss: t.loss,
      actor: i
        ? {
            hp: i.hp,
            totalHp: i.totalHp,
            score: i.score,
            kills: this.playerKillCounts.get(i) ?? (e === 0 ? this.playerKills : 0),
            statTime: this.timer,
          }
        : null,
    };
  }
  storeVersusPlayers(e) {
    this.selectedPlayers = e.map((t, i) => ({
      ...(this.selectedPlayers[i] ??
        newSelectPlayer(i, {
          didJoin: i === 0,
          character: t.character,
          controller: i,
        })),
      didJoin: t.didJoin,
      character: t.character,
      score: t.score,
      win: t.win,
      loss: t.loss,
      selectList: [...t.selectList],
    }));
  }
  startVersusEndFlow() {
    const e = newVersusEndFlow({
      gameChapter: this.gameChapter,
      players: [this.sourceVersusPlayerSnapshot(0), this.sourceVersusPlayerSnapshot(1)],
    });
    ((this.versusEndFlow = e.state),
      (this.versusEndInput = void 0),
      (this.versusEndEscape = !1),
      (this.screen = 'versus-end'),
      (this.screenFrame = 0),
      (this.paused = !1),
      this.clearAllSourceInputs(),
      this.storeVersusPlayers(e.state.result.players),
      this.applyVersusEndEffects(e.effects),
      this.renderVersusEndFlow());
  }
  stepVersusEndFlow() {
    const e = this.versusEndFlow;
    if (!e) return;
    const t = stepVersusEndFlow(e, {
      escapePressed: this.versusEndEscape,
      control: this.versusEndInput,
    });
    ((this.versusEndEscape = !1),
      (this.versusEndInput = void 0),
      (this.versusEndFlow = t.state),
      this.applyVersusEndEffects(t.effects),
      this.versusEndFlow && this.renderVersusEndFlow());
  }
  applyVersusEndEffects(e) {
    for (const t of e)
      if (t.type !== 'capture-scene')
        if (t.type === 'stop-music') this.stopCurrentMusic();
        else if (t.type === 'clear-music-reference') this.stopCurrentMusic();
        else if (t.type === 'play-audio') {
          const i = this.playSound(t.id);
          t.id === '005' && (this.versusEndOutcomeVoice = i);
        } else
          t.type === 'stop-outcome-audio'
            ? (this.audio.stopVoice(this.versusEndOutcomeVoice),
              (this.versusEndOutcomeVoice = void 0))
            : t.type === 'set-game-chapter'
              ? (this.gameChapter = t.value)
              : t.type === 'clear-inputs'
                ? (this.clearAllSourceInputs(),
                  (this.versusEndInput = void 0),
                  (this.versusEndEscape = !1))
                : t.type === 'clear-raw-key'
                  ? (this.versusEndEscape = !1)
                  : t.type === 'set-intro-loop'
                    ? (this.introLoop = t.value)
                    : t.type === 'route' && this.applyVersusEndRoute(t.route);
  }
  applyVersusEndRoute(e) {
    if (e.kind === 'main-menu') {
      this.beginPlayExitFade();
      return;
    }
    if (
      (this.storeVersusPlayers(e.players),
      this.clearVersusEndFlow(),
      (this.dataName = 'extra'),
      (this.mode = 'versus'),
      (this.sourceMode = 'versus'),
      e.kind === 'replay-return')
    ) {
      (this.clearAllSourceInputs(), this.startSameScreenScene(51));
      return;
    }
    ((this.selectedPlayers = this.selectedPlayers.map((t) => ({
      ...t,
      didJoin: !0,
      selectList: [...t.selectList],
    }))),
      this.startHeroSelection('versus', {
        kind: 'scene',
        dataName: 'extra',
        script: 51,
      }));
  }
  clearVersusEndFlow() {
    (this.audio.stopVoice(this.versusEndOutcomeVoice),
      (this.versusEndOutcomeVoice = void 0),
      (this.versusEndFlow = void 0),
      (this.versusEndInput = void 0),
      (this.versusEndEscape = !1),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ),
      this.screenLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ));
  }
  finishSourceMovie() {
    if (this.chapterSession?.replay) {
      this.applySourcePlayRoute('movie-chapters');
      return;
    }
    ((this.gameChapter += 1),
      (this.progress.arcadeChapter = this.gameChapter),
      this.progress.arcadeWon ||
        (this.progress.arcadeMaxChapter = Math.max(
          this.progress.arcadeMaxChapter,
          this.gameChapter,
        )),
      this.saveProgress());
    const e = parseChapters(this.manifest.data.arcade).filter((r) => r.script > 0),
      t = e.findIndex((r) => r.number === this.gameChapter),
      i = e[t];
    if (!i || i.script === 99999) {
      ((this.progress.arcadeWon = !0),
        (this.progress.arcadeMaxChapter = 99999),
        this.saveProgress(),
        this.openNovel('arcade-win', 'splash', !0));
      return;
    }
    (this.resetNewMode('arcade', 'arcade'),
      this.startChapterSession(
        {
          dataName: 'arcade',
          background: 'sc-cliff-1a',
          mode: 'arcade',
          replay: !1,
          maxUnlocked: Math.max(1, this.progress.arcadeMaxChapter),
          heroAfterSelection: !1,
        },
        Math.max(0, t),
      ));
  }
  commitSourceSceneFrame(e = !1) {
    (this.prepareSourceSceneFrame(), this.renderScene(), this.finishSourceSceneFrame(e));
  }
  prepareSourceSceneFrame() {
    (this.updateSuperState(),
      this.materializeReadyHudPlayers(),
      this.updateCamera(),
      (this.quake = stepQuake(this.quake)),
      this.admitPendingActors());
  }
  admitPendingActors() {
    if (this.pendingActors.length !== 0) {
      for (const e of this.pendingActors)
        (this.actors.push(e),
          e.role === 'player' && (this.playersChanged = !0),
          e.changeAction(e.actionId, !0));
      this.pendingActors.length = 0;
    }
  }
  finishSourceSceneFrame(e = !1) {
    (this.stepHudAfterDraw(),
      this.stepHue(),
      !this.processActors(e) &&
        (this.stepMessages(),
        this.statsTransitionFrames > 0 &&
          (!this.statsTransitionOpening &&
            this.statsTransitionFrames === 11 &&
            this.closeAllLines(),
          (this.statsTransitionFrames -= 1)),
        this.helpClosingFrames > 0
          ? ((this.helpClosingFrames -= 1), this.helpClosingFrames === 0 && (this.helpFrames = 0))
          : this.helpFrames > 0 && (this.helpFrames -= 1),
        this.timerRunning &&
          this.timer >= 0 &&
          (this.statsVisible || this.statsTransitionFrames > 0) &&
          ((this.timerTick += 1),
          this.timerTick > this.sourceGameRate() + 1 && ((this.timer -= 1), (this.timerTick = 0)),
          this.timer < 0 && (this.timer = 0)),
        this.stepSlowRate()));
  }
  stepHudAfterDraw() {
    if (this.sourceMode === 'demo' || this.sourceMode === 'show') this.stepHudStartBlink(0);
    else if (!['arcade', 'arena', 'preview'].includes(this.sourceMode)) {
      for (const e of [0, 1])
        if (!this.actor(`p${e + 1}`)) {
          if (this.hudStatMode[e] === 'start') this.stepHudStartBlink(e);
          else if (this.hudStatMode[e] === 'choose') {
            if (this.hudChoiceTouched[e]) {
              this.hudChoiceTouched[e] = !1;
              continue;
            }
            if (
              ((this.hudStartDelay[e] += 1), this.hudStartDelay[e] > this.sourceGameRate() * 10)
            ) {
              const t = this.selectedPlayers[e];
              (t && (t.didJoin = !1),
                (this.hudStartDelay[e] = 0),
                (this.hudStatMode[e] = 'start'),
                this.playSound('blip'));
            }
          }
        }
    }
    if (this.miniStats)
      for (const e of this.actors)
        !this.shouldDrawMiniStat(e) || e.miniStatFrames <= 0 || (e.miniStatFrames -= 1);
  }
  stepHudStartBlink(e) {
    ((this.hudStartDelay[e] -= 1),
      this.hudStartDelay[e] <= 0 && (this.hudStartDelay[e] = this.sourceGameRate() * 8));
  }
  handleHudControllerRelease(e) {
    if (
      this.statsHudOffset() === void 0 ||
      ['arcade', 'arena', 'demo', 'show', 'preview'].includes(this.sourceMode)
    )
      return !1;
    for (const t of [0, 1]) {
      if (this.actor(`p${t + 1}`)) continue;
      const i = this.hudStatMode[t];
      if (i === 'loading') continue;
      if (i === 'start') {
        if (
          (![0, 1].some((d) => this.actor(`p${d + 1}`)?.isLiving()) && t !== 0) ||
          [0, 1].some((d) =>
            d === t || !this.actor(`p${d + 1}`)?.isLiving()
              ? !1
              : this.selectedPlayers[d]?.controller === e.index,
          ) ||
          !e.buttons.some(Boolean)
        )
          continue;
        const u = this.selectedPlayers[t] ?? this.selectedPlayerState(t + 1);
        return (
          (this.selectedPlayers[t] = newSelectPlayer(t, {
            ...u,
            didJoin: !0,
            controller: e.index,
            selectList: [...(u?.selectList ?? newSelectPlayer(t).selectList)],
          })),
          (this.hudStartDelay[t] = 0),
          (this.hudStatMode[t] = 'choose'),
          (this.hudChoiceTouched[t] = !0),
          this.playSound('click'),
          !0
        );
      }
      const r = this.selectedPlayers[t];
      if (!r || r.controller !== e.index) continue;
      const n = e.x < 0 || e.y < 0 ? -1 : e.x > 0 || e.y > 0 ? 1 : 0;
      if (n !== 0) {
        const c = this.progress.arcadeMaxChapter >= 99999;
        let h = (this.hudChoice[t] + n + HEROES.length) % HEROES.length;
        return (
          !c && h === 2 && (h = n < 0 ? 1 : 0),
          (this.hudChoice[t] = h),
          (this.hudStartDelay[t] = 0),
          (this.hudChoiceTouched[t] = !0),
          this.playSound('click'),
          !0
        );
      }
      const a =
        e.buttons[3] || (e.buttons[0] && e.buttons[1] && e.buttons[2])
          ? 3
          : e.buttons[2]
            ? 2
            : e.buttons[1]
              ? 1
              : e.buttons[0] || e.buttons.slice(4).some(Boolean)
                ? 0
                : -1;
      if (a < 0) continue;
      let o = a;
      const l = this.hudChoice[t];
      for (const c of [0, 1]) {
        if (c === t || !this.actor(`p${c + 1}`)?.isLiving()) continue;
        const h = this.selectedPlayers[c];
        h?.character === l &&
          h.color === o &&
          ((o += 1), o > (HERO_PALETTES[l]?.length ?? 0) && (o = 0));
      }
      return (
        (r.didJoin = !0),
        (r.character = l),
        (r.color = o),
        (this.hudStatMode[t] = 'loading'),
        (this.hudStartDelay[t] = 0),
        (this.hudChoiceTouched[t] = !1),
        this.playSound('click'),
        this.beginHudPlayerLoad(t),
        !0
      );
    }
    return !1;
  }
  beginHudPlayerLoad(e) {
    const t = this.selectedPlayers[e];
    if (!t) return;
    const i = Math.max(0, Math.min(HEROES.length - 1, t.character)),
      r = HEROES[i].id,
      n = t.color > 0 ? HERO_PALETTES[i]?.[t.color - 1] : void 0,
      a = ++this.hudLoadToken[e];
    ((this.hudLoadReady[e] = !1),
      Promise.all([this.ensureAtlas(r), ...(n ? [this.ensureAtlas(`${r}.${n}`)] : [])])
        .then(() => {
          this.destroyed ||
            a !== this.hudLoadToken[e] ||
            this.hudStatMode[e] !== 'loading' ||
            (this.hudLoadReady[e] = !0);
        })
        .catch(() => {
          a === this.hudLoadToken[e] &&
            ((t.didJoin = !1),
            (this.hudStatMode[e] = 'start'),
            (this.hudStartDelay[e] = 0),
            this.playSound('error'));
        }));
  }
  materializeReadyHudPlayers() {
    for (const e of [0, 1]) {
      if (this.hudStatMode[e] !== 'loading' || !this.hudLoadReady[e] || this.actor(`p${e + 1}`))
        continue;
      ((this.hudLoadReady[e] = !1), (this.hudStatMode[e] = 'start'));
      const t = e === 0 ? 1 : -1,
        i = e === 0 ? 3 : SCREEN_WIDTH - 234 - 5,
        r = Math.trunc(this.cameraX) + i + Math.trunc(234 / 2) + t * 20;
      this.playSound('gling');
      const n = this.createChosenPlayer(e + 1, [
        String(t),
        String(r),
        String(Math.trunc(this.floorHeight / 2)),
        '400',
      ]);
      n && this.setActorProcess(n, 'ai');
    }
  }
  runSourceSceneFrame(e = !1) {
    (this.prepareSourceSceneFrame(), this.finishSourceSceneFrame(e));
  }
  setSlow(e, t) {
    this.slowEnabled && ((this.slowAmount = Math.max(0, e)), (this.slowDecay = Math.max(0, t)));
  }
  stepSlowRate() {
    if (this.slowAmount <= 0) return;
    this.slowAmount *= this.slowDecay;
    const e = Math.trunc(this.slowAmount);
    e === 0
      ? ((this.slowAmount = 0),
        (this.slowDecay = 0),
        (this.sourceUpdateRate = this.sourceGameRate()))
      : (this.sourceUpdateRate = Math.max(1, this.sourceGameRate() - e));
  }
  processPlayerInput(e) {
    if (!e?.isLiving() || e.process !== 'player' || !e.action()?.onKeyboard) return;
    const t = e.id === 'p2' ? 2 : 1,
      i = this.selectedPlayerState(t)?.controller ?? t - 1;
    let r = readInput(this.keys, i, this.settings.keyboardMaps[i], this.settings.buttonMaps[i]),
      n = this.playerInputStates.get(e);
    return (
      n ||
        ((n = {
          queue: [0, 0, 0, 0],
          zeroRepeat: 0,
          didDouble: !1,
        }),
        this.playerInputStates.set(e, n)),
      r === Input.NOTHING
        ? ((n.zeroRepeat += 1),
          n.zeroRepeat >= 3 && (this.pushInput(n, Input.NOTHING), (n.zeroRepeat = 0)))
        : r !== n.queue[0] && (this.pushInput(n, r), (n.zeroRepeat = 0)),
      n.queue[0] === Input.FORWARD &&
      n.queue[1] === 0 &&
      n.queue[2] === Input.FORWARD &&
      n.queue[3] === 0
        ? ((r = Input.RUN_FORWARD), (n.queue[0] = -1), (n.didDouble = !0))
        : n.queue[0] === Input.BACKWARD &&
            n.queue[1] === 0 &&
            n.queue[2] === Input.BACKWARD &&
            n.queue[3] === 0
          ? ((r = Input.RUN_BACKWARD), (n.queue[0] = -1), (n.didDouble = !0))
          : n.queue[0] === Input.UP &&
              n.queue[1] === 0 &&
              n.queue[2] === Input.UP &&
              n.queue[3] === 0
            ? ((r = Input.HOP_UP), (n.queue[0] = -1), (n.didDouble = !0))
            : n.queue[0] === Input.DOWN &&
                n.queue[1] === 0 &&
                n.queue[2] === Input.DOWN &&
                n.queue[3] === 0
              ? ((r = Input.HOP_DOWN), (n.queue[0] = -1), (n.didDouble = !0))
              : n.didDouble && ((n.queue[0] = -1), (n.didDouble = !1)),
      r
    );
  }
  pushInput(e, t) {
    e.queue = [t, e.queue[0], e.queue[1], e.queue[2]];
  }
  processActors(e = !1) {
    const t = [...this.actors].filter((r) => !r.removed);
    for (const r of t)
      ((r.damageEnabled = this.sceneDamage),
        (r.worldMinX = this.playerMinX),
        (r.worldMaxX = this.playerMaxX),
        (r.worldFloor = this.floorHeight),
        this.enterActorAction(r));
    for (const r of t) this.outputAttack(r, !0, t);
    const i = this.superActor
      ? t.filter((r) => r === this.superActor || r.type.actorType === 2)
      : t;
    for (const r of i) {
      if (r.removed) continue;
      const n = r.action(),
        a = r.frame();
      a?.audio &&
        r.lastAudioFrame !== a.id &&
        (this.playCameraSoundAt(a.audio, r.x), (r.lastAudioFrame = a.id));
      const o = r.updateAnimation();
      r.stepQuake();
      const l = this.resolveActorMotion(r),
        c = r.role !== 'none' && !r.isRetreating && !r.outside ? this.playerMinX : -99999,
        h = r.role !== 'none' && !r.isRetreating && !r.outside ? this.playerMaxX : 99999,
        u = r.processType === 'script' ? 99999 : this.floorHeight,
        d = r.applyMotion(c, h, u, l.x, l.y);
      r.outside && r.x >= this.playerMinX && r.x <= this.playerMaxX && (r.outside = !1);
      let f = o;
      d !== -1 && (f = d);
      const m = this.fighterControllers.get(r)?.state(),
        p = this.clericProcessors.get(r),
        g = m?.following ? m.target : p?.doFollow ? r.target : void 0;
      if (g && n?.actionType === 0 && Math.abs(r.x - g.x) > 9) {
        const S = r.x > g.x ? -1 : 1;
        (r.face !== S && n.onStopped !== -1 && (f = n.onStopped), (r.face = S));
      }
      r.didContact && n?.onContact !== void 0 && n.onContact >= 0 && (f = n.onContact);
      const v = this.pendingActorInputs.filter((S) => S.target === r),
        x = [];
      let b = !1;
      for (const S of v) {
        const w = this.resolveHit(S.attacker, r, S.frame, !0, S);
        w.accepted &&
          (w.nextAction >= 0 && (f = w.nextAction),
          w.absorbed && (b = !0),
          S.frame.damageVector.length && x.push(S));
      }
      b && (x.length = 0);
      for (let S = this.pendingActorInputs.length - 1; S >= 0; S -= 1)
        this.pendingActorInputs[S].target === r && this.pendingActorInputs.splice(S, 1);
      if (l.bumped) {
        this.notifyProcessorBumped(r);
        const S = n?.onStopped ?? -1;
        (S !== -1 && (f = S), (r.aiWait = Math.max(r.aiWait, 4)));
      }
      if (
        (r.bonusLife > 0 && r.hp <= 0 && ((f = this.resurrectActor(r)), (x.length = 0)), f !== -1)
      )
        (this.updateDedicatedProcessor(r), r.changeAction(f));
      else if (r.process === 'script') {
        const S = this.scriptProcessorBumps.delete(r),
          w = r.script?.mode,
          A =
            w === 'action' ||
            (w === 'wait-action' && (r.actionId === r.stance().onStand || r.removed));
        S && !A ? r.keyboard(Input.NOTHING) : r.updateScript((E) => this.actor(E));
      } else if (r.process === 'ai' && (r.isLiving() || isAutoController(r.controllerKind)))
        this.processAi(r);
      else if (r.process === 'player' && e) {
        r.failureWait > 0 && (r.failureWait -= 1);
        const S = this.processPlayerInput(r);
        S !== void 0 && r.keyboard(S);
      }
      this.enterActorAction(r);
      for (const S of x) r.applyHitVector(S.attacker, S.frame) && this.notifyProcessorBumped(r);
      r.processType === 'ai' && r.regenerate();
      const _ = this.superActor ? void 0 : r.stepComboClock(this.sourceMode !== 'tutorial');
      if (
        (_ !== void 0 && this.awardCombo(r, _),
        r.hp <= 0 && (r.deadFrames += 1),
        this.pendingSuperStart)
      )
        break;
    }
    for (const r of t) this.flushActorFeedback(r);
    if (this.pendingSuperStart) return ((this.playersChanged = !1), !0);
    for (let r = this.pendingActorInputs.length - 1; r >= 0; r -= 1)
      this.pendingActorInputs[r].target.removed && this.pendingActorInputs.splice(r, 1);
    for (let r = this.actors.length - 1; r >= 0; r -= 1) {
      const n = this.actors[r];
      n.removed &&
        (this.actionSeen.delete(n),
        this.fighterControllers.delete(n),
        this.scriptProcessorBumps.delete(n),
        this.animalProcessors.delete(n),
        this.clericProcessors.delete(n),
        this.fairyProcessors.delete(n),
        this.wispProcessors.delete(n),
        this.circleProcessors.delete(n),
        this.trackProcessors.delete(n),
        this.playerInputStates.delete(n),
        n.role === 'player' && (this.playersChanged = !0),
        this.actors.splice(r, 1));
    }
    if (this.playersChanged && this.sourceMode !== 'versus') {
      const r = [...this.sourcePlayerActors.values()].filter((a) => a.hp > 0).length,
        n = this.sourcePlayerActors.get(1)?.align ?? this.player?.align;
      if (n !== void 0)
        for (const a of this.actors) {
          const o =
            a.align !== -1 &&
            a.role !== 'none' &&
            a.role !== 'pickup' &&
            n !== -1 &&
            (a.align === 0 || a.align !== n);
          a.role === 'player' || !o || a.recalculateStats(a.level, r);
        }
    }
    return (
      (this.playersChanged = !1),
      (this.focusEnemy = this.actors.find((r) => r.isLiving() && this.player?.isEnemy(r))),
      !1
    );
  }
  flushActorFeedback(e) {
    const t = e.consumeFeedback();
    if (
      (t.rageDepleted && this.playSound('tong'),
      t.superLevelGained &&
        (this.playSound('tong'),
        this.hueActorForHit(e, 32, this.actorMagicSpl(e)),
        e.role === 'player' &&
          (this.setSlow(10 * e.spl, 0.85),
          this.openLine(this.playerLineIndex(e), `Go Super${e.spl > 1 ? ` ${e.spl}x` : ''}!`))),
      !t.resourceFailure || e.role !== 'player')
    )
      return;
    const i = e.id === 'p2' ? 1 : 0;
    (this.openLine(i, t.resourceFailure === 'magic' ? 'Magic Exceeded!' : 'Super Exceeded!'),
      t.resourceFailure === 'super' && this.playSound('ting'));
  }
  enterActorAction(e) {
    if (this.actionSeen.get(e) === e.actionSerial) return;
    this.actionSeen.set(e, e.actionSerial);
    const t = e.action();
    t &&
      (this.applyActorActionEffect(e),
      t.audioStop && this.audio.stopVoice(e.currentActionAudio),
      t.audio && (e.currentActionAudio = this.playCameraSoundAt(t.audio, e.x)),
      t.typeCall >= 0 && this.spawnActionActors(e, t.typeCall, t.typeCallParticle),
      this.applyActionSceneEffect(e),
      t.sceneCall === 1 && e.jump < 1 && this.spawnActionDust(e));
  }
  actorMagicSpl(e) {
    return e.calculateMagicSpl();
  }
  actorMagicHue(e, t) {
    const i = t ?? this.actorMagicSpl(e);
    return HUE_RAMP[Math.max(0, Math.min(HUE_RAMP.length - 1, i))];
  }
  hueActorWithMagic(e, t, i) {
    const r = this.actorMagicHue(e, i);
    e.setHue(
      Math.trunc(15 * t),
      Math.trunc(r.r / 3) * t,
      Math.trunc(r.g / 3) * t,
      Math.trunc(r.b / 3) * t,
    );
  }
  hueActorForHit(e, t, i) {
    const r =
      i < 0
        ? {
            r: 100,
            g: 0,
            b: 0,
          }
        : this.actorMagicHue(e, i);
    e.setHue(t, Math.trunc(r.r / 3), Math.trunc(r.g / 3), Math.trunc(r.b / 3));
  }
  applyActorActionEffect(e) {
    const t = e.action();
    !t ||
      (t.actionEffect !== 2 && t.actionEffect !== 3) ||
      (t.actionEffect === 2 && this.playCameraSoundAt('failure', e.x),
      t.bodyType === 0 &&
        this.spawnBloodParticles(
          void 0,
          -1,
          0,
          e.x,
          e.y,
          e.jump + 80,
          e.face,
          t.actionEffect === 2 ? 3 : 6,
          1,
          1,
        ),
      this.hueActorWithMagic(e, 1));
  }
  setMagicScreenHue(e, t, i) {
    if (t <= 0 || this.superActor) return;
    const r = this.actorMagicHue(e, i);
    this.setHue(
      t,
      {
        r: r.r / 2,
        g: r.g / 2,
        b: r.b / 2,
      },
      {
        r: 0,
        g: 0,
        b: 0,
      },
    );
  }
  applyActionSceneEffect(e) {
    const t = e.action();
    if (t) {
      if (
        t.sceneEffect === 1 ||
        t.sceneEffect === 5 ||
        (t.sceneEffect === 2 && (e.role === 'player' || e.role === 'boss'))
      ) {
        (!this.superActor && t.sceneQuakeSize > 0 && (this.quake = startQuake(t.sceneQuakeSize)),
          this.setMagicScreenHue(e, t.sceneHueSteps, t.sceneEffect === 5 ? 3 : void 0));
        return;
      }
      if (t.sceneEffect === 3) {
        (this.hueActorWithMagic(e, 2),
          !this.superActor &&
            !this.pendingSuperStart &&
            e.x >= this.cameraX - 128 &&
            e.x <= this.cameraX + SCREEN_WIDTH + 128 &&
            (this.pendingSuperStart = e),
          this.spawnSuperSpark(e),
          e.role === 'player'
            ? this.openLine(this.playerLineIndex(e), `${t.title}!`)
            : e.role === 'boss' &&
              this.sourceMode === 'arcade' &&
              (this.player && (this.player.whoIHit = e), this.openLine(99999, `${t.title}!`)));
        return;
      }
      t.sceneEffect === 4 &&
        (this.pendingSuperEnd = {
          actor: e,
          quake: t.sceneQuakeSize,
          hueSteps: t.sceneHueSteps,
        });
    }
  }
  updateSuperState() {
    if (this.pendingSuperStart) {
      const i = this.pendingSuperStart;
      if (((this.pendingSuperStart = void 0), i.removed)) return;
      ((this.superActor = i),
        (this.pendingSuperEnd = void 0),
        this.setSlow(15, 0.85),
        this.setHue(
          10,
          {
            r: 0,
            g: 0,
            b: 0,
          },
          {
            r: -255,
            g: -255,
            b: -255,
          },
        ),
        (this.superMusicSnapshot = this.suspendCurrentMusic()));
      return;
    }
    if (!this.pendingSuperEnd) {
      if (this.superActor?.removed) {
        this.superActor = void 0;
        const i = this.superMusicSnapshot;
        ((this.superMusicSnapshot = void 0), i && this.restoreMusicSnapshot(i));
      }
      return;
    }
    const e = this.pendingSuperEnd;
    ((this.pendingSuperEnd = void 0),
      (this.superActor = void 0),
      (this.hue = this.clearHueState(!1)),
      this.setSlow(8, 0.85),
      e.quake > 0 && (this.quake = startQuake(e.quake)),
      this.setMagicScreenHue(e.actor, e.hueSteps));
    const t = this.superMusicSnapshot;
    ((this.superMusicSnapshot = void 0), t && this.restoreMusicSnapshot(t));
  }
  spawnSuperSpark(e) {
    const t = this.addActor({
      id: `super-spark-${e.id}-${this.frame}`,
      main: 'fx',
      sprite: 'fx',
      type: 9,
      level: 1,
      aiLevel: 1,
      align: -1,
      face: 1,
      x: e.x,
      y: e.y + 1,
      jump: e.jump,
      role: 'none',
      process: 'ai',
      controllerKind: 'script',
    });
    t &&
      ((t.parent = e.parent),
      (t.spl = t.usedSpl = this.actorMagicSpl(e)),
      (t.speedX = -2),
      (t.speedJump = 2));
  }
  spawnActionDust(e) {
    for (let t = 0; t < 3; t += 1) {
      const i = this.addActor({
        id: `dust-${e.id}-${this.frame}-${t}`,
        main: 'fx',
        sprite: 'fx',
        type: 1,
        level: 1,
        aiLevel: 1,
        align: -1,
        face: e.face,
        x: e.x,
        y: e.y - 10 + Math.random() * 20,
        jump: 0,
        role: 'none',
        process: 'ai',
        controllerKind: 'script',
      });
      i &&
        ((i.speedX = -(e.face + Math.random() * 3)), (i.speedY = Math.random()), (i.speedJump = 1));
    }
  }
  preflightActorAction(e, t) {
    const i = e.action(t);
    if (
      !i ||
      e.processType !== 'ai' ||
      i.onStopped === -1 ||
      i.bodyType === -1 ||
      e.type.walkThrough ||
      i.moveType !== 0 ||
      i.move.length === 0
    )
      return t;
    const r = (i.move[0] ?? 0) * e.face,
      n = i.move[1] ?? 0,
      a = e.groundRect(e.x + r, e.y),
      o = e.groundRect(e.x, e.y + n);
    for (const u of this.sceneStops) {
      let d = !1;
      const f = Math.trunc((e.type.solid[0] ?? 0) / 2),
        m = e.type.solid[1] ?? 0,
        p = Math.trunc(m * 0.75),
        g = p + Math.trunc(m * 0.25) + 1;
      if (
        (boxesOverlap(a, u) && ((e.x = e.speedX > 0 ? u.x1 - f - 1 : u.x2 + f + 1), (d = !0)),
        boxesOverlap(o, u) && ((e.y = e.speedY > 0 ? u.y1 - g * 0.25 : u.y2 + p + 1), (d = !0)),
        d)
      )
        return (this.notifyProcessorBumped(e), (e.aiWait = Math.max(e.aiWait, 4)), i.onStopped);
    }
    const l = e.groundRect(),
      c = e.groundRect(e.x + r, e.y + n);
    return this.actors.some(
      (u) =>
        u !== e &&
        !u.removed &&
        u.processType !== 'script' &&
        u.action()?.bodyType !== -1 &&
        !u.type.walkThrough &&
        !boxesOverlap(l, u.groundRect()) &&
        boxesOverlap(c, u.groundRect()),
    )
      ? (this.notifyProcessorBumped(e), (e.aiWait = Math.max(e.aiWait, 4)), i.onStopped)
      : t;
  }
  resolveActorMotion(e) {
    let t = e.speedX,
      i = e.speedY,
      r = !1;
    if (e.processType === 'script' || e.type.walkThrough || !e.groundRect())
      return {
        x: t,
        y: i,
        bumped: r,
      };
    const n = Math.trunc((e.type.solid[0] ?? 0) / 2),
      a = e.type.solid[1] ?? 0,
      o = Math.trunc(a * 0.75),
      c = (o + Math.trunc(a * 0.25) + 1) * 0.25,
      h = e.groundRect(e.x + t, e.y),
      u = e.groundRect(e.x, e.y + i);
    for (const p of this.sceneStops)
      if (
        (boxesOverlap(h, p) && ((e.x = t > 0 ? p.x1 - n - 1 : p.x2 + n + 1), (t = 0), (r = !0)),
        boxesOverlap(u, p) && ((e.y = i > 0 ? p.y1 - c : p.y2 + o + 1), (i = 0), (r = !0)),
        r)
      )
        break;
    if (e.action()?.bodyType === -1)
      return {
        x: t,
        y: i,
        bumped: r,
      };
    if (
      this.actors.some(
        (p) =>
          p !== e &&
          !p.removed &&
          p.processType !== 'script' &&
          p.action()?.bodyType !== -1 &&
          !p.type.walkThrough &&
          boxesOverlap(e.airRect(), p.airRect()) &&
          boxesOverlap(e.groundRect(), p.groundRect()),
      ) ||
      (t === 0 && i === 0 && e.speedJump === 0)
    )
      return {
        x: t,
        y: i,
        bumped: r,
      };
    const m = e.airRect(e.x + t, e.y + i, e.jump);
    for (const p of this.actors) {
      if (
        p === e ||
        p.removed ||
        p.processType === 'script' ||
        p.action()?.bodyType === -1 ||
        p.type.walkThrough ||
        !boxesOverlap(m, p.airRect())
      )
        continue;
      const g = p.groundRect();
      (t !== 0 &&
        boxesOverlap(e.groundRect(e.x + t, e.y), g) &&
        ((e.x = t > 0 ? g.x1 - n - 1 : g.x2 + n + 1), (t = 0), (r = !0)),
        i !== 0 &&
          boxesOverlap(e.groundRect(e.x, e.y + i), g) &&
          ((e.y = i > 0 ? g.y1 - c : g.y2 + o + 1), (i = 0), (r = !0)));
    }
    return {
      x: t,
      y: i,
      bumped: r,
    };
  }
  processAi(e) {
    if (e.controllerKind === 'animal') {
      let r = this.animalProcessors.get(e);
      r || ((r = newAllyMemory()), this.animalProcessors.set(e, r));
      const n = stepAllyAi(e, r, this.groundProcessorWorld());
      n !== void 0 && e.keyboard(n);
      return;
    }
    if (e.controllerKind === 'cleric') {
      let r = this.clericProcessors.get(e);
      r || ((r = newAnimalMemory(e)), this.clericProcessors.set(e, r));
      const n = stepAnimalAi(e, r, this.groundProcessorWorld());
      n !== void 0 && e.keyboard(n);
      return;
    }
    if (e.controllerKind === 'fairy') {
      let r = this.fairyProcessors.get(e);
      if (
        (r || ((r = newWispMemory(e)), this.fairyProcessors.set(e, r)), r.nextAction !== void 0)
      ) {
        const a = r.nextAction;
        ((r.nextAction = void 0), trackLeader(e, r), e.changeAction(a));
        return;
      }
      const n = stepWispAi(e, r);
      n !== void 0 && e.keyboard(n);
      return;
    }
    if (e.controllerKind === 'wisp') {
      let r = this.wispProcessors.get(e);
      r || ((r = newTrackMemory()), this.wispProcessors.set(e, r));
      const n = stepTrackAi(e, this.actors, r);
      n !== void 0 && e.keyboard(n);
      return;
    }
    if (e.controllerKind === 'circle') {
      let r = this.circleProcessors.get(e);
      r || ((r = newFollowMemory(e)), this.circleProcessors.set(e, r));
      const n = stepCircleAi(e, r, this.actors);
      n !== void 0 && e.keyboard(n);
      return;
    }
    if (e.controllerKind === 'track') {
      let r = this.trackProcessors.get(e);
      r || ((r = newFairyMemory(this.trackBonusType(e))), this.trackProcessors.set(e, r));
      const n = stepFairyAi(e, r);
      n !== void 0 && e.keyboard(n);
      return;
    }
    if (e.role === 'none' && e.leader) {
      if (!e.leader.isLiving()) {
        e.removed = !0;
        return;
      }
      ((e.x = e.leader.x),
        (e.y = e.leader.y - 1),
        (e.jump = e.leader.jump),
        (e.face = e.leader.face),
        (e.speedX = e.speedY = e.speedJump = 0));
      return;
    }
    if (e.role === 'object' || e.role === 'pickup' || e.role === 'none') {
      e.keyboard(Input.NOTHING);
      return;
    }
    let t = this.fighterControllers.get(e);
    t || ((t = new EnemyAi(e)), this.fighterControllers.set(e, t));
    const i = t.step(
      {
        actors: this.actors.filter((r) => !r.removed),
        bounds: {
          playerMinX: this.playerMinX,
          playerMaxX: this.playerMaxX,
          sceneMinX: this.sceneMinX,
          sceneMaxX: this.sceneMaxX,
          sceneWidth: this.sceneWidth,
          floorHeight: this.floorHeight,
        },
        isSpotClear: (r, n, a) => this.isAiSpotClear(r, n, a),
        isPathClear: (r, n, a, o) => this.isAiPathClear(r, n, a, o),
        isLivingEnemy: (r, n) => n.isLiving() && r.isEnemy(n),
        isInCamera: (r) => r.x >= this.cameraX && r.x <= this.cameraX + SCREEN_WIDTH,
        isYInRange: (r, n) => {
          const a = r.frame();
          return !!(a?.attack && r.canDepthHit(n, a));
        },
        canPerform: (r, n) => {
          const a = r.action(r.action()?.onKeyboard?.[n] ?? -1);
          return !!(
            a &&
            (a.cost[0] ?? 0) <= r.hp &&
            (a.cost[1] ?? 0) <= r.mp &&
            (a.cost[2] ?? 0) <= r.spl
          );
        },
        canRangeHit: (r, n, a) => this.aiRangeHits(r, n, a),
        attackRange: (r, n) => this.aiAttackRange(r, n),
        countEnemiesHit: (r, n) =>
          this.actors.filter((a) => a.isLiving() && r.isEnemy(a) && this.aiRangeHits(r, a, n))
            .length,
        vulnerability: (r) => r.action()?.vulnerability ?? 0,
        isStanding: (r) => r.actionId === r.stance().onStand,
        isWarned: (r) => !!r.whoHitMe?.isLiving(),
      },
      e.action()?.onKeyboard !== void 0,
    );
    i.remove
      ? (e.removed = !0)
      : i.command >= 0 && (i.button === void 0 ? e.changeAction(i.command) : e.keyboard(i.button));
  }
  trackBonusType(e) {
    return e.typeId === 18
      ? FairyBonus.ABSORB
      : e.typeId === 21
        ? FairyBonus.REFRACT
        : e.typeId === 23
          ? FairyBonus.RESURRECT
          : FairyBonus.OTHER;
  }
  updateDedicatedProcessor(e) {
    if (e.controllerKind === 'fairy') {
      let t = this.fairyProcessors.get(e);
      (t || ((t = newWispMemory(e)), this.fairyProcessors.set(e, t)), trackLeader(e, t));
    } else if (e.controllerKind === 'wisp') {
      let t = this.wispProcessors.get(e);
      (t || ((t = newTrackMemory()), this.wispProcessors.set(e, t)),
        moveTracker(e, this.actors, t));
    } else if (e.controllerKind === 'circle') {
      let t = this.circleProcessors.get(e);
      (t || ((t = newFollowMemory(e)), this.circleProcessors.set(e, t)), followLeader(e, t));
    } else if (e.controllerKind === 'track') {
      let t = this.trackProcessors.get(e);
      (t || ((t = newFairyMemory(this.trackBonusType(e))), this.trackProcessors.set(e, t)),
        moveFairy(e, t));
    }
  }
  notifyProcessorBumped(e) {
    if (
      (e.process === 'script' && this.scriptProcessorBumps.add(e),
      this.fighterControllers.get(e)?.onBumped(),
      e.controllerKind === 'animal')
    ) {
      let t = this.animalProcessors.get(e);
      (t || ((t = newAllyMemory()), this.animalProcessors.set(e, t)), markAllyBumped(t));
    } else if (e.controllerKind === 'cleric') {
      let t = this.clericProcessors.get(e);
      (t || ((t = newAnimalMemory(e)), this.clericProcessors.set(e, t)), markAnimalBumped(t));
    }
  }
  groundProcessorWorld() {
    return {
      actors: this.actors.filter((e) => !e.removed),
      playerMinX: this.playerMinX,
      playerMaxX: this.playerMaxX,
      sceneWidth: this.sceneWidth,
      floorHeight: this.floorHeight,
      isAnimalSpotClear: (e, t, i) =>
        e.processType === 'script' ||
        e.action()?.bodyType === -1 ||
        this.isAnimalSpotClear(e, t, i),
      isSpotClear: (e, t, i) =>
        e.processType === 'script' ||
        e.action()?.bodyType === -1 ||
        e.type.walkThrough ||
        this.isAiSpotClear(e, t, i),
      isPathClear: (e, t, i) =>
        e.processType === 'script' ||
        e.action()?.bodyType === -1 ||
        e.type.walkThrough ||
        this.isAiPathClear(e, t, i),
      canPerform: (e, t) => {
        const i = e.action(e.action()?.onKeyboard?.[t] ?? -1);
        return !!(
          i &&
          (i.cost[0] ?? 0) <= e.hp &&
          (i.cost[1] ?? 0) <= e.mp &&
          (i.cost[2] ?? 0) <= e.spl
        );
      },
    };
  }
  isAnimalSpotClear(e, t, i) {
    if (i < 0 || i > this.floorHeight) return !1;
    const r = e.groundRect(t, i),
      n = e.groundRect();
    return !r || !n
      ? !0
      : !this.actors.some(
          (a) =>
            a !== e &&
            !a.removed &&
            a.processType !== 'script' &&
            a.action()?.bodyType !== -1 &&
            !a.type.walkThrough &&
            !boxesOverlap(n, a.groundRect()) &&
            boxesOverlap(r, a.groundRect()),
        );
  }
  isAiSpotClear(e, t, i, r) {
    return (!e.isRetreating && !e.outside && (t < this.playerMinX || t > this.playerMaxX)) ||
      i < 0 ||
      i > this.floorHeight
      ? !1
      : this.isAiPositionCollisionFree(e, t, i, r);
  }
  isAiPositionCollisionFree(e, t, i, r) {
    const n = e.groundRect(t, i),
      a = e.groundRect();
    return !n || !a
      ? !0
      : this.sceneStops.some((o) => boxesOverlap(n, o))
        ? !1
        : !this.actors.some(
            (o) =>
              o !== e &&
              o !== r &&
              !o.removed &&
              o.processType !== 'script' &&
              o.action()?.bodyType !== -1 &&
              !o.type.walkThrough &&
              !boxesOverlap(a, o.groundRect()) &&
              boxesOverlap(n, o.groundRect()),
          );
  }
  isAiPathClear(e, t, i, r) {
    if (
      (!e.isRetreating && !e.outside && (t < this.playerMinX || t > this.playerMaxX)) ||
      i < 0 ||
      i > this.floorHeight
    )
      return !1;
    const n = Math.hypot(t - e.x, i - e.y),
      a = Math.max(1, Math.min(e.type.solid[0] ?? 1, e.type.solid[1] ?? 1)),
      o = Math.max(1, Math.ceil(n / a));
    for (let l = 1; l <= o; l += 1) {
      const c = l / o;
      if (!this.isAiPositionCollisionFree(e, e.x + (t - e.x) * c, e.y + (i - e.y) * c, r))
        return !1;
    }
    return !0;
  }
  aiRangeFrame(e, t) {
    const i = e.action(e.action()?.onKeyboard?.[t] ?? -1);
    return i && i.aiRangeFrame >= 0 ? e.frameById(i.aiRangeFrame) : void 0;
  }
  aiRangeHits(e, t, i) {
    const r = this.aiRangeFrame(e, i);
    if (!r?.range || !e.canDepthHit(t, r)) return !1;
    const n = t.frame()?.body;
    return n
      ? boxesOverlap(
          worldBox(r.range, e.face, e.x, e.y, e.jump),
          worldBox(n, t.face, t.x, t.y, t.jump),
        )
      : !1;
  }
  aiAttackRange(e, t) {
    const i = this.aiRangeFrame(e, t);
    if (!i?.range) return -1;
    const r = worldBox(i.range, e.face, e.x, e.y, e.jump);
    return Math.max(Math.abs(r.x1 - e.x), Math.abs(r.x2 - e.x));
  }
  outputAttack(e, t = !1, i = this.actors) {
    const r = e.action(),
      n = e.frame();
    if (!r || !n?.attack || r.actionType === 0) return;
    const a = worldBox(n.attack, e.face, e.x, e.y, e.jump);
    for (const o of i) {
      if (
        o === e ||
        (!o.isLiving() && n.damageType !== 80) ||
        o === e.parent ||
        (e.controllerKind === 'wisp' && e.target && o !== e.target) ||
        (n.damageAlign === 1 && e.align === o.align) ||
        (n.damageAlign === 2 && e.align !== o.align) ||
        (n.damageAlign === 3 && !e.isEnemy(o)) ||
        (n.damageAlign === 4 && !e.isAlly(o))
      )
        continue;
      const l = o.frame(),
        c =
          n.damageAlign === 3 || n.damageAlign === 4
            ? o.airRect()
            : l?.body && o.action()?.bodyType !== -1
              ? worldBox(l.body, o.face, o.x, o.y, o.jump)
              : void 0;
      if (
        !c ||
        (n.damageAlign !== 3 &&
          n.damageAlign !== 4 &&
          o.action()?.bodyType === 4 &&
          n.damageType !== 20) ||
        !e.canDepthHit(o, n) ||
        !boxesOverlap(a, c) ||
        (e.controllerKind === 'wisp' && (e.didContact = !0),
        e.hitTrack.get(o) === n.id && n.damageType !== 60) ||
        (e.hitTrack.set(o, n.id), o.airJuggles >= MIN_HIT_OVERLAP)
      )
        continue;
      const h = {
          x1: Math.max(a.x1, c.x1),
          y1: Math.max(a.y1, c.y1),
          x2: Math.min(a.x2, c.x2),
          y2: Math.min(a.y2, c.y2),
        },
        u = h.x1 + Math.trunc((h.x2 - h.x1) / 2),
        d = h.y1 + Math.trunc((h.y2 - h.y1) / 2),
        f = Math.trunc(o.y) - d;
      if (n.damageType === 60) {
        if (
          o.leader?.role === 'player' ||
          e.jump > 5 ||
          o.jump !== 0 ||
          o.action()?.onPickup === -1 ||
          (t && this.pendingActorInputs.some((m) => m.target === o))
        )
          continue;
        (t
          ? this.pendingActorInputs.push({
              attacker: e,
              target: o,
              frame: n,
              impactX: u,
              impactJump: f,
            })
          : this.applyPickup(e, o, n),
          this.applyAttackSelfOutput(e, n));
        return;
      }
      if (!(n.damageType === 30 && o.action()?.actionType === 30)) {
        if (n.damageType < 30 && n.damageTypeCall >= 0) {
          const m = this.spawnActionActor(e, n.damageTypeCall, {
            x: o.x,
            y: o.y + 1,
            jump: o.jump,
          });
          m && ((m.parent = e.parent), (m.spl = m.usedSpl = this.actorMagicSpl(e.parent)));
        }
        if (
          (n.damageType === 70 && (e.didContact = !0),
          n.damageType < 30 &&
            n.damageConnector &&
            ((e.didContact = !0),
            e.type.passContact &&
              ((e.parent.didContact = !0), e.parent.isEnemy(o) && (e.parent.whoIHit = o))),
          n.damageType < 30 && e.isEnemy(o) && (e.whoIHit = o),
          n.damageType === 0)
        ) {
          this.applyAttackSelfOutput(e, n);
          continue;
        }
        if (
          (t
            ? this.pendingActorInputs.push({
                attacker: e,
                target: o,
                frame: n,
                impactX: u,
                impactJump: f,
              })
            : this.resolveHit(e, o, n, !1, {
                impactX: u,
                impactJump: f,
              }),
          this.applyAttackSelfOutput(e, n),
          !t && r.onContact >= 0 && e.didContact && e.changeAction(r.onContact),
          n.damageType === 30)
        )
          return;
      }
    }
  }
  resolveHit(e, t, i, r, n) {
    if (i.damageType === 60)
      return {
        damage: 0,
        mpDamage: 0,
        blocked: !1,
        killed: !1,
        accepted: !0,
        nextAction: this.applyPickup(e, t, i, !r),
      };
    const a = t.isLiving(),
      o = t.hp,
      l = t.action(),
      c = l?.bodyType ?? 0,
      h = t.guard,
      u = t.receiveHit(e, i, this.sceneDamage, {
        applyAction: !r,
        applyVector: !r,
        preaccepted: r,
      });
    if (!u.accepted) return u;
    t.miniStatFrames > 0 && (t.miniStatFrames = this.sourceGameRate() * 3);
    const d = l?.onBlocked !== void 0 && l.onBlocked !== -1 && h > 0 && !u.blocked && u.damage >= h;
    if (
      (d &&
        i.damageAction === 2 &&
        (t.role === 'player' || t.role === 'boss') &&
        (this.setSlow(15, 0.95),
        this.setHue(
          15,
          {
            r: 128,
            g: 128,
            b: 128,
          },
          {
            r: 0,
            g: 0,
            b: 0,
          },
        )),
      i.damageType === 70)
    ) {
      const f = Math.max(0, -u.damage);
      return (t.setHue(16, f + 32, f + 32, 0), u);
    }
    if (i.damageType === 80)
      return (
        this.spawnHitEffect(e, t, 7, {
          spl: this.actorMagicSpl(t),
          still: !0,
        }),
        u
      );
    if (u.absorbed)
      return (
        this.hueActorWithMagic(t, 1),
        this.spawnHitEffect(e, t, 10, {
          spl: this.actorMagicSpl(t),
          still: !0,
        }),
        u
      );
    if (
      (u.attacked &&
        (this.fighterControllers.get(t)?.onAttacked(e.parent ?? e),
        t.process === 'script' && this.scriptProcessorBumps.add(t)),
      (u.damage > 0 || u.blocked) && this.applySourceHitEffects(e, t, i, u, c, d, n),
      u.damage > 0 && a)
    ) {
      const f =
        !u.blocked && i.damageType < 30 && t.type.actorType !== 1 && Math.trunc(o - u.damage) <= 0;
      if (t.hp <= 0)
        for (const p of [...this.actors, ...this.pendingActors])
          p !== t && p.leader === t && p.controllerKind === 'circle' && (p.hp = 0);
      const m = e.parent ?? e;
      if (
        (!u.blocked && !f && t.type.killScore > 0 && t.isEnemy(e) && e.countComboHit(),
        !u.blocked && !f && t.type.killScore > 0 && m.isEnemy(t))
      ) {
        const p = i.damageType === 20 ? u.damage / 3 : u.damage;
        m.addSuper(p);
      }
      if (!u.blocked && m.role === 'player' && t.type.killScore > 0) {
        const p = f ? t.type.killScore : Math.trunc(u.damage + u.mpDamage / 2);
        (m.addScore(p),
          (this.score = Math.max(0, Math.min(9999999, this.score + p))),
          this.saveHighScore());
      }
      if (!u.blocked && f && m.role === 'player' && m.isEnemy(t)) {
        const p = (this.playerKillCounts.get(m) ?? 0) + 1;
        (this.playerKillCounts.set(m, p), this.playerLineIndex(m) === 0 && (this.playerKills = p));
      }
      if (
        (f && this.dropPickups(t, e.face),
        !u.blocked && i.damageType === 20 && c !== 4 && (e.parent ?? e).bonusRefract > 0)
      ) {
        const p = e.parent ?? e;
        ((p.didRefract = !0),
          (p.bonusRefract -= 1),
          this.spawnRefractedMagic(e, t, n?.impactX, n?.impactJump));
      }
      this.sceneDamage && t.hp > 0 && t.hp < t.totalHp * 0.1 && !t.didWarning
        ? ((t.didWarning = !0),
          this.addActorBonuses(t, t.type.dieBonuses) && (t.airJuggles = MIN_HIT_OVERLAP),
          t.role === 'player' &&
            (this.setSlow(20, 0.95),
            this.openLine(this.playerLineIndex(t), 'Near Death!'),
            this.playSound('warning')))
        : this.sceneDamage &&
          t.hp <= 0 &&
          ((i.damageType === 1 ||
            i.damageType === 2 ||
            i.damageType === 20 ||
            i.damageType === 21 ||
            (i.damageType === 3 && (c === 0 || c === 5))) &&
            (t.role === 'player' || t.role === 'boss') &&
            this.setSlow(30, 0.95),
          t.role === 'player' && this.openLine(this.playerLineIndex(t), 'You Died!'));
    }
    return u;
  }
  awardCombo(e, t) {
    const i = parseArenaTiers(this.manifest?.safeConfig?.comboBonus),
      r = arenaTierFor(i, t);
    if (r) {
      if (
        (e.addScore(r.tier.score),
        e.role === 'player' &&
          ((this.score = Math.max(0, Math.min(9999999, this.score + r.tier.score))),
          this.saveHighScore()),
        r.tier.bonus >= 0)
      ) {
        const n = Array(6).fill(0);
        ((n[r.tier.bonus] = 1), this.addActorBonuses(e, n));
      }
      if (e.role === 'player') {
        if (this.sourceMode === 'arena')
          for (let n = 0; n < r.arenaCoins; n += 1) e.pickupDrops.push('coin');
        this.openLine(e.id === 'p2' ? 1 : 0, `${r.tier.title} ${t} Hit`);
      }
    }
  }
  applySourceHitEffects(e, t, i, r, n, a, o) {
    const l = Math.max(1, r.impactDamage ?? r.damage),
      c = this.actorMagicSpl(e),
      h = o?.impactX ?? Math.trunc(t.x),
      u = o?.impactJump ?? t.jump + Math.max(4, (t.type.solid[2] ?? 32) / 2),
      d = (e.parent ?? e).x > t.x ? 1 : -1,
      f = (p) => {
        if (i.damageType === 1 || i.damageType === 30)
          (this.playCameraSoundAt('fistblck', h),
            this.spawnHitEffect(e, t, 2, {
              spl: -1,
              x: h,
              jump: u,
            }));
        else if (i.damageType === 2 || i.damageType === 3)
          p === 2
            ? (this.playCameraSoundAt('blockmetal', h),
              this.spawnHitEffect(e, t, 5, {
                spl: -1,
                x: h,
                jump: u,
              }),
              this.spawnBloodParticles(void 0, -1, 6, h, t.y, u, d, l, 1, 1))
            : (this.playCameraSoundAt('fistblck', h),
              this.spawnHitEffect(e, t, 2, {
                spl: -1,
                x: h,
                jump: u,
              }),
              n === 0
                ? this.spawnBloodParticles(void 0, -1, 0, h, t.y, u, d, l, 1, 1)
                : n === 5 && this.spawnBloodParticles(t, 2, 8, h, t.y, u, d, l, 1, 1));
        else if (i.damageType === 20 || i.damageType === 21) {
          const g = i.damageType === 21 ? 3 : c;
          (this.playCameraSoundAt('blockmagic', h),
            this.spawnHitEffect(e, t, 3, {
              spl: g,
              x: h,
              jump: u,
            }),
            this.spawnBloodParticles(
              i.damageType === 20 ? e : void 0,
              g,
              4,
              h,
              t.y,
              u,
              d,
              l,
              i.damageType === 21 ? -1 : 1,
              2,
            ));
        }
      };
    if (
      (a &&
        (i.damageAction === 2 &&
          (this.playCameraSoundAt('guardbrk', t.x),
          this.spawnHitEffect(e, t, 7, {
            spl: -1,
            still: !0,
            x: h,
            jump: u,
          })),
        f(t.type.blockType)),
      r.blocked)
    ) {
      (f(r.resisted ? n : t.type.blockType),
        r.resisted && t.setHue(16, r.damage * 2 + 52, -10, -5));
      return;
    }
    const m = l + (t.hp <= 0 ? 3 : 0);
    if (
      ((i.damageType === 1 || i.damageType === 2 || i.damageType === 3 || i.damageType === 30) &&
        this.spawnHitEffect(e, t, 2, {
          spl: -1,
          x: h,
          jump: u,
        }),
      i.damageType === 1)
    )
      (this.playCameraSoundAt(n === 2 ? 'hitwood' : l >= 10 ? 'bigpunch' : 'hitthud', h),
        t.hp <= 0 && this.hueActorForHit(t, 32, -1));
    else if (i.damageType === 2)
      (this.playCameraSoundAt(n === 2 ? 'hitwood' : 'hitthud', h),
        t.hp <= 0 && this.hueActorForHit(t, 32, -1));
    else if (i.damageType === 3)
      n === 2
        ? this.playCameraSoundAt('hitwood', h)
        : n === 0 || n === 5
          ? (this.hueActorForHit(t, 32, -1),
            this.playCameraSoundAt(`hitblood${l >= 15 ? 3 : l >= 8 ? 2 : 1}`, h),
            n === 5
              ? this.spawnBloodParticles(t, 2, 8, h, t.y, u, d, m, 2, 3)
              : this.spawnBloodParticles(void 0, -1, 0, h, t.y, u, d, m, 2, 3))
          : this.playCameraSoundAt('hitblood1', h);
    else if (i.damageType === 20 || i.damageType === 21) {
      const p = i.damageType === 21 ? 3 : c;
      (this.playCameraSoundAt(i.damageType === 20 && l >= 15 ? 'hitmagic2' : 'hitmagic1', h),
        this.hueActorForHit(t, 32, p),
        this.spawnHitEffect(e, t, 3, {
          spl: p,
          x: h,
          jump: u,
        }),
        this.spawnBloodParticles(i.damageType === 20 ? e : void 0, p, 4, h, t.y, u, d, m, -1, 2));
    } else i.damageType === 30 && this.playCameraSoundAt('hitthud', t.x);
  }
  spawnHitEffect(e, t, i, r = {}) {
    if (!this.manifest?.actors?.fx) return;
    const a = (e.parent ?? e).x > t.x ? 1 : -1,
      o = this.addActor({
        id: `hit-fx-${this.frame}-${this.actors.length}`,
        main: 'fx',
        sprite: 'fx',
        type: i,
        level: 1,
        aiLevel: 1,
        align: -1,
        face: a,
        x: r.x ?? t.x,
        y: t.y + (r.still ? 2 : 1),
        jump: r.jump ?? t.jump + Math.max(4, (t.type.solid[2] ?? 32) / 2),
        role: 'none',
        process: 'ai',
        controllerKind: 'script',
      });
    o &&
      ((r.spl ?? -1) >= 0 && (o.spl = o.usedSpl = r.spl),
      r.still || ((o.speedX = -a * 2), (o.speedJump = 2)));
  }
  spawnBloodParticles(e, t, i, r, n, a, o, l, c, h) {
    if ((!this.bloodEnabled && i === 0) || !this.manifest?.actors?.fx) return;
    const u = Math.min(10, Math.max(1, Math.trunc(l / 3)));
    for (let d = 0; d < u; d += 1) {
      const f = this.addActor({
        id: `blood-fx-${this.frame}-${this.actors.length}-${d}`,
        main: 'fx',
        sprite: 'fx',
        type: i,
        level: 1,
        aiLevel: 1,
        align: -1,
        face: o,
        x: r - 15 + Math.random() * 30,
        y: n - 15 + Math.random() * 30,
        jump: a,
        role: 'none',
        process: 'ai',
        controllerKind: 'script',
      });
      f &&
        (e && ((f.parent = e), (f.align = e.align)),
        t >= 0 && (f.spl = f.usedSpl = t),
        (f.speedX = o * (1 + Math.random() * c)),
        (f.speedJump = 2 + Math.random() * h));
    }
  }
  spawnRefractedMagic(e, t, i = t.x, r = t.jump) {
    if (!this.manifest?.actors?.pickup) return;
    const n = e.parent ?? e,
      o = -(n.x > t.x ? 1 : -1),
      l = this.actorMagicSpl(n);
    this.playSound('tong');
    for (let c = 0; c < 3; c += 1) {
      const h = this.addActor({
        id: `refract-${n.id}-${this.frame}-${c}`,
        main: 'pickup',
        sprite: 'pickup',
        type: 15,
        level: 1,
        aiLevel: 1,
        align: n.align,
        face: o,
        x: i + o * (10 + (c === 1 ? 15 : 0)),
        y: t.y + (c - 1) * 5,
        jump: r,
        role: 'none',
        process: 'ai',
        controllerKind: 'script',
      });
      h &&
        ((h.parent = e),
        (h.spl = h.usedSpl = l),
        (h.speedX = o * (5 + l)),
        (h.speedY = (c - 1) * 3),
        (h.speedJump = 2));
    }
  }
  applyAttackSelfOutput(e, t) {
    (t.selfDamage.length &&
      e.applySelfDamage(t.selfDamage[0] ?? 0, t.selfDamage[1] ?? 0, 0, this.sceneDamage),
      t.selfVector.length &&
        e.addSpeed(e.face, t.selfVector[0] ?? 0, t.selfVector[1] ?? 0, t.selfVector[2] ?? 0));
  }
  resurrectActor(e) {
    ((e.mp = 0),
      (e.sp = 0),
      (e.spl = 0),
      (e.guard = 0),
      (e.resist = 0),
      (e.ko = 0),
      (e.comboHits = 0),
      (e.comboTicksLeft = 0),
      (e.bonusRage = 0),
      (e.bonusRefract = 0),
      (e.bonusAbsorb = 0));
    for (const t of [...this.actors, ...this.pendingActors])
      t !== e && t.leader === e && t.controllerKind === 'circle' && (t.hp = 0);
    return (
      (e.hp = e.totalHp),
      (e.didWarning = !1),
      (e.airJuggles = 5),
      (e.jump += 5),
      (e.speedX = 0),
      (e.speedY = 0),
      (e.speedJump = 6),
      (e.bonusLife -= 1),
      this.manifest?.actors?.pickup && this.createTrackedBonus(e, 23),
      e.setHue(50, 200, 200, 200),
      e.role === 'player' && this.openLine(this.playerLineIndex(e), 'Life Ressurected!'),
      (e.role === 'player' || e.role === 'boss') && this.setSlow(30, 0.96),
      this.superActor ||
        ((this.quake = startQuake(5)),
        (e.role === 'player' || e.role === 'boss') &&
          this.setHue(
            20,
            {
              r: 175,
              g: 175,
              b: 200,
            },
            {
              r: 0,
              g: 0,
              b: 0,
            },
          )),
      e.type.onFall
    );
  }
  hitSound(e, t, i, r, n) {
    return n
      ? e === 20 || e === 21
        ? 'blockmagic'
        : (e === 2 || e === 3) && i === 2
          ? 'blockmetal'
          : 'fistblck'
      : t === 2 && e <= 3
        ? 'hitwood'
        : e === 1
          ? r >= 10
            ? 'bigpunch'
            : 'hitthud'
          : e === 2 || e === 30
            ? 'hitthud'
            : e === 3
              ? `hitblood${r >= 15 ? 3 : r >= 8 ? 2 : 1}`
              : e === 20
                ? r >= 15
                  ? 'hitmagic2'
                  : 'hitmagic1'
                : e === 21
                  ? 'hitmagic1'
                  : 'hitthud';
  }
  applyPickup(e, t, i, r = !0) {
    const n = i.damageAction,
      a = (h) => {
        t.role === 'player' && this.openLine(this.playerLineIndex(t), h);
      },
      o = () => {
        const h = PICKUP_NAMES.get(e.typeId);
        h && t.pickupDrops.push(h);
      };
    n === 0
      ? ((t.hp = Math.min(t.totalHp, t.hp + (i.damage[0] ?? 0))),
        (t.mp = Math.min(t.totalMp, t.mp + (i.damage[1] ?? 0))))
      : n === 10
        ? t.type.totalSpl > 0 && t.spl < t.type.totalSpl
          ? ((t.spl += 1), a(`Go Super${t.spl > 1 ? ` ${t.spl}x` : ''}!`))
          : this.sourceMode === 'arena'
            ? o()
            : (t.mp = t.totalMp)
        : n === 11
          ? t.bonusLife + 1 > 3
            ? this.sourceMode === 'arena'
              ? o()
              : ((t.hp = t.totalHp), (t.mp = t.totalMp), a('Fully Restored!'))
            : ((t.bonusLife += 1), a('Bonus Life!'))
          : n === 12 && i.damageTypeCall >= 0
            ? this.actors.filter(
                (u) => !u.removed && u.leader === t && u.controllerKind === 'circle',
              ).length >= 3 && this.sourceMode === 'arena'
              ? o()
              : (this.createCircleActor(t, e.main, i.damageTypeCall, e.sprite), a('Bonus Fairy!'))
            : n === 13
              ? ((t.bonusRage += 20), this.hueActorWithMagic(t, 1), a('Bonus Rage!'))
              : n === 14
                ? t.level + 1 > 9 && this.sourceMode === 'arena'
                  ? o()
                  : (t.recalculateStats(t.level + 1),
                    this.hueActorWithMagic(t, 2),
                    a('Bonus Level Up!'))
                : n === 15
                  ? t.totalMp <= 0
                    ? o()
                    : (t.bonusRefract <= 0 && i.damageTypeCall >= 0
                        ? this.createTrackedBonus(t, i.damageTypeCall, e.main, e.sprite)
                        : (t.didRefract = !0),
                      (t.bonusRefract += 25),
                      this.hueActorWithMagic(t, 2),
                      a('Bonus Refractor!'))
                  : n === 16
                    ? (t.bonusAbsorb <= 0 && i.damageTypeCall >= 0
                        ? this.createTrackedBonus(t, i.damageTypeCall, e.main, e.sprite)
                        : (t.didAbsorb = !0),
                      (t.bonusAbsorb += 30),
                      this.hueActorWithMagic(t, 2),
                      a('Bonus Protection!'))
                    : n === 17
                      ? this.sourceMode === 'arcade' && t.role === 'player'
                        ? (t.addScore(100),
                          (this.score = Math.min(9999999, this.score + 100)),
                          this.saveHighScore())
                        : o()
                      : n === 18 && this.dropPickups(e, t.face);
    const l = t.action()?.onPickup ?? -1;
    (r && l !== -1 && t.changeAction(l), (e.didContact = !0));
    const c = e.action()?.onContact ?? -1;
    return (c !== -1 && e.changeAction(c), this.playSound('pickup'), l);
  }
  dropPickups(e, t = e.face) {
    (e.pickupDrops.forEach((i, r) => {
      const n = PICKUP_ICONS[i] ?? -1;
      if (n < 0) return;
      const a = this.addActor({
        id: `${e.id}-drop-${r}-${this.frame}`,
        main: 'pickup',
        sprite: 'pickup',
        type: n,
        level: 1,
        aiLevel: 1,
        align: 0,
        face: 1,
        x: e.x - 10 + Math.random() * 20,
        y: Math.max(0, Math.min(this.floorHeight - 1, e.y - 10 + Math.random() * 20)),
        jump: e.jump + (e.type.solid[2] ?? 0) + Math.random() * 20,
        role: 'pickup',
        process: 'script',
        processType: 'ai',
        controllerKind: 'script',
      });
      a && ((a.speedX = -t * (1 + Math.random())), (a.speedJump = 4 + Math.random() * 2));
    }),
      (e.pickupDrops.length = 0));
  }
  spawnActionActor(e, t, i) {
    const r = this.addActor({
      id: `${e.id}-call-${this.frame}-${this.actors.length}`,
      main: e.main,
      sprite: e.sprite,
      type: t,
      level: 1,
      aiLevel: e.aiLevel,
      align: i?.align ?? e.align,
      face: i?.face ?? e.face,
      x: i?.x ?? e.x,
      y: i?.y ?? e.y,
      jump: i?.jump ?? e.jump,
      role: i?.role ?? 'none',
      process: i?.process ?? 'script',
      processType: i?.processType,
      controllerKind: i?.controllerKind ?? 'script',
    });
    return (
      r &&
        (i?.detached || (r.parent = e.parent),
        (r.target = e.target),
        (r.speedX = i?.speedX ?? 0),
        (r.speedY = i?.speedY ?? 0),
        (r.speedJump = i?.speedJump ?? 0)),
      r
    );
  }
  inheritActionMagic(e, t) {
    return t && ((t.spl = t.usedSpl = this.actorMagicSpl(e)), t);
  }
  spawnActionActors(e, t, i) {
    const r = (n) => Math.random() * n;
    if (i === 1) {
      for (let n = 0; n < 7; n += 1)
        this.spawnActionActor(e, t, {
          x: e.x - 10 + r(20),
          y: e.y - 10 + r(20),
          jump: e.jump,
          face: -e.face,
          align: 99,
          speedX: -e.face * (1 + r(2)),
          speedY: -1 + r(2),
          speedJump: 4 + 0.03 * n,
          detached: !0,
        });
      return;
    }
    if (i === 2) {
      this.spawnActionActor(e, t, {
        x: e.x,
        y: e.y,
        jump: e.jump,
        controllerKind: 'wisp',
        process: 'ai',
        processType: 'script',
      });
      return;
    }
    if (i === 3) {
      for (let n = 0; n < 3; n += 1)
        this.spawnActionActor(e, t, {
          x: e.x - 20 + r(40),
          y: e.y - 10 + r(20),
          jump: e.jump + (e.type.solid[2] ?? 0) + r(10),
        });
      return;
    }
    if (i === 5) {
      for (let n = 0; n < 50; n += 1)
        this.spawnActionActor(e, t, {
          x: e.x + r(20) * e.face,
          y: e.y - 20 + r(40),
          jump: e.jump,
          speedX: e.face * (5 + r(n / 3)),
          speedY: -2 + n / 12.5,
          speedJump: 3 + n / 5,
        });
      return;
    }
    if (i === 6) {
      for (let n = 0; n < 6; n += 1) {
        const a = n === 1 || n === 4 ? 10 : n === 2 || n === 3 ? 20 : 0;
        this.inheritActionMagic(
          e,
          this.spawnActionActor(e, t, {
            x: e.x + a * e.face,
            y: e.y,
            jump: e.jump - 18 + n * 6 + 4,
          }),
        );
      }
      return;
    }
    if (i === 7 || i === 8) {
      for (let n = 0; n < 6; n += 1) {
        const a = i === 7 ? n * 5 : n * 5 - 4,
          o = e.jump + (i === 7 ? (5 - n) * 5 - 1 : n * 5 - 23);
        this.inheritActionMagic(
          e,
          this.spawnActionActor(e, t, {
            x: e.x + a * e.face,
            y: e.y,
            jump: o,
          }),
        );
      }
      return;
    }
    if (i === 9) {
      this.spawnActionRefractedMagic(e);
      return;
    }
    if (i === 10) {
      let n = -0.5;
      for (let a = 5; a < 50; a += 15) {
        const o = (a * Math.PI) / 180;
        (this.inheritActionMagic(
          e,
          this.spawnActionActor(e, t, {
            x: e.x,
            y: e.y,
            jump: e.jump,
            speedX: e.face * Math.cos(o) * 5,
            speedY: n,
            speedJump: Math.sin(o) * 5 + 1,
          }),
        ),
          (n += 0.5));
      }
      return;
    }
    if (i === 11) {
      this.inheritActionMagic(
        e,
        this.spawnActionActor(e, t, {
          x: e.x - 10 + r(20),
          y: e.y - 10 + r(20),
          jump: e.jump + (e.type.solid[2] ?? 0) + r(20),
          role: 'pickup',
          speedX: e.face * (1 + r(1)),
          speedJump: 4 + r(2),
        }),
      );
      return;
    }
    this.inheritActionMagic(
      e,
      this.spawnActionActor(e, t, {
        x: e.x,
        y: e.y,
        jump: e.jump,
      }),
    );
  }
  spawnActionRefractedMagic(e) {
    if (!this.manifest?.actors?.pickup) return;
    const t = this.actorMagicSpl(e),
      i = e.parent,
      r = e.face;
    this.playSound('tong');
    for (let n = 0; n < 3; n += 1) {
      const a = this.addActor({
        id: `action-refract-${e.id}-${this.frame}-${n}`,
        main: 'pickup',
        sprite: 'pickup',
        type: 15,
        level: 1,
        aiLevel: 1,
        align: i.align,
        face: r,
        x: e.x + r * (10 + (n === 1 ? 15 : 0)),
        y: e.y + (n - 1) * 5,
        jump: e.jump,
        role: 'none',
        process: 'ai',
        controllerKind: 'script',
      });
      a &&
        ((a.parent = i),
        (a.spl = a.usedSpl = t),
        (a.speedX = r * (5 + t)),
        (a.speedY = (n - 1) * 3),
        (a.speedJump = 2));
    }
  }
  processTriggers() {
    const e = [...this.triggers];
    for (const t of e) {
      const i = this.triggers.indexOf(t);
      if (i < 0 || !this.triggerReady(t)) continue;
      this.triggers.splice(i, 1);
      const r = toNumber(t.args[t.args.length - 1]);
      r > 0 && this.runScript(r, 1);
    }
    this.newTriggers.length &&
      (this.triggers.push(...this.newTriggers), (this.newTriggers.length = 0));
  }
  triggerReady(e) {
    const [t, i] = e.args;
    if (e.command === 'script-trigger-actor-null') return !this.actor(t);
    if (e.command === 'script-trigger-actor-dead')
      return !!(this.actor(t) && this.actor(t).hp <= 0);
    if (e.command === 'script-trigger-actor-done') {
      const r = this.actor(t);
      return r ? this.actorProcessDone(r) : !1;
    }
    if (e.command === 'script-trigger-actor-done-all')
      return this.actors.every((r) => this.actorProcessDone(r));
    if (e.command === 'script-trigger-enemies-dead') return this.enemiesDead(!1);
    if (e.command === 'script-trigger-enemies-null') return this.enemiesDead(!0);
    if (e.command === 'script-trigger-player-enemies-dead') return this.nonplayerDead(!1);
    if (e.command === 'script-trigger-player-enemies-null') return this.nonplayerDead(!0);
    if (e.command === 'script-trigger-arena-dead')
      return this.playersDead() || this.enemiesDead(!1);
    if (e.command === 'script-trigger-arena-null')
      return this.playersNull() || this.enemiesDead(!0);
    if (e.command === 'script-trigger-players-dead') return this.playersDead();
    if (e.command === 'script-trigger-players-only')
      return this.actors.every((r) => r.removed || r.align === 1 || r.hp <= 0);
    if (e.command === 'script-trigger-player-x')
      return this.livePlayerActors().some((r) => r.x > toNumber(t));
    if (e.command === 'script-trigger-player-near-actor') {
      const r = this.actor(t);
      return !!(
        r && this.livePlayerActors().some((n) => Math.hypot(n.x - r.x, n.y - r.y) <= toNumber(i))
      );
    }
    return e.command === 'script-trigger-timer'
      ? this.timer <= toNumber(t) && this.timer >= 0
      : e.command === 'script-trigger-caption-done'
        ? !this.caption
        : e.command === 'script-trigger-mission-done'
          ? !this.mission
          : e.command === 'script-trigger-dialog-done'
            ? !this.hasActiveDialog()
            : e.command === 'script-trigger-sprites-done'
              ? !this.hasActiveDialog() &&
                !this.caption &&
                !this.mission &&
                this.lines.size === 0 &&
                this.statsTransitionFrames === 0 &&
                this.goFrames === 0 &&
                this.helpFrames === 0 &&
                this.helpClosingFrames === 0
              : e.command === 'script-trigger-hue-done'
                ? this.hue.done
                : !1;
  }
  actorProcessDone(e) {
    return e.removed
      ? !0
      : e.process === 'script'
        ? e.isScriptDone()
        : e.process === 'ai' && e.controllerKind === 'fighter'
          ? e.actionId === e.stance().onStand
          : !0;
  }
  playerLineIndex(e) {
    return e.id === 'p2' ? 1 : 0;
  }
  joinedPlayerNumbers() {
    if (this.selectedPlayers.length > 0) {
      const t = [1, 2].filter((i) => this.selectedPlayers[i - 1]?.didJoin === !0);
      if (t.length > 0) return t;
    }
    const e = [1, 2].filter((t) => this.actors.some((i) => i.id === `p${t}`));
    return e.length > 0 ? e : [1];
  }
  livePlayerActors() {
    return this.joinedPlayerNumbers()
      .map((e) => this.actor(`p${e}`))
      .filter((e) => e !== void 0);
  }
  playersDead() {
    const e = new Set(this.livePlayerActors().filter((t) => t.hp > 0));
    return this.joinedPlayerNumbers().every((t) => {
      const i = this.actor(`p${t}`);
      return !i || !e.has(i);
    });
  }
  playersNull() {
    return this.joinedPlayerNumbers().every((e) => !this.actor(`p${e}`));
  }
  anyPlayerNull() {
    return this.joinedPlayerNumbers().some((e) => !this.actor(`p${e}`));
  }
  enemiesDead(e) {
    const t = this.actors.filter((i) => !i.removed);
    return t.every((i) => t.every((r) => (i.isEnemy(r) ? (e ? !1 : !r.isLiving()) : !0)));
  }
  nonplayerDead(e) {
    return this.actors.every((t) =>
      t.removed || t.align === -1 || t.role === 'pickup' || t.role === 'none'
        ? !0
        : !(t.align === 0 || t.align !== 1) || (!e && t.hp <= 0),
    );
  }
  runScript(e, t) {
    const i = this.manifest.data[this.dataName];
    let r = e,
      n = t;
    for (let a = 0; a < 2e3; a += 1) {
      const l = i[`Script:${r}`]?.[String(n)];
      if (!l) return;
      if (((n += 1), l === 'nothing')) continue;
      const c = l.split('|'),
        h = c.shift();
      if (h === 'script-goto') {
        this.pendingScripts.push({
          id: toNumber(c[0]),
          line: 1,
        });
        return;
      }
      if (h === 'script-goto-if-demo') {
        if (isTrialEdition(this.edition)) {
          this.pendingScripts.push({
            id: toNumber(c[0]),
            line: 1,
          });
          return;
        }
        continue;
      }
      if (h === 'script-trigger-clear') {
        this.triggers.length = 0;
        continue;
      }
      if (h.startsWith('script-trigger-')) {
        this.newTriggers.push({
          command: h,
          args: c,
        });
        continue;
      }
      if (h === 'script-start-change') {
        this.startScript = toNumber(c[0]);
        continue;
      }
      if (h === 'script-restart') {
        this.startSameScreenScene(this.startScript);
        continue;
      }
      if (h === 'script-scene-change') {
        this.startSameScreenScene(toNumber(c[0]));
        continue;
      }
      if (h === 'script-scene-fade') {
        this.beginSceneTransition('fade', toNumber(c[0]));
        continue;
      }
      if (h === 'script-scene-load') {
        const u = toNumber(c[0]);
        u === 99999 ? this.finish(!0) : this.beginSceneTransition('load', u);
        continue;
      }
      if (h === 'script-screen-set') {
        const u = routeFromScreenName(c[0] ?? '');
        u?.kind === 'menu'
          ? this.openMenu()
          : u?.kind === 'intro'
            ? this.startIntro()
            : u?.kind === 'splash'
              ? this.startSplash()
              : u?.kind === 'nag-preview' &&
                (this.manifest?.data.extra?.['Script:94']
                  ? (this.resetNewMode('show', 'preview'), this.loadScene('extra', 94))
                  : this.openMenu());
        return;
      }
      if (h === 'script-screen-call') {
        this.suspendedScript = {
          id: r,
          line: n,
        };
        const u = routeFromCommand(c[0] ?? '', c.slice(1));
        u?.kind === 'novel'
          ? this.openNovel(u.id)
          : u?.kind === 'poster'
            ? this.openPoster(u.id, u.seconds)
            : (this.pendingScripts.push(this.suspendedScript), (this.suspendedScript = void 0));
        return;
      }
      h.startsWith('game-')
        ? this.runGameCommand(h, c)
        : h.startsWith('scene-') && this.runSceneCommand(h, c);
    }
    throw new Error(`Rage of Magic script ${e} exceeded its source command guard`);
  }
  runGameCommand(e, t) {
    if (e === 'game-status') this.statusValue = toNumber(t[0]);
    else if (e === 'game-chapter') {
      const i = toNumber(t[0]);
      this.gameChapter = i;
      const r = parseChapters(this.manifest.data[this.dataName])
        .filter((n) => n.script > 0)
        .findIndex((n) => n.number === i);
      (r >= 0 && (this.chapterIndex = r),
        this.dataName === 'arcade' &&
          i > 0 &&
          ((this.progress.arcadeChapter = i),
          (this.progress.arcadeMaxChapter = Math.max(this.progress.arcadeMaxChapter, i))),
        this.dataName === 'arena' &&
          i > 0 &&
          ((this.progress.arenaChapter = i),
          (this.progress.arenaMaxChapter = Math.max(this.progress.arenaMaxChapter, i))));
    } else
      e === 'game-mode'
        ? ((this.sourceMode = normalizeMode(t[0])),
          ['arcade', 'arena', 'practice', 'show'].includes(this.sourceMode) &&
            (this.mode = this.sourceMode))
        : e === 'game-audio-play'
          ? this.playSound(t[0])
          : e === 'game-music-set'
            ? this.selectCurrentMusic(t[0] || void 0)
            : e === 'game-music-play'
              ? (t[0] && this.selectCurrentMusic(t[0]), this.playCurrentMusic())
              : e === 'game-music-stop'
                ? this.pauseCurrentMusic()
                : e === 'game-music-null' && this.stopCurrentMusic();
  }
  runSceneCommand(e, t) {
    if (e === 'scene-set-limit-quad') this.setLimits(toNumber(t[0]), toNumber(t[1]));
    else if (e === 'scene-set-actor-limit-quad')
      this.setActorLimits(toNumber(t[0]), toNumber(t[1]));
    else if (e === 'scene-set-actor-limit-none')
      ((this.playerMinX = -99999),
        (this.playerMaxX = 99999),
        this.applyCamera(withPlayerBounds(this.sourceCamera, this.playerMinX, this.playerMaxX)),
        this.refreshOutsideActors());
    else if (e === 'scene-set-actor-process-ai') {
      const i = [...this.actors, ...this.pendingActors];
      this.commitSourceSceneFrame();
      for (const r of i) this.setActorProcess(r, 'ai');
    } else if (e === 'scene-set-actor-process-script') {
      const i = [...this.actors, ...this.pendingActors];
      this.commitSourceSceneFrame();
      for (const r of i) this.setActorProcess(r, 'script');
    } else if (e === 'scene-damage') {
      this.sceneDamage = /^(?:y|yes|true|1)$/i.test(t[0] ?? '');
      for (const i of this.actors) i.damageEnabled = this.sceneDamage;
    } else if (e === 'scene-stats-set') {
      const i = /^(?:y|yes|true|1)$/i.test(t[0] ?? '');
      ((this.statsOn = i), this.startStatsTransition(i, toNumber(t[1])));
    } else if (e === 'scene-timer-ever') ((this.timer = -1), (this.timerRunning = !1));
    else if (e === 'scene-timer-start')
      ((this.timer = Math.min(99, toNumber(t[0]))), (this.timerTick = 0), (this.timerRunning = !0));
    else if (e === 'scene-timer-stop') this.timerRunning = !1;
    else if (e === 'scene-timer-clear')
      ((this.timer = -1), (this.timerTick = 0), (this.timerRunning = !1));
    else if (e === 'scene-caption-open')
      this.openTimedMessage('caption', toNumber(t[0]), t.slice(1).join('|'));
    else if (e === 'scene-mission-open')
      this.openTimedMessage('mission', toNumber(t[0]), t.slice(1).join('|'));
    else if (e === 'scene-dialog-open')
      t.length === 1
        ? this.openDialog(void 0, 0, t[0] ?? '')
        : this.openDialog(t[0], toNumber(t[1]), t.slice(2).join('|'));
    else if (e === 'scene-caption-close') this.closeTimedMessage('caption');
    else if (e === 'scene-mission-close') this.closeTimedMessage('mission');
    else if (e === 'scene-dialog-close-all') this.closeAllDialogs();
    else if (e === 'scene-close-all') this.closeMessages();
    else if (e === 'scene-dialog-close') this.closeDialog(toNumber(t[0]));
    else if (e === 'scene-init-dialog' || e === 'scene-init-caption') {
      ((this.statsOn = !1),
        this.startStatsTransition(!1, 0),
        e === 'scene-init-dialog' ? this.closeTimedMessage('caption') : this.closeAllDialogs(),
        this.closeAllLines());
      for (const i of this.actors) this.setActorProcess(i, 'script');
    } else if (e === 'scene-stats-open')
      (this.closeTimedMessage('caption'),
        this.closeAllDialogs(),
        this.statsOn && this.startStatsTransition(!0, toNumber(t[0])));
    else if (e === 'scene-show-go') ((this.goFrames = GO_TOTAL_FRAMES), this.playSound('gogo'));
    else if (e === 'scene-show-markers') {
      for (const i of this.actors)
        i.role === 'player' &&
          !i.removed &&
          this.markerFrames.set(i, this.sourceGameRate() * TIMING.markerSeconds);
      this.playSound('gling');
    } else if (e === 'scene-help-open') this.openHelpKeys();
    else if (e === 'scene-help-open-hint' && this.pauseHints && !this.helpHintShown)
      this.openHelpKeys();
    else if (e === 'scene-help-toggle')
      this.helpFrames > 0 ? this.closeHelpKeys() : this.openHelpKeys();
    else if (e === 'scene-help-close') this.closeHelpKeys();
    else if (e === 'scene-quake') {
      const i = toNumber(t[0]);
      i !== 0 && !this.superActor && (this.quake = startQuake(i));
    } else if (e === 'scene-slow') this.setSlow(toNumber(t[0]), toNumber(t[1]));
    else if (e === 'scene-line-open') this.openLine(toNumber(t[0]), t.slice(1).join('|'));
    else if (e === 'scene-line-close') this.closeLine(toNumber(t[0]));
    else if (e === 'scene-line-close-all') this.closeAllLines();
    else if (e === 'scene-hue') {
      const i = toNumber(t[0]);
      i !== -1 &&
        !this.superActor &&
        this.setHue(i, this.hue.value, this.hueFromRgb(t.slice(1, 4)), !0);
    } else if (e === 'scene-hue-full') {
      const i = toNumber(t[0]);
      i !== -1 &&
        !this.superActor &&
        this.setHue(i, this.hueFromRgb(t.slice(1, 4)), this.hueFromRgb(t.slice(4, 7)), !0);
    } else if (e === 'scene-hue-clear') this.superActor || (this.hue = this.clearHueState(!1));
    else if (e === 'scene-fade-in')
      this.superActor ||
        this.setHue(
          15,
          {
            r: -255,
            g: -255,
            b: -255,
          },
          {
            r: 0,
            g: 0,
            b: 0,
          },
          !0,
        );
    else if (e === 'scene-fade-out')
      this.superActor ||
        this.setHue(
          15,
          this.hue.value,
          {
            r: -255,
            g: -255,
            b: -255,
          },
          !0,
        );
    else if (e === 'scene-fade-black')
      this.superActor ||
        this.setHue(
          0,
          {
            r: -255,
            g: -255,
            b: -255,
          },
          {
            r: -255,
            g: -255,
            b: -255,
          },
          !0,
        );
    else if (e === 'scene-cam-set-xy')
      this.applyCamera(moveCameraTo(this.sourceCamera, toNumber(t[0]), toNumber(t[1])));
    else if (e === 'scene-cam-set-quad')
      this.applyCamera(moveCameraToQuadrant(this.sourceCamera, toNumber(t[0])));
    else if (e === 'scene-cam-set-target')
      this.applyCamera(
        glideCameraTo(this.sourceCamera, toNumber(t[0]), toNumber(t[1]), toNumber(t[2])),
      );
    else if (e === 'scene-cam-set-target-zero')
      this.applyCamera(glideCameraTo(this.sourceCamera, 0, 0, 0));
    else if (e === 'scene-cam-set-target-players')
      this.applyCamera(trackPlayers(this.sourceCamera, this.cameraPlayers()));
    else if (e === 'scene-cam-set-target-players-forward')
      this.applyCamera(trackPlayersClamped(this.sourceCamera, this.cameraPlayers()));
    else if (e === 'scene-cam-set-target-actors')
      this.applyCamera(trackAllActors(this.sourceCamera, this.cameraActors()));
    else if (e === 'scene-cam-set-actor')
      this.applyCamera(centerCameraOnActor(this.sourceCamera, this.actor(t[0])));
    else if (e === 'scene-cam-set-actor-push')
      this.applyCamera(pushCameraWithActor(this.sourceCamera, this.actor(t[0])));
    else if (e === 'scene-cam-set-target-actor')
      this.applyCamera(centerCameraOn(this.sourceCamera, this.actor(t[0]), toNumber(t[1], 10)));
    else if (e === 'scene-cam-play-audio') {
      const i = toNumber(t[1]);
      i > this.cameraX - 128 && i < this.cameraX + SCREEN_WIDTH + 128 && this.playSound(t[0]);
    } else if (e === 'scene-cam-play-audio-actor') {
      const i = this.actor(t[1]);
      i &&
        i.x > this.cameraX - 128 &&
        i.x < this.cameraX + SCREEN_WIDTH + 128 &&
        this.playSound(t[0]);
    } else if (e === 'scene-actor-set-face') {
      const i = this.actor(t[0]);
      i && (i.face = toNumber(t[1], 1));
    } else if (e === 'scene-actor-set-face-eachother') {
      const i = this.actor(t[0]),
        r = this.actor(t[1]);
      i && r && ((i.face = i.x < r.x ? 1 : -1), (r.face = -i.face));
    } else if (e === 'scene-actor-set-location') {
      const i = this.actor(t[0]);
      i &&
        ((i.face = toNumber(t[1], 1)),
        (i.x = toNumber(t[2])),
        (i.y = toNumber(t[3])),
        (i.jump = toNumber(t[4])),
        (i.speedX = i.speedY = i.speedJump = 0));
    } else if (e === 'scene-actor-set-action') {
      const i = this.actor(t[0]);
      i && this.queueActorAction(i, toNumber(t[1]));
    } else if (e === 'scene-actor-set-process') {
      const i = this.actor(t[0]);
      i && this.setActorProcess(i, t[1] === 'ai' ? 'ai' : 'script');
    } else if (e === 'scene-actor-remove') {
      const i = this.actor(t[0]);
      i && this.queueActorAction(i, -2);
    } else if (e === 'scene-actor-set-key-queue') {
      const i = this.actor(t[0]);
      i?.process === 'script' && i.queueKeys(t[1] ?? '');
    } else if (e === 'scene-actor-move-to') {
      const i = this.actor(t[0]);
      if (i?.process === 'script') i.moveTo(toNumber(t[1]), toNumber(t[2]), toNumber(t[3]));
      else if (i?.controllerKind === 'fairy') {
        let r = this.fairyProcessors.get(i);
        (r || ((r = newWispMemory(i)), this.fairyProcessors.set(i, r)),
          (r.targetX = toNumber(t[2])),
          (r.targetY = toNumber(t[3])));
      }
    } else if (e === 'scene-actor-move-relative-to') {
      const i = this.actor(t[0]);
      i?.process === 'script' &&
        i.moveTo(
          toNumber(t[1]),
          Math.trunc(i.x) + toNumber(t[2]),
          Math.trunc(i.y) + toNumber(t[3]),
        );
    } else if (e === 'scene-actor-move-relative-actor') {
      const i = this.actor(t[0]);
      i?.process === 'script' && i.moveTo(toNumber(t[2]), toNumber(t[3]), toNumber(t[4]), t[1]);
    } else if (e === 'scene-actor-move-near-actor')
      this.actor(t[0])?.process === 'script' && this.moveNearActor(t[0], t[1], toNumber(t[2]));
    else if (e === 'scene-actor-set-leader') {
      const i = this.actor(t[0]);
      i && (i.leader = this.actor(t[1]));
    } else if (e === 'scene-actor-set-stat') {
      const i = this.actor(t[0]);
      i &&
        (t[1] !== '?' && (i.hp = toNumber(t[1])),
        t[2] !== '?' && (i.mp = toNumber(t[2])),
        t[3] !== '?' && (i.spl = toNumber(t[3])));
    } else if (e === 'scene-actor-set-stat-restore') {
      const i = this.actor(t[0]);
      i && ((i.hp = i.totalHp), (i.mp = i.totalMp), (i.spl = 0));
    } else if (e === 'scene-actor-set-resist') {
      const i = this.actor(t[0]);
      i && (i.resist = Math.max(0, Math.min(1, toNumber(t[1]))));
    } else if (e === 'scene-actor-add-stat') {
      const i = this.actor(t[0]);
      i &&
        (t[1] !== '?' && (i.hp += toNumber(t[1])),
        t[2] !== '?' && (i.mp += toNumber(t[2])),
        t[3] !== '?' && (i.spl += toNumber(t[3])));
    } else if (e === 'scene-actor-add-level') {
      const i = this.actor(t[0]);
      i && i.recalculateStats(i.level + toNumber(t[1]));
    } else if (e === 'scene-actor-set-name') {
      const i = this.actor(t[0]);
      i && (i.name = t.slice(1).join('|'));
    } else if (e === 'scene-actor-set-align') {
      const i = this.actor(t[0]);
      i && (i.align = toNumber(t[1]));
    } else if (e === 'scene-actor-set-race') {
      const i = this.actor(t[0]);
      i && (i.race = t.slice(1).join('|'));
    } else if (e === 'scene-actor-add-pickup') {
      const i = this.actor(t[0]);
      i && PICKUP_ICONS[t[1] ?? ''] !== void 0 && i.pickupDrops.push(t[1]);
    } else if (e === 'scene-actor-add-bonus') {
      const i = this.actor(t[0]);
      i &&
        this.addActorBonuses(
          i,
          t.slice(1, 7).map((r) => toNumber(r)),
        );
    } else if (e === 'scene-actor-remove-some-bonus') {
      const i = this.actor(t[0]);
      i && this.removeActorBonuses(i);
    } else if (e === 'scene-actor-add-circle') {
      const i = this.actor(t[0]);
      if (i) {
        const r = this.createCircleActor(i, t[1], toNumber(t[2]), t[3]);
        r && (r.spl = r.usedSpl = this.actorMagicSpl(i));
      }
    } else
      e === 'scene-run'
        ? this.commitSourceSceneFrame()
        : e === 'scene-end-pickup'
          ? this.rewardEndPickups()
          : e === 'scene-create-pickup'
            ? this.createPickup(t)
            : e === 'scene-create-player-chosen'
              ? this.createChosenPlayer(toNumber(t[0], 1), t.slice(1))
              : e === 'scene-create-player-bonus'
                ? this.createChosenPlayerBonuses(toNumber(t[0], 1))
                : e === 'scene-create-player-allies'
                  ? this.createChosenPlayerAllies(toNumber(t[0], 1))
                  : e.startsWith('scene-create-ally-')
                    ? this.createAlly(e, t)
                    : e.startsWith('scene-create-') && this.createActor(e, t);
  }
  selectedPlayerState(e) {
    const t = Math.max(0, Math.min(1, Math.trunc(e) - 1)),
      i = this.selectedPlayers[t];
    if (i) return i;
    const r =
      this.sourceMode === 'arena'
        ? t === 0
          ? this.progress.arenaPlayer
          : normalizePlayerProgress(this.progress.arenaPlayer2, 1)
        : t === 0
          ? this.progress.arcadePlayer
          : void 0;
    if (r)
      return newSelectPlayer(t, {
        didJoin: t === 0 ? !0 : r.didJoin,
        character: r.character,
        color: r.color,
        score: r.score,
        coins: r.coins,
        controller: t,
        selectList: r.selectList,
        align: t + 1,
      });
  }
  chosenPlayerActor(e) {
    return this.actor(`p${Math.max(1, Math.min(2, Math.trunc(e)))}`);
  }
  createChosenPlayer(e, t) {
    const i = Math.max(0, Math.min(1, Math.trunc(e) - 1)),
      r = this.selectedPlayerState(i + 1);
    if (!r?.didJoin) return;
    const n = this.chosenPlayerActor(i + 1);
    if (n) return n;
    const a = Math.max(0, Math.min(HEROES.length - 1, r.character)),
      // Survival can be played as any character off the select grid, not only a hero.
      chosen = this.sourceMode === 'survival' ? r.characterActor : void 0,
      o = chosen ?? HEROES[a].id,
      l = chosen ? void 0 : r.color > 0 ? HERO_PALETTES[a]?.[r.color - 1] : void 0,
      c = l ? `${o}.${l}` : o,
      h = t.length >= 4;
    let u = h ? toNumber(t[0], 1) : 1,
      d = h ? toNumber(t[1]) : Math.trunc(this.cameraX) + 150,
      f = h ? toNumber(t[2]) : Math.trunc(this.floorHeight / 2);
    !h && i === 0 && this.sourceMode === 'arena' && this.selectedPlayerState(2)?.didJoin
      ? (f = Math.trunc(this.floorHeight * 0.8))
      : !h && i === 1 && this.sourceMode !== 'arena'
        ? ((d = Math.trunc(this.cameraX) + SCREEN_WIDTH - 150), (u = -1))
        : !h &&
          i === 1 &&
          (f = Math.trunc(
            this.selectedPlayerState(1)?.didJoin ? this.floorHeight * 0.2 : this.floorHeight / 2,
          ));
    const m = this.addActor({
      id: `p${i + 1}`,
      main: o,
      sprite: c,
      type: 0,
      level: r.selectList[SELECT_SLOT.level] ?? 0,
      aiLevel: 10,
      align: r.align,
      face: u,
      x: d,
      y: f,
      jump: h ? toNumber(t[3]) : 0,
      role: 'player',
      process: 'script',
      processType: 'script',
      controllerKind: 'player',
    });
    if (m) {
      ((m.score = 0), (r.didJoin = !0), (r.character = a));
      const p =
        this.sourceMode === 'arcade'
          ? i === 0
            ? this.progress.arcadePlayer
            : void 0
          : this.sourceMode === 'arena'
            ? i === 0
              ? this.progress.arenaPlayer
              : this.progress.arenaPlayer2
            : void 0;
      (p && ((p.didJoin = !0), (p.character = a), (p.color = r.color)),
        i === 0 && (this.heroIndex = a));
    }
    return m;
  }
  createChosenPlayerBonuses(e) {
    const t = this.chosenPlayerActor(e),
      i = this.selectedPlayerState(e);
    !t?.isLiving() || !i?.didJoin || this.addActorBonuses(t, i.selectList.slice(0, 6));
  }
  createChosenPlayerAllies(e) {
    if (
      this.sourceMode !== 'arena' &&
      this.sourceMode !== 'survival' &&
      this.sourceMode !== 'versus'
    )
      return;
    const t = this.chosenPlayerActor(e),
      i = this.selectedPlayerState(e);
    if (!t?.isLiving() || !i?.didJoin) return;
    const r = [this.selectedPlayerState(1), this.selectedPlayerState(2)].filter(
      (a) => a?.didJoin,
    ).length;
    let n = 0;
    for (let a = 7; a < i.selectList.length; a += 1) {
      const o = ALLY_ACTOR_IDS[a];
      if (o)
        for (let l = 0; l < (i.selectList[a] ?? 0); l += 1) {
          let c = Math.trunc(t.x),
            h = Math.trunc(t.y);
          this.sourceMode === 'versus'
            ? n === 0
              ? ((c -= 40 * t.face), (h -= 30))
              : n === 1
                ? ((c -= 40 * t.face), (h += 30))
                : n === 2
                  ? (c -= 80 * t.face)
                  : n === 3
                    ? ((c -= 80 * t.face), (h -= 50))
                    : n === 4 && ((c -= 80 * t.face), (h += 50))
            : n === 0
              ? (c -= 80 * t.face)
              : n === 1
                ? ((c -= 40 * t.face), (h -= 30 - (r - 1) * 10))
                : n === 2 && ((c -= 40 * t.face), (h += 30 - (r - 1) * 10));
          const u = o === 'cler',
            d = this.addActor({
              id: `p${Math.max(0, e - 1)}a${n}`,
              main: o,
              sprite: this.recolorAllies ? `${o}.@${this.sourceMode === 'versus' ? e : 0}` : o,
              type: 0,
              level: t.level,
              aiLevel: t.level + 1,
              align: t.align,
              face: t.face,
              x: c,
              y: h,
              jump: 0,
              role: u ? 'cleric' : 'fighter',
              process: 'script',
              processType: 'script',
              controllerKind: u ? 'cleric' : 'fighter',
            });
          d && (this.sourceAllyTypes.set(d, a), (n += 1));
        }
    }
  }
  createPickup(e) {
    const t = PICKUP_ICONS[e[0] ?? ''] ?? -1;
    if (!(t < 0))
      return this.addActor({
        id: e[4] ?? 'pickup',
        main: 'pickup',
        sprite: 'pickup',
        type: t,
        level: 1,
        aiLevel: 1,
        align: 0,
        face: 1,
        x: toNumber(e[1]),
        y: toNumber(e[2]),
        jump: toNumber(e[3]),
        role: 'pickup',
        process: 'script',
        processType: 'ai',
        controllerKind: 'script',
      });
  }
  rewardEndPickups() {
    const e = this.actors.filter((i) => i.role === 'player' && i.isLiving()),
      t =
        e.length <= 1
          ? e[0]
          : (e.find((i) => i.id === 'p1')?.score ?? 0) > (e.find((i) => i.id === 'p2')?.score ?? 0)
            ? e.find((i) => i.id === 'p1')
            : e.find((i) => i.id === 'p2');
    if (t)
      for (const i of this.actors) {
        if (i.role !== 'pickup' || !i.isLiving() || i.type.selectId === -1) continue;
        const r = PICKUP_NAMES.get(i.typeId),
          n = i.action()?.onKeyboard?.[Input.ABC] ?? -1;
        !r ||
          i.frame()?.damageType !== 60 ||
          n === -1 ||
          (t.pickupDrops.push(r), i.changeAction(n));
      }
  }
  createActor(e, t) {
    if (e === 'scene-create-object' || e === 'scene-create-animal') {
      const a = e.endsWith('animal');
      return this.addActor({
        id: t[7] ?? t[0],
        main: t[0],
        type: toNumber(t[1]),
        sprite: t[2],
        level: 1,
        aiLevel: 1,
        align: -1,
        face: toNumber(t[3], 1),
        x: toNumber(t[4]),
        y: toNumber(t[5]),
        jump: toNumber(t[6]),
        role: a ? 'none' : 'object',
        process: a ? 'ai' : 'script',
        processType: a ? 'script' : 'ai',
        controllerKind: a ? 'animal' : 'script',
      });
    }
    if (e === 'scene-create-player') {
      const a = Math.max(1, Math.min(2, toNumber(t[10], 1))),
        o = this.addActor({
          id: `p${a}`,
          main: t[0],
          type: toNumber(t[1]),
          sprite: t[2],
          level: toNumber(t[3]),
          aiLevel: toNumber(t[4]),
          align: toNumber(t[5]),
          face: toNumber(t[6], 1),
          x: toNumber(t[7]),
          y: toNumber(t[8]),
          jump: toNumber(t[9]),
          role: 'player',
          process: 'script',
          processType: 'script',
          controllerKind: 'player',
        });
      if (o && this.sourceMode === 'arcade') {
        const l = this.selectedPlayerState(a);
        if (l) {
          const c = HEROES.findIndex((h) => h.id === o.main);
          c >= 0 &&
            ((l.character = c), (this.heroIndex = c), (this.progress.arcadePlayer.character = c));
        }
      }
      return (a === 1 && (this.player = o), o);
    }
    if (t.length < 10) return;
    const i = e.replace('scene-create-', ''),
      r =
        i === 'boss'
          ? 'boss'
          : i === 'cleric'
            ? 'cleric'
            : i === 'fairy'
              ? 'none'
              : i === 'actor'
                ? 'actor'
                : 'fighter',
      n =
        i === 'cleric' ? 'cleric' : i === 'fairy' ? 'fairy' : i === 'actor' ? 'script' : 'fighter';
    return this.addActor({
      id: t[10] ?? t[0],
      main: t[0],
      type: toNumber(t[1]),
      sprite: t[2],
      level: toNumber(t[3]),
      aiLevel: toNumber(t[4]),
      align: toNumber(t[5]),
      face: toNumber(t[6], 1),
      x: toNumber(t[7]),
      y: toNumber(t[8]),
      jump: toNumber(t[9]),
      role: r,
      process: i === 'fairy' ? 'ai' : 'script',
      processType: 'script',
      controllerKind: n,
    });
  }
  createAlly(e, t) {
    const i = this.actor(t[5]);
    if (!i) return;
    let r = Math.trunc(i.x),
      n = Math.trunc(i.y);
    const a = t[6];
    a === 'r'
      ? (r -= 80 * i.face)
      : a === 't1'
        ? ((r -= 40 * i.face), (n -= 30))
        : a === 't2'
          ? ((r -= 80 * i.face), (n -= 50))
          : a === 'b1'
            ? ((r -= 40 * i.face), (n += 30))
            : a === 'b2' && ((r -= 80 * i.face), (n += 50));
    const o = e.endsWith('cleric')
        ? 'cleric'
        : e.endsWith('actor')
          ? 'actor'
          : e.endsWith('fairy')
            ? 'none'
            : e.endsWith('boss')
              ? 'boss'
              : 'fighter',
      l = e.endsWith('cleric')
        ? 'cleric'
        : e.endsWith('fairy')
          ? 'fairy'
          : e.endsWith('actor')
            ? 'script'
            : 'fighter',
      c = this.addActor({
        id: t[7] ?? t[0],
        main: t[0],
        type: toNumber(t[1]),
        sprite: t[2],
        level: toNumber(t[3]),
        aiLevel: toNumber(t[4]),
        align: i.align,
        face: i.face,
        x: r,
        y: n,
        jump: Math.trunc(i.jump),
        role: o,
        process: l === 'fairy' ? 'ai' : 'script',
        processType: 'script',
        controllerKind: l,
      });
    return (c && (c.leader = i), c);
  }
  addActorBonuses(e, t) {
    const [i = 0, r = 0, n = 0, a = 0, o = 0, l = 0] = t;
    let c = !1;
    (i > 0 && ((e.spl += i), (c = !0)), r > 0 && ((e.bonusRage += r * 20), (c = !0)));
    const h = n > 0 && e.totalMp > 0 && e.bonusRefract <= 0;
    n > 0 && e.totalMp > 0 && ((e.bonusRefract += n * 25), (c = !0));
    const u = a > 0 && e.bonusAbsorb <= 0;
    if ((a > 0 && ((e.bonusAbsorb += a * 30), (c = !0)), (e.bonusLife += Math.max(0, l)), o > 0)) {
      ((c = !0), this.playSound('fairy'));
      for (let d = 0; d < o; d += 1) this.createCircleActor(e, 'pickup', 9, 'pickup');
    }
    if (h) {
      const d = this.createTrackedBonus(e, 21);
      d && (d.spl = d.usedSpl = this.actorMagicSpl(e));
    }
    if (u) {
      const d = this.createTrackedBonus(e, 18);
      d && (d.spl = d.usedSpl = this.actorMagicSpl(e));
    }
    return (
      c && (this.markerFrames.delete(e), this.hueActorWithMagic(e, 1), this.playSound('tong')),
      c
    );
  }
  removeActorBonuses(e) {
    const t = [...this.actors, ...this.pendingActors].filter(
        (r) => r !== e && !r.removed && r.leader === e && r.controllerKind === 'circle',
      ),
      i = e.bonusRage > 0 || e.bonusRefract > 0 || e.bonusAbsorb > 0 || t.length > 0;
    e.bonusRage = e.bonusRefract = e.bonusAbsorb = 0;
    for (const r of t) r.hp = 0;
    return (
      i && (this.markerFrames.delete(e), this.hueActorWithMagic(e, 1), this.playSound('tong')),
      i
    );
  }
  createCircleActor(e, t, i, r) {
    const n = this.addActor({
      id: `circle-${e.id}-${this.frame}-${this.actors.length + this.pendingActors.length}`,
      main: t,
      sprite: r,
      type: i,
      level: 1,
      aiLevel: 1,
      align: e.align,
      face: e.face,
      x: e.x,
      y: e.y,
      jump: SCREEN_HEIGHT * 2,
      role: 'none',
      process: 'ai',
      processType: 'script',
      controllerKind: 'circle',
    });
    return (
      n &&
        ((n.leader = e),
        (n.parent = e),
        this.circleProcessors.set(n, newFollowMemory(n)),
        circleSiblings(e, [...this.actors, ...this.pendingActors])),
      n
    );
  }
  createTrackedBonus(e, t, i = 'pickup', r = 'pickup') {
    const n = this.addActor({
      id: `track-${e.id}-${t}-${this.frame}`,
      main: i,
      sprite: r,
      type: t,
      level: 1,
      aiLevel: 1,
      align: e.align,
      face: e.face,
      x: e.x,
      y: e.y - 1,
      jump: 0,
      role: 'none',
      process: 'ai',
      processType: 'script',
      controllerKind: 'track',
    });
    return (
      n &&
        ((n.leader = e),
        (n.parent = e),
        this.trackProcessors.set(n, newFairyMemory(this.trackBonusType(n)))),
      n
    );
  }
  addActor(e) {
    const t = this.manifest.actors[e.main];
    if (!t) return;
    const i = new Actor(t, {
      ...e,
      difficulty: this.difficultyIndex,
    });
    return (
      (i.actionPreflight = (r) => this.preflightActorAction(i, r)),
      (i.damageEnabled = this.sceneDamage),
      (i.outside = i.x < this.playerMinX || i.x > this.playerMaxX),
      this.pendingActors.push(i),
      i.process === 'script' && this.scriptProcessorBumps.add(i),
      e.role === 'player' &&
        (this.markerFrames.set(i, this.sourceGameRate() * TIMING.markerSeconds),
        e.id === 'p1' && (this.player = i),
        (e.id === 'p1' || e.id === 'p2') && this.sourcePlayerActors.set(e.id === 'p2' ? 2 : 1, i)),
      i
    );
  }
  moveNearActor(e, t, i) {
    const r = this.actor(e),
      n = this.actor(t);
    if (!r || !n) return;
    const a = r.x - n.x,
      o = r.y - n.y,
      l = Math.hypot(a, o) || 1;
    r.moveTo(0, n.x + (a / l) * i, n.y + (o / l) * i);
  }
  actor(e) {
    return (
      this.actors.find((t) => t.id === e && !t.removed) ??
      this.pendingActors.find((t) => t.id === e && !t.removed)
    );
  }
  queueActorAction(e, t) {
    if (e.process === 'script') {
      e.scriptAction(t);
      return;
    }
    if (e.process === 'ai' && e.controllerKind === 'fighter') {
      let i = this.fighterControllers.get(e);
      (i || ((i = new EnemyAi(e)), this.fighterControllers.set(e, i)), i.queueAction(t));
      return;
    }
    if (e.controllerKind === 'fairy') {
      let i = this.fairyProcessors.get(e);
      (i || ((i = newWispMemory(e)), this.fairyProcessors.set(e, i)), (i.nextAction = t));
    }
  }
  setActorProcess(e, t) {
    if (
      ((e.processType = t),
      (e.process = controllerKindOf(e, t)),
      (e.script = void 0),
      (e.aiWait = 0),
      this.scriptProcessorBumps.delete(e),
      e.process === 'script' && this.scriptProcessorBumps.add(e),
      t === 'script' && this.markerFrames.delete(e),
      this.fighterControllers.delete(e),
      this.animalProcessors.delete(e),
      this.clericProcessors.delete(e),
      this.fairyProcessors.delete(e),
      this.wispProcessors.delete(e),
      t === 'ai' && e.controllerKind === 'player')
    ) {
      const i = this.playerInputStates.get(e);
      i && ((i.queue = [0, 0, 0, 0]), (i.didDouble = !1));
    }
  }
  setLimits(e, t) {
    ((this.sceneMinX = Math.max(0, (e - 1) * SCREEN_WIDTH)),
      (this.sceneMaxX = Math.min(this.sceneWidth - 1, (e + t - 1) * SCREEN_WIDTH - 1)),
      (this.playerMinX = this.sceneMinX),
      (this.playerMaxX = this.sceneMaxX),
      this.applyCamera(withSceneBounds(this.sourceCamera, this.sceneMinX, this.sceneMaxX)),
      this.refreshOutsideActors());
  }
  setActorLimits(e, t) {
    if (e === -1) {
      ((this.playerMinX = -99999),
        (this.playerMaxX = 99999),
        this.applyCamera(withPlayerBounds(this.sourceCamera, this.playerMinX, this.playerMaxX)),
        this.refreshOutsideActors());
      return;
    }
    ((this.playerMinX = Math.max(0, (e - 1) * SCREEN_WIDTH)),
      (this.playerMaxX = Math.min(this.sceneWidth - 1, (e + t - 1) * SCREEN_WIDTH - 1)),
      this.applyCamera(withPlayerBounds(this.sourceCamera, this.playerMinX, this.playerMaxX)),
      this.refreshOutsideActors());
  }
  refreshOutsideActors() {
    for (const e of this.actors) e.outside = e.x < this.playerMinX || e.x > this.playerMaxX;
  }
  updateCamera() {
    this.applyCamera(
      stepCamera(this.sourceCamera, {
        actors: this.cameraActors(),
        players: this.cameraPlayers(),
      }),
    );
  }
  calcFloorPosition(e) {
    return Math.trunc(8 * (1 - e / (this.floorHeight + 8)));
  }
  applyCamera(e) {
    ((this.sourceCamera = e),
      (this.cameraX = e.x),
      (this.cameraY = e.y),
      (this.playerMinX = e.playerMinX),
      (this.playerMaxX = e.playerMaxX));
  }
  cameraActors() {
    return this.actors.filter(
      (e) =>
        !e.removed && e.hp > 0 && e.role !== 'none' && e.role !== 'pickup' && e.role !== 'animal',
    );
  }
  cameraPlayers() {
    return [...new Set(this.sourcePlayerActors.values())].filter((e) => !e.removed && e.hp > 0);
  }
  replaceTextVars(e) {
    const t = this.chapterChoices()[this.chapterIndex]?.number ?? this.chapterIndex + 1;
    return e
      .replace(/\{chapter}/g, String(t))
      .replace(/\{up}/g, '[]')
      .replace(/\{right}/g, '[]')
      .replace(/\{down}/g, '[]')
      .replace(/\{left}/g, '[]')
      .replace(/\{attack}/g, '[A]')
      .replace(/\{magic}/g, '[S]')
      .replace(/\{panic}/g, '[D]')
      .replace(/\{super}/g, '[W]');
  }
  openDialog(e, t, i) {
    const r = e && !this.actor(e) ? 3 : Math.max(0, Math.min(3, t));
    this.dialogCloseFrames.delete(r);
    const n = this.dialogs.get(r) ?? [],
      a = this.wrapSourceDialogText(this.replaceTextVars(i)),
      o = n.length > 0 ? n[n.length - 1].actor : this.dialogActors.get(r),
      l = !this.dialogActors.has(r),
      c = !l && o !== e;
    (n.push({
      actor: e,
      displayActor: c ? o : e,
      position: r,
      text: a,
      reveal: 0,
      tick: 0,
      phase: l ? 'enter' : c ? 'swap-exit' : a ? 'printing' : 'delay',
      delay: l ? PANEL_ENTER_FRAMES : c ? PANEL_EXIT_FRAMES : a ? 0 : 10,
    }),
      this.dialogs.set(r, n),
      this.dialogActors.set(r, e),
      l && this.playSound('streak'));
  }
  wrapSourceDialogText(e) {
    if (!e) return '';
    const t = e.split(' ');
    let i = '',
      r = '',
      n = 0;
    for (const a of t) {
      let o = r ? ` ${a}` : a,
        l = this.sourceBitmapWidth(2, o);
      ((n + l > TEXT_WRAP_WIDTH || (!r && l > TEXT_WRAP_WIDTH)) &&
        ((i += `${r}|`), (r = ''), (n = 0), (o = a), (l = this.sourceBitmapWidth(2, o))),
        (r += o),
        (n += l));
    }
    return i + r;
  }
  openTimedMessage(e, t, i) {
    const r = this.replaceTextVars(i),
      n = this.sourceBitmapWidth(2, r),
      a = Math.trunc(n / 2) + 46,
      o = {
        text: r,
        y: t,
        frames: a,
        totalFrames: a,
        textWidth: n,
        barFrames: Math.trunc(n / 2) + (e === 'caption' ? 46 : 37),
      };
    e === 'caption'
      ? ((this.caption = o), this.playSound('streak'))
      : ((this.mission = o), this.playSound('gogo'));
  }
  openLine(e, t) {
    if (!this.statsOn) return;
    const i = e === 99999 ? 1 : Math.max(0, Math.min(1, e));
    if (i === 0 && this.player?.processType === 'script') return;
    const r = this.replaceTextVars(t),
      n = this.sourceBitmapWidth(2, r),
      a = n + 21;
    this.lines.set(i, {
      text: r,
      y: this.sourceMode === 'arcade' ? 35 : 66,
      frames: a,
      totalFrames: a,
      textWidth: n,
      position: i,
    });
  }
  closeTimedMessage(e) {
    const t = e === 'caption' ? this.caption : this.mission;
    t &&
      (t.closingFrames = e === 'caption' ? TIMING.captionCloseFrames : TIMING.missionCloseFrames);
  }
  closeLine(e) {
    const t = this.lines.get(e);
    t && (t.closingFrames = TIMING.lineCloseFrames);
  }
  closeAllLines() {
    for (const e of this.lines.keys()) this.closeLine(e);
  }
  closeDialog(e) {
    this.dialogs.has(e) && this.dialogCloseFrames.set(e, TIMING.dialogCloseFrames);
  }
  closeAllDialogs() {
    for (const e of this.dialogs.keys()) this.closeDialog(e);
  }
  openHelpKeys() {
    this.helpFrames > 0 ||
      ((this.helpHintShown = !0),
      (this.helpTotalFrames = this.sourceGameRate() * 30 + 21),
      (this.helpFrames = this.helpTotalFrames),
      (this.helpClosingFrames = 0));
  }
  closeHelpKeys() {
    this.helpFrames > 0 && (this.helpClosingFrames = 11);
  }
  startStatsTransition(e, t) {
    e !== this.statsVisible &&
      ((this.statsVisible = e),
      (this.statsTransitionOpening = e),
      (this.statsTransitionTotal = Math.max(0, Math.trunc(t)) + 11),
      (this.statsTransitionFrames = this.statsTransitionTotal));
  }
  statsHudOffset() {
    if (this.statsTransitionFrames <= 0) return this.statsVisible ? 0 : void 0;
    const e = Math.max(0, this.statsTransitionTotal - 11),
      t = Math.max(0, this.statsTransitionTotal - this.statsTransitionFrames),
      i = Math.max(0, Math.min(10, t - e)),
      r = this.statsTransitionOpening ? -80 : 0,
      n = this.statsTransitionOpening ? 0 : -80;
    return Math.trunc(easeIn(r, n, i, 10));
  }
  closeMessages() {
    (this.startStatsTransition(!1, 0),
      this.closeTimedMessage('caption'),
      this.closeTimedMessage('mission'),
      this.closeAllDialogs(),
      this.closeAllLines(),
      this.closeHelpKeys());
  }
  stepTimedMessage(e) {
    const t = e === 'caption' ? this.caption : this.mission;
    t &&
      (t.closingFrames !== void 0 ? (t.closingFrames -= 1) : (t.frames -= 1),
      ((t.closingFrames !== void 0 && t.closingFrames <= 0) ||
        (t.closingFrames === void 0 && t.frames <= 0)) &&
        (e === 'caption' ? (this.caption = void 0) : (this.mission = void 0)));
  }
  stepMessages() {
    (this.stepTimedMessage('caption'), this.stepTimedMessage('mission'));
    for (const [e, t] of this.lines)
      (t.closingFrames !== void 0 ? (t.closingFrames -= 1) : (t.frames -= 1),
        ((t.closingFrames !== void 0 && t.closingFrames <= 0) ||
          (t.closingFrames === void 0 && t.frames <= 0)) &&
          this.lines.delete(e));
    for (const [e, t] of this.dialogs) {
      const i = this.dialogCloseFrames.get(e);
      if (i !== void 0) {
        i <= 1
          ? (this.dialogCloseFrames.delete(e),
            this.dialogs.delete(e),
            this.dialogActors.delete(e),
            this.dialogTexts.delete(e))
          : this.dialogCloseFrames.set(e, i - 1);
        continue;
      }
      const r = t[0];
      if (r) {
        if (r.phase === 'swap-exit')
          ((r.delay -= 1),
            r.delay <= 0 &&
              ((r.displayActor = r.actor),
              (r.phase = 'enter'),
              (r.delay = PANEL_ENTER_FRAMES),
              this.playSound('streak')));
        else if (r.phase === 'enter')
          ((r.delay -= 1),
            r.delay <= 0 &&
              ((r.phase = r.text ? 'printing' : 'delay'), (r.delay = r.text ? 0 : 10)));
        else if (r.phase === 'printing')
          ((r.tick += 1),
            r.tick > [6, 3, 1][this.typeSpeedIndex] &&
              ((r.tick = 0),
              (r.reveal += 1),
              r.reveal > r.text.length &&
                ((r.reveal = r.text.length), (r.phase = 'waiting'), this.playSound('blip'))));
        else if (r.phase === 'delay' && --r.delay <= 0) {
          const n = t.shift();
          n && this.dialogTexts.set(e, n.text);
        }
      }
    }
    this.goFrames > 0 && (this.goFrames -= 1);
    for (const [e, t] of this.markerFrames)
      e.removed || !e.isLiving() || t <= 1
        ? this.markerFrames.delete(e)
        : this.markerFrames.set(e, t - 1);
  }
  hasActiveDialog() {
    return [...this.dialogs.values()].some((e) => e.length > 0);
  }
  advanceDialogs() {
    for (const e of this.dialogs.values()) {
      const t = e[0];
      t &&
        (t.phase === 'printing'
          ? ((t.reveal = t.text.length), (t.phase = 'waiting'))
          : t.phase === 'waiting' &&
            ((t.phase = 'delay'), (t.delay = 10), this.playSound('click')));
    }
    this.renderDialog();
  }
  clearMessages() {
    (this.dialogs.clear(),
      this.dialogActors.clear(),
      this.dialogTexts.clear(),
      this.dialogCloseFrames.clear(),
      (this.caption = void 0),
      (this.mission = void 0),
      this.lines.clear(),
      (this.statsTransitionFrames = 0),
      (this.goFrames = 0),
      this.markerFrames.clear());
  }
  clearHueState(e) {
    const t = () => ({
      r: 0,
      g: 0,
      b: 0,
    });
    return {
      active: !1,
      done: e,
      step: 0,
      steps: 0,
      start: t(),
      target: t(),
      value: t(),
    };
  }
  hueFromRgb(e) {
    return {
      r: toNumber(e[0]),
      g: toNumber(e[1]),
      b: toNumber(e[2]),
    };
  }
  setHue(e, t, i, r = !1) {
    if (!r && !this.hueEnabled) return;
    const n = Math.max(0, e);
    this.hue = {
      active: n > 0,
      done: n === 0,
      step: 0,
      steps: n,
      start: {
        ...t,
      },
      target: {
        ...i,
      },
      value: {
        ...(n === 0 ? i : t),
      },
    };
  }
  stepHue() {
    if (!this.hue.active) return;
    if (((this.hue.step += 1), this.hue.step > this.hue.steps)) {
      ((this.hue.active = !1), (this.hue.done = !0));
      return;
    }
    const e = Math.min(1, this.hue.step / this.hue.steps);
    this.hue.value = {
      r: this.hue.start.r + (this.hue.target.r - this.hue.start.r) * e,
      g: this.hue.start.g + (this.hue.target.g - this.hue.start.g) * e,
      b: this.hue.start.b + (this.hue.target.b - this.hue.start.b) * e,
    };
  }
  renderHue() {
    this.fadeLayer.removeChildren().forEach((n) => n.destroy());
    const e = Math.trunc(this.hue.value.r),
      t = Math.trunc(this.hue.value.g),
      i = Math.trunc(this.hue.value.b);
    if (e === 0 && t === 0 && i === 0) {
      this.sceneLayer.filters = [];
      return;
    }
    if (typeof document > 'u') return;
    const r = (this.sceneHueFilter ??= new ColorMatrixFilter({
      padding: 0,
    }));
    ((r.matrix = [1, 0, 0, 0, e / 255, 0, 1, 0, 0, t / 255, 0, 0, 1, 0, i / 255, 0, 0, 0, 1, 0]),
      (this.sceneLayer.filters = [r]));
  }
  finish(e) {
    if (
      (this.sourceMode === 'arcade' && this.dataName === 'arcade') ||
      (this.sourceMode === 'arena' && this.dataName === 'arena')
    ) {
      this.startSourceEndScreen(this.sourceMode, e);
      return;
    }
    (this.clearAllSourceInputs(),
      this.stopCurrentMusic(),
      (this.screen = e ? 'clear' : 'defeated'),
      (this.screenFrame = 0),
      this.renderStaticScreen(),
      this.emitState(!0));
  }
  sourceChapterState(e) {
    const t = parseChapters(this.manifest.data[e]).filter((n) => n.script > 0),
      i = e === 'arcade' ? this.progress.arcadeChapter : this.progress.arenaChapter;
    return {
      chapter: t[this.chapterIndex]?.number ?? i,
      maxChapter: e === 'arcade' ? this.progress.arcadeMaxChapter : this.progress.arenaMaxChapter,
      scripts: Object.fromEntries(t.map((n) => [n.number, n.script])),
    };
  }
  sourcePickupSelectId(e) {
    const t = PICKUP_ICONS[e];
    if (t === void 0) return;
    const i = this.manifest?.actors?.pickup?.[`ActorType:${t}`]?.select_id,
      r = i === void 0 ? -1 : toNumber(i, -1);
    return r >= 0 ? r : void 0;
  }
  sourceEndItems(e) {
    return e.pickupDrops.flatMap((t) => {
      const i = this.sourcePickupSelectId(t);
      return i === void 0
        ? []
        : [
            {
              selectId: i,
            },
          ];
    });
  }
  sourceEndPlayerSnapshot(e, t = 0) {
    const i =
        e === 'arcade'
          ? this.progress.arcadePlayer
          : t === 0
            ? this.progress.arenaPlayer
            : normalizePlayerProgress(this.progress.arenaPlayer2, 1),
      r = this.selectedPlayerState(t + 1),
      n = r
        ? normalizePlayerProgress(
            {
              ...i,
              ...r,
              selectList: r.selectList,
            },
            t,
          )
        : i,
      a = this.sourcePlayerActors.get(t + 1) ?? this.actors.find((l) => l.id === `p${t + 1}`),
      o =
        e === 'arena'
          ? [...this.sourceAllyTypes.entries()]
              .filter(([l]) => l.id.startsWith(`p${t}a`))
              .map(([l, c]) => ({
                hp: l.hp,
                allyType: c,
                items: this.sourceEndItems(l),
              }))
          : [];
    return {
      ...normalizePlayerProgress(n, this.heroIndex),
      didJoin: n.didJoin || a !== void 0,
      character: r?.character ?? (t === 0 ? this.heroIndex : n.character),
      color: r?.color ?? n.color,
      actor: a
        ? {
            hp: a.hp,
            totalHp: a.totalHp,
            level: a.level,
            score: a.score,
            kills: a
              ? (this.playerKillCounts.get(a) ??
                (this.playerLineIndex(a) === 0 ? this.playerKills : 0))
              : 0,
            statTime: this.timer,
            spl: a.spl,
            bonusRage: a.bonusRage,
            bonusRefract: a.bonusRefract,
            bonusAbsorb: a.bonusAbsorb,
            bonusLife: a.bonusLife,
            circleCount: this.actors.filter(
              (l) => !l.removed && l.leader === a && l.controllerKind === 'circle',
            ).length,
            items: this.sourceEndItems(a),
          }
        : null,
      createdAllies: o,
    };
  }
  storeSourceEndPlayer(e, t, i = 0) {
    const r = normalizePlayerProgress(t, i === 0 ? this.heroIndex : 1);
    ((r.didJoin = t?.didJoin ?? r.didJoin),
      (r.character = t?.character ?? r.character),
      e === 'arcade'
        ? (this.progress.arcadePlayer = r)
        : i === 0
          ? (this.progress.arenaPlayer = r)
          : (this.progress.arenaPlayer2 = r));
  }
  startSourceEndScreen(e, t) {
    (this.stopCurrentMusic(), this.audio.stopVoice(this.endOutcomeVoice));
    const i = this.sourceChapterState(e),
      r = this.chapterSession?.mode === e && this.chapterSession.replay === !0,
      n = this.sourceEndPlayerSnapshot(e, 0);
    this.endResult =
      e === 'arcade'
        ? nextArcadeStage({
            gameChapter: i.chapter,
            gameMaxChapter: i.maxChapter,
            gameReplay: r,
            gameHiscore: this.progress.arcadeWon ? 1 : 0,
            gameStatus: t ? 1 : this.statusValue,
            players: [n],
            chapterScripts: i.scripts,
          })
        : buildStageResult({
            gameChapter: i.chapter,
            gameMaxChapter: i.maxChapter,
            gameReplay: r,
            gameHiscore: this.progress.arenaWon ? 1 : 0,
            players: [n, this.sourceEndPlayerSnapshot(e, 1)],
            chapterScripts: i.scripts,
          });
    const a = this.endResult;
    (r ||
      (this.storeSourceEndPlayer(e, a.players[0]),
      e === 'arena' && this.storeSourceEndPlayer(e, a.players[1], 1)),
      e === 'arena' &&
        (this.selectedPlayers = [0, 1].map((o) => {
          const l = a.players[o],
            c =
              this.selectedPlayers[o] ??
              newSelectPlayer(o, {
                didJoin: o === 0,
                character: l?.character ?? o,
                controller: o,
              });
          return l
            ? {
                ...c,
                didJoin: l.didJoin,
                character: l.character,
                color: l.color,
                score: l.score,
                coins: l.coins,
                selectList: [...l.selectList],
              }
            : c;
        })),
      r ||
        (e === 'arcade'
          ? ((this.progress.arcadeChapter = a.gameChapter),
            (this.progress.arcadeMaxChapter = a.gameMaxChapter))
          : ((this.progress.arenaChapter = a.gameChapter),
            (this.progress.arenaMaxChapter = a.gameMaxChapter))),
      (this.score = a.players[0]?.score ?? this.score),
      this.saveHighScore(),
      (this.endChoice = 0),
      (this.endFrame = 0),
      (this.endQuestion = void 0),
      (this.endQuestionState = void 0),
      (this.endPopup = void 0),
      this.clearAllSourceInputs(),
      (this.screen = a.winType === 1 ? 'clear' : 'defeated'),
      (this.screenFrame = 0),
      this.playSound(RESULT_SCREEN.startAudio),
      (this.endOutcomeVoice = this.playSound(a.outcomeAudio ?? void 0)),
      this.renderStaticScreen(),
      this.emitState(!0));
  }
  stepEndScreen() {
    if (!this.endResult) return;
    if (this.endQuestion && this.endQuestionState) {
      const t = stepQuestion(this.endQuestionState, 'none');
      ((this.endQuestionState = t.state),
        t.kind === 'dismiss' ? this.closeEndModal() : this.renderSourceEndModal());
      return;
    }
    if (this.endPopup) {
      const t = stepMessage(this.endPopup.state);
      ((this.endPopup.state = t.state), t.dismiss && this.closeEndModal());
      return;
    }
    const e = resultPanelY(this.endFrame).inputReady;
    ((this.endFrame += 1),
      !e && resultPanelY(this.endFrame).inputReady && this.clearAllSourceInputs(),
      this.refreshSourceEndDisplay());
  }
  handleEndReleasedKey(e) {
    if (this.endResult) {
      if (this.endPopup) {
        if (GAME_KEYS.has(e)) {
          const t = stepMessage(this.endPopup.state, !0);
          ((this.endPopup.state = t.state), t.dismiss && this.closeEndModal());
        }
        return;
      }
      if (this.endQuestion && this.endQuestionState) {
        const t =
          e === 'ArrowLeft' || e === 'Numpad4'
            ? 'left'
            : e === 'ArrowRight' || e === 'Numpad6'
              ? 'right'
              : GAME_KEYS.has(e)
                ? 'accept'
                : 'none';
        if (t === 'none') return;
        const i = stepQuestion(this.endQuestionState, t);
        if (
          ((this.endQuestionState = i.state),
          'sound' in i && i.sound && this.playSound(i.sound),
          i.kind === 'choose')
        ) {
          const r = i.choice === 0 ? this.endQuestion.yesCommand : this.endQuestion.noCommand;
          (this.closeEndModal(),
            r && this.applySourceEndEffects(quitOrSaveEffects(this.endResult.mode, r)));
        } else i.kind === 'dismiss' ? this.closeEndModal() : this.renderSourceEndModal();
        return;
      }
      if (resultPanelY(this.endFrame).inputReady)
        if (e === 'ArrowLeft' || e === 'ArrowRight' || e === 'Numpad4' || e === 'Numpad6') {
          const t = e === 'ArrowRight' || e === 'Numpad6';
          ((this.endChoice = moveResultChoice(this.endResult.mode, this.endChoice, t ? 1 : -1)),
            this.playSound(RESULT_SCREEN.moveAudio),
            this.refreshSourceEndDisplay());
        } else
          GAME_KEYS.has(e) &&
            (this.playSound(RESULT_SCREEN.acceptAudio),
            this.clearAllSourceInputs(),
            this.applySourceEndEffects(
              resultChoiceEffects(this.endResult, this.endChoice, {
                localLowest: lowestHighScore(this.localScores, this.endResult.mode),
              }),
            ));
    }
  }
  applySourceEndEffects(e) {
    for (const t of e)
      t.type === 'save'
        ? this.saveProgress()
        : t.type === 'set-globals' && this.endResult?.gameReplay !== !0
          ? (t.gameHiscore !== void 0 && t.gameHiscore > 0 && (this.progress.arenaWon = !0),
            t.gameMaxChapter !== void 0 && (this.progress.arenaMaxChapter = t.gameMaxChapter))
          : t.type === 'stop-music'
            ? this.stopCurrentMusic()
            : t.type === 'screen-call'
              ? this.openSourceEndRoute(t.screen)
              : t.type === 'screen-fade' && this.beginEndRouteFade(t.screen);
  }
  beginEndRouteFade(e) {
    this.endRouteFade ||
      (this.clearAllSourceInputs(),
      (this.endRouteFade = {
        step: 0,
        route: e,
        filter:
          typeof document > 'u'
            ? void 0
            : new ColorMatrixFilter({
                padding: 0,
              }),
      }));
  }
  stepEndRouteFade() {
    const e = this.endRouteFade;
    if (!e) return;
    if (!brandDone(e.step)) {
      (e.filter && this.setDisplayAdditiveHue(this.root, e.filter, brandHue(e.step)),
        (e.step += 1));
      return;
    }
    const t = e.route;
    ((this.root.filters = []), (this.endRouteFade = void 0), this.openSourceEndRoute(t));
  }
  sourceChapterRoute(e, t) {
    const i = e.mode === 'arcade' ? this.progress.arcadeWon : this.progress.arenaWon,
      r = e.mode === 'arcade' ? this.progress.arcadeMaxChapter : this.progress.arenaMaxChapter;
    return {
      dataName: e.mode,
      background: e.image,
      mode: e.mode,
      replay: t,
      maxUnlocked: i ? 99999 : Math.max(1, r - (t ? 1 : 0)),
      heroAfterSelection: !1,
    };
  }
  openSourceEndRoute(e) {
    const t = this.endResult?.gameReplay ?? !1;
    if (e.kind === 'question') {
      (this.clearAllSourceInputs(),
        (this.endQuestion = e),
        (this.endQuestionState = newQuestion(e.yesCommand, e.noCommand)),
        this.playSound('click'),
        this.renderSourceEndModal());
      return;
    }
    if (e.kind === 'popup') {
      (this.clearAllSourceInputs(),
        (this.endPopup = {
          title: e.title,
          message: e.message,
          icon: e.icon,
          state: newMessage(e.duration),
        }),
        this.renderSourceEndModal());
      return;
    }
    if (e.kind === 'play') {
      (this.clearSourceEndState(),
        e.scriptId !== null ? this.loadScene(e.mode, e.scriptId) : this.openMenu());
      return;
    }
    if (e.kind === 'chapter') {
      const i = this.sourceChapterRoute(e, t);
      (this.clearSourceEndState(), this.startChapterSession(i, e.index));
      return;
    }
    if (e.kind === 'select') {
      const i = e.continuation;
      if (i.kind !== 'chapter') {
        this.openMenu();
        return;
      }
      const r = this.sourceChapterRoute(i, t);
      (this.clearSourceEndState(),
        this.startHeroSelection('arena', {
          kind: 'chapters',
          session: r,
          index: i.index,
        }));
      return;
    }
    if (e.kind === 'novel') {
      const i = this.endResult;
      e.continuation?.kind === 'submit' &&
        i &&
        (this.pendingSubmit = {
          mode: i.mode,
          playerOneScore: i.players[0]?.score ?? 0,
          playerTwoScore: i.players[1]?.score ?? 0,
        });
      const r =
        e.continuation?.kind === 'hue'
          ? 'splash'
          : e.continuation?.kind === 'submit'
            ? 'submit'
            : 'menu';
      (this.clearSourceEndState(), this.openNovel(e.id, r, !0));
      return;
    }
    if (e.kind === 'hue') {
      (this.clearSourceEndState(),
        e.continuation.kind === 'splash'
          ? this.startSplash()
          : this.openSourceEndRoute(e.continuation));
      return;
    }
    if (e.kind === 'splash') {
      (this.clearSourceEndState(), this.startSplash());
      return;
    }
    if (e.kind === 'submit') {
      const i = this.endResult;
      this.openSubmit(
        i?.mode ?? 'arcade',
        i?.players[0]?.score ?? this.score,
        i?.players[1]?.score ?? 0,
      );
      return;
    }
    this.openMenu();
  }
  closeEndModal() {
    ((this.endQuestion = void 0),
      (this.endQuestionState = void 0),
      (this.endPopup = void 0),
      this.clearAllSourceInputs(),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ));
  }
  clearSourceEndState() {
    ((this.endRouteFade = void 0),
      (this.root.filters = []),
      this.audio.stopVoice(this.endOutcomeVoice),
      (this.endOutcomeVoice = void 0),
      (this.endResult = void 0),
      (this.endPanel = void 0),
      (this.endSword = void 0),
      (this.endQuestion = void 0),
      (this.endQuestionState = void 0),
      (this.endPopup = void 0),
      (this.endFrame = 0));
  }
  openNovel(e, t = this.suspendedScript ? 'script' : 'none', i = !0, r) {
    this.clearAllSourceInputs();
    const n = this.manifest.data.novel?.[e],
      a = this.manifest.bitmapFonts.map((h) => h.height),
      o = buildNovelLines(
        n,
        {
          player1: this.score,
        },
        a,
      ),
      l = n?.image?.replace(/\.jpe?g$/i, ''),
      c = {
        kind: 'novel',
        id: e,
        layout: o,
        motion: newScrollState(o.height, SCREEN_HEIGHT, i),
        ready: !l || this.images.has(l),
        returnTo: t,
        fadeOut: i || !!r,
        closingHueTarget: r?.target,
        closingHueSteps: r?.steps,
        sectionMusic: n?.music,
        previousMusicPlaying: !1,
      };
    ((this.interstitial = c),
      c.ready && this.startInterstitialAudio(c),
      this.renderInterstitial(),
      l &&
        !this.images.has(l) &&
        this.ensureImage(l).then(() => {
          this.interstitial === c &&
            (this.startInterstitialAudio(c), (c.ready = !0), this.renderInterstitial());
        }));
  }
  openPoster(e, t, i = this.suspendedScript ? 'script' : 'none', r = !1) {
    this.clearAllSourceInputs();
    const n = this.manifest.data.poster?.[e],
      a = `bg-${n?.bg ?? e}`,
      o = this.suspendCurrentMusic(),
      l = i === 'attract-demo' ? this.pendingAttractDemoScript : void 0,
      c = l === void 0 ? void 0 : this.sceneDefinition('extra', l),
      h = c !== void 0 && this.sceneResourcesPrepared(c),
      u = {
        kind: 'poster',
        id: e,
        gallery: r,
        motion: newPageState(t),
        ready: this.images.has(a),
        returnTo: i,
        fadeOut: !0,
        targetReady: c === void 0 || h,
        preparedTarget: h ? c : void 0,
        sectionMusic: n?.music,
        previousMusic: o.name,
        previousMusicPlaying: o.playing,
      };
    ((this.interstitial = u),
      u.ready && this.startInterstitialAudio(u),
      this.renderInterstitial(),
      u.ready ||
        this.ensureImage(a)
          .then(() => {
            this.interstitial === u &&
              (this.startInterstitialAudio(u), (u.ready = !0), this.renderInterstitial());
          })
          .catch((d) => {
            this.interstitial === u &&
              (u.targetError = d instanceof Error ? d : new Error(String(d)));
          }),
      c &&
        !h &&
        this.prepareScene(c)
          .then((d) => {
            this.interstitial === u && ((u.preparedTarget = d), (u.targetReady = !0));
          })
          .catch((d) => {
            this.interstitial === u &&
              (u.targetError = d instanceof Error ? d : new Error(String(d)));
          }));
  }
  stepInterstitial() {
    const e = this.interstitial;
    if (e) {
      if (e.kind === 'poster' && e.targetError) throw e.targetError;
      if (e.ready) {
        if (e.closingStep !== void 0) {
          if (
            (e.closingStep === 0 &&
              e.returnTo !== 'script' &&
              e.returnTo !== 'none' &&
              this.finalizeInterstitialAudio(e),
            e.closingStep > (e.closingHueSteps ?? 20))
          ) {
            this.finishInterstitial();
            return;
          }
          (this.applyInterstitialDisplay(), (e.closingStep += 1));
          return;
        }
        (this.applyInterstitialDisplay(), this.advanceInterstitialAfterDraw(e));
      }
    }
  }
  advanceInterstitialAfterDraw(e) {
    if (e.kind === 'novel') {
      const t = stepNovelScroll(e.motion);
      ((e.motion = t.state), t.done && this.closeInterstitial());
    } else {
      const t = e.returnTo === 'attract-demo' && !e.targetReady,
        i = stepNovelPage(e.motion, e.gallery || t);
      ((e.motion = i.state), i.done && this.closeInterstitial());
    }
  }
  handleInterstitialKey(e) {
    const t = this.interstitial;
    if (!(!t || !t.ready || t.closingStep !== void 0)) {
      if (t.kind === 'poster') {
        if (
          (t.returnTo === 'attract-demo' && !t.targetReady) ||
          (e !== 'KeyQ' &&
            !this.isSourceControllerButtonCode(e) &&
            !this.sourceControllerPressedAnyButton())
        )
          return;
        (t.returnTo === 'attract-demo' &&
          ((this.introLoop = 0),
          (this.pendingAttractDemoScript = void 0),
          (t.returnTo = 'splash'),
          (t.closingHueTarget = 255),
          (t.closingHueSteps = 10)),
          this.closeInterstitial());
        return;
      }
      e === 'KeyQ' || e === 'Space'
        ? this.handleInterstitialAction(!0)
        : e === 'ArrowUp'
          ? this.handleNovelDirection('up')
          : e === 'ArrowDown'
            ? this.handleNovelDirection('down')
            : ['Enter', 'KeyA', 'KeyS', 'KeyD'].includes(e) && this.handleInterstitialAction(!1);
    }
  }
  handleNovelDirection(e) {
    const t = this.interstitial;
    if (t?.kind !== 'novel' || t.closingStep !== void 0) return;
    const i = advanceNovel(t.motion, e);
    ((t.motion = i.state), i.sound && this.playSound(i.sound), this.applyInterstitialDisplay());
  }
  handleInterstitialAction(e) {
    const t = this.interstitial;
    if (!t || t.closingStep !== void 0) return;
    if (t.kind === 'poster') {
      this.closeInterstitial();
      return;
    }
    const i = advanceNovel(t.motion, e ? 'skip' : 'action');
    ((t.motion = i.state),
      i.sound && this.playSound(i.sound),
      i.done ? this.closeInterstitial() : this.applyInterstitialDisplay());
  }
  renderInterstitial() {
    ((this.overlayLayer.filters = []),
      this.overlayLayer.removeChildren().forEach((i) => i.destroy()));
    const e = this.interstitial;
    if (!e) return;
    const t = new Container();
    if (
      (t.addChild(new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill(0)),
      (e.display = t),
      (e.textDisplay = void 0),
      (e.arrowDisplay = void 0),
      (e.fadeFilter =
        typeof document > 'u'
          ? void 0
          : new ColorMatrixFilter({
              padding: 0,
            })),
      !e.ready)
    ) {
      this.overlayLayer.addChild(t);
      return;
    }
    if (e.kind === 'poster') {
      const i = this.manifest.data.poster?.[e.id],
        r = this.images.get(`bg-${i?.bg ?? e.id}`);
      r && t.addChild(new Sprite(r));
      const [n = SCREEN_WIDTH / 2, a = 55] = toNumberList(i?.['pos-xy'], [SCREEN_WIDTH / 2, 55]),
        o = new Container(),
        l = e.returnTo !== 'attract-demo' && this.sourceMode !== 'movie';
      for (const c of buildPageLines(
        i,
        this.manifest.bitmapFonts.map((h) => h.height),
        l,
      )) {
        const h = this.sourceBitmapText(c.font, c.text);
        (h.container.position.set(
          Math.trunc(n - this.sourceBitmapWidth(c.measureFont, c.text) / 2),
          a + c.y,
        ),
          o.addChild(h.container));
      }
      ((e.textDisplay = o), t.addChild(o));
    } else {
      const i = this.manifest.data.novel?.[e.id],
        r = i?.image?.replace(/\.jpe?g$/i, ''),
        n = r ? this.images.get(r) : void 0;
      if (n) {
        const l = new Sprite(n),
          [c = 0, h = 0] = toNumberList(i?.['image-xy'], [0, 0]);
        (l.position.set(c, h), t.addChild(l));
      }
      t.addChild(
        new Graphics().rect(59, 0, 394, SCREEN_HEIGHT).fill({
          color: 0,
          alpha: 0.75,
        }),
        new Graphics().rect(56, 0, 1, SCREEN_HEIGHT).fill(8421504),
        new Graphics().rect(57, 0, 1, SCREEN_HEIGHT).fill(16777215),
        new Graphics().rect(58, 0, 1, SCREEN_HEIGHT).fill(0),
        new Graphics().rect(453, 0, 1, SCREEN_HEIGHT).fill(0),
        new Graphics().rect(454, 0, 1, SCREEN_HEIGHT).fill(16777215),
        new Graphics().rect(455, 0, 1, SCREEN_HEIGHT).fill(8421504),
      );
      const a = new Container();
      for (const l of e.layout.lines) {
        const c = this.sourceBitmapText(l.font, l.text);
        (c.container.position.set(
          Math.trunc(SCREEN_WIDTH / 2 - this.sourceBitmapWidth(l.measureFont, l.text) / 2),
          l.y,
        ),
          a.addChild(c.container));
      }
      ((e.textDisplay = a), t.addChild(a));
      const o = new Container();
      (o.addChild(new Sprite(Texture.EMPTY), new Sprite(Texture.EMPTY)),
        (e.arrowDisplay = o),
        t.addChild(o));
    }
    (this.overlayLayer.addChild(t),
      this.applyInterstitialDisplay(),
      e.firstRunAdvanced || ((e.firstRunAdvanced = !0), this.advanceInterstitialAfterDraw(e)));
  }
  applyInterstitialDisplay() {
    const e = this.interstitial;
    if (!e?.display || !e.ready) return;
    const t = e.motion;
    e.textDisplay &&
      ((e.textDisplay.alpha = t.textPct),
      (e.textDisplay.y = e.kind === 'novel' ? Math.trunc(e.motion.y) : 0));
    const i = Math.max(1, e.closingHueSteps ?? 20),
      r = e.closingHueTarget ?? -255,
      n = e.closingStep === void 0 ? t.hue : (r * Math.min(i, e.closingStep)) / i;
    if (
      (e.fadeFilter && this.setDisplayAdditiveHue(e.display, e.fadeFilter, n),
      e.kind === 'novel' && e.arrowDisplay)
    ) {
      e.arrowDisplay.visible = e.motion.manual;
      const a = Math.floor(e.motion.anim / 10) & 1,
        o = atlasCellPosition(a + 2, 4, 11, 15),
        l = atlasCellPosition(a, 4, 11, 15),
        c = e.arrowDisplay.children[0],
        h = e.arrowDisplay.children[1];
      ((c.texture =
        this.sourceDicedTexture('ui.stats', 1, o.x, o.y, 11, 15, `novel-arrow-${a + 2}`) ??
        Texture.EMPTY),
        (h.texture =
          this.sourceDicedTexture('ui.stats', 1, l.x, l.y, 11, 15, `novel-arrow-${a}`) ??
          Texture.EMPTY),
        c.position.set(SCREEN_WIDTH - 11 - 20, Math.trunc(SCREEN_HEIGHT / 2 - 15 / 2)),
        h.position.set(SCREEN_WIDTH - 11 - 20, SCREEN_HEIGHT - 20 - 15));
    }
  }
  closeInterstitial() {
    const e = this.interstitial;
    if (e) {
      if (e.fadeOut) {
        e.closingStep ??= 0;
        return;
      }
      this.finishInterstitial();
    }
  }
  finishInterstitial() {
    const e = this.interstitial;
    if (!e) return;
    this.clearAllSourceInputs();
    const t = this.chapterSession,
      i = this.chapterIndex;
    (this.finalizeInterstitialAudio(e),
      (this.interstitial = void 0),
      (this.overlayLayer.filters = []),
      this.overlayLayer.removeChildren().forEach((n) => n.destroy()));
    const r = this.suspendedScript;
    if (((this.suspendedScript = void 0), e.returnTo === 'script' && r))
      this.pendingScripts.push(r);
    else if (e.returnTo === 'menu') this.openMenu();
    else if (e.returnTo === 'chapter' && t) this.startChapterSession(t, i);
    else if (e.returnTo === 'splash') this.startSplash();
    else if (e.returnTo === 'submit') {
      const n = this.pendingSubmit;
      ((this.pendingSubmit = void 0),
        n ? this.openSubmit(n.mode, n.playerOneScore, n.playerTwoScore) : this.openMenu());
    } else if (e.returnTo === 'attract-demo') {
      const n = this.pendingAttractDemoScript;
      ((this.pendingAttractDemoScript = void 0),
        n && e.kind === 'poster' && e.preparedTarget
          ? (this.resetNewMode('show', 'demo'),
            (this.sceneGeneration += 1),
            this.activatePreparedScene(e.preparedTarget, !1))
          : this.startSplash());
    }
  }
  finalizeInterstitialAudio(e) {
    e.audioFinalized ||
      ((e.audioFinalized = !0),
      e.sectionMusic && this.audio.stop(e.sectionMusic, !0),
      e.kind === 'novel'
        ? this.restoreMusicSnapshot({
            name: e.previousMusic,
            playing: e.previousMusicPlaying,
          })
        : this.selectCurrentMusic(void 0, !1));
  }
  startInterstitialAudio(e) {
    if (!e.audioStarted) {
      if (((e.audioStarted = !0), e.kind === 'novel')) {
        const t = this.suspendCurrentMusic();
        ((e.previousMusic = t.name), (e.previousMusicPlaying = t.playing));
      }
      (this.selectCurrentMusic(e.sectionMusic || void 0), this.playCurrentMusic());
    }
  }
  renderScene() {
    ((this.sceneLayer.visible = !0),
      (this.superLayer.visible = !0),
      (this.screenLayer.visible = !1));
    const e = new Set(this.actors);
    for (const t of [...this.actorViews.keys()]) {
      if (e.has(t)) continue;
      (this.actorViews.get(t)?.destroy({
        children: !0,
      }),
        this.actorViews.delete(t),
        this.viewFrames.delete(t),
        this.actorLayerDisplays.delete(t),
        this.actorShadowLayerDisplays.delete(t));
      const i = this.actorShadows.get(t);
      (i && destroyLayer(i), this.actorShadows.delete(t));
    }
    (this.renderHue(),
      this.sceneLayer.position.set(0, 0),
      this.backgroundLayer.position.set(
        -Math.round(this.cameraX),
        Math.round(this.cameraY) + this.quake.offsetY,
      ));
    for (const t of this.actors) this.renderActor(t);
    (this.renderForeground(), this.renderHud(), this.renderDialog());
  }
  ensureShadowSceneCompositeFilter() {
    if (this.shadowSceneFilter) return;
    const e = new ColorMatrixFilter({
      padding: 0,
    });
    ((e.matrix = blackMatrix()), (this.shadowLayer.filters = [e]), (this.shadowSceneFilter = e));
  }
  renderActor(e) {
    const t = e.frame();
    if (!t || e.drawType === -1) {
      const c = this.actorViews.get(e);
      c && (c.visible = !1);
      const h = this.actorShadows.get(e);
      h && (h.container.visible = !1);
      return;
    }
    let i = this.actorViews.get(e);
    if (!i) {
      ((i = new Container()),
        (i.sortableChildren = !0),
        this.actorViews.set(e, i),
        this.actorLayer.addChild(i));
      const c = createLayer();
      (this.shadowLayer.addChild(c.container), this.actorShadows.set(e, c));
    }
    i.visible = !0;
    const r = `${e.sprite}:${t.id}:${t.layers.map((c) => `${c.frame}/${c.type}/${c.alpha}/${c.x}/${c.y}`).join(',')}`;
    if (this.viewFrames.get(e) !== r) {
      i.removeChildren().forEach((m) => m.destroy());
      const c = this.actorShadows.get(e);
      c.container.removeChildren().forEach((m) => m.destroy());
      const h = [],
        u = [],
        d = this.atlases.has(e.sprite) ? e.sprite : e.main,
        f = this.atlases.get(d);
      if (f)
        for (const [m, p] of t.layers.entries()) {
          const g = Math.max(0, Math.min(f.textures.length - 1, p.frame)),
            v = f.textures[g];
          if (!v) continue;
          const x = new Sprite(v);
          (x.anchor.set(160 / f.entry.width, 200 / f.entry.height),
            x.position.set(p.x, p.y),
            (x.alpha = p.alpha),
            (x.zIndex = m));
          const b = new ColorMatrixFilter({
            padding: 0,
          });
          (h.push({
            sprite: x,
            type: p.type,
            filter: b,
            hueKey: '',
          }),
            i.addChild(x));
          const _ = shadowPlacement(p, f.entry.bounds[g], f.entry.width, f.entry.height);
          if (_) {
            const S = `shadow:${d}:${g}`;
            let w = this.sourceTextureCache.get(S);
            if (
              (w ||
                ((w = spriteTexture(v, f.entry.bounds[g], f.entry.width, f.entry.height)),
                this.sourceTextureCache.set(S, w)),
              w)
            ) {
              (ensureOpacityFilter(c), this.ensureShadowSceneCompositeFilter());
              const A = new Sprite(w);
              ((A.tint = 0),
                (A.alpha = 1),
                A.position.set(_.x, _.y),
                (A.scale.y = _.scaleY),
                c.container.addChild(A));
              const E = f.entry.bounds[g] ?? {
                  x1: 0,
                  y1: 0,
                  x2: f.entry.width - 1,
                  y2: f.entry.height - 1,
                },
                D = `shadow-clipped:${d}:${g}`;
              let B = this.sourceTextureCache.get(D);
              (B ||
                ((B = shadowTexture(v, f.entry.bounds[g], f.entry.width, f.entry.height)),
                B && this.sourceTextureCache.set(D, B)),
                u.push({
                  sprite: A,
                  commonTexture: w,
                  clippedTexture: B,
                  sourceWidth: E.x2 - E.x1 + 1,
                  sourceHeight: E.y2 - E.y1 + 1,
                  cropX1: E.x1,
                  cropX2: E.x2,
                  layerX: p.x,
                  layerY: p.y,
                }));
            }
          }
        }
      (this.actorLayerDisplays.set(e, h),
        this.actorShadowLayerDisplays.set(e, u),
        this.viewFrames.set(e, r));
    }
    const n = !!(this.superActor && (e === this.superActor || e.type.actorType === 2)),
      a = !!(this.superActor && !n),
      o = n ? this.superLayer : this.actorLayer;
    (i.parent !== o && o.addChild(i),
      this.updateActorLayerHues(e, a),
      i.position.set(
        Math.round(e.x - this.cameraX + e.quakeOffsetX),
        Math.round(this.cameraY + SCREEN_HEIGHT - SCENE_HEIGHT + this.floorTop + e.y - e.jump),
      ),
      (i.scale.x = e.face === 1 ? 1 : -1),
      (i.zIndex = e.y),
      (i.alpha = a ? 1 : e.opacity));
    const l = this.actorShadows.get(e);
    if (l) {
      ((l.container.zIndex = this.actors.indexOf(e)),
        l.container.position.set(
          Math.round(e.x - this.cameraX + e.quakeOffsetX),
          Math.round(this.cameraY + SCREEN_HEIGHT - SCENE_HEIGHT + this.floorTop + e.y),
        ),
        (l.container.scale.x = e.face === 1 ? 1 : -1));
      const c = applyLayerOpacity(l, e.jump, e.drawType, e.opacity);
      let h = !1;
      for (const u of this.actorShadowLayerDisplays.get(e) ?? []) {
        const m =
            Math.trunc(Math.trunc(-this.cameraX) + e.x) +
            e.quakeOffsetX +
            u.layerX * e.face -
            (e.face === 1 ? SHADOW_ORIGIN_X - u.cropX1 : u.cropX2 - SHADOW_ORIGIN_X),
          p = Math.trunc(
            Math.trunc(this.cameraY) +
              SCREEN_HEIGHT -
              SCENE_HEIGHT +
              this.floorTop +
              e.y +
              Math.trunc(u.layerY / 4),
          ),
          g = isFrameClipped(m, p, u.sourceWidth, u.sourceHeight, SCREEN_WIDTH, SCREEN_HEIGHT);
        ((u.sprite.visible = !g || !!u.clippedTexture),
          u.sprite.visible &&
            ((u.sprite.texture = g ? u.clippedTexture : u.commonTexture), (h = !0)));
      }
      l.container.visible = !this.superActor && c > 0 && h;
    }
  }
  updateActorLayerHues(e, t = !1) {
    const i = this.actorMagicHue(e),
      r = e.bonusRage > 0,
      n = (this.frame & 1) === 0;
    for (const a of this.actorLayerDisplays.get(e) ?? []) {
      if (t) {
        ((a.sprite.visible = a.type === 0),
          (a.sprite.tint = 0),
          (a.sprite.filters = []),
          (a.hueKey = 'dark'));
        continue;
      }
      ((a.sprite.visible = !0), (a.sprite.tint = 16777215));
      let o = 0,
        l = 0,
        c = 0;
      (a.type === 1
        ? ({ r: o, g: l, b: c } = i)
        : a.type === 0 &&
          (e.drawType === 1 && ((o = e.hueR), (l = e.hueG), (c = e.hueB)),
          r &&
            (n
              ? ((o += 50), (l -= 20), (c -= 10))
              : ((o += e.drawType === 1 && a.sprite.alpha < 1 ? 25 : 20), (l -= 10), (c -= 5)))),
        this.setLayerAdditiveHue(a, o, l, c));
    }
  }
  setLayerAdditiveHue(e, t, i, r) {
    const n = `${t}/${i}/${r}`;
    if (e.hueKey !== n) {
      if (((e.hueKey = n), t === 0 && i === 0 && r === 0)) {
        e.sprite.filters = [];
        return;
      }
      ((e.filter.matrix = [
        1,
        0,
        0,
        0,
        t / 255,
        0,
        1,
        0,
        0,
        i / 255,
        0,
        0,
        1,
        0,
        r / 255,
        0,
        0,
        0,
        1,
        0,
      ]),
        (e.sprite.filters = [e.filter]));
    }
  }
  renderForeground() {
    for (const e of this.foregroundLayer.children) {
      const [, t = '0', i = '1', r = 'left'] = e.label.split(':'),
        n = e;
      ((n.tint = this.superActor ? 0 : 16777215),
        (n.x = parallaxX({
          cameraX: this.cameraX,
          foreX: toNumber(t),
          distance: toNumber(i),
          sceneWidth: this.sceneWidth,
          viewportWidth: SCREEN_WIDTH,
          imageWidth: n.width,
          anchor: r,
        })),
        (n.y = SCREEN_HEIGHT - n.height + Math.trunc(this.cameraY) + this.quake.offsetY));
    }
  }
  renderHud() {
    if ((this.hudLayer.removeChildren().forEach((n) => n.destroy()), this.superActor)) return;
    if (this.survivalResult) {
      this.drawSurvivalResult();
      return;
    }
    const e = this.statsHudOffset();
    if (e === void 0) return;
    if (this.sourceMode === 'demo' || this.sourceMode === 'show') {
      this.hudStartDelay[0] > this.sourceGameRate() &&
        this.drawHudPrompt(
          this.sourceMode === 'demo'
            ? 'Demonstration - Press Any Button'
            : 'Fight Show - Press Any Button',
          0,
          3 + e,
          SCREEN_WIDTH,
        );
      return;
    }
    if (this.sourceMode === 'preview') return;
    const t = this.actor('p1') ?? this.player,
      i = this.actor('p2');
    if (this.sourceMode === 'arcade') {
      if (!t) return;
      const n = t.whoIHit && !t.whoIHit.removed ? t.whoIHit : this.focusEnemy;
      (this.drawSourceStat(t, 3, 3 + e, !0),
        n && this.drawSourceStat(n, SCREEN_WIDTH - 234 - 5, 3 + e, !1),
        this.drawSourceTimer(3, 3 + e));
      return;
    }
    const r = SCREEN_WIDTH - 234 - 5;
    if (t) {
      this.drawSourceStat(t, 3, 3 + e, !0);
      const n = t.whoIHit && !t.whoIHit.removed ? t.whoIHit : void 0;
      n && this.drawSourceStat(n, 3, 35 + e, !1);
    } else this.drawEmptyPlayerStat(0, 3, 3 + e);
    if (i) {
      this.drawSourceStat(i, r, 3 + e, !0);
      const n = i.whoIHit && !i.whoIHit.removed ? i.whoIHit : void 0;
      n && this.drawSourceStat(n, r, 35 + e, !1);
    } else this.sourceMode !== 'survival' && this.drawEmptyPlayerStat(1, r, 3 + e);
    ((t || i) && this.drawSourceTimer(3, 3 + e),
      // With no second player there, the wave and clock take that corner.
      this.sourceMode === 'survival' && this.drawSurvivalStatus(3 + e));
  }
  drawHudPrompt(e, t, i, r) {
    const n = this.sourceBitmapText(0, e);
    (n.container.position.set(t + Math.trunc((r - n.width) / 2), i + 12),
      this.hudLayer.addChild(n.container));
  }
  drawEmptyPlayerStat(e, t, i) {
    if (this.sourceMode === 'arena' || this.sourceMode === 'arcade') {
      this.drawHudPrompt('Please Wait', t, i, 234);
      return;
    }
    if (this.hudStatMode[e] === 'choose') {
      this.drawChoosingPlayerStat(e, t, i, 'Choose?');
      return;
    }
    if (this.hudStatMode[e] === 'loading') {
      this.drawChoosingPlayerStat(e, t, i, 'Please Wait');
      return;
    }
    this.hudStartDelay[e] > this.sourceGameRate() &&
      this.drawHudPrompt('Press Any Button', t, i, 234);
  }
  drawChoosingPlayerStat(e, t, i, r) {
    const n = this.selectedPlayers[e],
      a = Math.max(0, Math.min(HEROES.length - 1, this.hudChoice[e])),
      o = new Container(),
      l = atlasCellPosition(0, 1, 234, 30),
      c = this.sourceDicedTexture('ui.stats', 2, l.x, l.y, 234, 30, 'stat-player-bar'),
      h = new Graphics();
    h.rect(t + 2, i - 1, 23, 24).fill({
      color: 0,
      alpha: 0.5,
    });
    for (let v = 0; v < 3; v += 1)
      h.rect(t + 214 + 6 * v, i + 20, 5, 5).fill({
        color: 0,
        alpha: 0.5,
      });
    if ((o.addChild(h), c)) {
      const v = new Sprite(c);
      (v.position.set(t - 1, i - 2), o.addChild(v));
    }
    const u = atlasCellPosition(a, 3, 24, 24),
      d = this.sourceDicedTexture('ui.stats', 5, u.x, u.y, 24, 24, `stat-player-${a}`);
    if (d) {
      const v = new Sprite(d);
      (v.position.set(t + 1, i + 1), o.addChild(v));
    }
    const f = n?.selectList[SELECT_SLOT.level] ?? 0,
      m = `${HERO_NAMES[a]} ${f > 0 ? `L${f} ` : ''}${HERO_RACES[a]}`,
      p = this.sourceBitmapText(0, m);
    (p.container.position.set(t + 29, i + 1), o.addChild(p.container));
    const g = this.sourceBitmapText(0, r);
    (g.container.position.set(t + 232 - g.width, i + 2),
      o.addChild(g.container),
      this.drawEmbossBar(o, t + 26, i + 14, 205, [16776960, 16762624, 11702016]),
      this.drawEmbossBar(o, t + 26, i + 20, 187, [315135, 37119, 25778]),
      this.hudLayer.addChild(o));
  }
  actorDisplayName(e) {
    return e.race
      ? e.level === 0
        ? `${e.name} ${e.race}`
        : `${e.name} L${e.level} ${e.race}`
      : e.name;
  }
  drawEmbossBar(e, t, i, r, n) {
    const a = Math.max(0, Math.trunc(r));
    if (a <= 0) return;
    const o = new Graphics();
    (o.rect(t, i, a, 1).fill(n[0]),
      a > 1 && o.rect(t, i + 1, a, 3).fill(n[1]),
      o.rect(t, i + 4, a, 1).fill(n[2]),
      e.addChild(o));
  }
  drawSourceStat(e, t, i, r) {
    if (e.removed) return;
    const n = Math.max(0, e.type.totalSpl),
      a = n > 0 ? 0 : e.totalMp > 0 ? 1 : 2,
      o = atlasCellPosition(a, 1, 234, 30),
      l = this.sourceDicedTexture('ui.stats', 2, o.x, o.y, 234, 30, `stat-bar-${a}`),
      c = new Container(),
      h = e.totalHp > 0 ? Math.max(e.hp > 0 ? 1 : 0, Math.trunc(205 * (e.hp / e.totalHp))) : 0,
      u = e.totalMp > 0 ? Math.max(e.mp > 0 ? 1 : 0, Math.trunc(187 * (e.mp / e.totalMp))) : 0,
      d = new Graphics();
    if (
      (d.rect(t + 2, i + 1, 23, 24).fill({
        color: 0,
        alpha: 0.5,
      }),
      h < 205 &&
        d.rect(t + 26 + h, i + 14, 205 - h, 5).fill({
          color: 0,
          alpha: 0.5,
        }),
      e.totalMp > 0 &&
        u < 187 &&
        d.rect(t + 26 + u, i + 20, 187 - u, 5).fill({
          color: 0,
          alpha: 0.5,
        }),
      c.addChild(d),
      l)
    ) {
      const v = new Sprite(l);
      (v.position.set(t - 1, i - 2), c.addChild(v));
    }
    const f = this.atlases.get(e.sprite),
      m = f ? this.sourceCroppedTexture(e.sprite, Math.max(0, f.entry.frames - 2)) : void 0;
    if (m) {
      const v = new Sprite(m);
      v.position.set(t + 1, i + 25 - m.height);
      let x = e.drawType === 1 ? e.hueR : 0,
        b = e.drawType === 1 ? e.hueG : 0,
        _ = e.drawType === 1 ? e.hueB : 0;
      (e.bonusRage > 0 &&
        ((this.frame & 1) === 0
          ? ((x += 50), (b -= 20), (_ -= 10))
          : ((x += 20), (b -= 10), (_ -= 5))),
        this.setLayerAdditiveHue(
          {
            sprite: v,
            type: 0,
            filter: new ColorMatrixFilter({
              padding: 0,
            }),
            hueKey: '',
          },
          x,
          b,
          _,
        ),
        c.addChild(v));
    }
    const p = this.sourceBitmapText(
      0,
      `${this.actorDisplayName(e)}${e.bonusLife > 0 ? ` x${e.bonusLife}` : ''}`,
    );
    (p.container.position.set(t + 29, i + 1), c.addChild(p.container));
    const g =
      r && e.role === 'player' && e.score > 0 && this.sourceMode !== 'practice'
        ? e.score.toLocaleString()
        : e.role === 'boss'
          ? 'Boss'
          : '';
    if (g) {
      const v = this.sourceBitmapText(0, g);
      (v.container.position.set(t + 232 - v.width, i + 1), c.addChild(v.container));
    }
    if (
      (this.drawEmbossBar(c, t + 26, i + 14, h, [16776960, 16762368, 11700736]),
      e.totalMp > 0 && this.drawEmbossBar(c, t + 26, i + 20, u, [314879, 37119, 25778]),
      n > 0)
    ) {
      const v = Math.min(n, Math.max(0, Math.trunc(e.spl)));
      for (let x = 0; x < v; x += 1)
        this.drawEmbossBar(c, t + 214 + 6 * x, i + 20, 5, [16750847, 14576616, 10177186]);
      v < n &&
        e.sp > 0 &&
        this.drawEmbossBar(
          c,
          t + 214 + 6 * v,
          i + 20,
          Math.min(5, Math.trunc((5 * e.sp) / 100)),
          [16750847, 14576616, 10177186],
        );
    }
    this.hudLayer.addChild(c);
  }
  drawSourceTimer(e, t) {
    if (this.timer === -1) {
      const r = this.sourceDicedTexture('ui.stats', 6, 1, 1, 26, 25, 'timer-infinity');
      if (r) {
        const n = new Sprite(r);
        (n.position.set(e + 242, t + 4), this.hudLayer.addChild(n));
      }
      return;
    }
    const i = String(Math.max(0, this.timer)).padStart(2, '0').slice(-2);
    for (const [r, n] of [...i].entries()) {
      const a = atlasCellPosition(Number(n), 10, 12, 25),
        o = this.sourceDicedTexture('ui.stats', 0, a.x, a.y, 12, 25, `counter-${n}`);
      if (!o) continue;
      const l = new Sprite(o);
      (l.position.set(e + 241 + r * 12, t + 3), this.hudLayer.addChild(l));
    }
  }
  renderDialog() {
    this.dialogLayer.removeChildren().forEach((t) => t.destroy());
    const e = (t, i) => {
      if (!t) return;
      const r = i ? 1 : 2,
        n = this.sourceBitmapText(r, t.text),
        a = t.textWidth ?? this.sourceBitmapWidth(2, t.text),
        o = t.totalFrames ?? Math.trunc(a / 2) + 45,
        l = Math.max(0, o - t.frames),
        c = Math.trunc(a / 2),
        h = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x / 15)), 2),
        u = (x, b = 15) => Math.pow(Math.min(1, Math.max(0, x / b)), 2);
      let d = SCREEN_WIDTH / 2;
      if (t.closingFrames !== void 0) {
        const x = i ? TIMING.missionCloseFrames : TIMING.captionCloseFrames;
        d += (SCREEN_WIDTH + a - SCREEN_WIDTH / 2) * u(x - t.closingFrames, x);
      } else
        l < 15
          ? (d = -a + (SCREEN_WIDTH / 2 + a) * h(l))
          : l >= 15 + c &&
            (d = SCREEN_WIDTH / 2 + (SCREEN_WIDTH + a - SCREEN_WIDTH / 2) * u(l - 15 - c));
      const m = (this.manifest?.bitmapFonts[i ? 0 : 2]?.height ?? (i ? 10 : 25)) + 10,
        p = t.y - 3,
        g = l;
      if (t.closingFrames !== void 0 || g < (t.barFrames ?? o)) {
        const x = Math.trunc(p - m / 2),
          b = new Graphics();
        (b.rect(0, x, SCREEN_WIDTH, 1).fill(16777215),
          b.rect(0, x + 1, SCREEN_WIDTH, 1).fill(1315860),
          b.rect(0, x + 2, SCREEN_WIDTH, Math.max(0, m - 4)).fill({
            color: 0,
            alpha: 0.5,
          }),
          b.rect(0, x + m - 2, SCREEN_WIDTH, 1).fill(1315860),
          b.rect(0, x + m - 1, SCREEN_WIDTH, 1).fill(16777215),
          this.dialogLayer.addChild(b));
      }
      (n.container.position.set(
        Math.trunc(d - n.width / 2),
        Math.trunc((i ? t.y - 3 : t.y + 1) - n.height / 2),
      ),
        this.dialogLayer.addChild(n.container));
    };
    (e(this.caption, !1), e(this.mission, !0));
    for (const [t, i] of [...this.dialogs.entries()].sort((r, n) => r[0] - n[0])) {
      const r = i[0],
        n = this.dialogTexts.get(t) ?? '',
        a =
          !r || r.phase === 'swap-exit'
            ? n
            : r.phase === 'enter'
              ? ''
              : r.phase === 'printing'
                ? r.text.slice(0, r.reveal)
                : r.text,
        o = panelPlacement(t),
        l = r?.displayActor ?? this.dialogActors.get(t),
        c = l ? this.actor(l) : void 0,
        h = o.forcedFace ?? c?.face ?? 1;
      let u = o.x;
      if (r?.phase === 'enter') {
        const x = Math.max(0, PANEL_ENTER_FRAMES - Math.min(PANEL_ENTER_FRAMES, r.delay));
        u = panelEnterX(t, x);
      } else r?.phase === 'swap-exit' && (u = panelExitX(t, PANEL_EXIT_FRAMES - r.delay));
      const d = this.dialogCloseFrames.get(t);
      (d !== void 0 && (u = panelExitX(t, PANEL_EXIT_FRAMES - d)), (u = Math.trunc(u)));
      const f = o.y;
      if (
        (this.dialogLayer.addChild(
          new Graphics().rect(u + 2, f + 2, PANEL_TRAVEL - 4, PANEL_HEIGHT - 5).fill({
            color: 0,
            alpha: 0.5,
          }),
        ),
        c)
      ) {
        const x = this.atlases.get(c.sprite),
          b = x ? this.sourceCroppedTexture(c.sprite, Math.max(0, x.entry.frames - 1)) : void 0;
        if (b) {
          const _ = new Sprite(b);
          ((_.y = f + 3 + 90 - b.height),
            h === 1 ? (_.x = u + 2) : ((_.x = u + PANEL_TRAVEL - 2), (_.scale.x = -1)),
            this.dialogLayer.addChild(_));
        }
      }
      const m = this.images.get('dialog');
      if (m) {
        const x = new Sprite(m);
        ((x.y = f),
          h === 1 ? (x.x = u) : ((x.x = u + PANEL_TRAVEL), (x.scale.x = -1)),
          this.dialogLayer.addChild(x));
      }
      const p = h === 1 ? u + 97 : u + 6,
        g = this.sourceBitmapText(0, c ? this.actorDisplayName(c) : 'Narrator');
      (g.container.position.set(p, f + 5), this.dialogLayer.addChild(g.container));
      let v = f + 18;
      for (const x of a.split('|').slice(0, 3)) {
        const b = this.sourceBitmapText(2, x);
        (b.container.position.set(p, v),
          this.dialogLayer.addChild(b.container),
          (v += (this.manifest?.bitmapFonts?.[2]?.height ?? 25) - 1));
      }
      if (r?.phase === 'waiting') {
        const x = Math.floor(this.frame / 10) & 1,
          b = atlasCellPosition(x, 4, 11, 15),
          _ = this.sourceDicedTexture('ui.stats', 1, b.x, b.y, 11, 15, `dialog-arrow-${x}`);
        if (_) {
          const S = new Sprite(_);
          (S.position.set(p + 316, f + 74), this.dialogLayer.addChild(S));
        }
      }
    }
    for (const [t, i] of this.lines) {
      const r = this.sourceBitmapText(2, i.text),
        n = i.textWidth ?? r.width,
        a = i.totalFrames ?? n + 20,
        o = Math.max(0, a - i.frames),
        l = t === 0 ? 0 : 1,
        c = l === 0 ? -n - 8 : SCREEN_WIDTH + n + 8,
        h = l === 0 ? 3 : SCREEN_WIDTH - 5,
        u = l === 0 ? -n : SCREEN_WIDTH + n,
        d = (p) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p / 10)), 2),
        f = (p) => Math.pow(Math.min(1, Math.max(0, p / 10)), 2);
      let m = h;
      (i.closingFrames !== void 0
        ? (m = h + (u - h) * f(TIMING.lineCloseFrames - i.closingFrames))
        : o < 10
          ? (m = c + (h - c) * d(o))
          : o >= 10 + n && (m = h + (c - h) * f(o - 10 - n)),
        r.container.position.set(Math.trunc(l === 0 ? m : m - r.width), i.y),
        this.dialogLayer.addChild(r.container));
    }
    if (this.goFrames > 0) {
      const t = GO_TOTAL_FRAMES - this.goFrames,
        r =
          (t <= TIMING.goDelayFrames
            ? 0
            : Math.floor((t - TIMING.goDelayFrames) * TIMING.goAnimationSpeed) %
              TIMING.goAnimationFrameCount) === 0
            ? 0
            : 1,
        n = atlasCellPosition(r, 2, 63, 52),
        a = this.sourceDicedTexture('ui.stats', 3, n.x, n.y, 63, 52, `go-${r}`);
      if (a) {
        const o = new Sprite(a);
        (o.position.set(SCREEN_WIDTH - 8 - 63, SCREEN_HEIGHT / 2 + 16 - 26),
          this.dialogLayer.addChild(o));
      }
    }
    for (const [t, i] of this.markerFrames) {
      if (t.removed || !t.isLiving()) continue;
      const r = (Math.trunc(i / 10) & 1) * 8,
        n = atlasCellPosition(r, 8, 22, 31),
        a = this.sourceDicedTexture('ui.stats', 4, n.x, n.y, 22, 31, `marker-${r}`);
      if (!a) continue;
      const o = new Sprite(a);
      (o.position.set(
        Math.round(t.x - this.cameraX - 11),
        Math.round(
          this.cameraY +
            SCREEN_HEIGHT -
            SCENE_HEIGHT +
            this.floorTop +
            t.y -
            31 -
            t.jump -
            (t.type.solid[2] ?? 40) -
            12,
        ),
      ),
        this.dialogLayer.addChild(o));
    }
    if (this.miniStats && !this.superActor)
      for (const t of this.actors) this.shouldDrawMiniStat(t) && this.drawMiniStat(t);
    this.helpFrames > 0 && this.renderSourceHelpKeys();
  }
  shouldDrawMiniStat(e) {
    return e.removed ||
      e.processType !== 'ai' ||
      e.type.actorType === 1 ||
      e.role === 'none' ||
      e.role === 'object' ||
      e.role === 'pickup' ||
      (e.role === 'player' && (this.markerFrames.get(e) ?? 0) > 0)
      ? !1
      : e.miniStatFrames > 0 || e.didWarning;
  }
  drawMiniStat(e) {
    const r = Math.round(e.x - this.cameraX - 15),
      n = Math.round(
        this.cameraY +
          SCREEN_HEIGHT -
          SCENE_HEIGHT +
          this.floorTop +
          e.y -
          2 -
          e.jump -
          (e.type.solid[2] ?? 40) -
          12,
      ),
      a = e.totalHp > 0 ? Math.max(e.hp > 0 ? 1 : 0, Math.trunc((27 * e.hp) / e.totalHp)) : 0,
      o = [16777215, 5263614, 16728128, 13172544, 4259648, 16744512, 6605e3, 13133e3, 12632256],
      l = new Graphics();
    (l.rect(r - 1, n - 1, 32, 4).fill({
      color: 0,
      alpha: 0.5,
    }),
      e.align >= 0 && l.rect(r, n, 2, 2).fill(o[Math.min(e.align, o.length - 1)] ?? 16777215),
      a > 0 && l.rect(r + 3, n, a, 2).fill(16762890),
      this.dialogLayer.addChild(l));
  }
  renderSourceHelpKeys() {
    const r = 60 + (this.manifest?.bitmapFonts?.[0]?.height ?? 10) + 5,
      n = SCREEN_HEIGHT + 90,
      a = SCREEN_HEIGHT,
      o = this.helpTotalFrames || this.sourceGameRate() * 30 + 20,
      l = Math.max(0, o - this.helpFrames),
      c = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x / 10)), 2),
      h = (x) => Math.pow(Math.min(1, Math.max(0, x / 10)), 2);
    let u = a;
    this.helpClosingFrames > 0
      ? (u += (n - a) * h(10 - this.helpClosingFrames))
      : l < 10
        ? (u = n + (a - n) * c(l))
        : this.helpFrames <= 10 && (u += (n - a) * h(10 - this.helpFrames));
    const d = new Container();
    ((d.y = Math.trunc(u - r)), (d.alpha = l < 100 && (Math.floor(l / 10) & 1) === 1 ? 1 : 0.75));
    const f = atlasCellPosition(0, 4, 32, 30),
      m = this.sourceDicedTexture('ui.guiicon', 1, f.x, f.y, 32, 30, 'help-key'),
      p = (x, b, _) => {
        if (m) {
          const w = new Sprite(m);
          (w.position.set(b, _), d.addChild(w));
        }
        const S = this.sourceBitmapText(4, x);
        (S.container.position.set(
          b + Math.trunc((32 - S.width) / 2) - 1,
          _ + Math.trunc((30 - S.height) / 2) + 1,
        ),
          d.addChild(S.container));
      },
      g = (x, b, _, S) => {
        const w = this.sourceBitmapText(x, b);
        (w.container.position.set(Math.trunc(_ - w.width / 2), S), d.addChild(w.container));
      },
      v = (x, b) => {
        const _ = Math.max(0, Math.min(1, this.selectedPlayers[x]?.controller ?? x)),
          S = this.settings.keyboardMaps[_];
        (g(0, `Player ${x + 1}`, b + 98, 10),
          p(keyLabel(S[7]), b + 32, 0),
          p(keyLabel(S[4]), b, 30),
          p(keyLabel(S[5]), b + 32, 30),
          p(keyLabel(S[6]), b + 64, 30),
          g(1, 'Key Buttons', b + Math.trunc(32 * 1.5), 62));
        const w = b + 96 + 4;
        (p(keyLabel(S[0]), w + 32, 0),
          p(keyLabel(S[3]), w, 30),
          p(keyLabel(S[2]), w + 32, 30),
          p(keyLabel(S[1]), w + 64, 30),
          g(1, 'Key Moves', w + Math.trunc(32 * 1.5), 62));
      };
    (v(0, 3),
      v(1, SCREEN_WIDTH - 3 - 196),
      g(0, 'F1 = Toggle Help', SCREEN_WIDTH / 2, 62),
      this.dialogLayer.addChild(d));
  }
  renderStaticScreen() {
    this.screen !== 'paused' && this.screen !== 'help' && this.clearPausePresentation();
    const e = !!(this.endResult && (this.screen === 'clear' || this.screen === 'defeated'));
    ((this.sceneLayer.visible = e),
      (this.superLayer.visible = e),
      (this.screenLayer.visible = !0),
      (this.logoLayer = void 0),
      (this.logoFilter = void 0),
      (this.introCover = void 0),
      (this.introCoverFilter = void 0),
      this.introCharacterViews.clear(),
      (this.splashLayer = void 0),
      (this.splashFilter = void 0),
      (this.splashPrompt = void 0),
      (this.menuPanel = void 0),
      (this.menuFadeOverlay = void 0),
      (this.menuSword = void 0),
      (this.menuHintLayer = void 0),
      (this.menuRoot = void 0),
      (this.menuMove = void 0),
      (this.heroSelectLayer = void 0),
      (this.heroSelectFilter = void 0),
      (this.heroSelectTitle = void 0),
      (this.heroSelectPanel = void 0),
      (this.heroSelectArrow = void 0),
      (this.heroSelectHighlight = void 0),
      (this.heroSelectPortraits.length = 0),
      (this.heroSelectConfirmedFrames.length = 0),
      (this.heroSelectLockedMessage = void 0),
      (this.chapterPanel = void 0),
      (this.chapterCursor = void 0),
      (this.chapterFadeOverlay = void 0),
      (this.chapterLetterbox = void 0),
      (this.chapterHintLayer = void 0),
      (this.chapterMove = void 0),
      (this.scorePanel = void 0),
      (this.scoreFilter = void 0),
      (this.scoreHintLayer = void 0),
      this.screenLayer.removeChildren().forEach((i) =>
        i.destroy({
          children: !0,
        }),
      ),
      e ||
        (this.hudLayer.removeChildren().forEach((i) => i.destroy()),
        this.dialogLayer.removeChildren().forEach((i) => i.destroy()),
        this.fadeLayer.removeChildren().forEach((i) => i.destroy())),
      this.overlayLayer.removeChildren().forEach((i) => i.destroy()));
    const t =
      !!this.startupLoad ||
      this.screen === 'logo' ||
      this.screen === 'intro' ||
      this.screen === 'splash';
    if (
      (e
        ? this.renderSourceEndScreen()
        : this.screenLayer.addChild(
            new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill(t ? 0 : 133396),
          ),
      !e)
    )
      if (this.screen === 'loading') {
        const i = editionInfo(this.edition === 'full'),
          r = new Container();
        (this.renderSourceContract(
          drawLoadingScreen({
            title: this.sceneTitle || null,
            subtitle: this.sceneSubtitle || null,
            owner: i.owner,
            percent: this.startupLoad ? this.assetProgress : this.sceneTransition?.prepared ? 1 : 0,
            fullEdition: this.edition === 'full',
            visible: this.startupLoad
              ? this.startupLoad.state.delay >= this.startupLoad.state.initialDelay
              : !0,
          }),
          r,
        ),
          this.screenLayer.addChild(r));
      } else
        this.screen === 'logo'
          ? this.renderLogo()
          : this.screen === 'intro' && !this.introBootstrap
            ? this.renderIntro()
            : this.screen === 'splash'
              ? this.renderSplash()
              : this.screen === 'menu'
                ? this.renderMenu()
                : this.screen === 'hero'
                  ? this.renderHeroSelection()
                  : this.screen === 'select'
                    ? this.renderSourceSelectScreen()
                    : this.screen === 'chapters'
                      ? this.renderChapters()
                      : this.screen === 'scores'
                        ? this.renderScores()
                        : this.screen === 'submit' || this.screen === 'input'
                          ? this.renderScoreFlow()
                          : this.screen === 'clear'
                            ? this.renderMessage(
                                'Stage Clear',
                                `Score ${this.score.toLocaleString()}
Press Enter to return`,
                              )
                            : this.screen === 'defeated' &&
                              this.renderMessage(
                                'Defeated',
                                `Final score ${this.score.toLocaleString()}
Press Enter to return`,
                              );
  }
  renderPlayQuestion() {
    const e = this.playQuestion;
    e && this.renderQuestionModal(e, 'play');
  }
  renderMenuQuestion() {
    const e = this.menuQuestion;
    e && this.renderQuestionModal(e, 'menu');
  }
  renderQuestionModal(e, t) {
    this.overlayLayer.removeChildren().forEach((c) =>
      c.destroy({
        children: !0,
      }),
    );
    const i = new Container();
    i.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 1 - QUESTION_DIM,
      }),
    );
    const r = this.sourceCroppedTexture('ui.guiform', QUESTION_LAYOUT.form),
      n = 140,
      a = 134;
    if (r) {
      const c = new Sprite(r);
      (c.position.set(n, a), i.addChild(c));
    }
    const o = n + QUESTION_LAYOUT.panelInsetX,
      l = a + QUESTION_LAYOUT.panelInsetY;
    (this.addSourceGuiIcon(i, QUESTION_LAYOUT.shieldIcon, o, l, `${t}-question-shield`),
      this.addSourceBitmap(i, 2, e.title, o + 40, l),
      this.addSourceBitmap(i, 1, e.question, o + 40, l + 27),
      this.addSourceGuiIcon(
        i,
        QUESTION_LAYOUT.swordIcon,
        o - 4 + e.state.choice * QUESTION_LAYOUT.choiceGapX + questionBlink(e.state.swordDraws),
        l + QUESTION_LAYOUT.choicesY - 4,
        `${t}-question-sword`,
      ),
      this.addSourceBitmap(i, 3, e.yes, o + 34, l + QUESTION_LAYOUT.choicesY),
      this.addSourceBitmap(
        i,
        3,
        e.no,
        o + 34 + QUESTION_LAYOUT.choiceGapX,
        l + QUESTION_LAYOUT.choicesY,
      ),
      this.overlayLayer.addChild(i));
  }
  addSourceVersusVertical(e) {
    const t = VERSUS_LAYOUT.separator;
    this.addSourceGuiIcon(e, 8, t.x, t.y, 'versus-separator-top');
    for (let i = 0; i < t.middleCount; i += 1)
      this.addSourceGuiIcon(e, 9, t.x, t.y + 30 + i * 30, `versus-separator-middle-${i}`);
    this.addSourceGuiIcon(e, 10, t.x, t.y + 30 + t.middleCount * 30, 'versus-separator-bottom');
  }
  renderVersusEndFlow() {
    const e = this.versusEndFlow;
    if (!e) return;
    const t = versusEndView(e);
    ((this.sceneLayer.visible = !0),
      (this.superLayer.visible = !0),
      (this.screenLayer.visible = !0),
      this.screenLayer.removeChildren().forEach((c) =>
        c.destroy({
          children: !0,
        }),
      ),
      this.overlayLayer.removeChildren().forEach((c) =>
        c.destroy({
          children: !0,
        }),
      ),
      this.screenLayer.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
          color: 0,
          alpha: 1 - 0.75,
        }),
      ));
    const i = new Container();
    i.y = t.resultPanelPixelY;
    const r = VERSUS_LAYOUT,
      n = this.sourceCroppedTexture('ui.guiform', 17);
    if (n) {
      const c = new Sprite(n);
      (c.position.set(r.panel.x, r.panel.y), i.addChild(c));
    }
    const a = this.sourceBitmapWidth(3, t.report.title),
      o = versusTitleLayout(t.result.round, a);
    this.addSourceBitmap(i, 3, o.text, o.textX, o.textY);
    const l = t.report.players.map((c) => (c.outcomeIcon === 'winner' ? 14 : 15));
    (this.addSourceGuiIcon(i, l[0], o.playerOneIconX, o.iconY, 'versus-title-p1'),
      this.addSourceGuiIcon(i, l[1], o.playerTwoIconX, o.iconY, 'versus-title-p2'),
      t.report.buttons.forEach((c, h) => {
        const u = this.sourceCroppedTexture('ui.guiform', 12);
        if (u) {
          const d = new Sprite(u);
          (d.position.set(r.buttons.baseXs[h], r.buttons.y), i.addChild(d));
        }
        this.addSourceBitmap(i, 3, c, r.buttons.textXs[h], r.buttons.y + 4);
      }),
      this.addSourceGuiIcon(
        i,
        1,
        r.buttons.cursorXs[t.choice] + t.resultSwordOffset,
        r.buttons.y + 1,
        'versus-result-sword',
      ));
    for (const c of t.report.players) {
      const h = c.x,
        u = c.rows;
      (this.addSourceBitmap(i, 0, c.playerText, h, u.player),
        this.addSourceBitmap(i, 1, c.characterText, h, u.character),
        this.addSourceBitmap(i, c.outcomeFont, c.outcomeText, h, u.outcome),
        this.addSourceBitmap(i, 0, c.battleResultsText, h, u.battleResults),
        this.addSourceBitmap(i, 1, c.killBonusText, h, u.killBonus),
        this.addSourceBitmap(i, 1, c.timeBonusText, h, u.timeBonus),
        this.addSourceBitmap(i, 0, c.finalReportText, h, u.finalReport),
        this.addSourceBitmap(i, 1, c.winsText, h, u.wins),
        this.addSourceBitmap(i, 1, c.lossText, h, u.loss),
        this.addSourceBitmap(i, 1, c.scoreText, h, u.score));
    }
    if ((this.addSourceVersusVertical(i), this.screenLayer.addChild(i), t.question)) {
      const c = t.question,
        h = new Container();
      h.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
          color: 0,
          alpha: 1 - QUESTION_DIM,
        }),
      );
      const u = this.sourceCroppedTexture('ui.guiform', QUESTION_LAYOUT.form),
        d = 140,
        f = 134;
      if (u) {
        const g = new Sprite(u);
        (g.position.set(d, f), h.addChild(g));
      }
      const m = d + QUESTION_LAYOUT.panelInsetX,
        p = f + QUESTION_LAYOUT.panelInsetY;
      (this.addSourceGuiIcon(h, QUESTION_LAYOUT.shieldIcon, m, p, 'versus-question-shield'),
        this.addSourceBitmap(h, 2, c.contract.title, m + 40, p),
        this.addSourceBitmap(h, 1, c.contract.question, m + 40, p + 27),
        this.addSourceGuiIcon(
          h,
          QUESTION_LAYOUT.swordIcon,
          m - 4 + c.choice * QUESTION_LAYOUT.choiceGapX + c.swordOffset,
          p + QUESTION_LAYOUT.choicesY - 4,
          'versus-question-sword',
        ),
        this.addSourceBitmap(h, 3, c.contract.buttons[0], m + 34, p + QUESTION_LAYOUT.choicesY),
        this.addSourceBitmap(
          h,
          3,
          c.contract.buttons[1],
          m + 34 + QUESTION_LAYOUT.choiceGapX,
          p + QUESTION_LAYOUT.choicesY,
        ),
        this.overlayLayer.addChild(h));
    }
  }
  renderSourceSelectScreen() {
    const e = this.selectState;
    if (!e) return;
    this.screenLayer.removeChildren().forEach((n) =>
      n.destroy({
        children: !0,
      }),
    );
    const t = new Container();
    (this.renderSourceContract(
      drawSelectScreen({
        state: e,
        movementKeys: this.settings.keyboardMaps[0].slice(0, 4).map(keyLabel).join(''),
        actionKeys: `${keyLabel(this.settings.keyboardMaps[0][4])} , ${keyLabel(this.settings.keyboardMaps[0][7])}`,
      }),
      t,
    ),
      this.screenLayer.addChild(t),
      this.overlayLayer.removeChildren().forEach((n) =>
        n.destroy({
          children: !0,
        }),
      ));
    const i = this.selectModal;
    if (!i) return;
    this.overlayLayer.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 0.6,
      }),
    );
    const r = this.sourceCroppedTexture('ui.guiform', 13);
    if (r) {
      const n = new Sprite(r);
      (n.position.set(
        Math.trunc((SCREEN_WIDTH - n.width) / 2),
        Math.trunc((SCREEN_HEIGHT - n.height) / 2),
      ),
        this.overlayLayer.addChild(n));
    }
    (this.addSourceBitmap(this.overlayLayer, 3, i.title, SCREEN_WIDTH / 2, 112, !0),
      this.addSourceBitmap(this.overlayLayer, 2, i.message, SCREEN_WIDTH / 2, 165, !0),
      i.kind === 'question' &&
        (this.addSourceBitmap(this.overlayLayer, i.choice === 0 ? 3 : 2, 'Yes', 205, 235, !0),
        this.addSourceBitmap(this.overlayLayer, i.choice === 1 ? 3 : 2, 'No', 307, 235, !0)));
  }
  renderScoreFlow() {
    if (this.screen !== 'submit' && this.screen !== 'input') return;
    this.screenLayer.removeChildren().forEach((t) =>
      t.destroy({
        children: !0,
      }),
    );
    const e = new Container();
    (this.renderSourceContract(
      drawCongratulationsScreen({
        mode: this.scoreMode,
        playerOneScore: this.submitPlayerScores[0],
        playerTwoScore: this.submitPlayerScores[1],
        choice: this.submitChoice,
        drawFrame: this.submitFrame,
        officialEdition: !0,
      }),
      e,
    ),
      this.screen === 'input' &&
        this.hiscoreInput &&
        this.renderSourceContract(
          drawNameEntryScreen({
            state: this.hiscoreInput,
            drawFrame: this.submitFrame,
          }),
          e,
        ),
      this.screenLayer.addChild(e),
      this.overlayLayer.removeChildren().forEach((t) =>
        t.destroy({
          children: !0,
        }),
      ),
      this.scoreFlowModal && this.renderScoreFlowModal(this.scoreFlowModal));
  }
  renderScoreFlowModal(e) {
    const t = new Container();
    if (
      (t.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
          color: 0,
          alpha: 0.25,
        }),
      ),
      e.kind === 'question')
    ) {
      const i = e.route,
        r = this.sourceCroppedTexture('ui.guiform', QUESTION_LAYOUT.form),
        n = 140,
        a = 134;
      if (r) {
        const c = new Sprite(r);
        (c.position.set(n, a), t.addChild(c));
      }
      const o = n + QUESTION_LAYOUT.panelInsetX,
        l = a + QUESTION_LAYOUT.panelInsetY;
      (this.addSourceGuiIcon(t, QUESTION_LAYOUT.shieldIcon, o, l, 'score-question-shield'),
        this.addSourceBitmap(t, 2, i.title, o + 40, l),
        this.addSourceBitmap(t, 1, i.question, o + 40, l + 27),
        this.addSourceGuiIcon(
          t,
          QUESTION_LAYOUT.swordIcon,
          o - 4 + e.choice * QUESTION_LAYOUT.choiceGapX + questionBlink(this.submitFrame),
          l + QUESTION_LAYOUT.choicesY - 4,
          'score-question-sword',
        ),
        this.addSourceBitmap(t, 3, i.buttons[0], o + 34, l + QUESTION_LAYOUT.choicesY),
        this.addSourceBitmap(
          t,
          3,
          i.buttons[1],
          o + 34 + QUESTION_LAYOUT.choiceGapX,
          l + QUESTION_LAYOUT.choicesY,
        ));
    } else {
      const i = e.route,
        r = this.sourceCroppedTexture('ui.guiform', MESSAGE_LAYOUT.form),
        n = 140,
        a = 152;
      if (r) {
        const c = new Sprite(r);
        (c.position.set(n, a), t.addChild(c));
      }
      const o = n + MESSAGE_LAYOUT.panelInsetX,
        l = a + MESSAGE_LAYOUT.panelInsetY;
      (this.addSourceGuiIcon(t, 0, o, l, 'score-popup-shield'),
        this.addSourceBitmap(t, 2, i.title, o + 40, l),
        this.addSourceBitmap(t, 1, i.message, o + 40, l + 27));
    }
    this.overlayLayer.addChild(t);
  }
  renderScores() {
    const e = new Container(),
      t = this.scorePages ?? buildHighScorePages(this.localScores, this.scoreHighlight);
    for (const [c, h] of t.entries()) {
      const u = new Container();
      u.x = c * SCREEN_WIDTH;
      const d = this.images.get(HIGH_SCORE_SCREEN.background);
      (d && u.addChild(new Sprite(d)),
        u.addChild(
          new Graphics()
            .rect(
              HIGH_SCORE_SCREEN.centerShade.x,
              HIGH_SCORE_SCREEN.centerShade.y,
              HIGH_SCORE_SCREEN.centerShade.width,
              HIGH_SCORE_SCREEN.centerShade.height,
            )
            .fill({
              color: 0,
              alpha: 0.625,
            }),
        ));
      const f = new Graphics(),
        m = (p) => (p === 'white' ? 16777215 : p === 'gray' ? 8421504 : 0);
      for (const p of [...HIGH_SCORE_SCREEN.borderXs.left, ...HIGH_SCORE_SCREEN.borderXs.right])
        f.rect(p.x, 0, 1, SCREEN_HEIGHT).fill(m(p.color));
      (u.addChild(f),
        this.addSourceBitmap(
          u,
          HIGH_SCORE_SCREEN.fonts.title,
          h.title,
          SCREEN_WIDTH / 2,
          HIGH_SCORE_SCREEN.layout.titleY,
          !0,
        ),
        this.addSourceBitmap(
          u,
          HIGH_SCORE_SCREEN.fonts.subtitle,
          h.subtitle,
          SCREEN_WIDTH / 2,
          HIGH_SCORE_SCREEN.layout.subtitleY,
          !0,
        ));
      for (const p of h.entries) {
        const g = p.highlighted ? 5 : HIGH_SCORE_SCREEN.fonts.row,
          v = this.sourceBitmapWidth(g, p.rankLabel);
        (this.addSourceBitmap(u, g, p.rankLabel, HIGH_SCORE_SCREEN.layout.rankRightX - v, p.y),
          this.addSourceBitmap(u, g, p.displayName, HIGH_SCORE_SCREEN.layout.nameX, p.y));
        const x = p.score.toLocaleString('en-US'),
          b = this.sourceBitmapWidth(g, x);
        this.addSourceBitmap(u, g, x, HIGH_SCORE_SCREEN.layout.scoreRightX - b, p.y);
        const _ = this.sourceCroppedTexture(HIGH_SCORE_SCREEN.trophyAtlas, p.trophyFrame);
        if (_) {
          const S = new Sprite(_);
          (S.position.set(
            HIGH_SCORE_SCREEN.layout.trophyX,
            p.y + HIGH_SCORE_SCREEN.layout.trophyYOffset,
          ),
            u.addChild(S));
        }
      }
      e.addChild(u);
    }
    ((e.x = this.scoreMode === 'arcade' ? 0 : -SCREEN_WIDTH),
      (this.scorePanel = e),
      (this.scoreFilter =
        typeof document > 'u'
          ? void 0
          : new ColorMatrixFilter({
              padding: 0,
            })),
      this.screenLayer.addChild(e));
    const i = SCREEN_HEIGHT - 13,
      r = new Container();
    ((r.visible = this.pauseHints),
      r.addChild(
        new Graphics().rect(0, i, SCREEN_WIDTH, 13).fill({
          color: 0,
          alpha: 0.5,
        }),
      ));
    const n = `${keyLabel(this.settings.keyboardMaps[0][3])}${keyLabel(this.settings.keyboardMaps[0][1])}`;
    (this.addSourceBitmap(r, 5, n, 2, i + 2),
      this.addSourceBitmap(
        r,
        0,
        HIGH_SCORE_SCREEN.hints.movement,
        2 + this.sourceBitmapWidth(5, n) + 8,
        i + 2,
      ));
    const a = this.sourceBitmapText(0, HIGH_SCORE_SCREEN.hints.actions);
    (a.container.position.set(SCREEN_WIDTH - 2 - a.width, i + 2), r.addChild(a.container));
    const o = `${keyLabel(this.settings.keyboardMaps[0][4])} , ${keyLabel(this.settings.keyboardMaps[0][7])}`,
      l = this.sourceBitmapWidth(5, o);
    (this.addSourceBitmap(r, 5, o, SCREEN_WIDTH - 2 - a.width - 8 - l, i + 2),
      (this.scoreHintLayer = r),
      this.screenLayer.addChild(r));
  }
  addSourceBitmap(e, t, i, r, n, a = !1, o = t) {
    const l = this.sourceBitmapText(t, i);
    (l.container.position.set(a ? Math.trunc(r - this.sourceBitmapWidth(o, i) / 2) : r, n),
      e.addChild(l.container));
  }
  renderSourceContract(e, t, i = !1) {
    let r = 0;
    const n = (a) => {
      if (a.kind === 'clear')
        t.addChild(new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill(a.color));
      else if (a.kind === 'image') {
        const o = this.images.get(a.asset);
        if (o) {
          const l = new Sprite(o);
          (l.position.set(a.x, a.y), t.addChild(l));
        }
      } else if (a.kind === 'atlas-frame') {
        const o = this.sourceCroppedTexture(a.atlas, a.frame);
        if (o) {
          const l = new Sprite(o);
          (l.position.set(a.flipX ? a.x + o.width : a.x, a.y),
            a.flipX && (l.scale.x = -1),
            t.addChild(l));
        }
      } else if (a.kind === 'actor-icon') {
        const o = this.addSourceActorIcon(t, a.actorId, a.frame ?? 0, a.size, a.x, a.y);
        o &&
          ((a.treatment === 'fade' || a.treatment === 'fade-solid') && (o.alpha = 0.5),
          (a.treatment === 'solid' || a.treatment === 'fade-solid') &&
            a.solidColor !== void 0 &&
            (o.tint = a.solidColor));
      } else if (a.kind === 'atlas-cell') {
        const o = (a.cell % a.across) * (a.width + a.gutter) + a.gutter,
          l = Math.floor(a.cell / a.across) * (a.height + a.gutter) + a.gutter,
          c = this.sourceDicedTexture(
            a.atlas,
            a.sourceFrame,
            o,
            l,
            a.width,
            a.height,
            `contract-${a.atlas}-${a.sourceFrame}-${a.cell}-${a.width}x${a.height}`,
          );
        if (c) {
          const h = new Sprite(c);
          (h.position.set(a.flipX ? a.x + a.width : a.x, a.y),
            a.flipX && (h.scale.x = -1),
            (a.treatment === 'fade' || a.treatment === 'fade-solid') && (h.alpha = 0.5),
            (a.treatment === 'solid' || a.treatment === 'fade-solid') &&
              a.solidColor !== void 0 &&
              (h.tint = a.solidColor),
            t.addChild(h));
        }
      } else if (a.kind === 'text') {
        const o = FONT_INDEX[a.font];
        let l = a.text;
        if (a.truncateFromEndAtWidth !== void 0) {
          const u = a.truncateMeasureSuffix ?? '';
          for (; l.length > 0 && this.sourceBitmapWidth(o, `${l}${u}`) > a.truncateFromEndAtWidth;)
            l = l.slice(1);
        }
        const c = this.sourceBitmapText(o, l),
          h =
            a.anchor === 'center' ? a.x - c.width / 2 : a.anchor === 'right' ? a.x - c.width : a.x;
        (c.container.position.set(Math.trunc(h), a.y), t.addChild(c.container));
      } else if (a.kind === 'canvas-effect')
        a.effect === 'hue'
          ? (r = a.amount ?? 0)
          : a.effect === 'half-rect' || a.effect === 'quarter-rect'
            ? t.addChild(
                new Graphics()
                  .rect(a.x ?? 0, a.y ?? 0, a.width ?? SCREEN_WIDTH, a.height ?? SCREEN_HEIGHT)
                  .fill({
                    color: 0,
                    alpha: a.amount ?? (a.effect === 'half-rect' ? 0.5 : 0.25),
                  }),
              )
            : !i &&
              (a.effect === 'fade-frozen' || a.effect === 'gray-frozen') &&
              t.addChild(
                new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
                  color: 0,
                  alpha: 1 - (a.amount ?? 0.5),
                }),
              );
      else if (a.kind === 'line')
        t.addChild(
          new Graphics().moveTo(a.x1, a.y1).lineTo(a.x2, a.y2).stroke({
            color: a.color,
            width: 1,
          }),
        );
      else if (a.kind === 'emboss-rect')
        t.addChild(
          new Graphics().rect(a.x, a.y, a.width, a.height).fill(a.dark),
          new Graphics()
            .rect(a.x, a.y, Math.max(0, a.width - 1), Math.max(0, a.height - 1))
            .fill(a.light),
          new Graphics()
            .rect(a.x + 1, a.y + 1, Math.max(0, a.width - 2), Math.max(0, a.height - 2))
            .fill(a.middle),
        );
      else if (a.kind === 'hint-bar') {
        (t.addChild(
          new Graphics().rect(0, a.y, SCREEN_WIDTH, SCREEN_HEIGHT - a.y).fill({
            color: 0,
            alpha: 0.5,
          }),
        ),
          this.addSourceBitmap(t, 5, a.movementKeys, 2, a.textY));
        const o = this.sourceBitmapWidth(5, a.movementKeys);
        this.addSourceBitmap(t, 0, a.movementLabel, 2 + o + a.gap, a.textY);
        const l = this.sourceBitmapWidth(0, a.actionLabel),
          c = this.sourceBitmapWidth(5, a.actionKeys),
          h = SCREEN_WIDTH - 2 - a.rightInset - l;
        (this.addSourceBitmap(t, 0, a.actionLabel, h, a.textY),
          this.addSourceBitmap(t, 5, a.actionKeys, h - a.gap - c, a.textY));
      } else if (a.kind === 'menu-header') {
        if (
          (n({
            kind: 'atlas-frame',
            atlas: a.atlas,
            frame: a.frame,
            x: a.x,
            y: a.y,
          }),
          a.title)
        )
          if (a.pairedIcon) {
            const o = this.sourceBitmapWidth(3, a.title),
              l = 30 + a.pairedIcon.afterGap + o,
              c = Math.trunc(a.titleCenterX - l / 2);
            (n({
              kind: 'atlas-cell',
              atlas: a.pairedIcon.atlas,
              sourceFrame: a.pairedIcon.sourceFrame,
              cell: a.pairedIcon.cell,
              across: 8,
              width: 30,
              height: 30,
              gutter: 1,
              x: c,
              y: a.titleY - 5,
            }),
              this.addSourceBitmap(t, 3, a.title, c + 30 + a.pairedIcon.afterGap, a.titleY));
          } else this.addSourceBitmap(t, 3, a.title, a.titleCenterX, a.titleY, !0);
      } else if (a.kind === 'menu-item') {
        if (
          (n({
            kind: 'atlas-frame',
            atlas: a.atlas,
            frame: a.frame,
            x: a.x,
            y: a.y,
          }),
          this.addSourceBitmap(t, a.titleFont === 'big-blue' ? 4 : 2, a.label, a.textX, a.textY),
          a.subtitle &&
            this.addSourceBitmap(
              t,
              a.subtitleFont === 'small-blue' ? 1 : 0,
              a.subtitle,
              a.textX,
              a.textY + 24,
            ),
          a.value)
        ) {
          const o = a.valueKind === 'key' ? 5 : 2,
            l = this.sourceBitmapWidth(o, a.value);
          this.addSourceBitmap(t, o, a.value, a.valueRightX - l, a.textY);
        }
        (a.key && n(a.key), a.sword && n(a.sword));
      }
    };
    if ((e.primitives.forEach(n), r !== 0 && typeof document < 'u')) {
      const a = new ColorMatrixFilter({
        padding: 0,
      });
      this.setDisplayAdditiveHue(t, a, r);
    }
  }
  addSourceGuiIcon(e, t, i, r, n) {
    const a = this.sourceGuiIconTexture(t, n);
    if (!a) return;
    const o = new Sprite(a);
    return (o.position.set(i, r), e.addChild(o), o);
  }
  addSourceEndVertical(e, t, i, r, n) {
    this.addSourceGuiIcon(e, RESULT_SCREEN.icons.verticalTop, t, i, `${n}-top`);
    for (let a = 0; a < r; a += 1)
      this.addSourceGuiIcon(
        e,
        RESULT_SCREEN.icons.verticalMiddle,
        t,
        i + 30 + a * 30,
        `${n}-middle-${a}`,
      );
    this.addSourceGuiIcon(e, RESULT_SCREEN.icons.verticalBottom, t, i + 30 + r * 30, `${n}-bottom`);
  }
  renderSourceEndScreen() {
    const e = this.endResult;
    if (!e) return;
    const t = buildResultReport(e),
      i = e.mode === 'arcade' ? RESULT_LAYOUT.arcade : RESULT_LAYOUT.arena,
      r = new Container(),
      n = this.sourceCroppedTexture(
        RESULT_SCREEN.forms.atlas,
        e.mode === 'arcade'
          ? RESULT_SCREEN.forms.arcadePanelFrame
          : RESULT_SCREEN.forms.arenaPanelFrame,
      );
    if (
      (this.screenLayer.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
          color: 0,
          alpha: 1 - RESULT_SCREEN.frozenSceneFade,
        }),
      ),
      n)
    ) {
      const o = new Sprite(n);
      (o.position.set(i.panel.x, i.panel.y), r.addChild(o));
    }
    this.addSourceBitmap(r, RESULT_SCREEN.fonts.bigGold, t.title, SCREEN_WIDTH / 2, i.titleY, !0);
    const a = this.addSourceGuiIcon(
      r,
      RESULT_SCREEN.icons.sword,
      i.buttonCursorXs[this.endChoice],
      i.buttonY + 1,
      `end-${e.mode}-sword`,
    );
    if (
      ((this.endSword = a),
      (this.endSwordBaseX = i.buttonCursorXs[this.endChoice]),
      t.buttons.forEach((o, l) => {
        this.addSourceBitmap(r, RESULT_SCREEN.fonts.bigGold, o, i.buttonTextXs[l], i.buttonY + 4);
      }),
      e.mode === 'arcade')
    ) {
      const o = t.players[0];
      if (o) {
        const l = RESULT_LAYOUT.arcade.playerCenterX,
          c = RESULT_LAYOUT.arcade.playerY;
        (this.addSourceBitmap(r, 0, o.heading, l, c, !0, 0),
          o.identity && this.addSourceBitmap(r, 1, o.identity, l, c + 10, !0, 1),
          o.status && this.addSourceBitmap(r, o.statusFont ?? 1, o.status, l, c + 20, !0, 1),
          this.addSourceBitmap(r, 0, 'BATTLE RESULTS', l, c + 37, !0, 1),
          o.killBonus && this.addSourceBitmap(r, 1, o.killBonus, l, c + 47, !0, 1),
          o.timeBonus && this.addSourceBitmap(r, 1, o.timeBonus, l, c + 57, !0, 1),
          this.addSourceBitmap(r, 0, 'FINAL REPORT', l, c + 74, !0, 1),
          o.score && this.addSourceBitmap(r, 1, o.score, l, c + 84, !0, 1));
      }
      RESULT_LAYOUT.arcade.verticalBars.forEach((l, c) => {
        this.addSourceEndVertical(r, l.x, l.y, l.middleCount, `arcade-bar-${c}`);
      });
    } else {
      const o = RESULT_LAYOUT.arena,
        l = this.sourceBitmapWidth(RESULT_SCREEN.fonts.bigGold, t.title);
      (t.outcomeIcons.forEach((c, h) => {
        if (!c) return;
        const u = Math.trunc(
          h === 0
            ? o.panel.x + o.panel.width / 2 - l / 2 + o.playerOneOutcomeIconTitleOffset
            : o.panel.x + o.panel.width / 2 + l / 2 + o.playerTwoOutcomeIconTitleOffset,
        );
        this.addSourceGuiIcon(
          r,
          c === 'winner' ? RESULT_SCREEN.icons.winner : RESULT_SCREEN.icons.loser,
          u,
          o.panel.y + 10,
          `arena-outcome-${h}-${c}`,
        );
      }),
        t.players.forEach((c, h) => {
          if (!c) return;
          const u = o.playerXs[h],
            d = o.playerY;
          if ((this.addSourceBitmap(r, 0, c.heading, u, d), !c.joined)) {
            c.joinPrompt && this.addSourceBitmap(r, 1, c.joinPrompt, u, d + 10);
            return;
          }
          (c.identity && this.addSourceBitmap(r, 1, c.identity, u, d + 10),
            c.status && this.addSourceBitmap(r, c.statusFont ?? 1, c.status, u, d + 20),
            this.addSourceBitmap(r, 0, 'BATTLE RESULTS', u, d + 37),
            c.killBonus && this.addSourceBitmap(r, 1, c.killBonus, u, d + 47),
            c.timeBonus && this.addSourceBitmap(r, 1, c.timeBonus, u, d + 57),
            this.addSourceBitmap(r, 0, 'FINAL REPORT', u, d + 74),
            c.coins && this.addSourceBitmap(r, 1, c.coins, u, d + 84),
            c.allies && this.addSourceBitmap(r, 1, c.allies, u, d + 94),
            c.score && this.addSourceBitmap(r, 1, c.score, u, d + 104));
        }),
        this.addSourceEndVertical(
          r,
          RESULT_LAYOUT.arena.verticalBar.x,
          RESULT_LAYOUT.arena.verticalBar.y,
          RESULT_LAYOUT.arena.verticalBar.middleCount,
          'arena-bar',
        ));
    }
    ((this.endPanel = r), this.screenLayer.addChild(r), this.refreshSourceEndDisplay());
  }
  refreshSourceEndDisplay() {
    const e = this.endResult;
    if (!e || !this.endPanel) return;
    const t = e.mode === 'arcade' ? RESULT_LAYOUT.arcade : RESULT_LAYOUT.arena;
    ((this.endPanel.y = resultPanelY(this.endFrame).pixelY),
      (this.endSwordBaseX = t.buttonCursorXs[this.endChoice]),
      this.endSword && (this.endSword.x = this.endSwordBaseX + resultBlink(this.endFrame)));
  }
  renderSourceEndModal() {
    if (
      (this.overlayLayer.removeChildren().forEach((t) =>
        t.destroy({
          children: !0,
        }),
      ),
      !this.endQuestion && !this.endPopup)
    )
      return;
    const e = new Container();
    if (
      (e.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
          color: 0,
          alpha: 1 - QUESTION_DIM,
        }),
      ),
      this.endQuestion && this.endQuestionState)
    ) {
      const t = this.sourceCroppedTexture('ui.guiform', QUESTION_LAYOUT.form),
        i = 140,
        r = 134;
      if (t) {
        const o = new Sprite(t);
        (o.position.set(i, r), e.addChild(o));
      }
      const n = i + QUESTION_LAYOUT.panelInsetX,
        a = r + QUESTION_LAYOUT.panelInsetY;
      (this.addSourceGuiIcon(e, QUESTION_LAYOUT.shieldIcon, n, a, 'end-question-shield'),
        this.addSourceBitmap(e, 2, this.endQuestion.title, n + 40, a),
        this.addSourceBitmap(e, 1, this.endQuestion.question, n + 40, a + 27),
        this.addSourceGuiIcon(
          e,
          QUESTION_LAYOUT.swordIcon,
          n -
            4 +
            this.endQuestionState.choice * QUESTION_LAYOUT.choiceGapX +
            questionBlink(this.endQuestionState.swordDraws),
          a + QUESTION_LAYOUT.choicesY - 4,
          'end-question-sword',
        ),
        this.addSourceBitmap(e, 3, this.endQuestion.yes, n + 34, a + QUESTION_LAYOUT.choicesY),
        this.addSourceBitmap(
          e,
          3,
          this.endQuestion.no,
          n + 34 + QUESTION_LAYOUT.choiceGapX,
          a + QUESTION_LAYOUT.choicesY,
        ));
    } else if (this.endPopup) {
      const t = this.sourceCroppedTexture('ui.guiform', MESSAGE_LAYOUT.form),
        i = 140,
        r = 152;
      if (t) {
        const o = new Sprite(t);
        (o.position.set(i, r), e.addChild(o));
      }
      const n = i + MESSAGE_LAYOUT.panelInsetX,
        a = r + MESSAGE_LAYOUT.panelInsetY;
      (this.addSourceGuiIcon(e, this.endPopup.icon, n, a, 'end-popup-icon'),
        this.addSourceBitmap(e, 2, this.endPopup.title, n + 36, a),
        this.addSourceBitmap(e, 1, this.endPopup.message, n + 36, a + 29));
    }
    this.overlayLayer.addChild(e);
  }
  renderLogo() {
    const e = this.images.get(RAGE_STARTUP_SOUND);
    if (!e) return;
    const t = new Container(),
      i = new ColorMatrixFilter({
        padding: 0,
      }),
      r = new Sprite(e),
      n = centeredFitRect(e.width, e.height, SCREEN_WIDTH, SCREEN_HEIGHT, 24, BRAND_LOGO_SCALE);
    (r.position.set(n.x, n.y),
      (r.width = n.width),
      (r.height = n.height),
      t.addChild(r),
      (this.logoLayer = t),
      (this.logoFilter = i),
      this.screenLayer.addChild(t),
      this.applyLogoHue(-255));
  }
  applyLogoHue(e) {
    this.logoLayer &&
      this.logoFilter &&
      this.setDisplayAdditiveHue(this.logoLayer, this.logoFilter, e);
  }
  renderIntro() {
    const e = this.images.get('cover'),
      t = this.atlases.get('ui.flash');
    if (!e || !t) return;
    const i = new Sprite(e),
      r = new ColorMatrixFilter({
        padding: 0,
      });
    ((this.introCover = i), (this.introCoverFilter = r), this.screenLayer.addChild(i));
    const n = new Container();
    n.sortableChildren = !0;
    const a = this.sourceCroppedTexture('ui.flash', 0);
    for (const o of SWORD_CUES) {
      const l = this.sourceCroppedTexture('ui.flash', o.imageFrame);
      if (!a || !l) continue;
      const c = new Sprite(a);
      ((c.visible = !1), (c.zIndex = 0));
      const h = new Sprite(l);
      ((h.visible = !1), (h.zIndex = 1));
      const u = new ColorMatrixFilter({
        padding: 0,
      });
      (this.introCharacterViews.set(o.frame, {
        band: c,
        head: h,
        filter: u,
      }),
        n.addChild(c, h));
    }
    (this.screenLayer.addChild(n), this.applyIntroSnapshot(swordFlights(0)));
  }
  applyIntroSnapshot(e) {
    this.introCover &&
      this.introCoverFilter &&
      ((this.introCover.y = Math.trunc(e.coverY)),
      this.setDisplayAdditiveHue(this.introCover, this.introCoverFilter, e.coverHue));
    for (const t of this.introCharacterViews.values())
      ((t.band.visible = !1), (t.head.visible = !1));
    for (const t of e.characters) {
      const i = this.introCharacterViews.get(t.cue.frame);
      i &&
        ((i.band.visible = t.showBand),
        i.band.position.set(0, t.cue.y),
        (i.head.visible = t.showHead),
        i.head.position.set(Math.trunc(t.x), t.cue.y),
        t.showHead && this.setDisplayAdditiveHue(i.head, i.filter, t.hue));
    }
  }
  renderSplash() {
    const e = this.images.get('splash');
    if (!e) return;
    const t = new Container(),
      i = new ColorMatrixFilter({
        padding: 0,
      });
    t.addChild(new Sprite(e));
    const r = PRESENTS_SCREEN;
    t.addChild(
      new Graphics().rect(r.cover.x, r.cover.y, r.cover.width, r.cover.height).fill(r.cover.color),
    );
    const n = this.sourceBitmapText(r.font, r.text);
    (n.container.position.set(SCREEN_WIDTH / 2 - Math.trunc(n.width / 2), r.textY),
      t.addChild(n.container));
    const a = editionInfo(this.edition === 'full'),
      o = this.sourceBitmapText(a.registrationFont, a.version);
    (o.container.position.set(420 - Math.trunc(o.width / 2), 155), t.addChild(o.container));
    const l = this.sourceBitmapText(2, 'Press Any Button');
    if (
      (l.container.position.set(SCREEN_WIDTH / 2 - Math.trunc(l.width / 2), 305),
      (l.container.visible = !1),
      (this.splashPrompt = l.container),
      t.addChild(l.container),
      a.owner !== null)
    ) {
      const c = this.sourceBitmapText(a.registrationFont, a.owner);
      (c.container.position.set(
        SCREEN_WIDTH / 2 - Math.trunc(this.sourceBitmapWidth(0, a.owner) / 2),
        338,
      ),
        t.addChild(c.container));
    }
    ((this.splashLayer = t),
      (this.splashFilter = i),
      this.screenLayer.addChild(t),
      this.applySplashHue(255),
      this.updateSplashPromptVisibility());
  }
  applySplashHue(e) {
    this.splashLayer &&
      this.splashFilter &&
      this.setDisplayAdditiveHue(this.splashLayer, this.splashFilter, e);
  }
  updateSplashPromptVisibility() {
    const e = this.screen === 'splash' && introPromptBlink(this.screenFrame);
    this.splashPrompt && (this.splashPrompt.visible = e);
  }
  renderMenu() {
    const e = this.images.get('bg-castle');
    (e && this.screenLayer.addChild(new Sprite(e)),
      (this.menuRoot = layoutMenu(
        buildMainMenu({
          distribution: 'archive',
          fullEdition: this.edition === 'full',
          musicOn: !this.musicMuted,
          soundsOn: !this.soundsMuted,
          fullScreen: !!document.fullscreenElement,
          graphics: this.sourceSpeedName(this.graphicsIndex),
          gameSpeed: this.sourceSpeedName(this.gameSpeedIndex),
          difficulty: ['EASY', 'NORM', 'HARD'][this.difficultyIndex],
          typeSpeed: this.sourceSpeedName(this.typeSpeedIndex),
          showHints: this.pauseHints,
          recolorAlly: this.recolorAllies,
          showBlood: this.bloodEnabled,
          screenHue: this.hueEnabled,
          slowEffect: this.slowEnabled,
          miniStats: this.miniStats,
          foregrounds: this.foregroundLayer.visible,
          preferredScreen: this.settings.preferredScreen,
          scaleToFit: this.settings.scaleToFit,
          arcadeChapter: this.progress.arcadeChapter,
          arenaChapter: this.progress.arenaChapter,
          arcadeProgressed: this.progress.arcadeWon || this.progress.arcadeMaxChapter > 1,
          arenaProgressed: this.progress.arenaWon || this.progress.arenaMaxChapter > 1,
          keyboardMaps: this.settings.keyboardMaps,
          buttonMaps: this.settings.buttonMaps,
        }),
      )),
      (this.menuPanel = new Container()));
    const t = centerMenu(this.menuRoot, SCREEN_WIDTH, SCREEN_HEIGHT);
    (this.menuPanel.position.set(t.x, -this.menuRoot.height - 1),
      (this.menuMove = {
        startX: this.menuPanel.x,
        startY: this.menuPanel.y,
        targetX: t.x,
        targetY: t.y,
        step: 0,
        steps: MENU_SLIDE_STEPS,
      }),
      this.screenLayer.addChild(this.menuPanel),
      this.renderMenuSelection());
    const i = SCREEN_HEIGHT - 13,
      r = new Container();
    ((r.visible = this.pauseHints),
      r.addChild(
        new Graphics().rect(0, i, SCREEN_WIDTH, SCREEN_HEIGHT - i).fill({
          color: 0,
          alpha: 0.5,
        }),
      ));
    const n = this.sourceBitmapText(
      5,
      this.settings.keyboardMaps[0].slice(0, 4).map(keyLabel).join(''),
    );
    (n.container.position.set(2, i + 2), r.addChild(n.container));
    const a = this.sourceBitmapText(0, 'Move');
    (a.container.position.set(2 + n.width + 8, i + 2), r.addChild(a.container));
    const o = this.sourceBitmapText(0, 'Select');
    (o.container.position.set(SCREEN_WIDTH - 2 - o.width, i + 2), r.addChild(o.container));
    const l = this.sourceBitmapText(5, '');
    (l.container.position.set(SCREEN_WIDTH - 2 - o.width - 8 - l.width, i + 2),
      r.addChild(l.container),
      (this.menuHintLayer = r),
      this.screenLayer.addChild(r),
      (this.menuFadeOverlay = new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill(0)),
      this.screenLayer.addChild(this.menuFadeOverlay));
  }
  renderMenuSelection() {
    const e = this.menuPanel,
      t = this.menuRoot;
    this.screen !== 'menu' ||
      !e ||
      !t ||
      (e.removeChildren().forEach((i) =>
        i.destroy({
          children: !0,
        }),
      ),
      (this.menuSword = void 0),
      this.drawSourceMenu(t, 0));
  }
  drawSourceMenu(e, t) {
    const i = this.menuPanel;
    if (!i) return;
    const r = t === this.menuPath.length,
      n = this.menuPath[t],
      a = e.title === void 0 ? 2 : e.title === '{LOGO}' ? 0 : 1,
      o = this.sourceCroppedTexture('ui.guiform', a);
    if (o) {
      const c = new Sprite(o);
      (c.position.set(e.x, e.y), i.addChild(c));
    }
    if (e.title && e.title !== '{LOGO}') {
      const c = this.sourceBitmapText(3, e.title),
        h = e.x + Math.trunc((e.width - c.width) / 2) - 2;
      (c.container.position.set(h, e.y + 18), i.addChild(c.container));
      const u = this.sourceGuiIconTexture(0, 'shield');
      if (u) {
        const d = new Sprite(u);
        d.position.set(h - 36, e.y + 12);
        const f = new Sprite(u);
        (f.position.set(h + c.width + 9, e.y + 12), i.addChild(d, f));
      }
    }
    for (const [c, h] of e.items.entries()) {
      const u = e.y + e.rowYs[c],
        d = r && c === this.menuIndex,
        f = !r && c === n;
      f && h.submenu && this.drawSourceMenu(h.submenu, t + 1);
      let m,
        p = 4,
        g = 1;
      d
        ? ((m = h.submenu ? (h.subtitle ? 24 : 6) : h.subtitle ? 4 : 3), (p = 2), (g = 0))
        : r && h.submenu
          ? (m = h.subtitle ? 23 : 5)
          : f
            ? ((m = h.subtitle ? 23 : 5), (p = 2), (g = 0))
            : (m = h.subtitle ? 4 : 3);
      const v = this.sourceCroppedTexture('ui.guiform', m);
      if (v) {
        const x = new Sprite(v);
        (x.position.set(e.x, u), i.addChild(x));
      }
      if ((this.drawSourceMenuItemText(h.title, p, e.x, u, h.type ?? 0), h.subtitle)) {
        const x = this.sourceBitmapText(g, h.subtitle);
        (x.container.position.set(e.x + 58, u + 3 + (this.manifest?.bitmapFonts[p]?.height ?? 25)),
          i.addChild(x.container));
      }
      if (d) {
        const x = this.sourceGuiIconTexture(1, 'sword');
        x &&
          ((this.menuSword = new Sprite(x)),
          (this.menuSwordBaseX = e.x + 22),
          this.menuSword.position.set(
            this.menuSwordBaseX + (Math.floor(this.screenFrame / 10) & 1),
            u + 2,
          ),
          i.addChild(this.menuSword));
      }
    }
    const l = this.sourceCroppedTexture('ui.guiform', 7);
    if (l) {
      const c = new Sprite(l),
        h = e.items.reduce((u, d) => u + itemHeight(d), 0);
      (c.position.set(e.x, e.y + e.headerHeight + h), i.addChild(c));
    }
  }
  drawSourceMenuItemText(e, t, i, r, n) {
    const a = this.menuPanel;
    if (!a) return;
    const o = e.indexOf(':');
    if (o < 0) {
      const u = this.sourceBitmapText(t, e);
      (u.container.position.set(i + 58, r + 5), a.addChild(u.container));
      return;
    }
    const l = this.sourceBitmapText(t, e.slice(0, o + 1));
    (l.container.position.set(i + 58, r + 5), a.addChild(l.container));
    const c = this.sourceBitmapText(3, e.slice(o + 1).trim()),
      h = itemTextLayout(c.width, n);
    if (n === 1) {
      const u = atlasCellPosition(0, 4, 32, 30),
        d = this.sourceDicedTexture('ui.guiicon', 1, u.x, u.y, 32, 30, 'menu-key-button');
      if (d) {
        const f = new Sprite(d);
        (f.position.set(i + (h.keyX ?? 0), r + 1), a.addChild(f));
      }
    }
    (c.container.position.set(i + h.textX, r + 5), a.addChild(c.container));
  }
  rebuildSourceMenu() {
    !this.menuPanel ||
      this.screen !== 'menu' ||
      ((this.menuRoot = layoutMenu(
        buildMainMenu({
          distribution: 'archive',
          fullEdition: this.edition === 'full',
          musicOn: !this.musicMuted,
          soundsOn: !this.soundsMuted,
          fullScreen: !!document.fullscreenElement,
          graphics: this.sourceSpeedName(this.graphicsIndex),
          gameSpeed: this.sourceSpeedName(this.gameSpeedIndex),
          difficulty: ['EASY', 'NORM', 'HARD'][this.difficultyIndex],
          typeSpeed: this.sourceSpeedName(this.typeSpeedIndex),
          showHints: this.pauseHints,
          recolorAlly: this.recolorAllies,
          showBlood: this.bloodEnabled,
          screenHue: this.hueEnabled,
          slowEffect: this.slowEnabled,
          miniStats: this.miniStats,
          foregrounds: this.foregroundLayer.visible,
          preferredScreen: this.settings.preferredScreen,
          scaleToFit: this.settings.scaleToFit,
          arcadeChapter: this.progress.arcadeChapter,
          arenaChapter: this.progress.arenaChapter,
          arcadeProgressed: this.progress.arcadeWon || this.progress.arcadeMaxChapter > 1,
          arenaProgressed: this.progress.arenaWon || this.progress.arenaMaxChapter > 1,
          keyboardMaps: this.settings.keyboardMaps,
          buttonMaps: this.settings.buttonMaps,
        }),
      )),
      this.renderMenuSelection());
  }
  renderHeroSelection() {
    if (this.screen !== 'hero') return;
    const e = new Container(),
      t = new ColorMatrixFilter({
        padding: 0,
      }),
      i = this.images.get('bg-select-1');
    i && e.addChild(new Sprite(i));
    const r =
        this.sourceMode === 'tutorial'
          ? 'START TUTORIAL'
          : this.sourceMode === 'survival'
            ? 'SURVIVAL MODE'
            : this.sourceMode === 'practice'
              ? 'PRACTICE MODE'
              : this.sourceMode === 'arena'
                ? 'ARENA MODE'
                : this.sourceMode === 'arcade'
                  ? 'ARCADE MODE'
                  : 'PLAYER SELECT',
      n = this.sourceBitmapText(3, r);
    (n.container.position.set(Math.trunc((SCREEN_WIDTH - n.width) / 2), -n.height),
      e.addChild(n.container));
    const a = new Container();
    a.position.set(-256, TITLE_PLAYER_LABEL_Y);
    const o = this.sourceBitmapText(2, 'PLAYER 1');
    a.addChild(o.container);
    for (const [g, v] of HERO_STATS.entries()) {
      const x = HERO_CARD_TOP + g * HERO_CARD_SPACING;
      a.addChild(
        new Graphics().rect(2, x + 3, HERO_CARD_WIDTH - 4, HERO_CARD_HEIGHT - 6).fill({
          color: 0,
          alpha: 0.5,
        }),
      );
      const b = this.sourcePlriconTexture(
        4,
        0,
        3,
        HERO_CARD_WIDTH,
        HERO_CARD_HEIGHT,
        'player-outer',
      );
      if (b) {
        const I = new Sprite(b);
        (I.position.set(0, x), a.addChild(I));
      }
      const _ = this.sourcePlriconTexture(
          4,
          2,
          3,
          HERO_CARD_WIDTH,
          HERO_CARD_HEIGHT,
          'player-confirmed',
        ),
        S = new Sprite(_ ?? Texture.EMPTY);
      (S.position.set(0, x),
        (S.visible = g === this.heroSelectConfirmedIndex),
        this.heroSelectConfirmedFrames.push(S),
        a.addChild(S));
      const w = this.sourcePlriconTexture(3, g, 3, 89, 84, `player-portrait-${g}`),
        A = new Sprite(w ?? Texture.EMPTY);
      (A.position.set(3, x + 3), this.heroSelectPortraits.push(A), a.addChild(A));
      const E = this.sourcePlriconTexture(4, 1, 3, HERO_CARD_WIDTH, HERO_CARD_HEIGHT, 'player-fix');
      if (E) {
        const I = new Sprite(E);
        (I.position.set(0, x), a.addChild(I));
      }
      const D = HERO_CARD_WIDTH + 5;
      let B = x + 8;
      for (const [I, Y, O] of [
        [0, v.name, 10],
        [0, v.race, 10],
        [0, v.weapon, 14],
        [1, `Stamina: ${v.stamina}`, 10],
        [1, `Strength: ${v.strength}`, 10],
        [1, `Magic: ${v.magic}`, 10],
        [1, `Speed: ${v.speed}`, 10],
      ]) {
        const $ = this.sourceBitmapText(I, Y);
        ($.container.position.set(D, B), a.addChild($.container), (B += O));
      }
    }
    const l = new Sprite(Texture.EMPTY);
    a.addChild(l);
    const c = new Sprite(Texture.EMPTY);
    a.addChild(c);
    const h = this.sourceBitmapText(5, 'Locked!');
    (h.container.position.set(HERO_CARD_WIDTH + 48, HERO_CARD_TOP + 2 * HERO_CARD_SPACING + 40),
      (h.container.visible = !1),
      a.addChild(h.container));
    const u = SCREEN_HEIGHT - 13;
    e.addChild(
      new Graphics().rect(0, u, SCREEN_WIDTH, SCREEN_HEIGHT - u).fill({
        color: 0,
        alpha: 0.5,
      }),
    );
    const d = this.sourceBitmapText(
      5,
      this.settings.keyboardMaps[0].slice(0, 4).map(keyLabel).join(''),
    );
    (d.container.position.set(2, u + 2), e.addChild(d.container));
    const f = this.sourceBitmapText(0, 'Choose');
    (f.container.position.set(2 + d.width + 8, u + 2), e.addChild(f.container));
    const m = this.sourceBitmapText(0, 'Select');
    (m.container.position.set(SCREEN_WIDTH - 2 - m.width, u + 2), e.addChild(m.container));
    const p = this.sourceBitmapText(5, '');
    (p.container.position.set(SCREEN_WIDTH - 2 - m.width - 8 - p.width, u + 2),
      e.addChild(p.container),
      (this.heroSelectLayer = e),
      (this.heroSelectFilter = t),
      (this.heroSelectTitle = n.container),
      (this.heroSelectPanel = a),
      (this.heroSelectArrow = l),
      (this.heroSelectHighlight = c),
      (this.heroSelectLockedMessage = h.container),
      e.addChild(a),
      this.screenLayer.addChild(e),
      this.refreshHeroSelection());
  }
  refreshHeroSelection() {
    if (
      this.screen !== 'hero' ||
      !this.heroSelectLayer ||
      !this.heroSelectFilter ||
      !this.heroSelectTitle ||
      !this.heroSelectPanel
    )
      return;
    const e = titleScreenState(this.screenFrame);
    ((this.heroSelectTitle.y = Math.trunc(e.titleY)),
      this.heroSelectPanel.position.set(Math.trunc(e.panelX), TITLE_PLAYER_LABEL_Y),
      this.setDisplayAdditiveHue(this.heroSelectLayer, this.heroSelectFilter, e.hue));
    for (const [a, o] of this.heroSelectPortraits.entries()) {
      const l = a === 2 && !this.progress.arcadeWon;
      ((o.tint = l ? 1052688 : 16777215),
        (o.alpha = l ? (a === this.heroIndex ? 1 : 0.72) : a === this.heroIndex ? 1 : 0.42));
    }
    for (const [a, o] of this.heroSelectConfirmedFrames.entries())
      o.visible = a === this.heroSelectConfirmedIndex;
    this.heroSelectLockedMessage &&
      (this.heroSelectLockedMessage.visible = this.heroSelectLockedFrames > 0);
    const t = HERO_CARD_TOP + this.heroIndex * HERO_CARD_SPACING,
      i = this.sourcePlriconTexture(2, e.cursorFrame, 2, 11, 16, `player-arrow-${e.cursorFrame}`);
    this.heroSelectArrow &&
      ((this.heroSelectArrow.texture = i ?? Texture.EMPTY),
      this.heroSelectArrow.position.set(-13, t + Math.floor(HERO_CARD_HEIGHT / 2) - 8));
    const r = 3 + e.cursorFrame,
      n = this.sourcePlriconTexture(
        4,
        r,
        3,
        HERO_CARD_WIDTH,
        HERO_CARD_HEIGHT,
        `player-highlight-${r}`,
      );
    this.heroSelectHighlight &&
      ((this.heroSelectHighlight.texture = n ?? Texture.EMPTY),
      this.heroSelectHighlight.position.set(0, t));
  }
  sourcePlriconTexture(e, t, i, r, n, a) {
    const o = atlasCellPosition(t, i, r, n);
    return this.sourceDicedTexture('ui.plricon', e, o.x, o.y, r, n, a);
  }
  sourceGuiIconTexture(e, t) {
    const i = atlasCellPosition(e, 8, 30, 30);
    return this.sourceDicedTexture('ui.guiicon', 0, i.x, i.y, 30, 30, t);
  }
  renderChapters() {
    const e = this.chapterSession;
    if (!e) return;
    const t = this.images.get(e.background);
    t && this.screenLayer.addChild(new Sprite(t));
    const i = this.chapterScreenRows(),
      n = this.manifest.data[e.dataName][e.category ?? 'Chapters'],
      a = new Container(),
      o = menuSlide(this.chapterEntryIndex, e.replay, SCREEN_HEIGHT),
      l = (SCREEN_WIDTH - MENU_MAX_HEIGHT) / 2;
    (a.position.set(l, o.y), (this.chapterPanel = a));
    const c = this.sourceCroppedTexture('ui.guiform', 18);
    c && a.addChild(new Sprite(c));
    const h =
        n?.title ??
        (e.mode === 'arena'
          ? 'ARENA STAGES'
          : e.mode === 'show'
            ? 'FIGHT SHOWS'
            : e.mode === 'gallery'
              ? 'IMAGE GALLERY'
              : 'ARCADE CHAPTERS'),
      u = this.sourceBitmapText(3, h);
    (u.container.position.set(Math.trunc((MENU_MAX_HEIGHT - u.width) / 2) - 2, 18),
      a.addChild(u.container));
    for (const [f, m] of i.entries()) {
      const p = MENU_CENTER_OFFSET + f * MENU_ROW_HEIGHT,
        g = this.sourceCroppedTexture('ui.guiform', 20);
      if (g) {
        const A = new Sprite(g);
        ((A.y = p), a.addChild(A));
      }
      const v = this.sourceBitmapText(3, `${pad3(f + 1)}.`);
      (v.container.position.set(95 - v.width - 6, p + 5), a.addChild(v.container));
      const x = f < e.maxUnlocked,
        b = n?.[String(f + 1)]?.split('|')[0] ?? m.title,
        _ = b.endsWith('*'),
        S = x ? b.replace(/\*$/, '') : lockedMessage(e.mode),
        w = this.sourceBitmapText(x ? 2 : 4, S.replace(/\*$/, ''));
      if (
        (w.container.position.set(95, p + 5),
        a.addChild(w.container),
        (x && _) || (!x && S.endsWith('*')))
      ) {
        const A = this.sourceGuiIconTexture(16, 'movie');
        if (A) {
          const E = new Sprite(A);
          (E.position.set(96 + w.width, p + 1), a.addChild(E));
        }
      }
    }
    const d = this.sourceCroppedTexture('ui.guiform', 21);
    if (d) {
      const f = new Sprite(d);
      ((f.y = MENU_CENTER_OFFSET + i.length * MENU_ROW_HEIGHT), a.addChild(f));
    }
    if (
      ((this.chapterCursor = new Sprite(Texture.EMPTY)),
      a.addChild(this.chapterCursor),
      this.screenLayer.addChild(a),
      e.replay)
    )
      this.renderChapterHints();
    else {
      const f = new Container();
      (f.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, 159).fill({
          color: 0,
          alpha: 0.75,
        }),
        new Graphics().rect(0, 159, SCREEN_WIDTH, 1).fill(8421504),
        new Graphics().rect(0, 160, SCREEN_WIDTH, 1).fill(16777215),
        new Graphics().rect(0, 161, SCREEN_WIDTH, 1).fill(0),
        new Graphics().rect(0, 224, SCREEN_WIDTH, SCREEN_HEIGHT - 224).fill({
          color: 0,
          alpha: 0.75,
        }),
        new Graphics().rect(0, 222, SCREEN_WIDTH, 1).fill(0),
        new Graphics().rect(0, 223, SCREEN_WIDTH, 1).fill(16777215),
        new Graphics().rect(0, 224, SCREEN_WIDTH, 1).fill(8421504),
      ),
        (this.chapterLetterbox = f),
        this.screenLayer.addChild(f));
    }
    ((this.chapterFadeOverlay = new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill(0)),
      this.screenLayer.addChild(this.chapterFadeOverlay),
      (this.chapterMove =
        o.steps > 0
          ? {
              startX: l,
              startY: o.y,
              targetX: l,
              targetY: o.targetY,
              step: 0,
              steps: o.steps,
            }
          : void 0),
      this.refreshChapterCursor());
  }
  renderChapterHints() {
    const e = SCREEN_HEIGHT - 13,
      t = new Container();
    ((t.visible = this.pauseHints),
      t.addChild(
        new Graphics().rect(0, e, SCREEN_WIDTH, SCREEN_HEIGHT - e).fill({
          color: 0,
          alpha: 0.5,
        }),
      ));
    const i = this.sourceBitmapText(
      5,
      `${keyLabel(this.settings.keyboardMaps[0][0])}${keyLabel(this.settings.keyboardMaps[0][2])}`,
    );
    (i.container.position.set(2, e + 2), t.addChild(i.container));
    const r = this.sourceBitmapText(0, 'Move');
    (r.container.position.set(2 + i.width + 8, e + 2), t.addChild(r.container));
    const n = this.sourceBitmapText(0, 'Select');
    (n.container.position.set(SCREEN_WIDTH - 2 - n.width, e + 2), t.addChild(n.container));
    const a = this.sourceBitmapText(5, '');
    (a.container.position.set(SCREEN_WIDTH - 2 - n.width - 8 - a.width, e + 2),
      t.addChild(a.container),
      (this.chapterHintLayer = t),
      this.screenLayer.addChild(t));
  }
  renderChapterPopup() {
    const e = this.chapterPopup;
    if (
      (this.overlayLayer.removeChildren().forEach((l) =>
        l.destroy({
          children: !0,
        }),
      ),
      !e)
    )
      return;
    const t = new Container();
    t.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 1 - QUESTION_DIM,
      }),
    );
    const i = 140,
      r = 152,
      n = this.sourceCroppedTexture('ui.guiform', MESSAGE_LAYOUT.form);
    if (n) {
      const l = new Sprite(n);
      (l.position.set(i, r), t.addChild(l));
    }
    const a = i + MESSAGE_LAYOUT.panelInsetX,
      o = r + MESSAGE_LAYOUT.panelInsetY;
    (this.addSourceGuiIcon(t, e.icon, a, o, 'chapter-locked-icon'),
      this.addSourceBitmap(t, 2, e.title, a + 40, o),
      this.addSourceBitmap(t, 1, e.message, a + 40, o + 27),
      this.overlayLayer.addChild(t));
  }
  closeChapterPopup() {
    ((this.chapterPopup = void 0),
      this.clearAllSourceInputs(),
      this.overlayLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ));
  }
  refreshChapterCursor() {
    if (!this.chapterCursor || !this.chapterSession) return;
    const e = this.chapterIndex < this.chapterSession.maxUnlocked;
    ((this.chapterCursor.texture =
      this.sourceGuiIconTexture(e ? 1 : 6, e ? 'sword' : 'lock') ?? Texture.EMPTY),
      this.chapterCursor.position.set(
        19 + (Math.floor(this.screenFrame / 10) & 1),
        MENU_CENTER_OFFSET + this.chapterIndex * MENU_ROW_HEIGHT + (e ? 2 : -2),
      ));
  }
  renderTextPage(e, t) {
    (this.clearAllSourceInputs(),
      (this.screen = 'clear'),
      this.screenLayer.removeChildren().forEach((i) => i.destroy()),
      this.screenLayer.addChild(
        new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill(133396),
      ),
      this.addCenteredText(e, 22, 35, 16777215),
      t.forEach((i, r) => this.addCenteredText(i, 12, 95 + r * 38, r === 0 ? 13036287 : 16777215)),
      this.addFooter('Enter or Q to return'));
  }
  renderPause() {
    if (!this.paused || this.screen !== 'paused' || !this.pauseMenu) return;
    this.ensurePauseComposite();
    const e = this.pauseUi;
    (e.removeChildren().forEach((t) =>
      t.destroy({
        children: !0,
      }),
    ),
      this.renderSourceContract(
        drawMenuScreen({
          menu: this.pauseMenu,
          activePath: this.pausePath,
          selectedIndex: this.pauseIndex,
          cameraX: this.pauseCameraX,
          cameraY: this.pauseCameraY,
          swordDraws: this.pauseSwordDraws,
          hints: this.pauseHints,
          movementKeys: this.settings.keyboardMaps[0].slice(0, 4).map(keyLabel).join(''),
          selectKey: '',
          fullEdition: this.edition === 'full',
        }),
        e,
        !!this.pauseFrozenTexture,
      ),
      this.pauseModal && this.renderPauseModal(this.pauseModal, e));
  }
  renderPauseModal(e, t = this.overlayLayer) {
    const i = new Container();
    i.addChild(
      new Graphics().rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT).fill({
        color: 0,
        alpha: 0.25,
      }),
    );
    const r = this.sourceCroppedTexture('ui.guiform', QUESTION_LAYOUT.form),
      n = 140,
      a = 134;
    if (r) {
      const c = new Sprite(r);
      (c.position.set(n, a), i.addChild(c));
    }
    const o = n + QUESTION_LAYOUT.panelInsetX,
      l = a + QUESTION_LAYOUT.panelInsetY;
    (this.addSourceGuiIcon(i, QUESTION_LAYOUT.shieldIcon, o, l, 'pause-question-shield'),
      this.addSourceBitmap(i, 2, e.title, o + 40, l),
      this.addSourceBitmap(i, 1, e.message, o + 40, l + 27),
      this.addSourceGuiIcon(
        i,
        QUESTION_LAYOUT.swordIcon,
        o - 4 + e.choice * QUESTION_LAYOUT.choiceGapX + questionBlink(e.swordDraws),
        l + QUESTION_LAYOUT.choicesY - 4,
        'pause-question-sword',
      ),
      this.addSourceBitmap(i, 3, 'Yes', o + 34, l + QUESTION_LAYOUT.choicesY),
      this.addSourceBitmap(
        i,
        3,
        'No',
        o + 34 + QUESTION_LAYOUT.choiceGapX,
        l + QUESTION_LAYOUT.choicesY,
      ),
      t.addChild(i));
  }
  renderControlsHelp() {
    if (this.screen !== 'help') return;
    if (!this.helpComposite || !this.helpUi) {
      const i = new Container();
      if (this.helpFrozenTexture) {
        const n = new Sprite(this.helpFrozenTexture),
          a = new ColorMatrixFilter({
            padding: 0,
          });
        ((a.matrix = [0.75, 0, 0, 0, 0, 0, 0.75, 0, 0, 0, 0, 0, 0.75, 0, 0, 0, 0, 0, 1, 0]),
          (n.filters = [a]),
          (this.helpFadeFilter = a),
          i.addChild(n));
      }
      const r = new Container();
      (i.addChild(r), (this.helpComposite = i), (this.helpUi = r), this.overlayLayer.addChild(i));
    }
    const e = this.sourceHelpPlayers(),
      t = this.helpUi;
    (t.removeChildren().forEach((i) =>
      i.destroy({
        children: !0,
      }),
    ),
      this.renderSourceContract(
        drawControlsScreen({
          playerIndex: this.controlsHelpPlayer,
          player: e[this.controlsHelpPlayer],
          drawFrame: this.controlsHelpFrame,
        }),
        t,
        !!this.helpFrozenTexture,
      ));
  }
  renderMessage(e, t) {
    this.addCenteredText(e, 23, 135, 16777215);
    const i = this.text(t, 12, 12110040, 500);
    (i.anchor.set(0.5, 0),
      (i.style.align = 'center'),
      i.position.set(SCREEN_WIDTH / 2, 180),
      this.screenLayer.addChild(i));
  }
  addCenteredText(e, t, i, r) {
    const n = this.text(e, t, r, t >= 14 ? 700 : 500);
    return (
      n.anchor.set(0.5, 0),
      n.position.set(SCREEN_WIDTH / 2, i),
      this.screenLayer.addChild(n),
      n
    );
  }
  addFooter(e) {
    const t = this.text(e, 9, 8359324, 500);
    (t.anchor.set(0.5, 1),
      t.position.set(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 9),
      this.screenLayer.addChild(t));
  }
  text(e, t, i, r) {
    return new Text({
      text: e,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: t,
        fontWeight: r >= 700 ? '700' : '500',
        fill: i,
        stroke: {
          color: 0,
          width: t >= 16 ? 3 : 2,
        },
        lineHeight: Math.ceil(t * 1.25),
      },
      resolution: 1,
    });
  }
  /**
   * A square from the top of a character's sprite - head and shoulders - for the
   * characters the game never drew a select icon for.
   */
  sourceActorIconTexture(e, t = 0) {
    const i = this.manifest?.atlases?.[e]?.bounds?.[t];
    if (!i) return;
    const r = Math.max(1, Math.min(i.x2 - i.x1, i.y2 - i.y1));
    return this.sourceDicedTexture(
      e,
      t,
      Math.trunc((i.x2 - i.x1 - r) / 2),
      0,
      r,
      r,
      `actor-icon-${e}-${t}`,
    );
  }
  addSourceActorIcon(container, actorId, frame, size, x, y) {
    const texture = this.sourceActorIconTexture(actorId, frame);
    if (!texture) return;
    const sprite = new Sprite(texture);
    return (
      (sprite.width = sprite.height = size),
      sprite.position.set(x, y),
      container.addChild(sprite),
      sprite
    );
  }
  sourceCroppedTexture(e, t) {
    const i = `crop:${e}:${t}`,
      r = this.sourceTextureCache.get(i);
    if (r) return r;
    const n = this.atlases.get(e);
    if (!n) return;
    const a = trimmedTexture(n, t);
    return (a && this.sourceTextureCache.set(i, a), a);
  }
  sourceDicedTexture(e, t, i, r, n, a, o) {
    const l = `dice:${e}:${t}:${o}`,
      c = this.sourceTextureCache.get(l);
    if (c) return c;
    const h = this.atlases.get(e);
    if (!h) return;
    const u = regionTexture(h, t, i, r, n, a);
    return (u && this.sourceTextureCache.set(l, u), u);
  }
  sourceBitmapText(e, t) {
    const i = this.manifest?.bitmapFonts?.[e],
      r = i ? this.atlases.get(i.atlas) : void 0;
    return !i || !r
      ? {
          container: new Container(),
          width: 0,
          height: 0,
        }
      : buildBitmapText(i, r, t, this.sourceTextureCache);
  }
  sourceBitmapWidth(e, t) {
    const i = this.manifest?.bitmapFonts?.[e];
    return i ? measureBitmapText(i, t) : t.length * 6;
  }
  setDisplayAdditiveHue(e, t, i) {
    if (Math.abs(i) < 0.01) {
      e.filters = [];
      return;
    }
    const r = i / 255;
    ((t.matrix = [1, 0, 0, 0, r, 0, 1, 0, 0, r, 0, 0, 1, 0, r, 0, 0, 0, 1, 0]), (e.filters = [t]));
  }
  async ensureAtlas(e) {
    if (this.atlases.has(e)) return;
    const t = this.manifest.atlases[e] ? e : e.split('.').slice(0, 2).join('.'),
      i = this.manifest.atlases[t] ?? this.manifest.atlases[e.split('.')[0]];
    if (!i) return;
    const r = await this.loadTexture(i.image),
      n = Array.from(
        {
          length: i.frames,
        },
        (a, o) =>
          new Texture({
            source: r.source,
            frame: new Rectangle(
              (o % i.columns) * i.cellWidth + i.padding,
              Math.floor(o / i.columns) * i.cellHeight + i.padding,
              i.width,
              i.height,
            ),
          }),
      );
    (this.atlases.set(e, {
      textures: n,
      entry: i,
    }),
      t !== e &&
        this.atlases.set(t, {
          textures: n,
          entry: i,
        }));
  }
  async ensureImage(e) {
    if (this.images.has(e)) return;
    const t = this.manifest?.images[e];
    t && this.images.set(e, await this.loadTexture(t.url));
  }
  loadTexture(e) {
    return new Promise((t, i) => {
      const r = assetPath(e, 'Game image'),
        n = new Image();
      ((n.decoding = 'async'),
        (n.onload = () => {
          const a = Texture.from(n);
          ((a.source.scaleMode = this.pixelPerfect ? 'nearest' : 'linear'),
            this.textureSources.add(a.source),
            t(a));
        }),
        (n.onerror = () => i(new Error(`Could not decode image: ${e}`))),
        (n.src = r));
    });
  }
  selectCurrentMusic(e, t = !0) {
    (this.currentMusic && this.audio.stop(this.currentMusic),
      (this.currentMusic = e),
      (this.musicPlaybackRequested = !1),
      e && t && this.audio.reset(e));
  }
  playCurrentMusic(e = !1) {
    const t = this.currentMusic;
    if (!t) {
      this.musicPlaybackRequested = !1;
      return;
    }
    (e && this.audio.reset(t),
      (this.musicPlaybackRequested = !this.musicMuted),
      this.musicPlaybackRequested && !this.audio.muted && this.audio.playLoop(t));
  }
  pauseCurrentMusic() {
    (this.currentMusic && this.audio.stop(this.currentMusic), (this.musicPlaybackRequested = !1));
  }
  suspendCurrentMusic() {
    const e = this.currentMusic,
      t = {
        name: e,
        playing: !!(e && this.audio.isPlaying(e)),
      };
    return (this.pauseCurrentMusic(), t);
  }
  restoreMusicSnapshot(e) {
    (this.currentMusic && this.currentMusic !== e.name
      ? this.audio.stop(this.currentMusic, !0)
      : this.currentMusic && !e.playing && this.audio.stop(this.currentMusic),
      (this.currentMusic = e.name),
      (this.musicPlaybackRequested = !1),
      e.playing && this.playCurrentMusic());
  }
  playSound(e) {
    if (!e || this.soundsMuted) return;
    const t = e
      .split(',')
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean);
    let i;
    for (const r of t) {
      const n = this.audio.play(r);
      i ??= n;
    }
    return i;
  }
  playCameraSoundAt(e, t) {
    if (!(t <= this.cameraX - 128 || t >= this.cameraX + SCREEN_WIDTH + 128))
      return this.playSound(e);
  }
  stopCurrentMusic() {
    (this.pauseCurrentMusic(), (this.currentMusic = void 0));
  }
  clearActors() {
    for (const e of this.actorViews.values())
      e.destroy({
        children: !0,
      });
    for (const e of this.actorShadows.values()) destroyLayer(e);
    (this.actorViews.clear(),
      this.actorLayerDisplays.clear(),
      this.actorShadows.clear(),
      this.actorShadowLayerDisplays.clear(),
      this.viewFrames.clear(),
      this.actionSeen.clear(),
      this.playerInputStates.clear(),
      (this.pendingActorInputs.length = 0),
      (this.actors.length = 0),
      (this.pendingActors.length = 0),
      (this.player = void 0),
      this.sourcePlayerActors.clear(),
      (this.focusEnemy = void 0),
      this.actorLayer.removeChildren().forEach((e) => e.destroy()),
      this.shadowLayer.removeChildren().forEach((e) =>
        e.destroy({
          children: !0,
        }),
      ));
  }
  loadHighScore() {
    try {
      return Number(localStorage.getItem(RAGE_HIGH_SCORE_KEY)) || 0;
    } catch {
      return 0;
    }
  }
  saveHighScore() {
    if (!(
      this.chapterSession?.replay === !0 ||
      this.endResult?.gameReplay === !0 ||
      this.score <= this.highScore
    )) {
      this.highScore = this.score;
      try {
        localStorage.setItem(RAGE_HIGH_SCORE_KEY, String(this.highScore));
      } catch {}
    }
  }
  loadProgress() {
    try {
      const e = JSON.parse(localStorage.getItem(RAGE_PROGRESS_KEY) ?? '{}');
      return {
        arcadeChapter: Math.max(1, Number(e.arcadeChapter) || 1),
        arcadeMaxChapter: Math.max(1, Number(e.arcadeMaxChapter) || Number(e.arcadeChapter) || 1),
        arenaChapter: Math.max(1, Number(e.arenaChapter) || 1),
        arenaMaxChapter: Math.max(1, Number(e.arenaMaxChapter) || Number(e.arenaChapter) || 1),
        arcadeWon: e.arcadeWon === !0,
        arenaWon: e.arenaWon === !0,
        arcadePlayer: normalizePlayerProgress(e.arcadePlayer, 0),
        arenaPlayer: normalizePlayerProgress(e.arenaPlayer, 0),
        arenaPlayer2: normalizePlayerProgress(e.arenaPlayer2, 1),
        survivalBest: {
          waves: Math.max(0, Number(e.survivalBest?.waves) || 0),
          seconds: Math.max(0, Number(e.survivalBest?.seconds) || 0),
        },
      };
    } catch {
      return {
        arcadeChapter: 1,
        arcadeMaxChapter: 1,
        arenaChapter: 1,
        arenaMaxChapter: 1,
        arcadeWon: !1,
        arenaWon: !1,
        arcadePlayer: newPlayerProgress(0),
        arenaPlayer: newPlayerProgress(0),
        arenaPlayer2: newPlayerProgress(1),
        survivalBest: {
          waves: 0,
          seconds: 0,
        },
      };
    }
  }
  saveProgress() {
    if (!(this.chapterSession?.replay === !0 || this.endResult?.gameReplay === !0))
      try {
        localStorage.setItem(RAGE_PROGRESS_KEY, JSON.stringify(this.progress));
      } catch {}
  }
  emitState(e = !1) {
    const t = {
        loaded: this.loaded,
        paused: this.paused,
        muted: this.audio.muted,
        rankedScoreEligible: this.rankedScoreEligible,
        status: this.screen,
        score: this.score,
        highScore: this.highScore,
        mode: this.sourceMode,
        hero: HEROES[this.heroIndex].id,
        chapter: this.chapterIndex + 1,
        enemies: this.actors.filter((r) => r.isLiving() && r.align === 2).length,
      },
      i = JSON.stringify(t);
    (!e && i === this.lastState) || ((this.lastState = i), this.onStateChange?.(t));
  }
}
export { RageOfMagicGame };
