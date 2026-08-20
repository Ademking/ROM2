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
/** Coins to spend on the select screen. Enough for a real squad. */
const SURVIVAL_COINS = 750;
/** Frames of quiet between clearing a wave and the next one dropping in. */
const WAVE_BREAK_FRAMES = 40;
const WAVE_CAPTION_FRAMES = 60;
/** Enemies per wave, and how far the wave can reach up the tiers. */
const MAX_WAVE_SIZE = 8;
const WAVES_PER_TIER = 4;
const WAVES_PER_LEVEL = 3;
const MAX_ENEMY_LEVEL = 9;
const BOSS_EVERY = 5;

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
      10: 'scene-create-player-allies|1',
      11: 'scene-caption-open|100|SURVIVAL',
      12: 'scene-fade-in',
      13: `script-trigger-caption-done|${SURVIVAL_FIGHT_SCRIPT}`,
      title: 'SURVIVAL',
      subtitle: 'Endless Waves',
      'scene-images': 'sc-arena-1a',
      'resources-1': SURVIVAL_ACTORS.map((id) => `sprite.${id}`).join(','),
      'resources-2': 'image.block.sc-arena-1a',
    },
    [SURVIVAL_FIGHT_SCRIPT]: {
      1: 'scene-set-actor-process-ai',
      2: 'scene-create-player-bonus|1',
      3: 'scene-stats-set|Y|0',
      4: 'game-music-play|002b',
      5: 'scene-damage|Y',
    },
  };
}

export {
  BOSS_EVERY,
  SURVIVAL_ACTORS,
  SURVIVAL_COINS,
  SURVIVAL_DATA_NAME,
  SURVIVAL_SCRIPT,
  WAVE_BREAK_FRAMES,
  WAVE_CAPTION_FRAMES,
  survivalScene,
  survivalWave,
};
