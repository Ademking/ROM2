<div align="center">

# ⚔️ Rage of Magic II

### Community Continuation Project

_A fan-made project born from nostalgia, curiosity, and a childhood wish to see **Rage of Magic II** continue._

![Fan project](https://img.shields.io/badge/fan%20project-unofficial-ff4655?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PixiJS](https://img.shields.io/badge/PixiJS-8-e91e63?style=for-the-badge)

**[▶ Play the official restoration](https://tonysuri.itch.io/rage-of-magic-ii)** &nbsp;·&nbsp;
**[👤 Tony Suri, the creator of ROM2](https://x.com/tonysurix)**

</div>

---

## 📖 Contents

- [Why This Project Exists](#%EF%B8%8F-why-this-project-exists)
- [Then, 20 Years Later…](#-then-20-years-later)
- [About This Project](#%EF%B8%8F-about-this-project)
- [Getting Started](#%EF%B8%8F-getting-started)
- [Controls](#-controls)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)
- [State of the Code](#-state-of-the-code)
- [What's Next](#-whats-next)
- [Thank You, Tony](#-thank-you-tony)
- [Disclaimer](#%EF%B8%8F-disclaimer)

---

## ❤️ Why This Project Exists

**Rage of Magic II is one of my childhood games.**

I spent countless hours playing it almost every day on my Windows XP computer. At the time, it felt
like one of the coolest games I had ever played — and honestly, I still think it is.

But there was always one thing that stayed in my head:

> **I wanted to know what happened next.**

The story ends at **Chapter 37**, and that was it.

For years, I wished there could be a continuation: new chapters, new enemies, new characters, new
areas, and more of the world I remembered from my childhood.

The game was originally created by **[Tony Suri](https://x.com/tonysurix)**.

Because Rage of Magic II was built as a **Java applet**, it eventually became difficult to run once
modern browsers dropped Java support.

Years ago I tried looking into the game and understanding its code and logic myself. I experimented
with decompiling it, but at the time it was far beyond what I was capable of doing.

So the idea stayed in the back of my mind. For years.

---

## ⚡ Then, 20 Years Later…

On **July 22, 2026**, Tony posted something I never expected to see.

He had brought **Rage of Magic II back to life as a modern web game**. Using AI assistance, the
original Java applet was converted into a version that runs directly in modern browsers — preserving
the original campaign, Arena mode, characters, artwork, animations, music, voices and combat.

<div align="center">

**▶ [Play Tony's official restored version on itch.io](https://tonysuri.itch.io/rage-of-magic-ii)**

</div>

Seeing the game running again after all these years genuinely made me incredibly happy.

My childhood game was back.

And almost immediately, the old thought came back too:

> **What if the story could finally continue?**

---

## 🛠️ About This Project

Once the game became playable on the web, I started experimenting with it. I inspected how it
worked, studied its structure and logic, and used AI tools to help me understand and recreate parts
of the game as a separate development project.

Calling it "reverse engineering" might sound more impressive than what I actually did 😄, but the
goal was simple:

> **Understand the game well enough to experiment with extending it.**

This repository is the result — a playground for:

|                       |                         |                           |
| --------------------- | ----------------------- | ------------------------- |
| 📜 New story chapters | 🧙 New characters       | 👹 New enemies            |
| ⚔️ New attacks/combos | 🏞️ New stages           | ⚙️ Gameplay improvements  |
| ✨ Quality-of-life    | 🔬 Mechanic experiments | 🎯 A continuation past 37 |

---

## ▶️ Getting Started

```bash
npm install
npm run dev
```

Then open **http://localhost:5273** and press **Play Rage of Magic II** — the click is what lets the
browser start audio.

The attract loop runs on its own: brand splash → cover art → character intros → a demo fight → back
around. Press any game button to open the menu.

> [!IMPORTANT]
> **The game's media is not in this repository.** Artwork, animation, music and voices belong to
> Tony Suri, so they are excluded by `.gitignore` (see the [disclaimer](#%EF%B8%8F-disclaimer)).
> A fresh clone will boot, then stop on the first missing file.
>
> To supply your own copy, run `npm run assets -- --list` for the exact list of paths, then drop the
> files into:
>
> ```
> public/games/rage-of-magic-ii/atlases/   # 229 sprite sheets
> public/games/rage-of-magic-ii/images/    # 109 backgrounds and scenes
> public/audio/rage-of-magic/sounds/       # 149 music tracks, voices and effects
> ```
>
> `npm run assets` reports coverage at any time.

---

## 🎮 Controls

These are the original controls, unchanged.

| Key                                                 | Action                   |
| --------------------------------------------------- | ------------------------ |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Move — double-tap to run |
| <kbd>A</kbd>                                        | Attack                   |
| <kbd>S</kbd>                                        | Magic                    |
| <kbd>D</kbd>                                        | Panic attack             |
| <kbd>A</kbd> + <kbd>S</kbd>                         | Special                  |
| <kbd>W</kbd>                                        | Super                    |
| <kbd>F1</kbd>                                       | Help                     |
| <kbd>Q</kbd>                                        | Quit                     |

---

## 📁 Project Structure

| Path      | What it is                                           |
| --------- | ---------------------------------------------------- |
| `src/`    | The game — 52 engine modules plus the entry point    |
| `public/` | Game assets, at the paths the engine requests        |
| `tools/`  | Small checkers for the source tree and the asset set |

<details>
<summary><b>Inside <code>src/</code></b> — click to expand</summary>

```
src/
├── main.js                 entry point: creates the Pixi app, sizes the canvas,
│                           pumps the fixed-step loop, forwards the keyboard
├── styles/game.css         the page around the canvas
├── lib/                    asset-path · audio-library · brand-intro
│                           canvas-fit · display-scale
└── games/rage-of-magic/
    ├── game.js             the main engine class
    ├── actor · bounds · bonuses · camera · layers · timing · atlas
    ├── constants · game-constants · document-parse · modes · routing
    ├── settings · keyboard · gamepad · cheats · name-entry · storage
    ├── scoring · versus · high-scores · color-matrix
    ├── ai/                 enemy · ally · animal · circle · fairy · track · wisp
    │                       plus constants · helpers
    ├── screens/            brand-screen · intro-panels · intro-swords
    │                       title-screen · loading-screen · novel
    │                       question · pause · attract
    ├── menu/               layout · options
    ├── select/             data · state
    └── draw/               atlas-sheets · screens
```

</details>

The pieces that matter most for adding content:

- **`games/rage-of-magic/document-parse.js`** — reads the chapter, actor and animation tables
- **`games/rage-of-magic/screens/novel.js`** — drives the story text between fights
- **`games/rage-of-magic/select/`** — the playable roster and ally loadouts
- **`games/rage-of-magic/ai/`** — one file per behaviour

---

## 🧰 Scripts

| Command                    | What it does                                    |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Start the dev server on port 5273               |
| `npm run build`            | Production build into `dist/`                   |
| `npm run preview`          | Serve the production build                      |
| `npm run check`            | Every module parses, every import resolves      |
| `npm run assets`           | Report which game assets are present or missing |
| `npm run assets -- --list` | Print every missing asset path, one per line    |
| `npm run format`           | Prettier over `src/` and `tools/`               |

---

## 🧪 State of the Code

The engine came out of a minified bundle, so it is readable but not yet finished as source:

- ✅ Every module, class, function and constant has a real name
- ✅ Split into 52 focused modules instead of one file
- ✅ `pixi.js` is the only runtime dependency
- ⚠️ Variables **inside** function bodies are still the minifier's `s, e, t, i, r, n` — around 1400
  of them

`npm run check` prints the running count.
Nothing depends on fixing them; they can be cleaned up module by module, which makes it an easy
first contribution.

---

## 🚀 What's Next

> **Chapter 37 doesn't have to be the end.**

The plan is to slowly understand the game, clean up the project, document how everything works, and
start experimenting with new content.

If you also grew up playing Rage of Magic II, then contributions, experiments, ideas, bug fixes and
discussions are all welcome. Let's see where the story can go next. ❤️

---

## 🙏 Thank You, Tony

Tony, if you ever find this repository:

> **Thank you.**
>
> Thank you for creating a game that became such a memorable part of my childhood, and thank you for
> bringing Rage of Magic II back to the web. Without the restoration, this project would probably
> never have happened.
>
> If you are not comfortable with any part of this repository being public, please contact me and I
> will respect your wishes.

---

## ⚠️ Disclaimer

> [!WARNING]
> This is an **unofficial, fan-made, non-commercial project.**
>
> I am not the original creator of Rage of Magic II, and I claim no ownership of the original game's
> characters, artwork, music, sounds, story or any other original assets. All rights to the original
> game and its content belong to their respective creator(s) and copyright holders.

<div align="center">

**Please support and play the official restored version:**

### 👉 [Rage of Magic II — Official Web Restoration](https://tonysuri.itch.io/rage-of-magic-ii)

</div>
