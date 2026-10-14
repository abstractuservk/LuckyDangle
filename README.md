# ✨ LuckyDangle for Windows

An interactive, swaying digital charm & talisman overlay for Windows, built from scratch with Electron and Verlet rope physics. Hang cultural talismans, lucky charms, or custom ornaments from the top edge of your screen that sway as you work, react to your cursor, and stay out of your way with seamless click-through transparency.

---

## 🌟 Features

- **Verlet Rope & Pendulum Physics**: Realistic multi-segment rope simulation with gravity, air resistance, tension constraints, and inertia.
- **Interactive Cursor Interactions**:
  - **Grab & Drag**: Click and drag any charm to stretch the cord.
  - **Flick & Release**: Release with motion to impart angular momentum and swing the talisman.
  - **Aerodynamic Breeze**: Moving your cursor briskly past the charm imparts gentle air displacement, making it sway naturally.
  - **Daruma Eye Wishing**: Click on the left eye of the Daruma doll to fill it in and make a wish (true to Japanese tradition)!
- **Seamless Click-Through Transparency**:
  - Borderless, transparent, always-on-top window.
  - Only the charm, string, and controls intercept mouse clicks.
  - Clicking anywhere else passes right through to whatever window is behind it (Chrome, VS Code, games, desktop).
- **Reposition Anywhere**: Grab the sleek grip handle at the ceiling to slide the dangle anywhere horizontally across your screen.
- **5 Built-in Cultural Charms & Custom Support**:
  - 🧿 **Evil Eye (Nazar Boncuğu)**: Handcrafted Turkish blown-glass talisman with concentric rings and specular highlights.
  - 🌶️ **Nimbu-Mirchi**: Authentic Indian talisman with 7 curved green chilies, plump textured yellow lemon, and protective charcoal.
  - 🎎 **Japanese Daruma**: Vermilion tumbling doll with crane eyebrows, tortoise beard, and interactive goal-setting eye pupils.
  - 🪙 **Feng Shui Lucky Coin**: Antique brass coin with square central hole, embossed 招財進寶 characters, endless Chinese knot, and waving red silk tassel.
  - 🎐 **Temple Wind Chime (Furin)**: Bronze temple bell with fluttering Tanzaku paper strip.
  - 🖼️ **Custom Charm**: Load any PNG, JPEG, or SVG image to dangle your own custom talisman.
- **Procedural Sound Engine**:
  - Web Audio API synthesized glass chimes, wooden clacks, brass coin jingles, and string plucks. No missing audio files.
- **Windows System Tray Integration**:
  - Custom tray icon in notification area with quick-switch charm presets, settings toggle, position reset, sound toggle, and exit.

---

## 🚀 How to Run

From the project directory:

```bash
cd C:\Users\pooja\LuckyDangle
npm start
```

### Auto-start with Windows (Optional)
To have LuckyDangle run automatically on startup:
1. Press `Win + R`, type `shell:startup`, and press Enter.
2. Create a shortcut to `npm start` or create a `.bat` file containing:
   ```bat
   @echo off
   cd /d "C:\Users\pooja\LuckyDangle"
   start "" npx electron .
   ```

---

## 🎮 Controls & Shortcuts

| Action | Control |
|---|---|
| **Grab / Swing** | Click and hold the charm, move your mouse, and release. |
| **Move Anchor** | Drag the small pill handle at the top edge of the screen left or right. |
| **Open Settings** | Click the gear icon next to the top anchor or double-click the System Tray icon. |
| **Make a Wish** | Select the Daruma doll and click its blank eye to fill in the pupil! |
| **System Tray Menu** | Right-click the LuckyDangle icon in the Windows taskbar tray to change charms or mute sound. |
| **Custom Image** | In Settings, select **Custom** and click the dropzone to choose any PNG or SVG. |

---

## 🛠️ Project Structure

```
LuckyDangle/
├── main.js                  # Electron main process (transparent window, tray, cursor hit-testing)
├── preload.js               # IPC bridge between main and renderer
├── package.json             # App metadata & dependencies
├── assets/
│   └── icon.png             # Application & System Tray icon
├── scripts/
│   └── generate-icon.js     # Standalone icon generator
└── src/
    ├── index.html           # Main UI, canvas container, and settings drawer
    ├── css/
    │   └── style.css        # Glassmorphic UI styles
    └── js/
        ├── physics.js       # Verlet physics rope & pendulum simulation
        ├── audio.js         # Procedural sound synthesizer (Web Audio)
        ├── charms.js        # Procedural canvas vector renderers for all charms
        └── app.js           # Render loop, mouse handling, and click-through logic
```
