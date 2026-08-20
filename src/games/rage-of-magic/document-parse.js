function toNumber(s, e = 0) {
  if (s === void 0 || s === '') return e;
  const t = Number(s);
  return Number.isFinite(t) ? t : e;
}
function toNumberList(s, e = []) {
  return s
    ? s
        .split(',')
        .map((t) => toNumber(t.trim()))
        .filter(Number.isFinite)
    : e;
}
function toBoolean(s, e = !1) {
  return s === void 0 || s === '' ? e : /^(?:y|yes|true|1)$/i.test(s);
}
function documentSection(s, e, t) {
  return s[`${e}:${t}`];
}
function parseChapters(s) {
  return Object.entries(s.Chapters ?? {})
    .filter(([e]) => /^\d+$/.test(e))
    .sort(([e], [t]) => Number(e) - Number(t))
    .map(([e, t]) => {
      const [i = '', r = '0'] = t.split('|');
      return {
        number: Number(e),
        title: i.replace(/\*$/, ''),
        script: toNumber(r),
      };
    });
}
function parseBox(s) {
  const e = toNumberList(s);
  return e.length === 4
    ? {
        x1: e[0],
        y1: e[1],
        x2: e[2],
        y2: e[3],
      }
    : void 0;
}
function parseActorAction(s, e) {
  const t = documentSection(s, 'ActorAction', e);
  if (!t?.name || !t.animate_frames) return;
  const i = [
    ...toNumberList(t.on_key_0to8, Array(9).fill(-1)),
    ...toNumberList(t.on_key_2x_udlr, Array(4).fill(-1)),
    ...toNumberList(t.on_key_a_b_c_ab_abc, Array(5).fill(-1)),
  ];
  return {
    id: e,
    name: t.name,
    title: t.title ?? t.name,
    actionType: toNumber(t.action_type),
    bodyType: toNumber(t.body_type),
    friction: toNumber(t.friction_pct, 1),
    gravity: toNumber(t.gravity_add),
    vulnerability: toNumber(t.vulnerability),
    changeFace: toNumber(t.change_face),
    keyFace: toNumber(t.key_face),
    animateReset: toBoolean(t.animate_reset, !0),
    animateLoop: toNumber(t.animate_loop, 1),
    animateRepeatAt: toNumber(t.animate_repeat_at),
    animateFrames: toNumberList(t.animate_frames),
    animateIndex: toNumber(t.animate_index),
    animateSpeed: toNumber(t.animate_speed, 1),
    moveType: toNumber(t.move_type),
    moveReset: toBoolean(t.move_reset),
    move: toNumberList(t.move_xyj),
    onBlocked: toNumber(t.on_blocked, -1),
    onContact: toNumber(t.on_contact, -1),
    onDone: toNumber(t.on_done, -1),
    onStopped: toNumber(t.on_stopped, -1),
    onLand: toNumber(t.on_land, -1),
    onFailure: toNumber(t.on_failure, -1),
    onPickup: toNumber(t.on_pickup, -1),
    onKeyboard: i.some((r) => r !== -1) ? i : void 0,
    audio: t.audio_names,
    audioStop: toBoolean(t.audio_stop),
    actionStance: toNumber(t.action_stance),
    actionEffect: toNumber(t.action_effect),
    sceneEffect: toNumber(t.scene_effect),
    sceneQuakeSize: toNumber(t.scene_quake_size),
    sceneHueSteps: toNumber(t.scene_hue_steps),
    bounce: toNumber(t.bounce_pct),
    sceneCall: toNumber(t.scene_call, -1),
    typeCall: toNumber(t.type_call, -1),
    typeCallParticle: toNumber(t.type_call_particle, -1),
    aiRangeFrame: toNumber(t.ai_range_frame, -1),
    cost: toNumberList(t.cost_hms),
  };
}
function parseActorFrame(s, e) {
  const t = documentSection(s, 'ActorFrame', e) ?? {},
    i = [];
  for (let r = 1; r <= 7; r += 1) {
    if (!t[`layer${r}`]) continue;
    const [n = 0, a = 0] = toNumberList(t[`layer${r}_xy`]);
    i.push({
      frame: toNumber(t[`layer${r}`]) - 1,
      type: toNumber(t[`layer${r}_type`]),
      alpha: toNumber(t[`layer${r}_alpha`], 1),
      x: n,
      y: a,
    });
  }
  return (
    i.length === 0 &&
      i.push({
        frame: e,
        type: 0,
        alpha: 1,
        x: 0,
        y: 0,
      }),
    {
      id: e,
      name: t.name ?? '',
      layers: i,
      body: parseBox(t.box_body),
      attack: parseBox(t.box_attack),
      range: parseBox(t.box_range) ?? parseBox(t.box_attack),
      attackZ: toNumber(t.box_attack_z),
      damageType: toNumber(t.dam_type),
      damageAction: toNumber(t.dam_action),
      damageAlign: toNumber(t.dam_align),
      damage: toNumberList(t.dam_hm),
      damageVector: toNumberList(t.dam_xyj),
      selfDamage: toNumberList(t.dam_self_hm),
      selfVector: toNumberList(t.dam_self_xyj),
      damageConnector: toBoolean(t.dam_connector, !0),
      damageTypeCall: toNumber(t.dam_type_call, -1),
      audio: t.audio_names,
    }
  );
}
function parseActorType(s, e) {
  const t = documentSection(s, 'ActorType', e) ?? {};
  return {
    name: t.name ?? 'Actor',
    names: (t.names ?? '')
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean),
    race: t.type ?? '',
    total: toNumberList(t.total_hm, [0, 0]),
    totalKo: toNumber(t.total_ko),
    totalSpl: toNumber(t.total_spl),
    totalGuard: toNumber(t.total_guard),
    totalResist: toNumber(t.total_resist),
    killScore: toNumber(t.kill_score),
    blockType: toNumber(t.block_type),
    selectId: toNumber(t.select_id, -1),
    solid: toNumberList(t.solid_whj),
    start: toNumberList(t.start_xyj, [0, 0, 0]),
    onStart: toNumber(t.on_start),
    onFall: toNumber(t.on_fall, -1),
    walkThrough: toBoolean(t.is_walkthru),
    movable: toBoolean(t.is_moveable, !0),
    canFace: toBoolean(t.can_face, !0),
    passContact: toBoolean(t.pass_contact, !0),
    aiRetreat: toBoolean(t.ai_retreat),
    aiProtector: toBoolean(t.ai_protector),
    aiGoBehind: toBoolean(t.ai_gobehind, !0),
    onTaunt: toNumber(t.on_taunt, -1),
    dieBonuses: [
      toNumber(t.die_spl),
      toNumber(t.die_rage),
      toNumber(t.die_refract),
      toNumber(t.die_absorb),
      toNumber(t.die_fairy),
      toNumber(t.die_ressurect),
    ],
    actorType: toNumber(t.actor_type),
  };
}
function parseActorStance(s, e) {
  const t = documentSection(s, 'ActorStance', e) ?? {};
  return {
    onStand: toNumber(t.on_stand),
    onHit: toNumber(t.on_hit, -1),
    onKo: toNumber(t.on_ko, -1),
    onDeath: toNumber(t.on_death, -1),
  };
}
export {
  parseActorAction,
  parseActorFrame,
  parseActorStance,
  parseActorType,
  parseChapters,
  toNumber,
  toNumberList,
};
