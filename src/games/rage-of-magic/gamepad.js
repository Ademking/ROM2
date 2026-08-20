function isGamepadActive(s) {
  return s.x !== 0 || s.y !== 0 || s.buttons.some(Boolean);
}
function copyGamepadState(s) {
  return {
    ...s,
    buttons: [...s.buttons],
  };
}
class GamepadReader {
  latchedIndex = -1;
  snapshots = new Map();
  reset() {
    ((this.latchedIndex = -1), this.snapshots.clear());
  }
  poll(e) {
    const t = e.find(isGamepadActive);
    if (t) {
      (this.latchedIndex === -1 || t.index !== this.latchedIndex) &&
        ((this.latchedIndex = t.index), this.snapshots.set(t.index, copyGamepadState(t)));
      return;
    }
    if (this.latchedIndex === -1) return;
    const i = this.snapshots.get(this.latchedIndex);
    return (
      this.snapshots.delete(this.latchedIndex),
      (this.latchedIndex = -1),
      i ? copyGamepadState(i) : void 0
    );
  }
}
export { GamepadReader };
