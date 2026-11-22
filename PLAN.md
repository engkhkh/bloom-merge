# Bloom Merge – Game Plan

**One game, every screen, every age.**
Web browser, Android and iPhone, and Windows/Mac desktop, all from a single codebase.

---

## 1. The Idea

**Bloom Merge** is a calm puzzle game where you merge and grow a garden.

- Drag two matching items together to merge them into a bigger one:
  seed → sprout → flower → tree → magic tree.
- Each level gives a small garden board and a goal, such as "Grow 3 sunflowers in 20 moves."
- Grown plants attract butterflies, birds and animals, and the player collects them in an album.
- Sessions take 2–5 minutes, so the game works on a phone in a queue or on a PC on a break.

### Why it works for children, women and men
| Group | What they enjoy |
|---|---|
| Children (5+) | Bright colours, animals, simple drag-and-drop, no reading needed, no violence |
| Women | Relaxing, creative garden decorating, collecting, daily streaks |
| Men | Harder "Expert" levels, move limits, leaderboards, score chasing |
| Families | "Family Garden" mode: everyone takes turns on one device |

### Easy to play on any device
- Touch (mobile), mouse (desktop/web) and keyboard all work.
- Portrait and landscape layouts.
- Works offline once installed.

---

## 2. Features

### Version 1 (MVP)
1. 5×5 merge board with 6 item levels
2. 30 levels with move-limit goals
3. Simple scoring and 1–3 stars per level
4. Sound effects and music, each with an on/off switch
5. Progress saved on the device
6. Kid Mode: no timers, no move limits, bigger buttons

### Version 2
- Daily Challenge (the same puzzle for everyone each day)
- Animal collection album
- Garden decorating (place your grown plants freely)
- Leaderboards and an optional account
- Arabic and English languages (RTL support)

### Version 3
- Family Garden turn-based mode
- Seasonal events (Ramadan lanterns, winter snow, spring blossoms)
- Level editor so players can share puzzles

---

## 3. Technology (one codebase → 3 platforms)

| Part | Tool | Why |
|---|---|---|
| Game engine | **Phaser 3** (JavaScript/TypeScript) | Free, made for 2D web games |
| Build tool | **Vite** | Fast development server |
| Web | Host on **Netlify / Vercel / GitHub Pages** (free) | Players open a link and play |
| Mobile apps | **Capacitor** | Wraps the web game into Android and iOS apps |
| Desktop app | **Tauri** (or Electron) | Builds Windows .exe and Mac apps |
| Installable web app | **PWA** (manifest + service worker) | "Add to Home Screen", offline play |
| Saving | localStorage first, **Firebase/Supabase** later | Cloud saves and leaderboards |

**Programs to install on your PC:** Node.js (LTS), VS Code, Git.
Android: Android Studio. iPhone: a Mac with Xcode (needed for iOS builds).

---

## 4. Folder Structure

Create this inside `C:\Claude projects\Bloom-Merge\`:

```
Bloom-Merge/
├── PLAN.md              ← this file
├── TASKS.md             ← checklist (below)
├── design/
│   ├── art/             ← sprites, backgrounds
│   ├── sounds/          ← music and effects
│   └── levels.json      ← level goals and layouts
├── game/                ← Phaser + Vite project
│   ├── src/
│   │   ├── scenes/      ← Menu, Game, LevelSelect, Album
│   │   ├── objects/     ← Board, Tile, MergeLogic
│   │   └── main.ts
│   ├── public/
│   └── package.json
├── mobile/              ← Capacitor Android / iOS projects
├── desktop/             ← Tauri desktop project
└── marketing/           ← icons, screenshots, store text
```

---

## 5. Step-by-Step Plan (about 10 weeks, part-time)

### Week 1: Setup
- [ ] Install Node.js, VS Code and Git
- [ ] Create the folders above
- [ ] Create the game project: `npm create vite@latest game -- --template vanilla-ts`, then `npm install phaser`
- [ ] Show a test screen in the browser

### Weeks 2–3: Core game
- [ ] Draw a 5×5 grid
- [ ] Drag-and-drop tiles (mouse + touch)
- [ ] Merge logic: 2 matching items become the next level
- [ ] Spawn new seeds after each move
- [ ] Score counter and move counter

### Week 4: Levels and goals
- [ ] Load levels from `levels.json`
- [ ] Win/lose screens and stars
- [ ] Level select map
- [ ] Save progress (localStorage)

### Week 5: Art and sound
- [ ] Simple, colourful art (free packs from Kenney.nl, or your own)
- [ ] Merge "pop" animation and particles
- [ ] Music and sound effects with on/off switches

### Week 6: Kid Mode and accessibility
- [ ] Kid Mode toggle (no limits, bigger tiles)
- [ ] Colour-blind friendly shapes on items
- [ ] Arabic and English text

### Week 7: Web release
- [ ] Add a PWA manifest and offline support
- [ ] Publish on Netlify or GitHub Pages
- [ ] Have family and friends of different ages test it

### Week 8: Mobile apps
- [ ] `npm install @capacitor/core @capacitor/cli`, then `npx cap add android`
- [ ] Test on a real phone
- [ ] Google Play developer account (one-time fee) and store listing
- [ ] iOS (optional, needs a Mac and an Apple developer account)

### Week 9: Desktop app
- [ ] Add Tauri and build a Windows installer
- [ ] Optional: publish on itch.io or the Microsoft Store

### Week 10: Polish and launch
- [ ] Fix bugs from testers
- [ ] Icons, screenshots, short trailer
- [ ] Launch on all three platforms

---

## 6. Money (optional)
- Free to play, with **no ads in Kid Mode**
- One-time "Full Garden" purchase to unlock all levels and decorations
- Optional cosmetic packs (garden themes)
- Avoid aggressive ads or loot boxes, because the game is for children too

---

## 7. Child Safety Checklist
- [ ] No chat between strangers
- [ ] No personal data collected from children
- [ ] Purchases protected by a parent gate
- [ ] Follow the Google Play "Families" and Apple Kids rules

---

## 8. Next Step
Start Week 1. When the folder is ready, ask Claude to write the starter code
for the 5×5 merge board in `game/src/`.
