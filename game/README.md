# Bloom Merge – Starter Game

Put this folder at `C:\Claude projects\Bloom-Merge\game`.

## Run it on your PC
1. Install **Node.js LTS** from nodejs.org.
2. Open a terminal in this folder (in File Explorer, click the address bar, type `cmd`, and press Enter).
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open the link it shows (http://localhost:5173) in your browser.
   The **Network** link opens the game on your phone if it's on the same Wi-Fi.

## Build for the web
```
npm run build
```
Upload the `dist` folder to Netlify, Vercel or GitHub Pages.

## What's done (Week 1–4 of PLAN.md)
- Menu with 5 levels, stars and locked levels
- 5×5 board with drag-and-drop for mouse and touch
- Merge chain: 🌰 → 🌱 → 🌷 → 🌻 → 🌳 → 🍎
- Goals, move limits, score, win and lose screens
- Kid Mode (no move limit)
- Progress saved on the device

### Added in version 0.2 (Weeks 5–7)
- Garden artwork: sky, sun, moving clouds, hills, a wooden garden bed and coloured plant badges
- Sounds and gentle background music, made in code (no sound files), with on/off buttons
- Merge effects: petals, butterflies, floating points, screen shake for big merges
- 10 levels
- Installable app (PWA): icons, manifest and offline support

## Install on a phone
After you upload `dist` to Netlify or GitHub Pages, open the link on the phone:
- **Android (Chrome):** menu ⋮ → **Add to Home screen** / **Install app**
- **iPhone (Safari):** Share → **Add to Home Screen**

It then opens full-screen like a normal app and works offline.

### Added in version 0.3 (Weeks 8–9)
- The last plant is now 🍎 **Apple Tree** (it replaces the rainbow)
- **Android app** project in `android/`, with icons, splash screen and portrait lock
- **iPhone app** project in `ios/`
- **Windows/Mac desktop app** using Electron (`electron/main.cjs`)

### Added in version 0.4 (Week 10: polish and launch)
- **Arabic language** with right-to-left text. Tap 🌐 on the menu to switch.
- **Rounded game font** (Baloo Bhaijaan 2) that covers both English and Arabic
- **📅 Daily Challenge:** one puzzle per day, the same for every player, with a best score and a 🔥 day streak
- **Store kit** in `../marketing/`: listing text in English and Arabic, 5 phone screenshots, a feature graphic and an icon

### Added in version 0.5 (Version 2 and 3 features)
- **📖 Garden Album:** 12 animal visitors (🐞 🐝 🐦 🐰 🐛 🐌 🐜 🐸 🐢 🐤 🐱 🐶) arrive as you play. A banner pops up when a new one visits.
- **👪 Family Garden:** 2–4 players take turns on one device, one move each, 10 turns per player. Merges score points, and the winner gets a 🏆.
- **Privacy policy** page at `public/privacy.html` (English + Arabic)

### Added in version 0.6
- **Seasonal gardens** chosen by date: 🌸 spring petals, ☀️ summer, 🍂 autumn leaves, ❄️ winter snow, 🌙 Ramadan night with lanterns, 🎉 Eid confetti and balloons. Tap the season badge on the menu to preview the others.
- **Font bundled inside the game**, so text looks right offline too (no Google Fonts download)
- **Windows app** tested: `npm run desktop:build` makes it, or download it from GitHub Actions
- **GitHub Actions** workflow that builds the web, Windows and Android versions automatically

### Added in version 0.7
- **✏️ Level Editor:** pick the plant to grow, how many, moves and starting seeds. It shows the difficulty and a share code like `BM-3-2-40-8-1036`. Friends type the code under "Enter a friend's code" and get the exact same board.

## Build the Android app (Windows PC)
1. Install **Android Studio** from developer.android.com and open it once so it finishes setup.
2. In this folder run:
   ```
   npm install
   npm run android
   ```
3. Android Studio opens the project. Plug in your phone (with USB debugging on) and press ▶ Run.
4. For a file to share or upload to Google Play: **Build → Generate Signed App Bundle / APK**.

### Added in version 0.8 (launch polish)
- **First-game tutorial:** a hand shows how to drag a seed onto another seed. It shows once, then never again.
- **Hints:** after 7 seconds without a move, two plants that can merge gently wiggle
- **Android back button:** goes back to the menu, or closes the app from the menu
- **Vibration** on merges (stronger for big plants). It follows the Sound setting.
- **Music pauses** when the phone locks or you switch apps, and resumes when you come back

### Added in version 0.12
- **🏡 My Garden** (garden decorating from the original plan). Every tulip, sunflower, tree and apple tree you grow in the levels goes into a basket. Pick one and tap the grass to plant it, drag plants to rearrange them, or drag them back to the basket. Your Album animals wander around the garden; tap one to see its name. The layout is saved (up to 60 plants).
- 3 more tests (48 in total)

### Added in version 0.11
- **↶ Undo:** take back a move, 3 times per level (unlimited in Kid Mode). It's not available in the Daily Challenge or Family Garden, to keep them fair.
- **Automated tests** (`npm test`, 45 tests): board rules, rocks, ice, Level Editor codes, Daily seeds, seasons and Ramadan/Eid dates, Arabic/English translation completeness, and a simulated player that must win every level at least 90% of the time. GitHub runs them on every push.

### Added in version 0.10
- **World 3: Frozen Pond.** In levels 21–30, some plants start frozen in ice. They can't be moved or merged until you merge something right next to them (up, down, left or right), which cracks the ice with a sound and flying shards. The later levels mix ice with rocks.
- Move limits were tuned with the simulated player: all 30 levels are winnable
- World 3 level buttons are icy blue

### Added in version 0.9
- **World 2: Rocky Garden.** Levels 11–20 have rocks that block cells, so there's less room to work with. Use ◀ ▶ on the menu to switch worlds.
- Every level was checked with a simulated player (300+ games each): all 20 are winnable, and in World 2 three stars need near-perfect play
- Privacy policy contact email: khilel208@gmail.com

## Publish on Google Play (signed release)
Google Play needs the app signed with **your own key**. Make it once and keep it safe: if you lose it you can't update the app.

1. Create the key (needs Java, which comes with Android Studio). In a terminal:
   ```
   keytool -genkeypair -v -keystore bloom-merge.jks -alias bloom -keyalg RSA -keysize 2048 -validity 10000
   ```
   Choose a password and answer the questions. **Back up `bloom-merge.jks` and the password somewhere safe, and never put them in the repo.**
2. Turn the key into text (PowerShell):
   ```
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("bloom-merge.jks")) | Set-Clipboard
   ```
3. On GitHub open **Settings → Secrets and variables → Actions → New repository secret** and add:
   | Name | Value |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | paste from step 2 |
   | `ANDROID_KEYSTORE_PASSWORD` | your keystore password |
   | `ANDROID_KEY_ALIAS` | `bloom` |
   | `ANDROID_KEY_PASSWORD` | your key password (same as above if you pressed Enter) |
4. The next build adds **bloom-merge-play.aab** (upload this to Google Play) and a signed **bloom-merge-android-release.apk**.

## Make a release
```
git tag v0.7.0
git push origin v0.7.0
```
GitHub builds everything and creates a **Release** page with the Windows installer, the Windows portable .exe and the Android app attached. Update `"version"` in `package.json` first for each new release.

## Build the iPhone app
This needs a **Mac** with **Xcode**. Run `npm install` then `npm run ios`, and press ▶ in Xcode.

## Windows desktop app
```
npm install
npm run desktop          ← opens the game in its own window
npm run desktop:build    ← makes an installer .exe in the "release" folder
```

## Files
- `src/art.ts` – garden drawings and buttons
- `src/audio.ts` – sound effects and music
- `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` – phone install
- `src/objects/MergeLogic.ts` – game rules
- `src/levels.ts` – add or edit levels here
- `src/scenes/MenuScene.ts` – main menu
- `src/scenes/GameScene.ts` – the board and gameplay
- `src/save.ts` – saving progress

## Next steps
Week 5: art and sound. Week 7: PWA and web release. Week 8: Capacitor mobile apps. Week 9: Tauri desktop app.
- `src/i18n.ts` – English and Arabic text (add more languages here)
- `src/daily.ts` – Daily Challenge rules and streak
- `src/album.ts` – Garden Album visitors and how to unlock them
- `src/scenes/AlbumScene.ts` – the Album screen
- `src/season.ts` – seasons, Ramadan and Eid dates, colours
- `src/custom.ts`, `src/scenes/EditorScene.ts` – Level Editor and share codes
- `src/garden.ts`, `src/scenes/GardenScene.ts` – My Garden
