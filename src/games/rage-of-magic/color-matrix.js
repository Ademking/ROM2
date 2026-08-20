function grayMatrix(s) {
  const e = Math.max(0, s) / 3;
  return [e, e, e, 0, 0, e, e, e, 0, 0, e, e, e, 0, 0, 0, 0, 0, 1, 0];
}
export { grayMatrix };
