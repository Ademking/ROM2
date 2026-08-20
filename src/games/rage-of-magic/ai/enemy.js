import { AI_TUNING, AiState } from './constants.js';
import {
  bestTarget,
  distanceBetween,
  hashString,
  lessCrowdedSide,
  pointTowards,
  seededRandom,
  sideOf,
  solidHalfWidth,
  solidHeight,
} from './helpers.js';
import { Input } from '../constants.js';
class EnemyAi {
  actor;
  random;
  mode = AiState.GOTO_WAIT_DECIDE;
  target;
  gotoX = 0;
  gotoY = 0;
  wait = 0;
  pursuitTries = 0;
  attackButton = -1;
  attackRangeX = -1;
  wasBumped = !1;
  wasAttacked = !1;
  canAttack = !1;
  didTaunt = !1;
  following = !1;
  pendingAction = -1;
  attacker;
  command = -1;
  commandButton;
  constructor(e, t = {}) {
    ((this.actor = e),
      (this.random = t.random ?? seededRandom(t.seed ?? hashString(e.id))),
      this.reset());
  }
  reset() {
    ((this.mode = AiState.GOTO_WAIT_DECIDE),
      this.setTarget(void 0),
      (this.gotoX = this.actor.x),
      (this.gotoY = this.actor.y),
      (this.wait = 0),
      (this.pursuitTries = 0),
      (this.attackButton = -1),
      (this.attackRangeX = -1),
      (this.wasBumped = !1),
      (this.wasAttacked = !1),
      (this.canAttack = !1),
      (this.didTaunt = !1),
      (this.following = !1),
      (this.pendingAction = -1),
      (this.attacker = void 0));
  }
  onBumped() {
    this.wasBumped = !0;
  }
  onAttacked(e) {
    ((this.wasAttacked = !0),
      (this.canAttack = !0),
      e && ((this.attacker = e), (this.actor.whoHitMe = e)));
  }
  queueAction(e) {
    this.pendingAction = e;
  }
  state() {
    return {
      mode: this.mode,
      target: this.target,
      gotoX: this.gotoX,
      gotoY: this.gotoY,
      wait: this.wait,
      pursuitTries: this.pursuitTries,
      attackButton: this.attackButton,
      attackRangeX: this.attackRangeX,
      following: this.following,
      canAttack: this.canAttack,
      didTaunt: this.didTaunt,
      wasBumped: this.wasBumped,
      wasAttacked: this.wasAttacked,
      protector: !!(this.actor.type.aiProtector && this.actor.leader),
    };
  }
  step(e, t = !0) {
    return (
      (this.command = -1),
      (this.commandButton = void 0),
      this.pendingAction !== -1
        ? ((this.command = this.pendingAction), (this.pendingAction = -1), this.decision())
        : this.actor.hp <= 0 || !t
          ? this.decision()
          : (!this.canAttack && !this.actor.outside && (this.canAttack = !0),
            this.handleInterruptions(e),
            this.runMode(e),
            this.decision())
    );
  }
  decision() {
    return {
      ...this.state(),
      command: this.command,
      button: this.commandButton,
      remove: this.command === -2,
    };
  }
  setTarget(e) {
    ((this.target = e), (this.actor.target = e));
  }
  issue(e, t) {
    ((this.commandButton = t), (this.command = e.actionForButton?.(this.actor, t) ?? t));
  }
  issueIfChanged(e, t) {
    const i = e.actionForButton?.(this.actor, t) ?? t;
    (this.actor.actionId !== void 0 && i === this.actor.actionId) ||
      ((this.commandButton = t), (this.command = i));
  }
  isEnemy(e, t) {
    return e.isLivingEnemy
      ? e.isLivingEnemy(this.actor, t)
      : t === this.actor ||
          t.hp <= 0 ||
          t.align === -1 ||
          t.type.actorType === 1 ||
          t.role === 'pickup' ||
          t.role === 'none' ||
          this.actor.align === -1 ||
          this.actor.hp <= 0
        ? !1
        : this.actor.align === 0 || this.actor.align !== t.align;
  }
  warned(e) {
    return this.actor.didWarning ?? e.isWarned?.(this.actor) ?? !1;
  }
  handleInterruptions(e) {
    if (this.warned(e) && !this.actor.isRetreating && this.actor.type.aiRetreat) {
      ((this.mode = AiState.RETREAT_DECIDE), (this.following = !1), (this.actor.isRetreating = !0));
      return;
    }
    if (this.actor.isRetreating) {
      (this.wasBumped || this.wasAttacked) &&
        ((this.mode === AiState.RETREAT || this.mode === AiState.RETREAT_ESCAPE) &&
          ((this.mode = AiState.RETREAT_ESCAPE_DECIDE), (this.pursuitTries += 1)),
        (this.wasBumped = !1),
        (this.wasAttacked = !1),
        this.pursuitTries > AI_TUNING.MAX_PURSUIT_TRIES &&
          ((this.actor.whoHitMe = void 0),
          (this.attacker = void 0),
          (this.pursuitTries = 0),
          (this.mode = AiState.RETREAT_DECIDE)));
      return;
    }
    if (this.actor.didContact)
      ((this.pursuitTries = 0), (this.wasBumped = !1), (this.wasAttacked = !1));
    else if (this.wasAttacked) {
      const t = this.attacker ?? this.actor.whoHitMe;
      (t &&
        ((t !== this.target && this.random.boolean()) || !this.target) &&
        (this.setTarget(t), (this.following = !0), (this.mode = AiState.PURSUE_DECIDE)),
        (this.pursuitTries = 0),
        (this.wasBumped = !1),
        (this.wasAttacked = !1));
    } else this.wasBumped && this.recoverFromBump(e);
    this.target &&
      (!this.isEnemy(e, this.target) || this.target.hp <= 0) &&
      (this.setTarget(void 0),
      (this.following = !1),
      (this.pursuitTries = 0),
      (this.mode = AiState.GOTO_WAIT_DECIDE));
  }
  recoverFromBump(e) {
    let t;
    (this.mode === AiState.GOTO_WAIT ||
    this.mode === AiState.GOTO_WAIT_DECIDE ||
    this.mode === AiState.GOTO_ESCAPE_DECIDE ||
    this.mode === AiState.GOTO_ESCAPE
      ? (t = AiState.GOTO_DECIDE)
      : this.mode === AiState.GOTO_DECIDE
        ? (t = AiState.GOTO_WAIT_DECIDE)
        : this.mode === AiState.GOTO || this.mode === AiState.FOLLOW
          ? (t = AiState.GOTO_ESCAPE_DECIDE)
          : this.target
            ? this.mode === AiState.PURSUE_WAIT ||
              this.mode === AiState.PURSUE_WAIT_DECIDE ||
              this.mode === AiState.PURSUE_ESCAPE_DECIDE ||
              this.mode === AiState.PURSUE_ESCAPE
              ? (t = AiState.PURSUE_DECIDE)
              : this.mode === AiState.PURSUE_DECIDE
                ? (t = AiState.PURSUE_WAIT_DECIDE)
                : (t = AiState.PURSUE_ESCAPE_DECIDE)
            : (t = AiState.GOTO_ESCAPE_DECIDE),
      (this.pursuitTries += 1),
      this.pursuitTries >= AI_TUNING.MAX_PURSUIT_TRIES &&
        ((t = AiState.GOTO_WAIT_DECIDE), (this.pursuitTries = 0)),
      (this.mode = t),
      (this.wasBumped = !1),
      this.issue(e, Input.NOTHING));
  }
  runMode(e) {
    this.command === -1 &&
      (this.mode === AiState.GOTO_WAIT_DECIDE
        ? this.waitDecide(e, AiState.GOTO_WAIT)
        : this.mode === AiState.GOTO_WAIT && this.wait-- <= 0
          ? (this.mode = AiState.GOTO_DECIDE)
          : this.mode === AiState.GOTO_ESCAPE_DECIDE
            ? this.escapeDecide(e, AiState.GOTO_ESCAPE, AiState.GOTO_WAIT_DECIDE)
            : this.mode === AiState.GOTO_ESCAPE
              ? this.walkTo(e, AiState.GOTO_DECIDE, !1)
              : this.mode === AiState.GOTO_DECIDE
                ? this.gotoDecide(e)
                : this.mode === AiState.GOTO
                  ? this.walkTo(e, AiState.PURSUE_WAIT_DECIDE, !1)
                  : this.mode === AiState.FOLLOW
                    ? this.walkTo(e, AiState.GOTO_WAIT_DECIDE, !1)
                    : this.mode === AiState.PURSUE_WAIT_DECIDE
                      ? this.waitDecide(e, AiState.PURSUE_WAIT)
                      : this.mode === AiState.PURSUE_WAIT && this.wait-- <= 0
                        ? this.finishPursuitWait(e)
                        : this.mode === AiState.PURSUE_ESCAPE_DECIDE
                          ? this.escapeDecide(e, AiState.PURSUE_ESCAPE, AiState.GOTO_WAIT_DECIDE)
                          : this.mode === AiState.PURSUE_ESCAPE
                            ? this.walkTo(e, AiState.PURSUE_DECIDE, !1)
                            : this.mode === AiState.PURSUE_DECIDE
                              ? this.pursueDecide(e)
                              : this.mode === AiState.PURSUE
                                ? this.pursueTo(e)
                                : this.mode === AiState.ATTACK_DECIDE
                                  ? this.attackDecide(e, AiState.ATTACK, AiState.PURSUE_WAIT_DECIDE)
                                  : this.mode === AiState.ATTACK
                                    ? this.attack(e)
                                    : this.mode === AiState.RETREAT_ESCAPE_DECIDE
                                      ? this.escapeDecide(
                                          e,
                                          AiState.RETREAT_ESCAPE,
                                          AiState.RETREAT_DECIDE,
                                        )
                                      : this.mode === AiState.RETREAT_ESCAPE
                                        ? this.walkTo(e, AiState.RETREAT_DECIDE, !0)
                                        : this.mode === AiState.RETREAT_DECIDE
                                          ? this.retreatDecide(e)
                                          : this.mode === AiState.RETREAT
                                            ? this.walkTo(e, AiState.RETREAT_GONE, !0)
                                            : this.mode === AiState.RETREAT_GONE &&
                                              (this.command = -2));
  }
  waitDecide(e, t) {
    const i = Math.max(0, Math.min(AI_TUNING.MAX_AI_LEVEL, Math.trunc(this.actor.aiLevel)));
    ((this.wait = this.random.int((AI_TUNING.MAX_AI_LEVEL - i) * AI_TUNING.WAIT_PER_LEVEL)),
      this.issueIfChanged(e, Input.NOTHING),
      (this.mode = t));
  }
  finishPursuitWait(e) {
    const t = this.countEnemiesNearby(e, AI_TUNING.ENEMY_CLOSE * 2);
    (e.isStanding?.(this.actor) ?? !1) &&
    t === 0 &&
    this.actor.type.onTaunt !== -1 &&
    !this.didTaunt &&
    this.random.int(8) === 0
      ? ((this.command = this.actor.type.onTaunt),
        (this.didTaunt = !0),
        (this.mode = AiState.ATTACK_DECIDE))
      : (this.mode = AiState.PURSUE_DECIDE);
  }
  gotoDecide(e) {
    let t = this.findNearest(
      e,
      (a) => (e.isYInRange?.(this.actor, a) ?? !0) && e.isPathClear(this.actor, a.x, a.y, a),
    );
    if (
      (t || (t = this.findNearest(e, (a) => e.isPathClear(this.actor, a.x, a.y, a))),
      t && Math.abs(this.actor.x - t.x) > AI_TUNING.CLOSE_ENOUGH_PIXELS)
    ) {
      (this.setTarget(t), (this.mode = AiState.PURSUE_WAIT_DECIDE), (this.following = !0));
      return;
    }
    if (
      ((t = this.random.boolean()
        ? bestTarget(
            this.actor,
            e.actors,
            (a, o) => e.isLivingEnemy?.(a, o) ?? this.isEnemy(e, o),
            e.isInCamera,
          )
        : this.findNearest(e)),
      this.setTarget(t),
      !t)
    ) {
      this.followLeader(e);
      return;
    }
    ((this.pursuitTries = 0), (this.following = !0));
    const i = sideOf(this.actor, t);
    let r;
    if (this.actor.type.aiGoBehind) {
      r = lessCrowdedSide(this.actor, t, e.actors);
      const a = solidHalfWidth(this.actor.type.solid);
      r === 1 && e.bounds.playerMaxX - t.x - AI_TUNING.MAX_GOTO_DIST < a
        ? (r = -1)
        : r === -1 && t.x - e.bounds.playerMinX - AI_TUNING.MAX_GOTO_DIST < a && (r = 1);
    } else r = i === 1 ? -1 : 1;
    const n = Math.max(1, Math.trunc(this.actor.aiLevel) + 1);
    for (let a = 0; a < n; a += 1)
      if (
        (this.stageAroundTarget(e, t, i, r),
        this.limitGoto(e),
        e.isPathClear(this.actor, this.gotoX, this.gotoY, t) &&
          Math.hypot(this.actor.x - this.gotoX, this.actor.y - this.gotoY) >
            AI_TUNING.MIN_MOVE_DIST)
      ) {
        this.mode = AiState.GOTO;
        return;
      }
    this.mode = AiState.GOTO_ESCAPE_DECIDE;
  }
  stageAroundTarget(e, t, i, r) {
    const n = solidHalfWidth(this.actor.type.solid),
      a = solidHeight(this.actor.type.solid),
      o = n + this.random.int(AI_TUNING.MAX_GOTO_DIST);
    ((this.gotoX = Math.trunc(t.x) + r * o),
      i === r
        ? this.actor.y > t.y
          ? (this.gotoY =
              Math.trunc(t.y) +
              a +
              this.random.int(Math.max(1, e.bounds.floorHeight - Math.trunc(t.y))))
          : (this.gotoY = Math.trunc(t.y) - a - this.random.int(Math.max(1, Math.trunc(t.y))))
        : (this.gotoY = this.random.int(Math.max(1, Math.trunc(e.bounds.floorHeight)))));
  }
  followLeader(e) {
    const t = this.actor.leader;
    if (!t || t.hp <= 0 || distanceBetween(this.actor, t) <= AI_TUNING.MIN_FOLLOW_DIST) {
      ((this.mode = AiState.GOTO_WAIT_DECIDE), (this.following = !1));
      return;
    }
    if (!e.isSpotClear(this.actor, this.actor.x, this.actor.y))
      (([this.gotoX, this.gotoY] = pointTowards(
        t.x,
        t.y,
        this.actor.x,
        this.actor.y,
        AI_TUNING.MIN_FOLLOW_DIST,
      )),
        (this.mode = AiState.FOLLOW));
    else {
      const [i, r] = pointTowards(
        this.actor.x,
        this.actor.y,
        t.x,
        t.y,
        AI_TUNING.CLOSE_ENOUGH_PIXELS,
      );
      e.isSpotClear(this.actor, i, r)
        ? (([this.gotoX, this.gotoY] = pointTowards(
            t.x,
            t.y,
            this.actor.x,
            this.actor.y,
            AI_TUNING.MIN_FOLLOW_DIST,
          )),
          (this.mode = AiState.FOLLOW))
        : (this.mode = AiState.GOTO_ESCAPE_DECIDE);
    }
    (this.limitGoto(e), (this.following = !1));
  }
  escapeDecide(e, t, i) {
    const r = Math.max(1, Math.trunc(this.actor.aiLevel) + 1);
    for (let n = 0; n < r; n += 1) {
      const o = this.random.int(23) * 15 * (Math.PI / 180),
        l = AI_TUNING.MIN_MOVE_DIST + this.random.int(AI_TUNING.MAX_GOTO_DIST);
      if (
        ((this.gotoX = this.actor.x + Math.cos(o) * l),
        (this.gotoY = this.actor.y + Math.sin(o) * l),
        !(
          (this.actor.face === 1 && this.gotoX < this.actor.x) ||
          (this.actor.face === -1 && this.gotoX > this.actor.x)
        ) && (this.limitGoto(e), e.isPathClear(this.actor, this.gotoX, this.gotoY)))
      ) {
        this.mode = t;
        return;
      }
    }
    for (let n = 0; n < 360; n += 15) {
      const a = n * (Math.PI / 180);
      if (
        ((this.gotoX = this.actor.x + Math.cos(a) * AI_TUNING.MIN_MOVE_DIST),
        (this.gotoY = this.actor.y + Math.sin(a) * AI_TUNING.MIN_MOVE_DIST),
        this.limitGoto(e),
        e.isPathClear(this.actor, this.gotoX, this.gotoY))
      ) {
        this.mode = t;
        return;
      }
    }
    this.mode = i;
  }
  pursueDecide(e) {
    const t = this.target;
    if (!t) {
      this.mode = AiState.GOTO_DECIDE;
      return;
    }
    if (Math.abs(this.actor.x - t.x) <= AI_TUNING.CLOSE_ENOUGH_PIXELS) {
      this.mode = AiState.GOTO_DECIDE;
      return;
    }
    const i = e.vulnerability?.(t) ?? 0,
      r = this.countEnemiesNearby(e, AI_TUNING.ENEMY_CLOSE),
      n = (o) => e.canPerform?.(this.actor, o) ?? !1;
    if (n(Input.ABC) && (this.random.int(6) === 0 || this.warned(e)) && (i === 2 || r >= 3))
      this.attackButton = Input.ABC;
    else if (n(Input.C) && this.random.int(5) === 0 && (i === 2 || r >= 2 || this.warned(e)))
      this.attackButton = Input.C;
    else if (n(Input.AB) && this.random.int(4) === 0 && (i === 2 || r === 1))
      this.attackButton = Input.AB;
    else if (n(Input.B) && this.random.int(3) === 0 && i === 1) this.attackButton = Input.B;
    else if (n(Input.A)) this.attackButton = Input.A;
    else {
      this.mode = AiState.PURSUE_WAIT_DECIDE;
      return;
    }
    if (
      (e.canRangeHit?.(this.actor, t, this.attackButton) ?? !1) &&
      this.random.boolean() &&
      this.canAttack
    ) {
      this.mode = AiState.ATTACK;
      return;
    }
    const a = e.attackRange?.(this.actor, this.attackButton) ?? -1;
    if (a < 0) {
      this.mode = AiState.PURSUE_WAIT_DECIDE;
      return;
    }
    ((this.attackRangeX =
      Math.trunc(a * 0.75) + this.random.int(Math.max(1, Math.trunc(a * 0.25)))),
      (this.gotoX = t.x + this.attackRangeX * sideOf(this.actor, t)),
      this.gotoX < e.bounds.playerMinX
        ? (this.gotoX = t.x + this.attackRangeX)
        : this.gotoX > e.bounds.playerMaxX && (this.gotoX = t.x - this.attackRangeX),
      (this.mode = AiState.PURSUE));
  }
  pursueTo(e) {
    const t = this.target;
    if (!t) {
      this.mode = AiState.GOTO_DECIDE;
      return;
    }
    if ((e.canRangeHit?.(this.actor, t, this.attackButton) ?? !1) && this.canAttack) {
      this.mode = AiState.ATTACK;
      return;
    }
    const i =
        e.isYInRange?.(this.actor, t) ?? Math.abs(this.actor.y - t.y) <= (t.type.solid[1] ?? 0),
      r = Math.max(1, solidHeight(t.type.solid));
    ((this.gotoY = i ? this.actor.y : Math.trunc(t.y) - Math.trunc(r / 2) + this.random.int(r)),
      this.limitGoto(e),
      e.isPathClear(this.actor, this.gotoX, this.gotoY, t)
        ? this.walkTo(e, AiState.ATTACK, i && this.random.boolean())
        : (this.mode = AiState.PURSUE_ESCAPE_DECIDE));
  }
  attackDecide(e, t, i) {
    let r = -1,
      n = 0;
    for (let a = Input.A; a <= Input.ABC; a += 1) {
      if (!(e.canPerform?.(this.actor, a) ?? !1)) continue;
      const o = e.countEnemiesHit?.(this.actor, a) ?? 0;
      o !== 0 &&
        (o > n || (o === n && (this.random.int(a) === 0 || this.warned(e)))) &&
        ((r = a), (n = o));
    }
    if (n === 0) {
      this.mode = i;
      return;
    }
    ((this.attackButton = r), (this.pursuitTries = 0), (this.mode = t));
  }
  attack(e) {
    const t =
      AI_TUNING.MAX_AI_LEVEL -
      Math.max(0, Math.min(AI_TUNING.MAX_AI_LEVEL, Math.trunc(this.actor.aiLevel)));
    (t === 0 || this.random.int(t) === 0) &&
      ((this.mode = AiState.ATTACK_DECIDE),
      (this.pursuitTries = 0),
      this.issue(e, this.attackButton));
  }
  retreatDecide(e) {
    const t = this.attacker ?? this.actor.whoHitMe;
    ((t ? this.actor.x > t.x : this.actor.x > e.bounds.sceneWidth / 2)
      ? ((this.gotoX = e.bounds.sceneMaxX + AI_TUNING.MAX_GOTO_DIST), (this.actor.face = 1))
      : ((this.gotoX = e.bounds.sceneMinX - AI_TUNING.MAX_GOTO_DIST), (this.actor.face = -1)),
      (this.gotoY = this.actor.y),
      (this.pursuitTries = 0),
      (this.mode = AiState.RETREAT),
      this.issueIfChanged(e, Input.NOTHING));
  }
  walkTo(e, t, i) {
    let r = this.gotoX,
      n = this.gotoY;
    const a = Math.trunc(this.actor.x),
      o = Math.trunc(this.actor.y);
    (Math.abs(r - a) <= AI_TUNING.CLOSE_ENOUGH_PIXELS * 2 && (r = a),
      Math.abs(n - o) <= AI_TUNING.CLOSE_ENOUGH_PIXELS && (n = o));
    let l = -1;
    (a > r && o > n
      ? (l = Input.UP_BACKWARD)
      : a > r && o < n
        ? (l = Input.DOWN_BACKWARD)
        : a < r && o > n
          ? (l = Input.UP_FORWARD)
          : a < r && o < n
            ? (l = Input.DOWN_FORWARD)
            : a > r
              ? (l = i ? Input.RUN_BACKWARD : Input.BACKWARD)
              : a < r
                ? (l = i ? Input.RUN_FORWARD : Input.FORWARD)
                : o > n
                  ? (l = i && this.random.boolean() ? Input.HOP_UP : Input.UP)
                  : o < n
                    ? (l = i && this.random.boolean() ? Input.HOP_DOWN : Input.DOWN)
                    : (this.mode = t),
      l !== -1 && this.issue(e, l));
  }
  countEnemiesNearby(e, t) {
    let i = 0;
    for (const r of e.actors) this.isEnemy(e, r) && distanceBetween(this.actor, r) < t && (i += 1);
    return i;
  }
  findNearest(e, t = () => !0) {
    let i,
      r = Number.POSITIVE_INFINITY;
    for (const n of e.actors) {
      if (!this.isEnemy(e, n) || !t(n)) continue;
      const a = distanceBetween(this.actor, n);
      a < r && ((r = a), (i = n));
    }
    return i;
  }
  limitGoto(e) {
    ((this.gotoX = Math.max(e.bounds.playerMinX, Math.min(e.bounds.playerMaxX - 1, this.gotoX))),
      (this.gotoY = Math.max(0, Math.min(e.bounds.floorHeight - 1, this.gotoY))));
  }
}
export { EnemyAi };
