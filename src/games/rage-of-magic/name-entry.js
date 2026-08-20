import { NAME_ENTRY_CHARS } from './settings.js';
function newNameEntry(s = null) {
  return {
    value: (s ?? '').toUpperCase(),
    maxLength: 16,
    cursorX: 8,
    cursorY: 4,
  };
}
function moveNameCursor(s, e) {
  let t = s.cursorX,
    i = s.cursorY;
  return (
    (e.x ?? 0) > 0
      ? (t = (t + 1) % 9)
      : (e.x ?? 0) < 0
        ? (t = (t + 8) % 9)
        : (e.y ?? 0) > 0
          ? (i = (i + 1) % 5)
          : (e.y ?? 0) < 0 && (i = (i + 4) % 5),
    {
      ...s,
      cursorX: t,
      cursorY: i,
    }
  );
}
function typeNameCharacter(s, e = null) {
  const t = NAME_ENTRY_CHARS[s.cursorY * 9 + s.cursorX];
  return t === '\b' || e === 3
    ? s.value.length === 0
      ? {
          state: s,
          outcome: 'error',
          audio: 'error',
        }
      : {
          state: {
            ...s,
            value: s.value.slice(0, -1),
          },
          outcome: 'backspace',
          audio: 'blip',
        }
    : t ===
        `
`
      ? {
          state: s,
          outcome: 'complete',
          audio: 'gling',
        }
      : s.value.length > s.maxLength || t === '\0'
        ? {
            state: s,
            outcome: 'error',
            audio: 'error',
          }
        : {
            state: {
              ...s,
              value: s.value + t,
            },
            outcome: 'append',
            audio: 'gling',
          };
}
export { moveNameCursor, newNameEntry, typeNameCharacter };
