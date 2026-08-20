import { assetPath } from './asset-path.js';

/**
 * Game audio, decoded into memory and played through Web Audio.
 *
 * The original library gave every sound a pool of <audio> elements: 149 sounds
 * with their polyphony copies is 536 of them. Chrome will not buffer that many
 * eagerly — measured at 12.5s for the set, and it silently downgrades
 * `preload="auto"` to metadata — so sounds were still stalling on their first
 * play, which is heard as the audio arriving after the picture. Decoding the
 * same files costs ~300ms, and a decoded buffer starts with no latency at all.
 */
class AudioLibrary {
  configs = new Map();
  buffers = new Map();
  /** name -> voices currently sounding, oldest first. */
  playingVoices = new Map();
  /** name -> where playback resumes, in seconds. Only loops are ever resumed. */
  offsets = new Map();
  muted = !1;
  context;
  async load(e) {
    const t = await fetch(assetPath(e, 'Audio manifest'));
    if (!t.ok) throw new Error(`Could not load audio manifest: ${t.status}`);
    const i = await t.json();
    for (const [r, n] of Object.entries(i.sounds))
      this.configs.set(r, {
        ...n,
        url: assetPath(n.url, `Sound ${r}`),
      });
  }
  audioContext() {
    return (this.context ??= new AudioContext());
  }
  async preload(e) {
    await Promise.all(
      e.map(async (t) => {
        if (this.buffers.has(t)) return;
        const i = this.configs.get(t);
        if (!i) throw new Error(`Could not preload missing sound: ${t}`);
        const r = await fetch(i.url);
        if (!r.ok) throw new Error(`Could not preload sound ${t}: ${r.status}`);
        this.buffers.set(t, await this.audioContext().decodeAudioData(await r.arrayBuffer()));
      }),
    );
  }
  /** Browsers start a context suspended; the click that starts the game resumes it. */
  unlock() {
    const e = this.audioContext();
    if (e.state === 'suspended') e.resume();
  }
  play(e) {
    return this.startVoice(e, !1, 0);
  }
  playLoop(e) {
    if (!this.isPlaying(e)) this.startVoice(e, !0, this.offsets.get(e) ?? 0);
  }
  restartLoop(e) {
    (this.stop(e, !0), this.playLoop(e));
  }
  startVoice(e, t, i) {
    if (this.muted) return;
    const r = this.buffers.get(e);
    if (!r) return;
    const n = this.configs.get(e),
      a = this.voicesFor(e);
    // The element pool could only ever sound `polyphony` copies at once, and
    // reused the oldest when it ran out. Keep that ceiling.
    while (a.length >= Math.max(1, n?.polyphony ?? 1)) this.endVoice(a[0], !1);
    const o = this.audioContext(),
      l = o.createGain();
    ((l.gain.value = n?.volume ?? 1), l.connect(o.destination));
    const c = o.createBufferSource();
    ((c.buffer = r), (c.loop = t), c.connect(l), c.start(0, i % r.duration));
    const h = {
      name: e,
      source: c,
      loop: t,
      startedAt: o.currentTime - i,
      currentTime: 0,
      pause: () => this.endVoice(h, !1),
    };
    return ((c.onended = () => this.forgetVoice(h)), a.push(h), h);
  }
  voicesFor(e) {
    let t = this.playingVoices.get(e);
    return (t || ((t = []), this.playingVoices.set(e, t)), t);
  }
  forgetVoice(e) {
    const t = this.playingVoices.get(e.name);
    if (!t) return;
    const i = t.indexOf(e);
    i >= 0 && t.splice(i, 1);
  }
  /** @param rewind - false remembers where the sound was, so a loop can resume there. */
  endVoice(e, t) {
    ((e.source.onended = null), this.forgetVoice(e));
    try {
      e.source.stop();
    } catch {}
    if (t) this.offsets.delete(e.name);
    else {
      const i = this.buffers.get(e.name),
        r = this.audioContext().currentTime - e.startedAt;
      this.offsets.set(e.name, i ? r % i.duration : r);
    }
  }
  isPlaying(e) {
    return this.voicesFor(e).length > 0;
  }
  reset(e) {
    (this.offsets.delete(e),
      // Rewinding something that is sounding restarts it, as seeking an element did.
      this.isPlaying(e) && this.restartLoop(e));
  }
  stop(e, t = !1) {
    for (const i of [...this.voicesFor(e)]) this.endVoice(i, t);
  }
  stopVoice(e) {
    e?.pause();
  }
  stopAll(e = !0) {
    for (const t of [...this.playingVoices.keys()]) this.stop(t, e);
  }
  setMuted(e) {
    ((this.muted = e), e && this.stopAll(!1));
  }
  destroy() {
    (this.stopAll(),
      this.playingVoices.clear(),
      this.buffers.clear(),
      this.configs.clear(),
      this.offsets.clear(),
      this.context?.close(),
      (this.context = void 0));
  }
}
export { AudioLibrary };
