import { COMBO_TICKS, MIN_COMBO_HITS } from './bonuses.js';
import { footprintBox, keyboardAction, solidBox, withinVerticalReach } from './bounds.js';
import { DEFAULT_UPDATE_RATE, Input } from './constants.js';
import {
  parseActorAction,
  parseActorFrame,
  parseActorStance,
  parseActorType,
} from './document-parse.js';
const ACTION_SLOTS = 8;
const MIN_HIT_OVERLAP = 5;
const HP_PER_LEVEL = 10;
const SPL_SPEED_BONUS = 0.075;
const RESIST_BASE = 7;
const QUAKE_STEPS = 5;
const ACTOR_NAME_CACHE = new WeakMap();
function pickActorName(s, e, t) {
  if (t.names.length === 0) return t.name;
  let i = ACTOR_NAME_CACHE.get(s);
  i || ((i = new Map()), ACTOR_NAME_CACHE.set(s, i));
  const r = Math.min(t.names.length - 1, i.get(e) ?? 0);
  return (i.set(e, Math.min(t.names.length - 1, r + 1)), t.names[r]);
}
class Actor {
  id;
  main;
  sprite;
  document;
  typeId;
  type;
  role;
  controllerKind;
  aiLevel;
  actionFrames = Array(ACTION_SLOTS).fill(0);
  hitTrack = new Map();
  name;
  race;
  process;
  processType;
  level;
  align;
  face;
  x;
  y;
  jump;
  speedX = 0;
  speedY = 0;
  speedJump = 0;
  totalHp;
  totalMp;
  totalKo;
  totalGuard;
  totalResist;
  hp;
  mp;
  sp = 0;
  ko;
  guard;
  spl = 0;
  usedSpl = 0;
  actionId;
  actionSerial = 0;
  actionLoop = 1;
  removed = !1;
  outside = !1;
  deadFrames = 0;
  airJuggles = 0;
  comboTicksLeft = 0;
  comboHits = 0;
  score = 0;
  didWarning = !1;
  miniStatFrames = 0;
  didContact = !1;
  lastAudioFrame = -1;
  currentActionAudio;
  script;
  leader;
  parent;
  target;
  whoHitMe;
  whoIHit;
  circleAngleX = 0;
  circleAngleY = 0;
  circleAngleJump = 0;
  aiWait = 0;
  aiSide = 1;
  resist;
  actionResist = 0;
  bonusRage = 0;
  bonusRefract = 0;
  bonusAbsorb = 0;
  bonusLife = 0;
  didAbsorb = !1;
  didRefract = !1;
  damageEnabled = !0;
  isRetreating = !1;
  drawType = 0;
  hueStep = 0;
  hueSteps = 0;
  hueR = 0;
  hueG = 0;
  hueB = 0;
  huePortionR = 0;
  huePortionG = 0;
  huePortionB = 0;
  opacity = 1;
  fadeDelay = 0;
  fadeRate = 0;
  quakeOn = !1;
  quakeFace = 1;
  quakeSize = 0;
  quakePercent = 0;
  quakeDirection = 1;
  worldMinX = 0;
  worldMaxX = 511;
  worldFloor = 113;
  actionPreflight;
  pickupDrops = [];
  actions = new Map();
  frames = new Map();
  stances = new Map();
  resourceFailure;
  rageDepletedFeedback = !1;
  superLevelGainedFeedback = !1;
  constructor(e, t) {
    ((this.document = e),
      (this.id = t.id),
      (this.main = t.main),
      (this.sprite = t.sprite),
      (this.typeId = t.type),
      (this.type = parseActorType(e, t.type)),
      (this.role = t.role),
      (this.controllerKind =
        t.controllerKind ??
        (t.role === 'player'
          ? 'player'
          : t.role === 'cleric'
            ? 'cleric'
            : t.role === 'animal'
              ? 'animal'
              : t.role === 'actor'
                ? 'script'
                : t.role === 'fighter' || t.role === 'boss'
                  ? 'fighter'
                  : 'passive')),
      (this.process = t.process ?? (t.role === 'player' ? 'player' : 'ai')),
      (this.processType = t.processType ?? (this.process === 'script' ? 'script' : 'ai')),
      (this.aiLevel = t.aiLevel === 0 ? 1 : Math.min(t.aiLevel + (t.difficulty ?? 1), 12)),
      (this.level = t.level),
      (this.align = t.align),
      (this.face = t.face),
      (this.x = t.x + (this.type.start[0] ?? 0) * this.face),
      (this.y = t.y + (this.type.start[1] ?? 0)),
      (this.jump = t.jump + (this.type.start[2] ?? 0)),
      (this.name = pickActorName(e, t.type, this.type)),
      (this.race = this.type.race));
    const i = this.type.actorType === 1 ? 0 : t.level * HP_PER_LEVEL;
    ((this.totalHp = Math.max(0, (this.type.total[0] ?? 0) + i)),
      (this.totalMp = Math.max(0, (this.type.total[1] ?? 0) + (this.type.total[1] ? i : 0))),
      (this.totalKo = Math.max(0, this.type.totalKo + t.level)),
      (this.totalGuard = this.type.totalGuard > 0 ? this.type.totalGuard + t.level : 0),
      (this.totalResist = this.type.totalResist > 0 ? this.type.totalResist + t.level : 0),
      (this.hp = this.totalHp),
      (this.mp = this.totalMp),
      (this.ko = this.totalKo),
      (this.guard = this.totalGuard),
      (this.resist = this.totalResist),
      (this.spl = 0),
      (this.parent = this),
      (this.actionId =
        this.jump + (this.type.start[2] ?? 0) > 0 && this.type.onFall >= 0
          ? this.type.onFall
          : this.type.onStart),
      this.action(this.actionId) || (this.actionId = 0),
      this.changeAction(this.actionId, !0));
  }
  recalculateStats(e, t = 0) {
    if (((this.level = e), (this.role === 'none' || this.role === 'pickup') && this.totalHp > 0))
      return;
    const i = e + Math.max(0, t - 1) * 2,
      r = this.type.actorType === 1 ? 0 : i * HP_PER_LEVEL,
      n = (l, c) => (c > 0 ? l / c : 1),
      a = n(this.hp, this.totalHp);
    if (
      ((this.totalHp = (this.type.total[0] ?? 0) + r),
      (this.hp = this.totalHp * a),
      (this.type.total[1] ?? 0) > 0)
    ) {
      const l = n(this.mp, this.totalMp);
      ((this.totalMp = (this.type.total[1] ?? 0) + r), (this.mp = this.totalMp * l));
    } else ((this.totalMp = 0), (this.mp = 0));
    if (this.type.totalGuard > 0) {
      const l = n(this.guard, this.totalGuard);
      ((this.totalGuard = this.type.totalGuard + i), (this.guard = this.totalGuard * l));
    }
    if (this.type.totalResist > 0) {
      const l = n(this.resist, this.totalResist);
      ((this.totalResist = this.type.totalResist + i), (this.resist = this.totalResist * l));
    }
    const o = n(this.ko, this.totalKo);
    ((this.totalKo = this.type.totalKo + i), (this.ko = this.totalKo * o));
  }
  action(e = this.actionId) {
    return (
      this.actions.has(e) || this.actions.set(e, parseActorAction(this.document, e)),
      this.actions.get(e)
    );
  }
  frame() {
    const e = this.action();
    if (!e || e.animateFrames.length === 0) return;
    const t = Math.min(
        e.animateFrames.length - 1,
        Math.max(0, Math.trunc(this.actionFrames[e.animateIndex] ?? 0)),
      ),
      i = e.animateFrames[t];
    if (!(i < 0))
      return (
        this.frames.has(i) || this.frames.set(i, parseActorFrame(this.document, i)),
        this.frames.get(i)
      );
  }
  frameById(e) {
    return (
      this.frames.has(e) || this.frames.set(e, parseActorFrame(this.document, e)),
      this.frames.get(e)
    );
  }
  stance(e = this.action()?.actionStance ?? 0) {
    return (
      this.stances.has(e) || this.stances.set(e, parseActorStance(this.document, e)),
      this.stances.get(e)
    );
  }
  groundRect(e = this.x, t = this.y) {
    return footprintBox(this.type.solid, e, t);
  }
  airRect(e = this.x, t = this.y, i = this.jump) {
    return solidBox(this.type.solid, e, t, i);
  }
  isLiving() {
    return this.hp > 0 && !this.removed;
  }
  calculateMagicSpl() {
    if (this.bonusRage > 0)
      if (this.hp <= 0) this.bonusRage = 0;
      else return 4;
    return Math.min(3, this.usedSpl + Math.trunc(this.level / 10));
  }
  isEnemy(e) {
    return this.align === -1 ||
      this.role === 'pickup' ||
      this.role === 'none' ||
      this.hp <= 0 ||
      e === this ||
      e === this.parent ||
      e.align === -1 ||
      e.role === 'pickup' ||
      e.role === 'none' ||
      e.type.actorType === 1
      ? !1
      : this.align === 0 || this.align !== e.align;
  }
  isAlly(e) {
    return e === this ||
      this.hp <= 0 ||
      this.align === 0 ||
      e.role === 'pickup' ||
      e.role === 'none' ||
      e.type.actorType === 1
      ? !1
      : this.align === e.align;
  }
  isScriptDone() {
    return this.script?.done ?? !0;
  }
  changeAction(e, t = !1) {
    if (e === -1) return !1;
    if (e === -2) return ((this.removed = !0), !0);
    let i = this.action(e);
    if (!i) return !1;
    if (!t && i.cost.length > 0 && i.onFailure >= 0) {
      const c = (i.cost[1] ?? 0) > this.mp,
        h = !c && (i.cost[2] ?? 0) > this.spl;
      if (
        (c || h) &&
        ((this.resourceFailure = c ? 'magic' : 'super'),
        i.onFailure < 0 || ((e = i.onFailure), (i = this.action(e)), !i))
      )
        return !1;
    }
    const r = this.actionPreflight?.(e) ?? e;
    if (r !== e && ((e = r), (i = this.action(e)), !i)) return !1;
    const n = this.stance(i.actionStance);
    if (
      ((e === n.onStand || i.actionType === 1) && (this.airJuggles = 0),
      (i.actionType === 0 || i.actionType === 30) && (this.actionResist = 0),
      (i.actionType === 0 || i.actionType === 30) && (this.usedSpl = this.spl),
      i.actionType !== 2 && this.hitTrack.clear(),
      (this.didContact = !1),
      (this.actionId = e),
      (this.actionSerial += 1),
      (this.actionLoop = i.animateLoop),
      (this.lastAudioFrame = -1),
      i.animateReset)
    )
      this.actionFrames.fill(0);
    else
      for (let c = 0; c < this.actionFrames.length; c += 1)
        c !== i.animateIndex && (this.actionFrames[c] = 0);
    (!t &&
      i.cost.length > 0 &&
      this.applySelfDamage(i.cost[0] ?? 0, i.cost[1] ?? 0, i.cost[2] ?? 0),
      i.changeFace && (this.face = i.changeFace),
      i.moveReset && (this.speedX = this.speedY = this.speedJump = 0));
    const [a = 0, o = 0, l = 0] = i.move;
    if (i.moveType === 0 && i.move.length) {
      const c = 1 + SPL_SPEED_BONUS * this.spl,
        h = a * c,
        u = o * c;
      (Math.abs(h) > Math.abs(this.speedX) && (this.speedX = h * this.face),
        Math.abs(u) > Math.abs(this.speedY) && (this.speedY = u),
        Math.abs(l) > Math.abs(this.speedJump) && (this.speedJump = l));
    } else if (i.moveType === 2) ((this.x += a * this.face), (this.y += o), (this.jump += l));
    else if (i.moveType === 3) ((this.jump = 0), (this.speedJump = 0));
    else if (i.moveType === 4) {
      const c = this.whoHitMe ?? this.whoIHit;
      if (c && c.face !== this.face) {
        this.face = c.face;
        const h = c.x + c.speedX * 2 - a * this.face;
        ((h < this.worldMinX || h > this.worldMaxX) && (this.face *= -1),
          (this.x = c.x + c.speedX * 2 - a * this.face),
          (this.y = c.y + c.speedY + o),
          (this.jump = Math.random() * l));
      } else {
        const h = Math.trunc(this.worldMaxX) - 20;
        this.x = this.worldMinX + (h === 0 ? 0 : Math.floor(Math.random() * Math.abs(h))) + 10;
        const u = Math.trunc(this.worldFloor);
        ((this.y = u === 0 ? 0 : Math.floor(Math.random() * Math.abs(u))),
          (this.jump = Math.random() * l));
      }
      this.jump < 10 && (this.jump = 0);
    }
    if (
      (i.actionType === 3 && (this.actionResist = RESIST_BASE + this.level * 2),
      i.actionEffect === 1)
    ) {
      const c = Math.max(
        1,
        (i.animateFrames.length * Math.max(1, i.animateLoop)) / Math.max(0.001, i.animateSpeed),
      );
      ((this.fadeDelay = c <= 8 ? 0 : 8), this.setXlucent(1, 1 / Math.max(1, c - this.fadeDelay)));
    }
    return !0;
  }
  applySelfDamage(e, t, i, r = this.damageEnabled) {
    return !r || this.type.actorType === 1
      ? !1
      : ((this.hp = Math.max(1, Math.min(this.totalHp, this.hp - e))),
        (this.mp = Math.max(0, Math.min(this.totalMp, this.mp - t))),
        this.bonusRage > 0 &&
          ((this.bonusRage -= t),
          this.bonusRage < 0 && ((this.bonusRage = 0), (this.rageDepletedFeedback = !0))),
        (this.spl = Math.max(0, Math.min(this.type.totalSpl, this.spl - i))),
        !0);
  }
  consumeFeedback() {
    const e = {
      resourceFailure: this.resourceFailure,
      rageDepleted: this.rageDepletedFeedback,
      superLevelGained: this.superLevelGainedFeedback,
    };
    return (
      (this.resourceFailure = void 0),
      (this.rageDepletedFeedback = !1),
      (this.superLevelGainedFeedback = !1),
      e
    );
  }
  setHue(e, t, i, r) {
    ((this.drawType = 1),
      (this.hueStep = 0),
      (this.hueSteps = Math.max(0, Math.trunc(e))),
      (this.hueR = Math.min(t, 128)),
      (this.hueG = Math.min(i, 128)),
      (this.hueB = Math.min(r, 128)));
    const n = Math.max(1, this.hueSteps);
    ((this.huePortionR = -this.hueR / n),
      (this.huePortionG = -this.hueG / n),
      (this.huePortionB = -this.hueB / n),
      (this.opacity = 1));
  }
  setXlucent(e, t) {
    ((this.opacity = e), (this.fadeRate = t), (this.drawType = 2));
  }
  keyboard(e) {
    const t = this.action();
    let i = e;
    return (
      t?.keyFace === 0 &&
        this.face === -1 &&
        (i =
          new Map([
            [Input.UP_FORWARD, Input.UP_BACKWARD],
            [Input.UP_BACKWARD, Input.UP_FORWARD],
            [Input.DOWN_FORWARD, Input.DOWN_BACKWARD],
            [Input.DOWN_BACKWARD, Input.DOWN_FORWARD],
            [Input.FORWARD, Input.BACKWARD],
            [Input.BACKWARD, Input.FORWARD],
            [Input.RUN_FORWARD, Input.RUN_BACKWARD],
            [Input.RUN_BACKWARD, Input.RUN_FORWARD],
          ]).get(e) ?? e),
      this.changeAction(keyboardAction(t, i))
    );
  }
  queueKeys(e) {
    ((this.process = 'script'),
      (this.script = {
        mode: 'keys',
        face: 0,
        x: 0,
        y: 0,
        keys: e.toLowerCase(),
        done: !1,
      }));
  }
  moveTo(e, t, i, r) {
    ((this.process = 'script'),
      (this.script = {
        mode: 'location',
        face: e,
        x: t,
        y: i,
        relativeActor: r,
        done: !1,
      }));
  }
  scriptAction(e) {
    ((this.process = 'script'),
      (this.script = {
        mode: 'action',
        face: 0,
        x: 0,
        y: 0,
        action: e,
        done: !1,
      }));
  }
  updateScript(e) {
    const t = this.script;
    if (!t || t.done) {
      this.action()?.onKeyboard && this.keyboard(Input.NOTHING);
      return;
    }
    if (t.mode === 'action') {
      (this.changeAction(t.action ?? -1), (t.mode = 'wait-action'));
      return;
    }
    if (t.mode === 'wait-action') {
      (this.actionId === this.stance().onStand || this.removed) && (t.done = !0);
      return;
    }
    if (t.mode === 'keys') {
      if (!t.keys) {
        t.done = !0;
        return;
      }
      if (!this.action()?.onKeyboard) return;
      const h = t.keys[0],
        u = '0123456789abcdefgh'.indexOf(h);
      u >= 0 &&
        (u <= Input.RUN_BACKWARD || keyboardAction(this.action(), u) >= 0) &&
        (this.keyboard(u), (t.keys = t.keys.slice(1)));
      return;
    }
    let i = t.x,
      r = t.y;
    if (t.relativeActor) {
      const h = e(t.relativeActor);
      if (!h) {
        t.done = !0;
        return;
      }
      ((i += h.x), (r += h.y));
    }
    const n = Math.trunc(this.x),
      a = Math.trunc(this.y),
      o = Math.abs(i - n) <= 9 ? 0 : Math.sign(i - n),
      l = Math.abs(r - a) <= 3 ? 0 : Math.sign(r - a);
    let c = Input.NOTHING;
    (o > 0 && l < 0
      ? (c = Input.UP_FORWARD)
      : o < 0 && l < 0
        ? (c = Input.UP_BACKWARD)
        : o > 0 && l > 0
          ? (c = Input.DOWN_FORWARD)
          : o < 0 && l > 0
            ? (c = Input.DOWN_BACKWARD)
            : o > 0
              ? (c = Input.FORWARD)
              : o < 0
                ? (c = Input.BACKWARD)
                : l < 0
                  ? (c = Input.UP)
                  : l > 0
                    ? (c = Input.DOWN)
                    : (t.face && (this.face = t.face), (t.done = !0)),
      this.keyboard(c));
  }
  updateAnimation() {
    const e = this.action();
    if (!e) return -1;
    let t = -1;
    if (e.animateLoop !== 0) {
      const i = e.animateIndex;
      ((this.actionFrames[i] = (this.actionFrames[i] ?? 0) + e.animateSpeed),
        this.actionFrames[i] >= e.animateFrames.length &&
          ((this.lastAudioFrame = -1),
          e.animateLoop === -1
            ? (this.actionFrames[i] = e.animateRepeatAt)
            : this.actionLoop === 1
              ? ((this.actionFrames[i] = Math.max(0, e.animateFrames.length - 1)), (t = e.onDone))
              : ((this.actionLoop -= 1), (this.actionFrames[i] = e.animateRepeatAt))));
    }
    return (this.stepVisualEffect(), t);
  }
  stepVisualEffect() {
    if (this.drawType === 1) {
      ((this.hueStep += 1),
        this.hueStep > this.hueSteps
          ? (this.drawType = 0)
          : ((this.hueR += this.huePortionR),
            (this.hueG += this.huePortionG),
            (this.hueB += this.huePortionB)));
      return;
    }
    if (this.drawType === 2) {
      if (this.fadeDelay > 0) {
        this.fadeDelay -= 1;
        return;
      }
      ((this.fadeDelay -= 1),
        (this.opacity -= this.fadeRate),
        this.opacity <= 0 && ((this.opacity = 0), (this.drawType = -1)));
    }
  }
  applyMotion(e, t, i, r = this.speedX, n = this.speedY) {
    const a = this.action();
    if (!a) return -1;
    let o = -1;
    return (
      (this.x = Math.max(e, Math.min(t, this.x + r))),
      n !== 0 && (this.y = Math.max(0, Math.min(i, this.y + n))),
      a.gravity > 0
        ? ((this.jump += this.speedJump),
          this.jump <= 0
            ? ((this.jump = 0),
              (this.speedX *= a.friction),
              (this.speedY *= a.friction),
              a.bounce === 0
                ? ((this.speedJump = 0), (o = a.onLand))
                : ((this.speedJump = -(this.speedJump + a.gravity) * a.bounce),
                  Math.trunc(this.speedJump) === 0 && (o = a.onLand)))
            : (this.speedJump -= a.gravity))
        : ((this.speedX *= a.friction), (this.speedY *= a.friction)),
      o
    );
  }
  setQuake(e, t, i) {
    ((this.quakeOn = !0),
      (this.quakeFace = t),
      (this.quakeSize = Math.min(e, QUAKE_STEPS)),
      (this.quakePercent = i),
      (this.quakeDirection = 1));
  }
  stepQuake() {
    this.quakeOn &&
      (this.quakeDirection === 1 &&
        (Math.trunc(this.quakeSize) !== 0
          ? (this.quakeSize *= this.quakePercent)
          : (this.quakeOn = !1)),
      (this.quakeDirection *= -1));
  }
  get quakeOffsetX() {
    return this.quakeOn && this.quakeDirection === 1
      ? Math.trunc(this.quakeSize * this.quakeFace)
      : 0;
  }
  canDepthHit(e, t) {
    return withinVerticalReach(this.type.solid, this.y, e.type.solid, e.y, t.attackZ);
  }
  addSpeed(e, t, i, r) {
    let n = !1;
    const a = t * e;
    if (a > 0 && this.speedX > 0) this.speedX = Math.max(a, this.speedX);
    else if (a < 0 && this.speedX < 0) this.speedX = Math.min(a, this.speedX);
    else {
      const o = this.speedX + a;
      ((n = (o > 0 && this.speedX < 0) || (o < 0 && this.speedX > 0)), (this.speedX = o));
    }
    return (
      i > 0 && this.speedY > 0
        ? (this.speedY = Math.max(i, this.speedY))
        : i < 0 && this.speedY < 0
          ? (this.speedY = Math.min(i, this.speedY))
          : (this.speedY += i),
      r > 0 && this.speedJump > 0
        ? (this.speedJump = Math.max(r, this.speedJump))
        : r < 0 && this.speedJump < 0
          ? (this.speedJump = Math.min(r, this.speedJump))
          : (this.speedJump += r),
      n
    );
  }
  regenerate() {
    if (!this.isLiving()) return;
    const e = (this.spl + 1) / 30;
    ((this.sp = Math.max(0, this.sp - e)),
      (this.mp = Math.min(this.totalMp, this.mp + e)),
      (this.ko = Math.min(this.totalKo, this.ko + e)),
      (this.resist = Math.min(this.totalResist, this.resist + e)),
      (this.guard = Math.min(this.totalGuard, this.guard + e)));
  }
  addSuper(e) {
    if (this.totalMp === 0 || this.hp <= 0) return !1;
    let t = e;
    return (
      this.spl > 0 && (t /= this.spl + 1),
      (this.sp += t),
      this.spl >= this.type.totalSpl
        ? !1
        : this.sp > 100
          ? ((this.sp = 0),
            (this.spl += 1),
            (this.usedSpl = this.spl),
            (this.superLevelGainedFeedback = !0),
            !0)
          : !1
    );
  }
  addScore(e) {
    this.score = Math.max(0, Math.min(9999999, this.score + Math.trunc(e)));
  }
  countComboHit() {
    const e = this.parent ?? this;
    return (
      e.comboTicksLeft === 0 && (e.comboHits = 0),
      (e.comboTicksLeft = COMBO_TICKS),
      (e.comboHits += 1),
      e
    );
  }
  stepComboClock(e = !0) {
    if (
      this.comboTicksLeft <= 0 ||
      this.hp <= 0 ||
      ((this.comboTicksLeft -= 1),
      this.comboTicksLeft !== 0 || this.comboHits < MIN_COMBO_HITS || !e)
    )
      return;
    const t = this.comboHits;
    return ((this.comboHits = 0), t);
  }
  receiveHit(e, t, i = !0, r = {}) {
    const n = r.applyAction ?? !0,
      a = r.applyVector ?? !0,
      o = {
        damage: 0,
        mpDamage: 0,
        blocked: !1,
        killed: !1,
        accepted: !1,
        nextAction: -1,
      };
    let l = -1;
    const c = (Y) => {
      Y < 0 || ((l = Y), n && this.changeAction(Y, !0));
    };
    if ((!r.preaccepted && !this.isLiving() && t.damageType !== 80) || t.damageType <= 0) return o;
    if (t.damageType === 80) {
      const Y = this.stance();
      return Y.onKo < 0
        ? o
        : (c(Y.onKo),
          this.setQuake(3, e.face, 0.75),
          a && this.applyHitVector(e, t),
          {
            ...o,
            accepted: !0,
            nextAction: l,
          });
    }
    if (t.damageType === 70) {
      if ((this.hp >= this.totalHp && this.mp >= this.totalMp) || this.hp <= 0) return o;
      const Y = Math.trunc(e.level / 100),
        O = (t.damage[0] ?? 0) + Y;
      this.hp = Math.min(this.totalHp, this.hp + O);
      const $ = (t.damage[1] ?? 0) + Y;
      return (
        (this.mp = Math.min(this.totalMp, this.mp + $)),
        this.processType !== 'script' &&
          this.hp <= this.totalHp * 0.75 &&
          (this.miniStatFrames = DEFAULT_UPDATE_RATE * 3),
        this.setQuake(3, e.face, 0.75),
        {
          damage: -O,
          mpDamage: -$,
          blocked: !1,
          killed: !1,
          accepted: !0,
          nextAction: l,
        }
      );
    }
    const h = e.parent ?? e,
      u = this.action();
    if (!u) return o;
    if (t.damageType === 20 && this.bonusAbsorb > 0) {
      const Y = t.damage[0] ?? 0,
        O = Math.trunc(Y + Math.abs(Y));
      return (
        (this.bonusAbsorb = Math.max(0, this.bonusAbsorb - O)),
        this.addSuper(O * 2),
        this.applySelfDamage(0, -O, 0, i),
        this.setQuake(3, e.face, 0.75),
        (this.didAbsorb = !0),
        {
          ...o,
          accepted: !0,
          absorbed: !0,
        }
      );
    }
    this.processType !== 'script' &&
      this.hp <= this.totalHp * 0.75 &&
      (this.miniStatFrames = DEFAULT_UPDATE_RATE * 3);
    let d = 1 + 0.2 * e.spl;
    (this.face === e.face && (d += 0.15),
      u.vulnerability > 0 && (d += 0.25 * (u.vulnerability - 1)),
      h.bonusRage > 0 && (d += 0.35));
    const f = Math.trunc(e.level / 100);
    let m = (t.damage[0] ?? 0) * d + f,
      p = (t.damage[1] ?? 0) * d + f,
      g = m;
    const v = (this.x > h.x && this.face === 1) || (this.x < h.x && this.face === -1);
    let x = !1,
      b = !1,
      _ = !1,
      S = !0;
    const w = this.hp;
    if (u.onBlocked !== -1 && !v && this.guard - m > 0)
      ((this.guard = Math.max(0, this.guard - m)),
        this.type.canFace && (this.face = h.x > this.x ? 1 : -1),
        c(u.onBlocked),
        (x = !0),
        (b = !0),
        (S = !1),
        this.setQuake(Math.trunc(g / 2) + 1, e.face, 0.75),
        (m = 0),
        (p = 0));
    else {
      (u.actionType !== 30 || u.onBlocked !== -1) &&
      this.actionResist + this.bonusRage + this.resist - m > 0 &&
      Math.trunc(this.hp - m / 2) > 0
        ? (this.actionResist > 0 &&
            ((this.actionResist -= m),
            this.actionResist < 0 && ((m = -this.actionResist), (this.actionResist = 0))),
          this.bonusRage > 0 &&
            m > 0 &&
            ((this.bonusRage -= m),
            this.bonusRage < 0 && ((m = -this.bonusRage), (this.bonusRage = 0))),
          this.resist > 0 && m > 0 && ((this.resist -= m), this.resist < 0 && (this.resist = 0)),
          (g = m),
          (m /= 2),
          (p /= 2),
          (x = !0),
          (_ = !0),
          (S = !1),
          this.setQuake(Math.trunc(m) + 3, e.face, 0.75))
        : (this.type.canFace && (this.face = h.x > this.x ? 1 : -1),
          (this.ko = Math.max(0, this.ko - m)),
          u.onBlocked !== -1 && this.guard > 0 && this.guard - m <= 0 && (this.guard = 0),
          this.setQuake(Math.trunc(m) + 1, e.face, 0.5));
      const O = t.damageType === 30 ? 1 : 0;
      i &&
        this.type.actorType !== 1 &&
        (t.damageType !== 30 && m > 0 && this.addSuper(m),
        t.damageType !== 30 && m !== 0 && (this.comboTicksLeft = 1),
        (this.hp = Math.max(O, this.hp - m)),
        (this.mp = Math.max(0, this.mp - p)),
        this.bonusRage > 0 &&
          ((this.bonusRage -= t.damageType === 30 ? p : m + p),
          this.bonusRage < 0 && ((this.bonusRage = 0), (this.rageDepletedFeedback = !0))),
        Math.trunc(this.hp) <= 0 && t.damageType < 30 && (this.hp = 0));
    }
    const A = this.stance(),
      E = i && this.type.actorType !== 1 && this.hp <= 0,
      D = !x && t.damageType < 30 && this.type.actorType !== 1 && Math.trunc(w - m) <= 0;
    D
      ? c(A.onDeath)
      : S && t.damageType < 30
        ? t.damageAction === 1
          ? this.jump === 0 && this.ko > 0 && A.onHit >= 0
            ? c(A.onHit)
            : A.onKo >= 0 &&
              (c(A.onKo),
              (this.ko = this.totalKo),
              (this.guard = this.totalGuard),
              (this.resist = this.totalResist),
              this.jump > 0 && (this.airJuggles += 1))
          : t.damageAction === 2 &&
            A.onKo >= 0 &&
            (c(A.onKo),
            (this.ko = this.totalKo),
            (this.guard = this.totalGuard),
            (this.resist = this.totalResist),
            this.jump > 0 && (this.airJuggles += 1))
        : S &&
          t.damageType === 30 &&
          (t.damageAction === 1 && this.jump === 0 && this.ko > 0 && A.onHit >= 0
            ? c(A.onHit)
            : A.onKo >= 0 &&
              (c(A.onKo),
              (this.ko = this.totalKo),
              (this.guard = this.totalGuard),
              (this.resist = this.totalResist)));
    const I =
      (_ || (b && t.damageType !== 30) || (!x && !D && t.damageType < 30)) &&
      (this.role === 'none' || this.isEnemy(h));
    return (
      I && (this.whoHitMe = h),
      a && this.applyHitVector(e, t),
      E &&
        ((this.mp = 0),
        (this.sp = 0),
        (this.spl = 0),
        (this.guard = 0),
        (this.resist = 0),
        (this.ko = 0),
        (this.bonusRage = 0),
        (this.bonusRefract = 0),
        (this.bonusAbsorb = 0),
        (this.comboHits = 0),
        (this.comboTicksLeft = 0),
        (this.didWarning = !0)),
      {
        damage: m,
        mpDamage: p,
        blocked: x,
        killed: E,
        accepted: !0,
        nextAction: l,
        guarded: b,
        resisted: _,
        impactDamage: g,
        attacked: I,
      }
    );
  }
  applyHitVector(e, t) {
    if (!t.damageVector.length || !this.type.movable) return !1;
    const i = e.parent ?? e,
      [r = 0, n = 0, a = 0] = t.damageVector;
    return this.addSpeed(this.x < i.x ? 1 : -1, r, n, a);
  }
}
export { Actor, MIN_HIT_OVERLAP };
