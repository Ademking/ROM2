const SCORE_PER_HIT = 10;
const KILL_BONUS = 10;
const ALLY_REFUND_COINS = 10;
const PERFECT_HEALTH_BONUS = 100;
const ALLY_BONUS_COINS = 10;
const SELECT_SLOT = {
  super: 0,
  rage: 1,
  refract: 2,
  absorb: 3,
  fairy: 4,
  life: 5,
  level: 6,
  coin: 35,
};
const BONUS_COST = {
  rage: 20,
  refract: 25,
  absorb: 30,
};
const ALLY_COSTS = [
  10, 15, 25, 30, 75, 300, 500, 10, 15, 20, 25, 30, 35, 50, 15, 20, 25, 30, 35, 50, 60, 20, 25, 50,
  60, 75, 100, 150, 200, 250, 275, 300, 350, 450, 500,
];
const ALLY_LIMITS = [
  3, 3, 3, 3, 3, 3, 9, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5,
];
const RESULT_HERO_NAMES = ['Azrael', 'Wren', 'Lucette'];
const RESULT_HERO_RACES = ['Drow Fighter', 'Human Paladin', 'Halfling Fighter'];
const RESULT_SCREEN = {
  rate: 30,
  frozenSceneFade: 0.75,
  entranceSteps: 10,
  startAudio: 'movestone',
  moveAudio: 'click',
  acceptAudio: 'gling',
  forms: {
    atlas: 'ui.guiform',
    arenaPanelFrame: 17,
    arcadePanelFrame: 25,
  },
  icons: {
    shield: 0,
    sword: 1,
    verticalTop: 8,
    verticalMiddle: 9,
    verticalBottom: 10,
    winner: 14,
    loser: 15,
  },
  fonts: {
    bigGold: 3,
  },
};
const RESULT_LAYOUT = {
  nativeHeight: 384,
  arcade: {
    panel: {
      x: 106,
      y: 86,
    },
    titleY: 100,
    buttonY: 248,
    buttonCursorXs: [122, 274],
    buttonTextXs: [156, 308],
    playerCenterX: 256,
    playerY: 142,
    verticalBars: [
      {
        x: 138,
        y: 142,
        middleCount: 1,
      },
      {
        x: 342,
        y: 142,
        middleCount: 1,
      },
    ],
  },
  arena: {
    panel: {
      x: 62,
      y: 76,
      width: 389,
    },
    titleY: 90,
    buttonY: 258,
    buttonCursorXs: [72, 200, 328],
    buttonTextXs: [106, 234, 362],
    playerXs: [78, 272],
    playerY: 131,
    verticalBar: {
      x: 240,
      y: 128,
      middleCount: 2,
    },
    playerOneOutcomeIconTitleOffset: -34,
    playerTwoOutcomeIconTitleOffset: 4,
  },
};
function resultPanelY(s, e = RESULT_LAYOUT.nativeHeight, t = RESULT_SCREEN.entranceSteps) {
  const i = Math.max(0, Math.trunc(s)),
    r = Math.max(1, Math.trunc(t)),
    n = Math.min(r, Math.max(0, i - 1)),
    a = -e + e * ((n * n) / (r * r));
  return {
    frame: i,
    panelY: a,
    pixelY: Math.trunc(a),
    inputReady: i >= r + 1,
    clearsInputs: i === r + 1,
  };
}
function resultBlink(s) {
  return Math.floor(Math.max(0, s) / 10) & 1;
}
function copyItem(s) {
  return {
    ...s,
  };
}
function copyActorSnapshot(s) {
  return s
    ? {
        ...s,
        items: s.items.map(copyItem),
      }
    : null;
}
function copyPlayerState(s) {
  return {
    ...s,
    selectList: [...s.selectList],
    actor: copyActorSnapshot(s.actor),
    createdAllies: s.createdAllies.map((e) => ({
      ...e,
      items: e.items.map(copyItem),
    })),
  };
}
function selectValue(s, e) {
  return s.selectList[e] ?? 0;
}
function setSelectValue(s, e, t) {
  for (; s.selectList.length <= e;) s.selectList.push(0);
  s.selectList[e] = Math.trunc(t);
}
function addTo(s, e, t) {
  s[e] = (s[e] ?? 0) + t;
}
function isPlayerAlive(s) {
  return s.didJoin && s.actor !== null && s.actor.hp > 0;
}
function nextArcadeStage(s) {
  const e = s.players.map(copyPlayerState),
    t = {
      mode: 'arcade',
      currentStage: s.gameChapter,
      gameChapter: s.gameChapter,
      gameMaxChapter: s.gameMaxChapter,
      gameReplay: s.gameReplay,
      gameHiscore: s.gameHiscore ?? 0,
      players: e,
      chapterScripts: s.chapterScripts ?? {},
      chapterAdd: 0,
      diffScore: 0,
    },
    i = e[0];
  if (!i?.actor)
    return {
      ...t,
      outcome: 'unresolved',
      winType: 0,
      outcomeAudio: null,
    };
  if (i.actor.hp <= 0 || s.gameStatus !== 1)
    return {
      ...t,
      outcome: 'loss',
      winType: -1,
      outcomeAudio: '009',
    };
  const r = s.gameReplay ? 0 : 1,
    n = {
      ...t,
      chapterAdd: r,
      outcome: 'win',
      winType: 1,
      outcomeAudio: '005',
    };
  if (!isPlayerAlive(i)) return n;
  i.score = i.actor.score;
  let a = i.actor.kills * KILL_BONUS;
  (i.actor.statTime >= 0 && (a += i.actor.statTime * SCORE_PER_HIT),
    i.actor.hp === i.actor.totalHp && (a += PERFECT_HEALTH_BONUS),
    (i.score += a));
  let o = s.gameChapter,
    l = s.gameMaxChapter;
  return (
    s.gameReplay || ((o += r), l !== 99999 && (l = o)),
    {
      ...n,
      diffScore: a,
      gameChapter: o,
      gameMaxChapter: l,
    }
  );
}
function buildStageResult(s) {
  const e = s.players.map(copyPlayerState),
    t = e.filter((d) => d.didJoin).length,
    i = e.filter(isPlayerAlive).length,
    r = e.map(() => 0),
    n = e.map(() => 0),
    a = e.map(() => 0),
    o = {
      mode: 'arena',
      currentStage: s.gameChapter,
      gameChapter: s.gameChapter,
      gameMaxChapter: s.gameMaxChapter,
      gameReplay: s.gameReplay,
      gameHiscore: s.gameHiscore ?? 0,
      players: e,
      chapterScripts: s.chapterScripts ?? {},
      chapterAdd: 0,
      aliveCount: i,
      joinedCount: t,
      diffScores: r,
      diffCoins: n,
      diffAllies: a,
      nextWin: !1,
      nextScriptId: null,
    };
  if (i === 0 || t === 0)
    return {
      ...o,
      outcome: 'loss',
      winType: -1,
      outcomeAudio: '009',
    };
  for (let d = 0; d < e.length; d++) {
    const f = e[d],
      m = isPlayerAlive(f);
    if (
      (m && setSelectValue(f, SELECT_SLOT.level, f.actor.level),
      s.gameChapter % 10 === 0 &&
        (selectValue(f, SELECT_SLOT.level) < ALLY_LIMITS[SELECT_SLOT.level]
          ? setSelectValue(f, SELECT_SLOT.level, selectValue(f, SELECT_SLOT.level) + 1)
          : selectValue(f, SELECT_SLOT.life) < ALLY_LIMITS[SELECT_SLOT.life] &&
            (setSelectValue(f, SELECT_SLOT.life, selectValue(f, SELECT_SLOT.life) + 1),
            addTo(n, d, ALLY_COSTS[SELECT_SLOT.level] - ALLY_COSTS[SELECT_SLOT.life]))),
      !m)
    )
      continue;
    const p = f.actor;
    ((r[d] = p.score),
      addTo(r, d, p.kills * KILL_BONUS),
      addTo(r, d, p.statTime * Math.trunc(SCORE_PER_HIT / i)),
      p.hp === p.totalHp && (addTo(r, d, PERFECT_HEALTH_BONUS), addTo(n, d, ALLY_BONUS_COINS)));
    for (const g of f.createdAllies)
      g.hp <= 0
        ? (addTo(a, d, 1),
          f.allyCount--,
          setSelectValue(f, g.allyType, selectValue(f, g.allyType) - 1))
        : (p.items.push(...g.items.map(copyItem)), (g.items.length = 0));
    ((f.createdAllies.length = 0),
      setSelectValue(f, SELECT_SLOT.super, Math.min(selectValue(f, SELECT_SLOT.super), p.spl)),
      setSelectValue(
        f,
        SELECT_SLOT.rage,
        Math.min(selectValue(f, SELECT_SLOT.rage), Math.trunc(p.bonusRage / BONUS_COST.rage)),
      ),
      setSelectValue(
        f,
        SELECT_SLOT.refract,
        Math.min(
          selectValue(f, SELECT_SLOT.refract),
          Math.trunc(p.bonusRefract / BONUS_COST.refract),
        ),
      ),
      setSelectValue(
        f,
        SELECT_SLOT.absorb,
        Math.min(selectValue(f, SELECT_SLOT.absorb), Math.trunc(p.bonusAbsorb / BONUS_COST.absorb)),
      ),
      setSelectValue(f, SELECT_SLOT.life, p.bonusLife),
      setSelectValue(
        f,
        SELECT_SLOT.fairy,
        Math.min(selectValue(f, SELECT_SLOT.fairy), p.circleCount),
      ),
      (p.circleCount = 0));
    for (const g of p.items) {
      const v = g.selectId;
      v === SELECT_SLOT.coin
        ? addTo(n, d, ALLY_REFUND_COINS)
        : selectValue(f, v) + 1 > ALLY_LIMITS[v]
          ? addTo(n, d, ALLY_COSTS[v])
          : setSelectValue(f, v, selectValue(f, v) + 1);
    }
    ((p.items.length = 0), (f.score += r[d] ?? 0), (f.coins += n[d] ?? 0));
  }
  const l = s.gameReplay ? 0 : 1;
  let c = s.gameChapter,
    h = s.gameMaxChapter;
  s.gameReplay || ((c += l), h !== 99999 && (h = c));
  const u = s.chapterScripts?.[c] ?? null;
  return {
    ...o,
    outcome: 'win',
    winType: 1,
    outcomeAudio: '005',
    chapterAdd: l,
    gameChapter: c,
    gameMaxChapter: h,
    nextScriptId: u,
    nextWin: u === 99999,
  };
}
function playerTitle(s) {
  const e = RESULT_HERO_NAMES[s.character] ?? `Player ${s.character + 1}`,
    t = RESULT_HERO_RACES[s.character] ?? '',
    i = selectValue(s, SELECT_SLOT.level);
  return `${e}${i > 0 ? ` L${i}` : ''}${t ? ` ${t}` : ''}`;
}
function killBonusText(s, e) {
  return `Kill Bonus: ${e && s > 0 ? `${s * KILL_BONUS} (${s} kills)` : '0'}`;
}
function timeBonusText(s, e, t) {
  return `Time Bonus: ${t && s > 0 ? `${s * e} (${s} secs)` : '0'}`;
}
function buildResultReport(s) {
  if (s.mode === 'arcade') {
    const i = s.players[0],
      r = i?.actor,
      n =
        !i || !r
          ? null
          : {
              heading: 'PLAYER 1',
              joined: i.didJoin,
              identity: playerTitle(i),
              status:
                s.winType === 1
                  ? r.hp < r.totalHp
                    ? 'Mission Success!'
                    : 'Perfect Mission!'
                  : 'Mission Failed!',
              statusFont: s.winType === 1 ? 1 : 5,
              killBonus: killBonusText(r.kills, s.winType === 1),
              timeBonus: timeBonusText(r.statTime, SCORE_PER_HIT, s.winType === 1),
              score: s.gameReplay
                ? `Score: ${s.diffScore}`
                : `Score: ${i.score}${s.diffScore > 0 ? ` (+${s.diffScore})` : ''}`,
            };
    return {
      title: `ARCADE ${s.gameReplay ? 'REPLAY' : 'CHAPTER'} ${s.currentStage}`,
      buttons: [s.winType !== 1 || s.gameReplay ? 'Retry' : 'Next', 'Quit'],
      players: [n],
      outcomeIcons: [null],
    };
  }
  const e = Math.trunc(SCORE_PER_HIT / Math.max(1, s.aliveCount)),
    t = s.players.map((i, r) => {
      if (!i.didJoin)
        return {
          heading: `PLAYER ${r + 1}`,
          joined: !1,
          joinPrompt: s.nextWin
            ? 'No Joining Here ...'
            : s.winType !== 1 || s.gameReplay
              ? 'Click Menu to Join!'
              : 'Visit Shop to Join!',
        };
      const n = isPlayerAlive(i),
        a = i.actor,
        o = n
          ? s.gameChapter % 10 === 0
            ? 'Level Added!'
            : a.hp < a.totalHp
              ? 'Still Alive!'
              : 'Perfect Battle!'
          : 'Died in Battle!';
      return {
        heading: `PLAYER ${r + 1}`,
        joined: !0,
        identity: playerTitle(i),
        status: o,
        statusFont: n ? 1 : 5,
        killBonus: killBonusText(a?.kills ?? 0, n),
        timeBonus: timeBonusText(a?.statTime ?? 0, e, n),
        coins: `Coins: ${i.coins}${s.diffCoins[r] > 0 ? ` (+${s.diffCoins[r]})` : ''}`,
        allies: `Allies: ${i.allyCount}${s.diffAllies[r] > 0 ? ` (${s.diffAllies[r]} died)` : ''}`,
        score: s.gameReplay
          ? `Score: ${s.diffScores[r]}`
          : `Score: ${i.score}${s.diffScores[r] > 0 ? ` (+${s.diffScores[r]})` : ''}`,
      };
    });
  return {
    title: `ARENA ${s.gameReplay ? 'REPLAY' : 'STAGE'} ${s.currentStage}`,
    buttons: [
      s.winType !== 1 || s.gameReplay ? 'Retry' : 'Next',
      s.winType !== 1 || s.gameReplay ? 'Menu' : 'Shop',
      'Quit',
    ],
    players: t,
    outcomeIcons: s.players.map((i) =>
      i.didJoin && i.actor ? (i.actor.hp > 0 ? 'winner' : 'loser') : null,
    ),
  };
}
function moveResultChoice(s, e, t) {
  const i = s === 'arcade' ? 2 : 3;
  return t === 0
    ? Math.max(0, Math.min(i - 1, Math.trunc(e)))
    : (Math.trunc(e) + (t > 0 ? 1 : -1) + i) % i;
}
function saveQuestion(s, e) {
  const t = s === 'arcade' ? 'Arcade' : 'Arena';
  return e
    ? {
        kind: 'question',
        title: `Save ${t}`,
        question: `Save ${s === 'arcade' ? 'chapter' : 'stage'} before quitting?`,
        yes: 'Yes',
        no: 'No',
        yesCommand: `Save ${t} Yes`,
        noCommand: `Quit ${t} Yes`,
      }
    : {
        kind: 'question',
        title: `Quit ${t}`,
        question: 'Are you sure?',
        yes: 'Yes',
        no: 'No',
        yesCommand: `Quit ${t} Yes`,
        noCommand: null,
      };
}
function saveQuestionEffects(s) {
  return [
    {
      type: 'screen-call',
      screen: saveQuestion(s, !1),
    },
  ];
}
function resultChoiceEffects(s, e, t = {}) {
  if (s.mode === 'arcade') {
    if (e === 0) {
      const i =
        s.chapterAdd === 1
          ? {
              kind: 'chapter',
              mode: 'arcade',
              image: 'sc-cliff-1a',
              index: s.gameChapter - 1,
            }
          : {
              kind: 'play',
              mode: 'arcade',
              scriptId: s.chapterScripts[s.gameChapter] ?? null,
            };
      return [
        {
          type: 'save',
          mode: 'arcade',
        },
        {
          type: 'screen-fade',
          screen: i,
        },
      ];
    }
    return [
      {
        type: 'screen-call',
        screen: saveQuestion('arcade', s.chapterAdd > 0 && !s.gameReplay),
      },
    ];
  }
  if (e === 0) {
    const i = [
      {
        type: 'save',
        mode: 'arena',
      },
    ];
    if (s.nextWin) {
      let n;
      return (
        !s.gameReplay && s.gameHiscore === 0
          ? (i.push({
              type: 'set-globals',
              gameHiscore: 1,
              gameMaxChapter: 99999,
            }),
            i.push({
              type: 'save',
              mode: 'arena',
            }),
            (n =
              (s.players[0]?.score ?? 0) + (s.players[1]?.score ?? 0) >
              (t.localLowest ?? Number.POSITIVE_INFINITY)
                ? {
                    kind: 'submit',
                  }
                : null))
          : (n = {
              kind: 'hue',
              steps: 10,
              from: [0, 0, 0],
              to: [255, 255, 255],
              continuation: {
                kind: 'splash',
              },
            }),
        i.push({
          type: 'screen-fade',
          screen: {
            kind: 'novel',
            id: 'arena-win',
            continuation: n,
          },
        }),
        i
      );
    }
    const r =
      s.chapterAdd === 1
        ? {
            kind: 'chapter',
            mode: 'arena',
            image: 'sc-arena-1a',
            index: s.gameChapter - 1,
          }
        : {
            kind: 'play',
            mode: 'arena',
            scriptId: s.chapterScripts[s.gameChapter] ?? null,
          };
    return (
      i.push({
        type: 'screen-fade',
        screen: r,
      }),
      i
    );
  }
  if (e === 1) {
    const i = [
      {
        type: 'save',
        mode: 'arena',
      },
    ];
    let r;
    if (s.nextWin && !s.gameReplay)
      ((r = {
        kind: 'popup',
        title: 'You Won!',
        message: 'No shop in the last level ...',
        duration: 75,
        icon: RESULT_SCREEN.icons.shield,
      }),
        i.push({
          type: 'screen-call',
          screen: r,
        }));
    else {
      const n = {
        kind: 'chapter',
        mode: 'arena',
        image: 'sc-arena-1a',
        index: s.gameChapter - 1,
      };
      ((r = s.gameReplay
        ? n
        : {
            kind: 'select',
            continuation: n,
          }),
        i.push({
          type: 'screen-fade',
          screen: r,
        }));
    }
    return i;
  }
  return [
    {
      type: 'screen-call',
      screen: saveQuestion('arena', s.chapterAdd > 0 && !s.gameReplay),
    },
  ];
}
function quitOrSaveEffects(s, e) {
  const t = s === 'arcade' ? 'Arcade' : 'Arena';
  if (e !== `Quit ${t} Yes` && e !== `Save ${t} Yes`) return [];
  const i = [];
  return (
    e.startsWith('Save ') &&
      i.push({
        type: 'save',
        mode: s,
      }),
    i.push(
      {
        type: 'set-globals',
        introLoop: 0,
      },
      {
        type: 'stop-music',
      },
      {
        type: 'screen-fade',
        screen: {
          kind: 'main-menu',
        },
      },
    ),
    i
  );
}
export {
  ALLY_COSTS,
  ALLY_LIMITS,
  RESULT_LAYOUT,
  RESULT_SCREEN,
  SELECT_SLOT,
  buildResultReport,
  buildStageResult,
  moveResultChoice,
  nextArcadeStage,
  quitOrSaveEffects,
  resultBlink,
  resultChoiceEffects,
  resultPanelY,
  saveQuestionEffects,
};
