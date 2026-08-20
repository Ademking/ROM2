function displayScale(s, e, t, i, r) {
  if (s <= 0 || e <= 0 || t <= 0 || i <= 0) return 1;
  const n = Math.min(s / t, e / i);
  return !r || n < 1 ? n : Math.floor(n);
}
export { displayScale };
