const QUESTION_DIM = 0.75;
const QUESTION_TIMEOUT_FRAMES = 500;
const QUESTION_LAYOUT = {
  form: 15,
  shieldIcon: 0,
  swordIcon: 1,
  panelInsetX: 17,
  panelInsetY: 17,
  choiceGapX: 116,
  choicesY: 54,
};
const MESSAGE_LAYOUT = {
  form: 10,
  panelInsetX: 13,
  panelInsetY: 18,
};
function newQuestion(s, e) {
  return {
    choice: s !== null && e === null ? 1 : 0,
    idleFrames: 0,
    swordDraws: 0,
  };
}
function stepQuestion(s, e) {
  const t = {
    ...s,
    idleFrames: s.idleFrames + 1,
    swordDraws: s.swordDraws + 1,
  };
  return e === 'escape' || t.idleFrames > QUESTION_TIMEOUT_FRAMES
    ? {
        kind: 'dismiss',
        state: t,
      }
    : e === 'left' || e === 'right'
      ? ((t.choice = t.choice === 0 ? 1 : 0),
        (t.idleFrames = 0),
        {
          kind: 'open',
          state: t,
          sound: 'click',
        })
      : e === 'accept'
        ? ((t.idleFrames = 0),
          {
            kind: 'choose',
            choice: t.choice,
            state: t,
            sound: 'gling',
          })
        : {
            kind: 'open',
            state: t,
          };
}
function questionBlink(s) {
  return Math.floor(Math.max(0, s) / 10) & 1;
}
function newMessage(s) {
  return {
    remainingFrames: Math.trunc(s),
  };
}
function stepMessage(s, e = !1) {
  const t = {
    remainingFrames: s.remainingFrames - 1,
  };
  return {
    state: t,
    dismiss: e || t.remainingFrames < 0,
  };
}
export {
  MESSAGE_LAYOUT,
  QUESTION_DIM,
  QUESTION_LAYOUT,
  newMessage,
  newQuestion,
  questionBlink,
  stepMessage,
  stepQuestion,
};
