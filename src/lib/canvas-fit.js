function centeredFitRect(s, e, t, i, r = 24, n = 1) {
  const a = Math.max(1, s),
    o = Math.max(1, e),
    l = Math.max(1, t - r * 2),
    c = Math.max(1, i - r * 2),
    h = Math.min(l / a, c / o) * Math.max(0, n),
    u = Math.max(1, Math.round(a * h)),
    d = Math.max(1, Math.round(o * h));
  return {
    x: Math.round((t - u) / 2),
    y: Math.round((i - d) / 2),
    width: u,
    height: d,
  };
}
export { centeredFitRect };
