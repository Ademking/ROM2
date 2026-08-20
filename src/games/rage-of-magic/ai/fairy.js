import { Input } from '../constants.js';
const FairyBonus = {
  OTHER: 0,
  ABSORB: 1,
  REFRACT: 2,
  RESURRECT: 3,
};
function newFairyMemory(s) {
  return {
    mode: 'none',
    bonusType: s,
  };
}
function stepFairyAi(s, e) {
  const t = decideFairyAction(s, e);
  return (moveFairy(s, e), t);
}
function decideFairyAction(s, e) {
  if (e.mode !== 'die') {
    if (e.mode === 'try-die' && s.action()?.onKeyboard) return ((e.mode = 'die'), Input.ABC);
    if (e.mode === 'try-magic' && s.action()?.onKeyboard) return ((e.mode = 'none'), Input.B);
  }
}
function moveFairy(s, e) {
  if (e.mode !== 'none') return;
  const t = s.leader ?? (s.parent !== s ? s.parent : void 0);
  if (t) {
    if (t.hp <= 0) {
      e.mode = 'try-die';
      return;
    }
    if (e.bonusType === FairyBonus.ABSORB) {
      if (t.bonusAbsorb <= 0) {
        e.mode = 'try-die';
        return;
      }
      if (t.didAbsorb) {
        ((e.mode = 'try-magic'), (t.didAbsorb = !1));
        return;
      }
    } else if (e.bonusType === FairyBonus.REFRACT) {
      if (t.bonusRefract <= 0) {
        e.mode = 'try-die';
        return;
      }
      if (t.didRefract) {
        ((e.mode = 'try-magic'), (t.didRefract = !1));
        return;
      }
    }
    ((s.spl = s.usedSpl = t.calculateMagicSpl()),
      (s.x = t.x + (s.type.start[0] ?? 0) * t.face),
      (s.y = t.y + (s.type.start[1] ?? 0)),
      e.bonusType === FairyBonus.ABSORB
        ? (s.jump = s.type.start[2] ?? 0)
        : e.bonusType === FairyBonus.REFRACT
          ? (s.jump = t.jump + (s.type.start[2] ?? 0) + (t.type.solid[2] ?? 0))
          : e.bonusType === FairyBonus.RESURRECT
            ? (s.jump = t.jump + (s.type.start[2] ?? 0) + Math.trunc((t.type.solid[2] ?? 0) / 2))
            : (s.jump = t.jump + (s.type.start[2] ?? 0)));
  }
}
export { FairyBonus, moveFairy, newFairyMemory, stepFairyAi };
