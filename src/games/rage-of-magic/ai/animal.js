import {
  ALLY_HIT_RANGE,
  DEFAULT_RANDOM,
  clampToPlayArea,
  movePoint,
  searchFreeSpot,
  stepToward,
  unitVector,
} from './ally.js';
import { weakestAlly } from './wisp.js';
import { Input } from '../constants.js';
const AnimalState = {
  WAIT_DECIDE: 'wait-decide',
  WAIT: 'wait',
  ESCAPE_DECIDE: 'escape-decide',
  ESCAPE: 'escape',
  GOTO_DECIDE: 'goto-decide',
  GOTO: 'goto',
  HEAL: 'heal',
};
function newAnimalMemory(s) {
  return (
    s && (s.target = void 0),
    {
      mode: AnimalState.WAIT_DECIDE,
      wait: 0,
      gotoX: 0,
      gotoY: 0,
      wasBumped: !1,
      wasAttacked: !1,
      doRun: !1,
      doFollow: !1,
    }
  );
}
function markAnimalBumped(s) {
  s.wasBumped = !0;
}
function stepAnimalAi(s, e, t, i = DEFAULT_RANDOM) {
  if (s.hp <= 0 || !s.action()?.onKeyboard) return;
  let r;
  if (
    (e.doFollow &&
      s.target &&
      s.action()?.actionType === 0 &&
      Math.abs(s.x - s.target.x) > 9 &&
      (s.face = s.x > s.target.x ? -1 : 1),
    s.target?.hp === 0 &&
      ((e.doRun = !1), (e.doFollow = !1), (s.target = void 0), (e.mode = AnimalState.WAIT_DECIDE)),
    s.whoHitMe && (e.wasAttacked = !0),
    e.wasAttacked
      ? ((e.mode = AnimalState.GOTO_DECIDE),
        (e.wasBumped = !1),
        (e.wasAttacked = !1),
        (e.doRun = !0))
      : e.wasBumped &&
        ((r = Input.NOTHING),
        (e.mode =
          e.mode !== AnimalState.ESCAPE_DECIDE
            ? AnimalState.ESCAPE_DECIDE
            : AnimalState.WAIT_DECIDE),
        (e.wasBumped = !1),
        (e.doRun = !1)),
    e.mode === AnimalState.WAIT_DECIDE)
  ) {
    const n = Math.min(Math.trunc(s.level), 10);
    return ((e.wait = 15 + i.int((10 - n) * 15)), (e.mode = AnimalState.WAIT), Input.NOTHING);
  }
  if (e.mode === AnimalState.WAIT)
    return (e.wait <= 0 && (e.mode = AnimalState.GOTO_DECIDE), (e.wait -= 1), r);
  if (e.mode === AnimalState.ESCAPE_DECIDE)
    return (
      searchFreeSpot(
        s,
        e,
        t,
        i,
        Math.max(1, Math.trunc(s.aiLevel) + 1),
        AnimalState.ESCAPE,
        AnimalState.WAIT_DECIDE,
        25,
        35,
      ) ?? r
    );
  if (e.mode === AnimalState.ESCAPE) {
    const n = stepToward(s, e.gotoX, e.gotoY, e.doRun);
    return (n.arrived && (e.mode = AnimalState.GOTO_DECIDE), n.command ?? r);
  }
  if (e.mode === AnimalState.GOTO_DECIDE) {
    if (s.whoHitMe) {
      const [a, o] = unitVector(s.whoHitMe.x, s.whoHitMe.y, s.x, s.y),
        l = 25 + i.int(150);
      return (
        (e.gotoX = Math.trunc(s.x) + Math.trunc(a * l)),
        (e.gotoY = Math.trunc(s.y) + Math.trunc(o * l)),
        clampToPlayArea(e, t),
        (e.doFollow = !1),
        (s.target = void 0),
        (s.whoHitMe = void 0),
        (e.mode = AnimalState.GOTO),
        r
      );
    }
    const n = weakestAlly(s, t.actors);
    if (((s.target = n ?? s.leader), !s.target)) e.mode = AnimalState.WAIT_DECIDE;
    else if (Math.hypot(s.target.x - s.x, s.target.y - s.y) <= ALLY_HIT_RANGE)
      ((e.doFollow = !0), (e.mode = AnimalState.HEAL));
    else {
      const [a, o] = movePoint(s.target.x, s.target.y, s.x, s.y, ALLY_HIT_RANGE);
      if (!t.isSpotClear(s, s.x, s.y))
        ((e.doFollow = !0),
          (e.gotoX = Math.trunc(a)),
          (e.gotoY = Math.trunc(o)),
          (e.mode = AnimalState.GOTO));
      else {
        const [l, c] = movePoint(s.x, s.y, s.target.x, s.target.y, 3);
        t.isSpotClear(s, l, c)
          ? ((e.doFollow = !0),
            (e.gotoX = Math.trunc(a)),
            (e.gotoY = Math.trunc(o)),
            (e.mode = AnimalState.GOTO))
          : (e.mode = AnimalState.ESCAPE_DECIDE);
      }
    }
    return (clampToPlayArea(e, t), r);
  }
  if (e.mode === AnimalState.GOTO) {
    const n = stepToward(s, e.gotoX, e.gotoY, e.doRun);
    return (n.arrived && (e.mode = AnimalState.HEAL), n.command ?? r);
  }
  return (
    (e.doRun = !1),
    (s.target = weakestAlly(s, t.actors)),
    s.target && s.target.hp < s.target.totalHp && t.canPerform(s, Input.B) && (r = Input.B),
    (e.mode = AnimalState.WAIT_DECIDE),
    r
  );
}
export { markAnimalBumped, newAnimalMemory, stepAnimalAi };
