import { ALLY_COSTS, ALLY_LIMITS } from '../scoring.js';
import {
  HERO_LAUGH_SOUNDS,
  HERO_NAMES,
  HERO_PALETTES,
  HERO_RACES,
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
  SELECT_LEVEL_SLOT,
  SELECT_MESSAGE_FRAMES,
} from './data.js';
function newSelectPlayer(s, e = {}) {
  return {
    didJoin: s === 0,
    character: s,
    color: 0,
    score: 0,
    align: 1,
    coins: 0,
    controller: s,
    win: 0,
    loss: 0,
    selectList: Array.from(
      {
        length: SELECT_ENTRIES.length,
      },
      () => 0,
    ),
    ...e,
  };
}
function copyScreenRef(s) {
  return {
    ...s,
  };
}
function copyOrNull(s) {
  return s
    ? {
        ...s,
      }
    : null;
}
function copySelectState(s) {
  return {
    ...s,
    saveMaxChapters: [...s.saveMaxChapters],
    selectLocks: [...s.selectLocks],
    nextScreen: copyScreenRef(s.nextScreen),
    players: s.players.map((e) => ({
      ...e,
      selectList: [...e.selectList],
      messages: e.messages.map((t) => ({
        ...t,
      })),
    })),
    panels: s.panels.map((e) => ({
      ...e,
      current: copyOrNull(e.current),
      queue: e.queue.map((t) => ({
        ...t,
      })),
    })),
  };
}
function normalizeSelectList(s) {
  return Array.from(
    {
      length: SELECT_ENTRIES.length,
    },
    (e, t) => Math.max(0, Math.trunc(s[t] ?? 0)),
  );
}
function selectTitle(s, e, t) {
  if (s === 'practice') return 'PRACTICE MODE';
  if (s === 'tutorial') return 'START TUTORIAL';
  if (s === 'versus') return `PLAYER VERSUS${t > 1 ? ` ROUND ${t}` : ''}`;
  const i = s === 'arena' ? 'ARENA' : 'ARCADE';
  return e
    ? `${i} REPLAY ${t}`
    : t > 1
      ? `${i} ${s === 'arena' ? 'STAGE' : 'CHAPTER'} ${t}`
      : `${i} MODE`;
}
function selectAvailability(s, e, t, i) {
  const r = SELECT_ENTRIES.map((o) => o.index >= SELECT_COLUMNS);
  let n = 0,
    a = SELECT_COLUMNS;
  if (s === 'versus') ((n = 5), (a = SELECT_COLUMNS * (t + 2)));
  else if (s === 'arena') {
    n = 3;
    let o = 1;
    (e && (i > 70 ? (o = 4) : i > 40 ? (o = 3) : i > 20 && (o = 2)),
      (a = SELECT_COLUMNS * (o + 1)));
  }
  for (let o = SELECT_COLUMNS; o < Math.min(a, r.length); o += 1) r[o] = !1;
  return {
    locks: r,
    maxAllies: n,
  };
}
function startPanelStep(s, e, t) {
  return e.kind === 'position'
    ? ((s.x = e.x),
      {
        ...e,
      })
    : e.kind === 'delay'
      ? {
          ...e,
          frame: 0,
        }
      : e.kind === 'command'
        ? {
            ...e,
          }
        : (e.audio &&
            t.push({
              type: 'audio',
              id: e.audio,
            }),
          {
            ...e,
            startX: s.x,
            time: 1,
            onTarget: !1,
          });
}
function queuePanelSteps(s, e, t) {
  for (const i of e)
    s.current === null
      ? (s.current = startPanelStep(s, i, t))
      : s.queue.push({
          ...i,
        });
}
function easeStep(s, e, t, i, r) {
  const n = t / i;
  return r === 'out' ? s + (e - s) * n * n : e - (e - s) * (1 - n) * (1 - n);
}
function stepPanel(s, e, t) {
  let i = 0;
  for (; s.current && i < 12;) {
    i += 1;
    const r = s.current;
    let n = !1;
    if (r.kind === 'position') n = !0;
    else if (r.kind === 'delay') {
      if (((r.frame += 1), (n = r.frame > r.frames), !n)) return;
    } else if (r.kind === 'command') {
      const a = e[s.playerIndex];
      (a &&
        ((a.mode = r.command === 'mode-loadout' ? 1 : 0),
        (a.cursorX = 0),
        (a.cursorY = r.command === 'mode-loadout' ? 5 : a.character)),
        (n = !0));
    } else if (r.onTarget) n = !0;
    else if (r.time >= r.steps) {
      ((s.x = r.targetX), (r.onTarget = !0));
      return;
    } else {
      ((s.x = easeStep(r.startX, r.targetX, r.time, r.steps, r.ease)), (r.time += 1));
      return;
    }
    if (n) {
      const a = s.queue.shift();
      s.current = a ? startPanelStep(s, a, t) : null;
    }
  }
}
function newSelectState(s) {
  const e = s.fullEdition ? s.saveMaxChapters.filter((o) => o === 99999).length : 0,
    t = selectAvailability(s.mode, s.fullEdition, e, s.gameMaxChapter),
    i = Array.from(
      {
        length: PLAYER_SLOTS,
      },
      (o, l) => {
        const c =
          s.players[l] ??
          newSelectPlayer(l, {
            didJoin: !1,
          });
        let h = normalizeSelectList(c.selectList),
          u = Math.trunc(c.coins),
          d = Math.trunc(c.align);
        s.mode === 'practice' || s.mode === 'tutorial'
          ? ((d = l + 1), (u = 150 * e), (h = h.map(() => 0)))
          : s.mode === 'versus'
            ? (d = l + 1)
            : s.mode === 'arena' && (d = 1);
        let f = 0,
          m = u;
        h.forEach((g, v) => {
          (v >= SELECT_COLUMNS && (f += g), (m += ALLY_COSTS[v] * g));
        });
        const p = Math.trunc(c.character);
        return {
          ...c,
          index: l,
          character: p,
          color: Math.trunc(c.color),
          score: Math.trunc(c.score),
          align: d,
          coins: u,
          controller: Math.trunc(c.controller),
          win: Math.trunc(c.win),
          loss: Math.trunc(c.loss),
          selectList: h,
          mode: 0,
          cursorX: 0,
          cursorY: p < 0 ? l : p,
          allyCount: f,
          selectDone: !1,
          totalCoins: m,
          messages: [
            {
              text: '',
              delay: 0,
            },
            {
              text: '',
              delay: 0,
            },
            {
              text: '',
              delay: 0,
            },
          ],
        };
      },
    ),
    r = s.mode === 'arcade' ? Math.trunc(s.carriedMaxAllies ?? 0) : t.maxAllies,
    n = SELECT_LAYOUT.panels.map((o, l) => ({
      playerIndex: l,
      x: o.startX,
      y: o.y,
      current: {
        kind: 'position',
        x: o.startX,
      },
      queue: [
        {
          kind: 'move',
          targetX: o.targetX,
          steps: SELECT_ENTRANCE_STEPS,
          ease: 'in',
        },
      ],
    }));
  return {
    state: {
      frame: 0,
      anim: 0,
      hueIn: SELECT_HUE_START,
      mode: s.mode,
      replay: s.replay,
      chapter: Math.trunc(s.chapter),
      gameMaxChapter: Math.trunc(s.gameMaxChapter),
      fullEdition: s.fullEdition,
      saveMaxChapters: [...s.saveMaxChapters],
      wins: e,
      title: selectTitle(s.mode, s.replay, Math.trunc(s.chapter)),
      selectLocks: t.locks,
      maxAllies: r,
      hints: s.hints ?? !0,
      controllerCount: Math.max(
        0,
        Math.min(MAX_CONTROLLERS, Math.trunc(s.controllerCount ?? MAX_CONTROLLERS)),
      ),
      players: i,
      panels: n,
      nextScreen: copyScreenRef(s.nextScreen),
      loadTitle: s.loadTitle ?? null,
      loadSubtitle: s.loadSubtitle ?? null,
      completed: !1,
    },
    effects: [
      {
        type: 'set-music',
        id: '100a',
      },
      {
        type: 'play-music',
      },
      {
        type: 'audio',
        id: 'movestone',
      },
    ],
  };
}
function stepPlayerMessages(s) {
  if (s.mode === 1) for (const e of [0, 1]) s.messages[e].delay > 0 && (s.messages[e].delay -= 1);
  else s.didJoin && s.cursorY === 2 && s.messages[2].delay > 0 && (s.messages[2].delay -= 1);
}
function resetSelectPlayer(s) {
  ((s.score = 0),
    (s.win = 0),
    (s.loss = 0),
    (s.didJoin = !1),
    (s.allyCount = 0),
    (s.selectDone = !1),
    s.selectList.fill(0));
}
function setSelectMessage(s, e, t) {
  s.messages[e] = {
    text: t,
    delay: SELECT_MESSAGE_FRAMES,
  };
}
function openSelectPanel(s, e, t) {
  const i = s.panels[e],
    r = s.players[e],
    n = SELECT_LAYOUT.panels[e];
  if (!i || !r || !n) return;
  const a = HERO_LAUGH_SOUNDS[r.character] ?? HERO_LAUGH_SOUNDS[0];
  queuePanelSteps(
    i,
    [
      {
        kind: 'delay',
        frames: PANEL_ENTER_STEPS,
      },
      {
        kind: 'move',
        targetX: n.outX,
        steps: PANEL_MOVE_STEPS,
        ease: 'out',
        audio: a,
      },
      {
        kind: 'command',
        command: 'mode-loadout',
      },
      {
        kind: 'move',
        targetX: n.targetX,
        steps: PANEL_MOVE_STEPS,
        ease: 'in',
        audio: 'movestone',
      },
    ],
    t,
  );
}
function stepSelectButtons(s, e, t, i, r) {
  if (e.selectDone) {
    t.button === 3 &&
      (r.push({
        type: 'audio',
        id: 'blip',
      }),
      (e.selectDone = !1));
    return;
  }
  ((e.messages[0].delay = 0), (e.messages[1].delay = 0));
  const n = Math.sign(t.x ?? 0),
    a = Math.sign(t.y ?? 0);
  if (n > 0 && e.cursorY <= 4) {
    ((e.cursorX = (e.cursorX + 1) % SELECT_COLUMNS),
      r.push({
        type: 'audio',
        id: 'click',
      }));
    return;
  }
  if (n < 0 && e.cursorY <= 4) {
    ((e.cursorX = (e.cursorX + SELECT_COLUMNS - 1) % SELECT_COLUMNS),
      r.push({
        type: 'audio',
        id: 'click',
      }));
    return;
  }
  if (a > 0) {
    ((e.cursorY = (e.cursorY + 1) % 6),
      r.push({
        type: 'audio',
        id: 'click',
      }));
    return;
  }
  if (a < 0) {
    ((e.cursorY = (e.cursorY + 5) % 6),
      r.push({
        type: 'audio',
        id: 'click',
      }));
    return;
  }
  if (t.button === void 0) return;
  if (e.cursorY > 4) {
    ((e.selectDone = !0),
      r.push({
        type: 'audio',
        id: 'gling',
      }),
      i < 2 &&
        s.mode === 'versus' &&
        r.push({
          type: 'screen-call',
          screen: {
            kind: 'popup',
            title: 'Player Versus',
            message: 'Waiting for the other player!',
            duration: 60,
            icon: 'shield',
          },
        }));
    return;
  }
  const o = e.cursorX + e.cursorY * SELECT_COLUMNS,
    l = e.cursorY === 0 ? 0 : 1,
    c = l === 0 ? 'Bonus' : 'Ally';
  if (t.button <= 2) {
    if (s.selectLocks[o]) setSelectMessage(e, l, `${c} Not Unavailable!`);
    else if (e.coins - ALLY_COSTS[o] < 0) setSelectMessage(e, l, 'Not Enough Coins!');
    else if (e.cursorY > 0 && e.allyCount + 1 > s.maxAllies)
      setSelectMessage(e, l, `${c} Count Exceeded!`);
    else if (e.selectList[o] >= ALLY_LIMITS[o]) setSelectMessage(e, l, `${c} Limit Exceeded!`);
    else {
      (e.cursorY > 0 && (e.allyCount += 1),
        (e.selectList[o] = e.selectList[o] + 1),
        (e.coins -= ALLY_COSTS[o]),
        r.push({
          type: 'audio',
          id: 'gling',
        }));
      return;
    }
    r.push({
      type: 'audio',
      id: 'error',
    });
    return;
  }
  e.selectList[o] <= 0
    ? (setSelectMessage(e, l, 'Nothing to Sell!'),
      r.push({
        type: 'audio',
        id: 'error',
      }))
    : (e.cursorY > 0 && (e.allyCount -= 1),
      (e.selectList[o] = e.selectList[o] - 1),
      (e.coins += ALLY_COSTS[o]),
      r.push({
        type: 'audio',
        id: 'blip',
      }));
}
function stepSelectCursor(s, e, t, i, r) {
  const n = Math.sign(t.y ?? 0);
  if (n > 0) {
    ((e.cursorY = (e.cursorY + 1) % HERO_NAMES.length),
      (e.messages[2].delay = 0),
      r.push({
        type: 'audio',
        id: 'click',
      }));
    return;
  }
  if (n < 0) {
    ((e.cursorY = (e.cursorY + HERO_NAMES.length - 1) % HERO_NAMES.length),
      (e.messages[2].delay = 0),
      r.push({
        type: 'audio',
        id: 'click',
      }));
    return;
  }
  if (t.button !== void 0) {
    if (t.button === 3 && i === 2) {
      (r.push({
        type: 'audio',
        id: 'blip',
      }),
        (e.didJoin = !1));
      return;
    }
    if (e.cursorY === 2 && s.saveMaxChapters[0] !== 99999) {
      (setSelectMessage(e, 2, 'Locked!'),
        r.push({
          type: 'audio',
          id: 'error',
        }));
      return;
    }
    (r.push({
      type: 'audio',
      id: 'gling',
    }),
      (e.character = e.cursorY),
      (e.color = t.button),
      (e.cursorX = -1),
      openSelectPanel(s, e.index, r));
  }
}
function selectModeLabel(s) {
  const e =
    s === 'versus'
      ? 'Versus'
      : s === 'arena'
        ? 'Arena'
        : s === 'practice'
          ? 'Practice'
          : s === 'tutorial'
            ? 'Tutorial'
            : null;
  return e
    ? {
        kind: 'question',
        title: `Quit ${e}`,
        question: 'Are you sure?',
        yes: 'Yes',
        no: 'No',
        yesCommand: 'Quit Yes',
        noCommand: null,
      }
    : null;
}
function stepSelect(s, e = {}) {
  const t = copySelectState(s),
    i = [];
  if (
    (t.players.forEach(stepPlayerMessages),
    t.panels.forEach((h) => stepPanel(h, t.players, i)),
    (t.anim += 1),
    t.hueIn < 0 && (t.hueIn = Math.min(0, t.hueIn + SELECT_HUE_STEP)),
    (t.frame += 1),
    e.key === 'escape')
  ) {
    const h = selectModeLabel(t.mode);
    return (
      h &&
        i.push({
          type: 'screen-call',
          screen: h,
        }),
      i.push({
        type: 'clear-key',
      }),
      {
        state: t,
        effects: i,
      }
    );
  }
  e.key === 'f1' &&
    ((t.hints = !t.hints),
    i.push({
      type: 'clear-key',
    }));
  let r = e.controls ?? [];
  e.appletMouse &&
    e.key !== 'f1' &&
    ((r = []),
    i.push(
      {
        type: 'clear-inputs',
      },
      {
        type: 'audio',
        id: 'blip',
      },
      {
        type: 'screen-call',
        screen: {
          kind: 'help-menu',
          title: 'Game Controls',
          body: "This game uses NO mouse.|You can use either your|keyboard or two joysticks.|You can change controls|with the 'Configuration'|section of the main menu.",
          button: 'Continue',
        },
      },
    ));
  const n = t.players.filter((h) => h.didJoin).length,
    a = t.players.filter((h) => h.selectDone).length,
    o = new Map();
  for (const h of r) o.has(h.controller) || o.set(h.controller, h);
  const l = (h) => {
    const u = o.get(h);
    return (o.delete(h), u);
  };
  for (const h of t.players) {
    if (!h.didJoin) {
      for (let d = 0; d < t.controllerCount; d += 1) {
        if (t.players.some((p) => p.didJoin && p.controller === d)) continue;
        l(d)?.button !== void 0 &&
          (resetSelectPlayer(h),
          (h.didJoin = !0),
          (h.controller = d),
          i.push({
            type: 'audio',
            id: 'gling',
          }));
      }
      continue;
    }
    const u = l(h.controller);
    h.cursorX < 0 ||
      !u ||
      (h.mode === 1 ? stepSelectButtons(t, h, u, n, i) : stepSelectCursor(t, h, u, n, i));
  }
  const c = t.mode === 'versus' ? a === 2 : a === n && n > 0;
  if (!t.completed && c) {
    const h = t.players[0],
      u = t.players[1];
    (h &&
      u?.didJoin &&
      h.character === u.character &&
      h.color === u.color &&
      ((u.color += 1), u.color > HERO_PALETTES[u.character].length && (u.color = 0)),
      (t.completed = !0),
      i.push({
        type: 'stop-music',
      }),
      t.loadTitle !== null
        ? i.push({
            type: 'screen-fade-load',
            screen: copyScreenRef(t.nextScreen),
            delay: 0,
            title: t.loadTitle,
            subtitle: t.loadSubtitle,
            resources: null,
          })
        : i.push({
            type: 'screen-fade',
            screen: copyScreenRef(t.nextScreen),
          }));
  }
  return {
    state: t,
    effects: i,
  };
}
function selectEntrance(s) {
  const e = Math.max(0, Math.trunc(s)),
    i = 1 - Math.min(SELECT_ENTRANCE_STEPS, e) / SELECT_ENTRANCE_STEPS;
  return {
    frame: e,
    titleY:
      SELECT_LAYOUT.title.targetY -
      (SELECT_LAYOUT.title.targetY - SELECT_LAYOUT.title.startY) * i * i,
    hue: Math.min(0, SELECT_HUE_START + e * SELECT_HUE_STEP),
    cursorFrame: Math.floor(e / SELECT_BLINK_FRAMES) & 1,
  };
}
function selectEntryLabel(s, e = 0) {
  const t = SELECT_ENTRIES[s];
  return t
    ? t.kind === 'bonus'
      ? `${t.name ?? t.race}${t.name ? ` ${t.race}` : ''}`
      : t.name === null
        ? `${e > 0 ? `L${e} ` : ''}${t.race}`
        : `${t.name}${e > 0 ? ` L${e}` : ''} ${t.race}`
    : '';
}
function selectMessage(s, e, t) {
  const i = s.players[e];
  if (!i) return '';
  const r = t === 'bonus' ? 0 : 1,
    n = i.messages[r];
  if (n.delay > 0) return n.text;
  if (t === 'bonus')
    return i.cursorY !== 0
      ? 'Nothing Selected'
      : `${selectEntryLabel(i.cursorX)} = ${ALLY_COSTS[i.cursorX]} Coins`;
  const a = i.cursorX + i.cursorY * SELECT_COLUMNS;
  return a < 7 || a >= SELECT_ENTRIES.length
    ? 'Nothing Selected'
    : s.selectLocks[a]
      ? 'Hidden Character'
      : `${selectEntryLabel(a, i.selectList[SELECT_LEVEL_SLOT] ?? 0)} = ${ALLY_COSTS[a]} Coins`;
}
function selectControllerLines(s, e) {
  const t = s.players[e];
  if (!t) return [];
  if (!t.didJoin) return ['Press Any Button', 'Using Any Controller'];
  const i = t.selectList[SELECT_LEVEL_SLOT] ?? 0,
    r = `${HERO_NAMES[t.character]} ${i > 0 ? `L${i} ` : ''}${HERO_RACES[t.character]}`;
  let n = `Coins: ${t.coins}/${t.totalCoins}`;
  s.mode !== 'practice' && !s.replay && (n += `, Score: ${t.score}`);
  let a = `Allies: ${t.allyCount}/${s.maxAllies}`;
  return (s.mode === 'versus' && (a += `, Wins: ${t.win}, Loss: ${t.loss}`), [r, n, a]);
}
function selectIconState(s, e, t) {
  const i = s.players[e];
  if (!i || !SELECT_ENTRIES[t]) return 'off';
  const r = (i.selectList[t] ?? 0) > 0,
    n = i.cursorY === Math.floor(t / SELECT_COLUMNS) && i.cursorX === t % SELECT_COLUMNS;
  return (!s.selectLocks[t] && i.coins - ALLY_COSTS[t] >= 0) || r
    ? n || r
      ? 'full'
      : 'faded'
    : n || r
      ? 'off'
      : 'faded-off';
}
export {
  newSelectPlayer,
  newSelectState,
  selectControllerLines,
  selectEntrance,
  selectIconState,
  selectMessage,
  stepSelect,
};
