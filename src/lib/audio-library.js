import { assetPath } from './asset-path.js';
class AudioLibrary {
  sounds = new Map();
  configs = new Map();
  preloadedUrls = new Map();
  muted = !1;
  async load(e) {
    const t = await fetch(assetPath(e, 'Audio manifest'));
    if (!t.ok) throw new Error(`Could not load audio manifest: ${t.status}`);
    const i = await t.json();
    for (const [r, n] of Object.entries(i.sounds)) {
      const a = {
          ...n,
          url: assetPath(n.url, `Sound ${r}`),
        },
        o = Math.max(1, n.polyphony ?? 1);
      (this.configs.set(r, a),
        this.sounds.set(
          r,
          Array.from(
            {
              length: o,
            },
            () => {
              const l = new Audio(a.url);
              return ((l.preload = 'auto'), (l.volume = a.volume ?? 1), l);
            },
          ),
        ));
    }
  }
  async preload(e) {
    await Promise.all(
      e.map(async (t) => {
        if (this.preloadedUrls.has(t)) return;
        const i = this.configs.get(t),
          r = this.sounds.get(t);
        if (!i || !r) throw new Error(`Could not preload missing sound: ${t}`);
        const n = await fetch(i.url);
        if (!n.ok) throw new Error(`Could not preload sound ${t}: ${n.status}`);
        const a = URL.createObjectURL(await n.blob());
        this.preloadedUrls.set(t, a);
        for (const o of r) ((o.src = a), o.load());
      }),
    );
  }
  play(e) {
    if (this.muted) return;
    const t = this.sounds.get(e);
    if (!t) return;
    const i = t.find((r) => r.paused || r.ended) ?? t[0];
    return (i.pause(), (i.currentTime = 0), i.play().catch(() => {}), i);
  }
  playLoop(e) {
    if (this.muted) return;
    const t = this.sounds.get(e)?.[0];
    t && ((t.loop = !0), t.paused && t.play().catch(() => {}));
  }
  isPlaying(e) {
    const t = this.sounds.get(e)?.[0];
    return !!(t && !t.paused && !t.ended);
  }
  reset(e) {
    const t = this.sounds.get(e);
    if (t) for (const i of t) i.currentTime = 0;
  }
  restartLoop(e) {
    const t = this.sounds.get(e)?.[0];
    t && (t.pause(), (t.currentTime = 0), (t.loop = !0), !this.muted && t.play().catch(() => {}));
  }
  unlock(e) {
    for (const t of e) {
      const i = this.sounds.get(t)?.[0];
      if (!i || !i.paused) continue;
      const r = i.muted;
      ((i.muted = !0),
        i
          .play()
          .then(() => {
            (i.pause(), (i.currentTime = 0), (i.muted = r));
          })
          .catch(() => {
            i.muted = r;
          }));
    }
  }
  stop(e, t = !1) {
    const i = this.sounds.get(e);
    if (i) for (const r of i) (r.pause(), t && (r.currentTime = 0));
  }
  stopVoice(e) {
    e && (e.pause(), (e.currentTime = 0));
  }
  stopAll(e = !0) {
    for (const t of this.sounds.keys()) this.stop(t, e);
  }
  setMuted(e) {
    if (((this.muted = e), !!e)) for (const t of this.sounds.values()) for (const i of t) i.pause();
  }
  destroy() {
    for (const e of this.sounds.values())
      for (const t of e) (t.pause(), t.removeAttribute('src'), t.load());
    (this.sounds.clear(), this.configs.clear());
    for (const e of this.preloadedUrls.values()) URL.revokeObjectURL(e);
    this.preloadedUrls.clear();
  }
}
export { AudioLibrary };
