function parseCheatCode(s, e = !1) {
  const t = s.toLowerCase();
  if (t === 'winemall')
    return {
      kind: 'win-all',
      message: 'All save games won!',
    };
  if (t === 'winzero')
    return {
      kind: 'win-zero',
      message: 'All save games not won!',
    };
  if (t === 'mocoins')
    return {
      kind: 'more-coins',
      message: '9999 coins added to all games!',
    };
  if (t === 'nocoins')
    return {
      kind: 'no-coins',
      message: 'All coins removed from all games!',
    };
  if (t === 'reset')
    return {
      kind: 'reset',
      message: 'All save games reset!',
    };
  if (t === 'dump')
    return {
      kind: 'dump',
      message: 'Debug info dumped to console.',
    };
  if (t === 'admin')
    return {
      kind: 'admin',
      message: 'Admin mode activated!',
    };
  const i = /^submit-([01])-(-?\d+)$/.exec(t);
  return e && i
    ? {
        kind: 'submit',
        mode: Number(i[1]),
        score: Number(i[2]),
      }
    : {
        kind: 'invalid',
        message: 'That did nothing ...',
      };
}
export { parseCheatCode };
