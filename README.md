# 🎬 StreamNest Pro

[![Status](https://img.shields.io/badge/Status-Production_Ready-success)](#) [![UI](https://img.shields.io/badge/UI-Glassmorphism-blue)](#) [![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS_+_Vite-yellow)](#)

**StreamNest Pro** is a premium, zero-backend, browser-native media player. Inspired by modern cinematic UX, it transforms your web browser into a professional-grade media application. Designed with a stunning glassmorphism interface, interactive ambient backgrounds, and deep OS-level media integration, StreamNest offers a truly immersive playback experience.

---
<img width="1600" height="685" alt="streamnest" src="https://github.com/user-attachments/assets/352df6d7-61f5-487c-9467-bcabbc23fafe" />


## ✨ Full Feature List

### 🎥 Playback & Media Handling
- **Local Media Support**: Seamlessly drag and drop `MP4`, `WebM`, and `MKV` files.
- **Multi-Audio Track Support**: Load external audio files to sync with videos (perfect for MKV files without native browser audio support).
- **Picture-in-Picture (PiP)**: Keep watching while navigating other apps.
- **Screenshot Capture**: Instantly snap high-quality PNG frames from your media.

### 🎛️ Pro Audio Engine (Web Audio API)
- **10-Band Equalizer**: Precision tuning from 32Hz to 16kHz.
- **Audio FX**: Dedicated controls for **Bass Boost**, **Treble**, and **Clarity**.

### 📝 Advanced Subtitle System
- **Drag & Drop Subtitles**: Drop `.srt` or `.vtt` files directly into the player.
- **Fully Customizable**: Adjust font size, text color, background opacity, and vertical position.

### 🖱️ Smart Interaction & Gesture System
- **Full-Screen Tap Controls**: Tap anywhere on the video to instantly toggle play/pause (smartly ignores UI control clicks).
- **Intelligent Cursor Zones**:
  - Hover the **Left** side + Arrow Keys ➡️ Adjust Volume.
  - Hover the **Right** side + Arrow Keys ➡️ Adjust Video Brightness.
- **Visual Feedback Overlays**: Sleek, auto-fading glassmorphism popups confirm volume (🔊) and brightness (☀️) changes.
- **Native OS Integration**: Full `navigator.mediaSession` support for hardware media keys, trackpad tap-to-pause gestures, and lock-screen controls.

### 🎨 Customization & Themes
- **Dynamic Themes**: Switch between curated aesthetics instantly (Cyberpunk, Neon Red, Matrix Green, Golden Cinema, Purple Haze).
- **Persistent Settings**: Your volume and theme choices are remembered locally.

---

## 💎 UI/UX Highlights

- **Cinematic Landing Page**: Features a smooth 3D tilt-effect drop zone and an interactive, floating particle background powered by a custom Canvas engine.
- **Animated Brand Identity**: The StreamNest logo uses animated gradient typography and floating micro-animations.
- **Glassmorphism Design**: Controls and overlays use premium background blurs (`backdrop-filter`) and sleek translucency.
- **Responsive & Fluid**: The player scales perfectly and hides controls smoothly when the cursor is idle.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, Vanilla CSS3
- **Build Tool**: Vite (Lightning-fast HMR and optimized production builds)
- **APIs Used**: 
  - `Web Audio API` (EQ and FX)
  - `Media Session API` (Hardware integrations)
  - `HTML5 Video API` (Core playback)
  - `Canvas API` (Background particle engine)
- **Zero Backend**: 100% static, client-side processing ensuring ultimate privacy and security.

---

## ⌨️ Controls & Shortcuts

StreamNest includes an intuitive, full-screen keyboard and gesture control system:

| Action / Gesture | Result |
| :--- | :--- |
| **Tap anywhere** on video | Toggle Play / Pause |
| **Spacebar** / **K** | Toggle Play / Pause |
| **Left Zone** + `ArrowUp` / `ArrowDown` | Increase / Decrease Volume |
| **Right Zone** + `ArrowUp` / `ArrowDown` | Increase / Decrease Brightness |
| `ArrowRight` / `ArrowLeft` | Seek Forward / Backward (5 seconds) |
| `F` | Toggle Fullscreen |
| `M` | Toggle Mute |
| **Media Keys** (Keyboard/OS) | Play, Pause, Seek (10s) |

---

## 📸 Screenshots

*(Placeholders - Add actual images to the `public/screenshots` folder)*

### Landing Page
![Landing Page](./public/screenshots/landing.png)
*Cinematic drop zone with interactive particles and animated branding.*

### Player UI
![Player UI](./public/screenshots/player.png)
*Glassmorphism controls overlay with smart gesture feedback.*

### Settings Panel
![Settings Panel](./public/screenshots/settings.png)
*Pro Settings modal featuring the 10-band EQ and Theme customization.*

---

## 🚀 Installation & Local Setup

Running the project locally is incredibly fast and requires minimal setup.

```bash
# 1. Clone the repository
git clone https://github.com/arupdas0825/streamnest.git
cd streamnest

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will instantly be available at `http://localhost:5173/`.

---

## 🌍 Production / Deployment

StreamNest is optimized for high-performance static hosting on platforms like Vercel, Netlify, or GitHub Pages.

```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

### Vercel Deployment
The project includes a `vercel.json` configuration file, ensuring proper routing for Single Page Application (SPA) deployments. Connect the repository to Vercel and it will deploy automatically with zero-config required.

---

## ✍️ Author

**Arup**
