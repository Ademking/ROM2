import { easeIn } from './menu/layout.js';
import { QUESTION_DIM, newQuestion, questionBlink, stepQuestion } from './screens/question.js';
const VERSUS_HERO_NAMES = ['Azrael', 'Wren', 'Lucette'];
const VERSUS_HERO_RACES = ['Drow Fighter', 'Human Paladin', 'Halfling Fighter'];
const ARENA_KILL_BONUS = 10;
const ARENA_TIME_BONUS = 10;
const SELECT_LEVEL_SLOT = 6;
const VERSUS_SCREEN = {
  frozenSceneFade: 0.75,
  entranceSteps: 10,
  outcomeAudio: '005',
  entranceAudio: 'movestone',
  quitQuestion: {
    title: 'Quit Versus',
    question: 'Are you sure?',
    buttons: ['Yes', 'No'],
    defaultChoice: 1,
    command: 'Quit Versus Yes',
  },
};
const VERSUS_LAYOUT = {
  panel: {
    x: 62,
    y: 76,
  },
  titleCenterX: 256,
  titleY: 90,
  outcomeIconY: 86,
  outcomeIconLeftTitleOffset: -34,
  outcomeIconRightTitleOffset: 4,
  buttons: {
    y: 258,
    labels: ['Again', 'Choose', 'Quit'],
    baseXs: [62, 190, 318],
    cursorXs: [72, 200, 328],
    textXs: [106, 234, 362],
  },
  players: {
    xs: [78, 272],
    rows: {
      player: 131,
      character: 141,
      outcome: 151,
      battleResults: 168,
      killBonus: 178,
      timeBonus: 188,
      finalReport: 205,
      wins: 215,
      loss: 225,
      score: 235,
    },
  },
  separator: {
    x: 240,
    y: 128,
    middleCount: 2,
  },
};
function copyVersusPlayer(s) {
  return {
    ...s,
    selectList: [...s.selectList],
    actor: s.actor
      ? {
          ...s.actor,
        }
      : null,
  };
}
function isVersusPlayerAlive(s) {
  return s.didJoin && s.actor !== null && s.actor.hp > 0;
}
function resolveVersusRound(s) {
  const e = [copyVersusPlayer(s.players[0]), copyVersusPlayer(s.players[1])],
    t = [0, 0];
  let i = -1;
  return (
    e.forEach((r, n) => {
      const a = r.actor;
      a &&
        ((t[n] = a.score),
        isVersusPlayerAlive(r)
          ? ((r.win += 1),
            (t[n] += a.kills * ARENA_KILL_BONUS),
            a.statTime >= 0 && (t[n] += a.statTime * ARENA_TIME_BONUS),
            (r.score += t[n]),
            (i = n))
          : ((r.loss += 1), (t[n] = 0)));
    }),
    {
      round: s.gameChapter,
      gameChapter: s.gameChapter + 1,
      winType: i,
      diffScores: t,
      players: e,
    }
  );
}
function versusTitleLayout(s, e) {
  const t = `VERSUS ROUND ${s}`,
    i = Math.trunc(e / 2);
  return {
    text: t,
    textX: VERSUS_LAYOUT.titleCenterX - i,
    textY: VERSUS_LAYOUT.titleY,
    playerOneIconX: VERSUS_LAYOUT.titleCenterX - i + VERSUS_LAYOUT.outcomeIconLeftTitleOffset,
    playerTwoIconX: VERSUS_LAYOUT.titleCenterX + i + VERSUS_LAYOUT.outcomeIconRightTitleOffset,
    iconY: VERSUS_LAYOUT.outcomeIconY,
  };
}
function versusCharacterName(s) {
  const e = Math.max(0, Math.min(VERSUS_HERO_NAMES.length - 1, Math.trunc(s.character))),
    t = s.selectList[SELECT_LEVEL_SLOT] ?? 0;
  return `${VERSUS_HERO_NAMES[e]}${t > 0 ? ` L${t}` : ''} ${VERSUS_HERO_RACES[e]}`;
}
function versusPlayerReport(s, e) {
  const t = s.players[e],
    i = t.actor,
    r = s.winType === e;
  let n,
    a = 1;
  s.winType === -1
    ? (n = 'Draw Game!')
    : r
      ? (n = i && i.hp < i.totalHp ? 'The Winner!' : 'Perfect Battle!')
      : ((n = 'The Loser ...'), (a = 5));
  const o = i?.kills ?? 0,
    l = o > 0 ? `Kill Bonus: ${o * ARENA_KILL_BONUS} (${o} kills)` : 'Kill Bonus: 0',
    c = i?.statTime ?? 0,
    h = i && r && c > 0 ? `Time Bonus: ${c * ARENA_TIME_BONUS} (${c} secs)` : 'Time Bonus: 0',
    u = s.diffScores[e],
    d = `Score: ${t.score}${u > 0 && t.score > 0 ? ` (+${u})` : ''}`;
  return {
    player: e + 1,
    x: VERSUS_LAYOUT.players.xs[e],
    rows: VERSUS_LAYOUT.players.rows,
    playerText: `PLAYER ${e + 1}`,
    characterText: versusCharacterName(t),
    outcomeText: n,
    outcomeFont: a,
    outcomeIcon: isVersusPlayerAlive(t) ? 'winner' : 'loser',
    battleResultsText: 'BATTLE RESULTS',
    killBonusText: l,
    timeBonusText: h,
    finalReportText: 'FINAL REPORT',
    winsText: `Wins: ${t.win} (+${r ? 1 : 0})`,
    lossText: `Loss: ${t.loss} (+${r ? 0 : 1})`,
    scoreText: d,
  };
}
function versusReport(s) {
  return {
    title: `VERSUS ROUND ${s.gameChapter - 1}`,
    buttons: VERSUS_LAYOUT.buttons.labels,
    players: [versusPlayerReport(s, 0), versusPlayerReport(s, 1)],
  };
}
function versusEntrance(s) {
  const e = Math.max(0, Math.trunc(s)),
    t = Math.min(VERSUS_SCREEN.entranceSteps, Math.max(0, e - 1)),
    i = easeIn(-384, 0, t, VERSUS_SCREEN.entranceSteps);
  return {
    frame: e,
    panelY: i,
    pixelY: Math.trunc(i),
    inputReady: e >= VERSUS_SCREEN.entranceSteps + 1,
    clearsInputs: e === VERSUS_SCREEN.entranceSteps + 1,
  };
}
function versusBlink(s) {
  return Math.floor(Math.max(0, s) / 10) & 1;
}
function nextVersusChoice(s, e) {
  return (s + e + 3) % 3;
}
function versusQuitQuestion() {
  return {
    kind: 'question',
    ...VERSUS_SCREEN.quitQuestion,
  };
}
function versusChoiceAction(s) {
  return s === 0
    ? {
        kind: 'replay-return',
        suspendedPlayReplayFlagMustAlreadyBeSet: !0,
      }
    : s === 1
      ? {
          kind: 'select',
          playersJoined: [!0, !0],
          dataName: 'extra',
          scriptId: 51,
          title: 'PLAYER VERSUS',
          subtitle: 'Red Versus Blue!',
        }
      : versusQuitQuestion();
}
const VERSUS_EXIT = {
  introLoop: 0,
  stopMusic: !0,
  transition: 'fade',
  nextScreen: 'main-menu',
};
function copyVersusPlayerJoin(s, e = s.didJoin) {
  return {
    ...s,
    didJoin: e,
    selectList: [...s.selectList],
    actor: s.actor
      ? {
          ...s.actor,
        }
      : null,
  };
}
function copyVersusPlayers(s, e = !1) {
  return [
    copyVersusPlayerJoin(s.players[0], e || s.players[0].didJoin),
    copyVersusPlayerJoin(s.players[1], e || s.players[1].didJoin),
  ];
}
function newVersusEndFlow(s) {
  const e = resolveVersusRound(s);
  return {
    state: {
      phase: 'entrance',
      result: e,
      report: versusReport(e),
      choice: 0,
      resultDrawFrame: 0,
      question: null,
      route: null,
    },
    effects: [
      {
        type: 'capture-scene',
        fade: VERSUS_SCREEN.frozenSceneFade,
      },
      {
        type: 'stop-music',
      },
      {
        type: 'clear-music-reference',
      },
      {
        type: 'play-audio',
        id: VERSUS_SCREEN.outcomeAudio,
      },
      {
        type: 'play-audio',
        id: VERSUS_SCREEN.entranceAudio,
      },
      {
        type: 'set-game-chapter',
        value: e.gameChapter,
      },
    ],
  };
}
function versusEndView(s) {
  const e = versusEntrance(s.resultDrawFrame);
  return {
    phase: s.phase,
    result: s.result,
    report: s.report,
    choice: s.choice,
    resultPanelY: e.panelY,
    resultPanelPixelY: e.pixelY,
    resultSwordOffset: versusBlink(s.resultDrawFrame),
    inputReady: s.phase === 'choices' && e.inputReady,
    question: s.question
      ? {
          contract: versusQuitQuestion(),
          choice: s.question.choice,
          swordOffset: questionBlink(s.question.swordDraws),
          idleFrames: s.question.idleFrames,
        }
      : null,
    route: s.route,
  };
}
function openVersusQuitQuestion(s, e) {
  ((s.phase = 'quit-question'),
    (s.question = newQuestion(versusQuitQuestion().command, null)),
    e.push(
      {
        type: 'open-quit-question',
        question: versusQuitQuestion(),
        fade: QUESTION_DIM,
      },
      {
        type: 'play-audio',
        id: 'click',
      },
    ));
}
function routeVersusEnd(s, e, t) {
  ((s.phase = 'routed'),
    (s.question = null),
    (s.route = e),
    t.push(
      {
        type: 'stop-outcome-audio',
        id: '005',
      },
      {
        type: 'route',
        route: e,
      },
    ));
}
function applyVersusChoice(s, e) {
  const t = versusChoiceAction(s.choice);
  (e.push(
    {
      type: 'play-audio',
      id: 'gling',
    },
    {
      type: 'clear-inputs',
    },
  ),
    t.kind === 'replay-return'
      ? routeVersusEnd(
          s,
          {
            ...t,
            gameChapter: s.result.gameChapter,
            players: copyVersusPlayers(s.result),
          },
          e,
        )
      : t.kind === 'select'
        ? routeVersusEnd(
            s,
            {
              kind: 'select-versus',
              gameChapter: s.result.gameChapter,
              players: copyVersusPlayers(s.result, !0),
              playersJoined: t.playersJoined,
              dataName: t.dataName,
              scriptId: t.scriptId,
              title: t.title,
              subtitle: t.subtitle,
              transition: 'fade',
            },
            e,
          )
        : openVersusQuitQuestion(s, e));
}
function versusInputAction(s) {
  if (s.escapePressed) return 'escape';
  const e = s.control?.x ?? 0;
  return e < 0 ? 'left' : e > 0 ? 'right' : s.control?.pressedAnyButton ? 'accept' : 'none';
}
function stepVersusQuestion(s, e, t) {
  const i = s.question ?? newQuestion(versusQuitQuestion().command, null),
    r = stepQuestion(i, versusInputAction(e));
  if (((s.question = r.state), r.kind === 'open')) {
    r.sound &&
      t.push({
        type: 'play-audio',
        id: r.sound,
      });
    return;
  }
  if (r.kind === 'dismiss') {
    ((s.phase = 'choices'),
      (s.question = null),
      t.push({
        type: 'close-quit-question',
        reason: e.escapePressed ? 'escape' : 'idle',
      }));
    return;
  }
  if (
    (t.push(
      {
        type: 'play-audio',
        id: r.sound,
      },
      {
        type: 'clear-inputs',
      },
    ),
    r.choice === 1)
  ) {
    ((s.phase = 'choices'),
      (s.question = null),
      t.push({
        type: 'close-quit-question',
        reason: 'no',
      }));
    return;
  }
  const n = {
    kind: 'main-menu',
    ...VERSUS_EXIT,
  };
  (t.push(
    {
      type: 'set-intro-loop',
      value: 0,
    },
    {
      type: 'stop-music',
    },
  ),
    routeVersusEnd(s, n, t));
}
function stepVersusEndFlow(s, e) {
  const t = {
      ...s,
      question: s.question
        ? {
            ...s.question,
          }
        : null,
    },
    i = [];
  if (t.phase === 'routed')
    return {
      state: t,
      effects: i,
    };
  if (t.phase === 'quit-question')
    return (
      stepVersusQuestion(t, e, i),
      {
        state: t,
        effects: i,
      }
    );
  const r = versusEntrance(t.resultDrawFrame);
  if (((t.resultDrawFrame += 1), r.clearsInputs))
    return (
      (t.phase = 'choices'),
      i.push({
        type: 'clear-inputs',
      }),
      {
        state: t,
        effects: i,
      }
    );
  if (!r.inputReady)
    return {
      state: t,
      effects: i,
    };
  if (((t.phase = 'choices'), e.escapePressed))
    return (
      i.push({
        type: 'clear-raw-key',
      }),
      openVersusQuitQuestion(t, i),
      {
        state: t,
        effects: i,
      }
    );
  const n = e.control?.x ?? 0;
  return (
    n !== 0
      ? ((t.choice = nextVersusChoice(t.choice, n < 0 ? -1 : 1)),
        i.push({
          type: 'play-audio',
          id: 'click',
        }))
      : e.control?.pressedAnyButton && applyVersusChoice(t, i),
    {
      state: t,
      effects: i,
    }
  );
}
function routeFromScreenName(s) {
  if (s === 'menu')
    return {
      kind: 'menu',
      transition: 'fade',
    };
  if (s === 'intro')
    return {
      kind: 'intro',
      transition: 'fade-load',
      initialDelay: 0,
    };
  if (s === 'splash')
    return {
      kind: 'splash',
      transition: 'set',
    };
  if (s === 'nag')
    return {
      kind: 'nag-preview',
      transition: 'fade-load',
      data: 'extra',
      script: 94,
      initialDelay: 0,
    };
}
function routeFromCommand(s, e) {
  if (s === 'novel')
    return {
      kind: 'novel',
      id: e[0] ?? '',
      fade: !0,
      suspendScript: !0,
    };
  if (s === 'poster')
    return {
      kind: 'poster',
      id: e[0] ?? '',
      seconds: Math.trunc(Number(e[1]) || 0),
      suspendScript: !0,
    };
  if (s === 'nag')
    return {
      kind: 'nag',
      page: Math.trunc(Number(e[0]) || 0),
      suspendScript: !0,
    };
}
export {
  VERSUS_LAYOUT,
  newVersusEndFlow,
  routeFromCommand,
  routeFromScreenName,
  stepVersusEndFlow,
  versusEndView,
  versusTitleLayout,
};
