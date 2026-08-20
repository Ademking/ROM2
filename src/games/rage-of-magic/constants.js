const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 384;
const DEFAULT_UPDATE_RATE = 40;
const SCENE_HEIGHT = 392;
const SHADOW_ORIGIN_X = 160;
const SPRITE_ORIGIN_X = 256;
const SPRITE_ORIGIN_Y = 272;
const REACH_PADDING = 3;
const HEROES = [
  {
    id: 'az',
    name: 'Azrael',
    kind: 'Drow',
    weapon: 'Cleaver Sword',
  },
  {
    id: 'wren',
    name: 'Wren',
    kind: 'Paladin',
    weapon: 'Bright Blade',
  },
  {
    id: 'luc',
    name: 'Lucette',
    kind: 'Halfling',
    weapon: 'Twin Fangs',
  },
];
const Input = {
  NOTHING: 0,
  UP: 1,
  UP_FORWARD: 2,
  FORWARD: 3,
  DOWN_FORWARD: 4,
  DOWN: 5,
  DOWN_BACKWARD: 6,
  BACKWARD: 7,
  UP_BACKWARD: 8,
  HOP_UP: 9,
  HOP_DOWN: 10,
  RUN_FORWARD: 11,
  RUN_BACKWARD: 12,
  A: 13,
  B: 14,
  C: 15,
  AB: 16,
  ABC: 17,
};
export {
  DEFAULT_UPDATE_RATE,
  HEROES,
  Input,
  REACH_PADDING,
  SCENE_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SHADOW_ORIGIN_X,
  SPRITE_ORIGIN_X,
  SPRITE_ORIGIN_Y,
};
