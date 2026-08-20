/**
 * Survival: one arena, one squad, and waves of enemies that never stop.
 *
 * The scene below is an ordinary scene script — the same commands the shipped
 * data uses — injected into the 'extra' data set at load. It sets the stage and
 * then stops; the waves themselves are spawned by the engine (stepSurvival),
 * because a script cannot count its way to an ever-harder wave 40.
 */
const SURVIVAL_DATA_NAME = 'extra';
const SURVIVAL_SCRIPT = 900;
/** The script the setup hands over to once the opening caption is done. */
const SURVIVAL_FIGHT_SCRIPT = 901;
/** The defeat voice the arena and arcade result screens use when you lose. */
const SURVIVAL_DEATH_SOUND = '009';
/** Frames of quiet between clearing a wave and the next one dropping in. */
const WAVE_BREAK_FRAMES = 40;
const WAVE_CAPTION_FRAMES = 60;
/** Enemies per wave, and how far the wave can reach up the tiers. */
const MAX_WAVE_SIZE = 8;
const WAVES_PER_TIER = 4;
const WAVES_PER_LEVEL = 3;
const MAX_ENEMY_LEVEL = 9;
const BOSS_EVERY = 5;

/**
 * The run summary panel. The shipped message forms all carry their own header
 * and button-row art, which nothing here needs, so this one is drawn: a dark
 * slate card with gold corners, sized to its contents.
 */
const SURVIVAL_RESULT = {
  width: 320,
  height: 146,
  titleY: 8,
  labelY: 46,
  valueY: 58,
  bestY: 88,
  // The footer band runs from the lower rule to the panel edge; both of these
  // centre their content in it, with or without the record line above.
  recordY: 114,
  promptY: 128,
  promptOnlyY: 122,
  headerHeight: 34,
  rules: [36, 108],
  colors: {
    panel: 723479,
    header: 1512740,
    border: 4870244,
    innerBorder: 2764600,
    rule: 3552822,
    gold: 15250250,
  },
};

/**
 * Backgrounds that are ours rather than Tony's, registered alongside the shipped
 * images at load so the engine can request them like any other scene image.
 */
const SURVIVAL_IMAGES = {
  'sc-survival': {
    url: '/games/rage-of-magic-ii/images/sc-survival.jpg',
  },
};

/** Columns on the character pick grid; the same width the ally grid uses. */
const SURVIVAL_GRID_COLUMNS = 7;

/**
 * Every character in the game, in pick-grid order, with where its 24x24 avatar
 * comes from:
 *   hero - the three portraits the in-game stats bar uses (ui.stats frame 5)
 *   icon - a cell on the select screen's own icon sheet
 *   neither - cropped from the character's sprite sheet, for the ones the
 *             original select screen never had to draw
 */
const SURVIVAL_CHARACTERS = [
  { id: 'az', hero: 0 },
  { id: 'wren', hero: 1 },
  { id: 'luc', hero: 2 },
  { id: 'sol', icon: 7 },
  { id: 'sola', icon: 8 },
  { id: 'wolf', icon: 9 },
  { id: 'mage', icon: 10 },
  { id: 'aco', icon: 11 },
  { id: 'cler', icon: 12 },
  { id: 'knt', icon: 13 },
  { id: 'wara', icon: 14 },
  { id: 'warb', icon: 15 },
  { id: 'pig', icon: 16 },
  { id: 'amaz', icon: 17 },
  { id: 'amaza', icon: 18 },
  { id: 'athf', icon: 19 },
  { id: 'amag', icon: 20 },
  { id: 'orc', icon: 21 },
  { id: 'orca', icon: 22 },
  { id: 'baka', icon: 23 },
  { id: 'grisa', icon: 24 },
  { id: 'ogre', icon: 25 },
  { id: 'troll', icon: 26 },
  { id: 'dlrd', icon: 27 },
  { id: 'tom', icon: 28 },
  { id: 'leo', icon: 29 },
  { id: 'puck', icon: 30 },
  { id: 'mwa', icon: 31 },
  { id: 'sda', icon: 32 },
  { id: 'dor', icon: 33 },
  { id: 'strd', icon: 34 },
  { id: 'war' },
  { id: 'eva' },
  { id: 'gris' },
  { id: 'fau' },
  { id: 'draco' },
  { id: 'serp' },
];

/** mm:ss, counting past an hour rather than wrapping. */
function formatSurvivalTime(e) {
  const t = Math.max(0, Math.trunc(e));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

/**
 * The run summary as two figures, each with its own label and the record to
 * beat, so the panel can show the numbers big instead of listing them.
 */
function survivalResultColumns(e) {
  return [
    {
      label: 'WAVES',
      value: String(e.waves),
      best: `Best ${e.bestWaves}`,
    },
    {
      label: 'TIME',
      value: formatSurvivalTime(e.seconds),
      best: `Best ${formatSurvivalTime(e.bestSeconds)}`,
    },
  ];
}

/** Who turns up, roughly weakest tier first. */
const SURVIVAL_TIERS = [
  ['war', 'wara', 'wolf', 'sol', 'sola'],
  ['orc', 'orca', 'knt', 'aco', 'mage', 'amaz', 'pig'],
  ['warb', 'cler', 'ogre', 'troll', 'baka', 'athf', 'amag'],
  ['grisa', 'gris', 'dlrd', 'leo', 'tom', 'eva'],
];
/** One of these headlines every fifth wave. */
const SURVIVAL_BOSSES = ['dor', 'puck', 'sda', 'mwa', 'strd', 'draco', 'serp'];
const SURVIVAL_ACTORS = [...SURVIVAL_TIERS.flat(), ...SURVIVAL_BOSSES];

function pick(list, wave, slot) {
  return list[(wave * 7 + slot * 3) % list.length];
}

/**
 * The wave that follows `wave - 1`: more enemies, higher levels and tougher
 * company as the number climbs, with a boss every fifth wave. Positions are
 * left to the caller, which is the only thing that knows where the camera is.
 */
function survivalWave(wave) {
  const size = Math.min(2 + Math.floor(wave / 2), MAX_WAVE_SIZE);
  const topTier = Math.min(SURVIVAL_TIERS.length - 1, Math.floor((wave - 1) / WAVES_PER_TIER));
  const level = Math.min(MAX_ENEMY_LEVEL, 1 + Math.floor((wave - 1) / WAVES_PER_LEVEL));
  const aiLevel = Math.min(10, 1 + Math.floor(wave / 2));
  const spawns = [];
  for (let slot = 0; slot < size; slot += 1) {
    // Later slots come from the harder end of what this wave has unlocked.
    const tier = SURVIVAL_TIERS[Math.min(topTier, Math.floor((slot * (topTier + 1)) / size))];
    spawns.push({ main: pick(tier, wave, slot), level, aiLevel });
  }
  if (wave % BOSS_EVERY === 0)
    spawns.push({
      main: pick(SURVIVAL_BOSSES, wave, 0),
      level,
      aiLevel: Math.min(10, aiLevel + 2),
      boss: true,
    });
  return spawns;
}

/**
 * The scene script. Setup mirrors an arena stage: create the squad, run a frame,
 * caption, fade in — then the fight script switches the actors to AI and turns
 * damage on, and the wave spawner takes it from there.
 */
function survivalScene() {
  return {
    [SURVIVAL_SCRIPT]: {
      1: 'game-mode|survival',
      2: 'scene-timer-ever',
      3: 'scene-cam-set-target-players',
      4: 'scene-fade-black',
      5: 'scene-create-player-chosen|1',
      6: 'scene-create-pickup|hp|176|110|500|s1',
      7: 'scene-create-pickup|mp|256|110|500|s2',
      8: 'scene-create-pickup|sp|336|110|500|s3',
      9: 'scene-run',
      10: 'scene-caption-open|100|SURVIVAL',
      11: 'scene-fade-in',
      12: `script-trigger-caption-done|${SURVIVAL_FIGHT_SCRIPT}`,
      title: 'SURVIVAL',
      subtitle: 'Endless Waves',
      'scene-images': 'sc-survival',
      'resources-1': SURVIVAL_ACTORS.map((id) => `sprite.${id}`).join(','),
      'resources-2': 'image.block.sc-survival',
    },
    [SURVIVAL_FIGHT_SCRIPT]: {
      1: 'scene-set-actor-process-ai',
      2: 'scene-stats-set|Y|0',
      3: 'game-music-play|002b',
      4: 'scene-damage|Y',
    },
  };
}

export {
  BOSS_EVERY,
  SURVIVAL_ACTORS,
  SURVIVAL_CHARACTERS,
  SURVIVAL_DATA_NAME,
  SURVIVAL_DEATH_SOUND,
  SURVIVAL_GRID_COLUMNS,
  SURVIVAL_IMAGES,
  SURVIVAL_RESULT,
  SURVIVAL_SCRIPT,
  WAVE_BREAK_FRAMES,
  WAVE_CAPTION_FRAMES,
  formatSurvivalTime,
  survivalResultColumns,
  survivalScene,
  survivalWave,
};
