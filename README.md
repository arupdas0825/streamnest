# 🎬 StreamNest

> **Your media, your nest. Stream anything, anywhere.**

A fully client-side, zero-backend, browser-native cinematic media player — built with vanilla HTML5, CSS3, and ES2022 JavaScript modules. No frameworks. No servers. No limits.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-Vanilla%20JS-yellow)
![Backend](https://img.shields.io/badge/backend-none-brightgreen)
![Vercel Ready](https://img.shields.io/badge/Vercel-ready-black)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Supported Formats](#supported-formats)
- [Module Reference](#module-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

StreamNest is a production-grade, browser-based media player that runs entirely on the client. Inspired by the UX of VLC and the elegance of modern streaming platforms, it provides a cinema-quality experience without requiring a single line of server code.

All media is handled locally via the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API) and `URL.createObjectURL()`. Subtitle files are parsed in-browser. HLS and MPEG-DASH streams are decoded via lazy-loaded CDN libraries. Everything is stateless, memory-safe, and Vercel-deployable in one click.

---

## Live Demo

```
https://streamnest.vercel.app
```

---

## Features

### Phase 1 — Core Playback
- File picker with MIME type detection from file header bytes (not just extension)
- Drag-and-drop file zone with animated accept/reject state
- Auto-play on file selection
- Supports `mp4`, `webm`, `ogg`, `mp3`, `flac`, `aac`, `wav`
- MKV support where browser codec permits

### Phase 2 — Player Controls
- Custom control bar (no native `<video controls>`)
- Play / Pause toggle
- Seek bar with played position, buffered range, and hover time preview
- Volume slider with mute/unmute toggle
- Fullscreen via Fullscreen API (with iOS `webkitEnterFullscreen` fallback)
- Picture-in-Picture via PiP API (auto-hidden when unsupported)
- Auto-hiding controls after 3s inactivity when playing

### Phase 3 — Subtitle Support
- Upload `.srt` or `.vtt` subtitle files
- Full SRT → VTT conversion in-browser (no server)
- Custom subtitle overlay rendering (not native `<track>` rendering)
- Toggle subtitles ON / OFF
- Subtitle sync offset correction (`setOffset(ms)`)
- BOM handling and multi-line cue support

### Phase 4 — UI / UX Design
- Deep dark glassmorphism aesthetic
- `backdrop-filter: blur(20px) saturate(1.8)` frosted-glass panels
- Typography: `Instrument Serif` (display) + `DM Sans` (UI) + `DM Mono` (timecodes)
- Amber (`#F59E0B`) and Teal (`#2DD4BF`) accent system
- Smooth 200ms fade transitions on control visibility
- Fully responsive layout via `ResizeObserver`

### Phase 5 — Advanced Features
- Playback speed control: `0.25x` → `0.5x` → `0.75x` → `1x` → `1.25x` → `1.5x` → `2x`
- Full keyboard shortcut system (see [Keyboard Shortcuts](#keyboard-shortcuts))
- Shortcut help overlay triggered by `?`
- HLS stream playback via lazy-loaded `hls.js`
- MPEG-DASH via lazy-loaded `dash.js`
- Waveform visualizer for audio files (Web Audio API + Canvas2D)
- Audio track switching for multi-language files (where `AudioTrackList` is supported)
- Non-blocking toast notifications for all state changes

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Input Layer                    │
│  File picker · Drag & Drop · URL / Stream   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              FileEngine                     │
│  URL.createObjectURL · MIME detect · Blob   │
└──────┬──────────────┬────────────┬──────────┘
       │              │            │
┌──────▼──────┐ ┌─────▼─────┐ ┌───▼──────────┐
│  VideoCore  │ │ AudioCore  │ │  StreamCore  │
│ HTMLVideo   │ │ HTMLAudio  │ │ hls / dash   │
└──────┬──────┘ └─────┬─────┘ └───┬──────────┘
       └──────────────┴───────────┘
                       │
┌──────────────────────▼──────────────────────┐
│           ControlBus (Event Dispatcher)      │
│  play·pause·seek·vol·speed·fullscreen·keys  │
└──────────────────────┬──────────────────────┘
                       │
         ┌─────────────┴─────────────┐
┌────────▼───────┐         ┌─────────▼──────────┐
│ SubtitleEngine │         │ AudioTrackManager   │
│ srt→vtt·cues   │         │ track enum·switch   │
└────────┬───────┘         └─────────┬──────────┘
         └─────────────┬─────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│              RenderPipeline                  │
│   Canvas2D · Fullscreen API · PiP API        │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│           UI Shell — StreamNest              │
│  Dark glass skin · controls · Vercel bundle  │
└─────────────────────────────────────────────┘
```

**Design principle:** Every module communicates exclusively through `ControlBus`. No direct cross-module method calls. All runtime state lives in a single `MediaState` plain object in `main.js`.

---

## Project Structure

```
streamnest/
├── index.html                    # App shell — imports module graph
├── style.css                     # Design tokens, global layout, dark theme
├── vite.config.js                # Vite config (dev server + build)
├── vercel.json                   # Vercel static deployment config
├── package.json
├── README.md
├── assets/
│   ├── fonts/                    # Self-hosted: Instrument Serif, DM Sans, DM Mono
│   └── icons/                    # SVG sprite for all UI controls
└── src/
    ├── main.js                   # Entry point, MediaState, module orchestration
    ├── modules/
    │   ├── FileEngine.js         # File ingestion, MIME detection, Blob lifecycle
    │   ├── VideoCore.js          # HTMLVideoElement wrapper + event surface
    │   ├── AudioCore.js          # HTMLAudioElement + Web Audio waveform
    │   ├── StreamCore.js         # hls.js / dash.js lazy integration
    │   ├── ControlBus.js         # Typed pub-sub event dispatcher
    │   ├── SubtitleEngine.js     # .srt parser → .vtt, TextTrack API, cue sync
    │   ├── AudioTrackManager.js  # Multi-audio track enumeration and switching
    │   ├── RenderPipeline.js     # Canvas2D overlay, Fullscreen API, PiP API
    │   └── KeyboardController.js # All shortcut bindings
    └── ui/
        ├── ControlBar.js         # Play/pause, seek, volume, speed, fullscreen
        ├── SubtitleOverlay.js    # Custom subtitle rendering layer
        ├── FileDropZone.js       # Drag-and-drop visual component
        └── Notifications.js      # Non-blocking toast system
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Structure | HTML5 | App shell, semantic media elements |
| Styling | CSS3 + Custom Properties | Design tokens, glassmorphism, animations |
| Logic | Vanilla JS (ES2022 modules) | All application logic, no framework |
| Build | Vite 5 | Dev server, HMR, static bundle |
| Streaming | hls.js (CDN, lazy) | HLS `.m3u8` stream playback |
| Streaming | dash.js (CDN, lazy) | MPEG-DASH `.mpd` stream playback |
| Audio viz | Web Audio API | Waveform analyser for audio files |
| Rendering | Canvas2D | Subtitle overlay, waveform, effects |
| Fonts | Instrument Serif + DM Sans | Display and UI typography |
| Deploy | Vercel | Static hosting, zero config |

---

## Getting Started

### Prerequisites

- Node.js `>=18.0.0`
- npm `>=9.0.0`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/streamnest.git
cd streamnest

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The dev server starts at `http://localhost:5173` and opens automatically.

### Build for Production

```bash
npm run build
```

Output is written to `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Keyboard Shortcuts

Press `?` at any time to show the shortcut overlay inside the player.

| Key | Action |
|---|---|
| `Space` | Play / Pause toggle |
| `←` / `→` | Seek backward / forward 5 seconds |
| `↑` / `↓` | Volume up / down 5% |
| `M` | Mute / Unmute toggle |
| `F` | Toggle fullscreen |
| `P` | Toggle Picture-in-Picture |
| `C` | Toggle subtitles |
| `1` – `9` | Seek to 10% – 90% of duration |
| `[` / `]` | Decrease / Increase playback speed |
| `?` | Show / hide keyboard shortcut overlay |

---

## Supported Formats

### Video
| Format | Container | Notes |
|---|---|---|
| H.264 / AVC | `.mp4` | Universal browser support |
| VP8 / VP9 | `.webm` | Chromium-based + Firefox |
| H.265 / HEVC | `.mp4` | Safari + hardware decode only |
| AV1 | `.webm` | Modern browsers |
| Matroska | `.mkv` | Limited — depends on codec inside |

### Audio
| Format | Notes |
|---|---|
| MP3 | Universal |
| AAC | Universal |
| FLAC | Chromium + Firefox |
| OGG Vorbis | Chromium + Firefox |
| WAV / PCM | Universal |

### Streaming
| Protocol | Library | Notes |
|---|---|---|
| HLS | `hls.js` (lazy CDN) | `.m3u8` — all browsers |
| HLS | Native | Safari (no library needed) |
| MPEG-DASH | `dash.js` (lazy CDN) | `.mpd` — all browsers |

### Subtitles
| Format | Notes |
|---|---|
| `.vtt` | Native WebVTT — direct TextTrack load |
| `.srt` | Parsed and converted to VTT in-browser |

---

## Module Reference

### `ControlBus.js`
Typed pub-sub event dispatcher built on `EventTarget`. All inter-module communication goes through this bus.

**Event types:** `PLAY` · `PAUSE` · `SEEK` · `VOLUME_CHANGE` · `MUTE_TOGGLE` · `SPEED_CHANGE` · `FULLSCREEN_TOGGLE` · `PIP_TOGGLE` · `SUBTITLE_LOAD` · `SUBTITLE_TOGGLE` · `AUDIO_TRACK_CHANGE` · `FILE_LOAD` · `ERROR`

### `FileEngine.js`
Handles all three ingestion paths: native file picker, drag-and-drop, and URL input. Performs MIME detection from file header bytes (not file extension). Manages `URL.createObjectURL()` / `URL.revokeObjectURL()` lifecycle. All blob URLs are revoked on file replacement and on page unload.

### `SubtitleEngine.js`
Parses `.srt` files into cue objects `{ id, startTime, endTime, text }`, converts SRT timecodes (`HH:MM:SS,mmm`) to VTT format (`HH:MM:SS.mmm`), serializes to VTT, creates a Blob URL, and attaches a `<track>` element. Handles BOM, HTML tags in cues (stripped), and missing sequence numbers.

### `AudioCore.js`
Wraps `HTMLAudioElement`. Connects to the Web Audio API `AnalyserNode` to drive a real-time waveform visualizer rendered on Canvas2D. Emits the same ControlBus event surface as VideoCore for interoperability.

### `StreamCore.js`
Detects HLS vs MPEG-DASH from URL pattern. Dynamically imports the correct library from CDN only when needed. Falls back to native HLS playback on Safari via `canPlayType` detection.

---

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy --prod
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

The included `vercel.json` configures:
- Static output from `dist/`
- SPA routing (all paths → `index.html`)
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

### Other Static Hosts

StreamNest deploys to any static host — Netlify, GitHub Pages, Cloudflare Pages, AWS S3 + CloudFront. Run `npm run build` and serve the `dist/` directory.

---

## Performance Budget

| Metric | Target |
|---|---|
| First paint (cold load, no media) | < 500ms |
| Time to interactive | < 800ms |
| JS bundle (gzipped, excl. CDN libs) | < 50KB |
| Seek bar `timeupdate` handler | < 2ms |
| Canvas frame render | 60fps target, 30fps floor |

---

## Roadmap

- [x] Phase 1 — File ingestion and core playback
- [x] Phase 2 — Custom control bar
- [x] Phase 3 — Subtitle engine (SRT + VTT)
- [x] Phase 4 — Dark glassmorphism UI
- [x] Phase 5 — Keyboard shortcuts + advanced controls
- [x] Phase 6 — HLS / MPEG-DASH streaming
- [ ] Chapter markers from MP4 metadata
- [ ] Thumbnail preview strip (VTT sprite-sheet or canvas extraction)
- [ ] Ambient mode (dominant color glow from current frame)
- [ ] PWA / Service Worker for offline app shell
- [ ] WebGL post-processing effects layer
- [ ] Custom equalizer via Web Audio API

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
# Make your changes
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a pull request
```

Please follow the existing module pattern — each new capability gets its own ES module file. No cross-module direct calls — all communication through `ControlBus`.

---

## License

MIT © 2026 StreamNest / Antigravity

---

<div align="center">

**StreamNest** — Not a media player. A cinema that lives in a tab.

Built with 🖤 and zero backends.

</div>