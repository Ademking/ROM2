import { ALLY_COSTS, ALLY_LIMITS } from '../scoring.js';
const PLAYER_SLOTS = 2;
const MAX_CONTROLLERS = 4;
const SELECT_COLUMNS = 7;
const SELECT_LEVEL_SLOT = 6;
const SELECT_MESSAGE_FRAMES = 30;
const SELECT_BLINK_FRAMES = 6;
const SELECT_HUE_START = -255;
const SELECT_HUE_STEP = 13;
const SELECT_ENTRANCE_STEPS = 18;
const PANEL_ENTER_STEPS = 5;
const PANEL_MOVE_STEPS = 10;
const HERO_NAMES = ['Azrael', 'Wren', 'Lucette'];
const HERO_RACES = ['Drow Fighter', 'Human Paladin', 'Halfling Fighter'];
const HERO_WEAPONS = ['Cleaver Sword', 'Bright Blade', 'Twin Fangs'];
const HERO_STAMINA = [3, 4, 4];
const HERO_STRENGTH = [6, 4, 3];
const HERO_MAGIC = [4, 4, 3];
const HERO_SPEED = [3, 4, 6];
const HERO_PALETTES = [
  ['azbrn', 'azpur', 'azgrn'],
  ['wrenpur', 'wrenyel', 'wrengrn'],
  ['lucpur', 'lucred', 'lucgrn'],
];
const HERO_LAUGH_SOUNDS = ['azhaha', 'wrenhaha', 'luceya'];
const SELECT_NAMES = [
  'Bonus',
  'Bonus',
  'Bonus',
  'Bonus',
  'Bonus',
  'Bonus',
  'Bonus',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Tom',
  'Leoric',
  'Puck',
  'Miwa',
  'Seeda',
  'Dor',
  'Stradlater',
];
const SELECT_RACES = [
  'Super',
  'Rage',
  'Refractor',
  'Protection',
  'Fairy',
  'Extra Life',
  'Level Up',
  'Soldier',
  'Archer',
  'Wolf',
  'Mage',
  'Drow Acolyte',
  'Cleric',
  'Knight',
  'Grunt',
  'Hunter',
  'Boar',
  'Amazon',
  'Huntress',
  'Thief',
  'Warlock',
  'Orc',
  'Orc Swordsman',
  'Ronin',
  'Warlord',
  'Ogre',
  'Troll',
  'Dreadlord',
  'Paladin',
  'Bounty Hunter',
  'Elf Spellmaster',
  'Elf Enchanter',
  'Elf Swordmaster',
  'Elf Champion',
  'Paladin Seer',
];
const SELECT_ACTOR_IDS = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'sol',
  'sola',
  'wolf',
  'mage',
  'aco',
  'cler',
  'knt',
  'wara',
  'warb',
  'pig',
  'amaz',
  'amaza',
  'athf',
  'amag',
  'orc',
  'orca',
  'baka',
  'grisa',
  'ogre',
  'troll',
  'dlrd',
  'tom',
  'leo',
  'puck',
  'mwa',
  'sda',
  'dor',
  'strd',
];
const SELECT_ENTRIES = SELECT_RACES.map((s, e) => ({
  index: e,
  row: Math.floor(e / SELECT_COLUMNS),
  column: e % SELECT_COLUMNS,
  kind: e < SELECT_COLUMNS ? 'bonus' : 'ally',
  name: SELECT_NAMES[e] ?? null,
  race: s,
  actorId: SELECT_ACTOR_IDS[e] ?? null,
  cost: ALLY_COSTS[e],
  max: ALLY_LIMITS[e],
}));
const SELECT_SCREEN = {
  background: 'bg-select-1',
  iconOffColor: 1052688,
};
/** Where the panel sits when there is only one player, centring its grid. */
const SELECT_SINGLE_PANEL_X = 161;
const SELECT_LAYOUT = {
  title: {
    startY: -25,
    targetY: 18,
  },
  panels: [
    {
      startX: -256,
      targetX: 30,
      outX: -256,
      y: 50,
    },
    {
      startX: 768,
      targetX: 481,
      outX: 768,
      y: 50,
    },
  ],
};
export {
  HERO_LAUGH_SOUNDS,
  HERO_MAGIC,
  HERO_NAMES,
  HERO_PALETTES,
  HERO_RACES,
  HERO_SPEED,
  HERO_STAMINA,
  HERO_STRENGTH,
  HERO_WEAPONS,
  MAX_CONTROLLERS,
  PANEL_ENTER_STEPS,
  PANEL_MOVE_STEPS,
  PLAYER_SLOTS,
  SELECT_BLINK_FRAMES,
  SELECT_COLUMNS,
  SELECT_ENTRANCE_STEPS,
  SELECT_ENTRIES,
  SELECT_HUE_START,
  SELECT_HUE_STEP,
  SELECT_LAYOUT,
  SELECT_SINGLE_PANEL_X,
  SELECT_LEVEL_SLOT,
  SELECT_MESSAGE_FRAMES,
  SELECT_SCREEN,
};
