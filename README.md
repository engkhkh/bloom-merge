# 🌻 Bloom Merge · حديقة الدمج

A calm merge-and-grow garden puzzle for the whole family. Drag two matching plants together to grow them:

🌰 Seed → 🌱 Sprout → 🌷 Tulip → 🌻 Sunflower → 🌳 Tree → 🍎 Apple Tree

One codebase runs on the **web**, **Android**, **iPhone** and **Windows/Mac**.

## Features
- 10 levels with goals, move limits and stars
- 📅 Daily Challenge: the same puzzle for everyone each day, with best score and 🔥 streak
- 👪 Family Garden: 2–4 players take turns on one device
- 📖 Garden Album: 12 animal visitors to collect
- 🌸 ☀️ 🍂 ❄️ 🌙 🎉 Seasonal gardens: spring, summer, autumn, winter, Ramadan and Eid, chosen by date
- ✏️ Level Editor: make your own puzzle and share it with a short code
- 🧸 Kid Mode: no move limit, no pressure
- English and Arabic (right-to-left)
- Works offline, no ads, no tracking, no personal data ([privacy policy](game/public/privacy.html))

## Project layout
| Folder | What's inside |
|---|---|
| `game/` | The game (Phaser 3 + TypeScript + Vite), plus the Android (`android/`), iOS (`ios/`) and desktop (`electron/`) apps |
| `marketing/` | Store listing text (English + Arabic), screenshots, feature graphic |
| `PLAN.md` | The original game plan |
| `.github/workflows/build.yml` | Automatic builds |

## Run it
```
cd game
npm install
npm run dev          # web, at http://localhost:5173
npm run desktop      # desktop window
npm run android      # opens Android Studio
```
More detail is in [game/README.md](game/README.md).

## Automatic builds
Every push to `main` runs GitHub Actions, which:
- publishes the web game to **GitHub Pages**
- builds the **Windows** installer and portable `.exe`
- builds an **Android** `.apk`

Download the Windows and Android files from the workflow run's **Artifacts**. Push a tag such as `v1.0.0` to create a **Release** with the files attached.

To turn on the website the first time: **Settings → Pages → Source: GitHub Actions**.
