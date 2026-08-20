# Rage of Magic II : Community Continuation Project

> A fan-made project born from nostalgia, curiosity, and a childhood wish to see **Rage of Magic II** continue.

## ❤️ Why This Project Exists

**Rage of Magic II is one of my childhood games.**

I spent countless hours playing it almost every day on my Windows XP computer. At the time, it felt like one of the coolest games I had ever played... and honestly, I still think it is.

But there was always one thing that stayed in my head:

**I wanted to know what happened next.**

The story ends at **Chapter 37**, and that was it...

For years, I wished there could be a continuation: new chapters, new enemies, new characters, new areas, and more of the world I remembered from my childhood.

The game was originally created by **Tony Suri**:
https://x.com/tonysurix

Because Rage of Magic II was built as a **Java applet**, it eventually became difficult to run once modern browsers dropped Java support.

Years ago, I tried looking into the game and understanding its code and logic myself. I experimented with decompiling it, but at the time it was far beyond what I was capable of doing.

So the idea stayed in the back of my mind.

For years.

---

## ⚡ Then, 20 Years Later...

On **July 22, 2026**, Tony posted something I never expected to see.

He had brought **Rage of Magic II back to life as a modern web game**.

Using AI assistance, the original Java applet was converted into a version that runs directly in modern browsers while preserving the original campaign, Arena mode, characters, artwork, animations, music, voices, and combat.

You can play Tony's official restored version here:

[Rage of Magic II on itch.io](https://tonysuri.itch.io/rage-of-magic-ii)

Seeing the game running again after all these years genuinely made me incredibly happy.

My childhood game was back.

And almost immediately, the old thought came back too:

**What if the story could finally continue?**

---

## 🛠️ About This Project

Once the game became playable on the web, I started experimenting with it.

I inspected how it worked, studied its structure and logic, and used AI tools to help me understand and recreate parts of the game as a separate development project.

Calling it "reverse engineering" might sound more impressive than what I actually did 😄, but the goal was simple:

**Understand the game well enough to experiment with extending it.**

This repository is the result.

My goal is to use it as a playground for things such as:

- New story chapters
- New characters
- New enemies
- New attacks and combos
- New stages and environments
- Gameplay improvements
- Quality-of-life features
- Experiments with the original mechanics
- And hopefully, someday, a continuation beyond Chapter 37

---

## 🙏 Thank You, Tony

Tony, if you ever find this repository:

**Thank you.**

Thank you for creating a game that became such a memorable part of my childhood.

And thank you for bringing Rage of Magic II back to the web.

Without the restoration, this project probably would never have happened.

If you are not comfortable with any part of this repository being public, please contact me and I will respect your wishes.

---

## ⚠️ Disclaimer

This is an **unofficial, fan-made, non-commercial project**.

I am not the original creator of Rage of Magic II and I do not claim ownership of the original game's characters, artwork, music, sounds, story, or other original assets.

All rights to the original game and its content belong to their respective creator(s) and copyright holders.

Please support and play the official restored version:

👉 **[Rage of Magic II: Official Web Restoration](https://tonysuri.itch.io/rage-of-magic-ii)**

---

## Running it

```bash
npm install && npm run dev
```

Open http://localhost:5273 and press **Play Rage of Magic II** (the click is what lets the browser
start audio). The attract loop runs: brand splash, cover art, character intros, a demo fight, then
back round. Any game button opens the menu.

Controls are the original ones: arrows move (double-tap to run), `A` attack, `S` magic, `D` panic,
`A+S` special, `W` super, `F1` help, `Q` quit.

## 🚀 What's Next?

**Chapter 37 doesn't have to be the end.**

The idea is to slowly understand the game, clean up the project, document how everything works, and start experimenting with new content.

If you also grew up playing Rage of Magic II, contributions, experiments, ideas, bug fixes, and discussions are welcome.

Let's see where the story can go next. ❤️

## Layout

| Path      | What it is                                           |
| --------- | ---------------------------------------------------- |
| `src/`    | The game: 52 engine modules plus the entry point     |
| `public/` | Game assets at the paths the engine requests         |
| `tools/`  | Small checkers for the source tree and the asset set |

Inside `src/`:

```
src/
  main.js                 entry point: creates the Pixi app, sizes the canvas,
                          pumps the fixed-step loop, forwards the keyboard
  styles/game.css         the page around the canvas
  lib/                    asset paths, audio library, canvas fitting
  games/rage-of-magic/
    constants, document-parse, actor, bounds, bonuses, settings, keyboard,
    cheats, camera, timing, layers, atlas, scoring, versus, high-scores, ...
    ai/                   enemy, ally, circle, fairy, wisp, animal, track
    screens/              intro, title, loading, novel, question, pause, attract
    menu/  select/  draw/
    game.js               the main engine class
```

### Assets

```bash
npm run assets             # coverage report
npm run assets -- --list   # print every missing path
```

All 229 atlases, 109 images and 149 sounds are present under `public/`, together with the
`manifest.json` and `audio.json` that describe them.

## Checks

```bash
npm run check     # every module parses, every import resolves
npm run assets    # every file the manifest asks for is present
npm run format    # prettier over src/ and tools/
```
