import os

base_dir = r"C:\Users\Lenovo\.gemini\antigravity\scratch\streamnest"
os.makedirs(base_dir, exist_ok=True)

files = {
    "vercel.json": """{
  "buildCommand": null,
  "outputDirectory": ".",
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}""",
    "index.html": """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StreamNest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:wght@400;500;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="sn-player-container">
    <div class="sn-logo">StreamNest</div>
    <video id="sn-video" playsinline></video>
    <audio id="sn-audio"></audio>
    <canvas id="sn-canvas"></canvas>
    
    <div id="sn-dropzone" class="sn-dropzone">
      <p>Drop media here</p>
    </div>

    <div id="sn-controls-container"></div>
    <div id="sn-notifications" class="sn-notifications"></div>
    <div id="sn-shortcuts-overlay" class="sn-shortcuts-overlay" style="display:none;">
      <div class="shortcuts-panel">
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li><kbd>Space</kbd> Play / Pause</li>
          <li><kbd>←</kbd> <kbd>→</kbd> Seek ±5s</li>
          <li><kbd>↑</kbd> <kbd>↓</kbd> Volume ±5%</li>
          <li><kbd>F</kbd> Fullscreen</li>
          <li><kbd>M</kbd> Mute</li>
          <li><kbd>C</kbd> Subtitles</li>
          <li><kbd>P</kbd> Picture in Picture</li>
          <li><kbd>1-9</kbd> Seek 10%-90%</li>
        </ul>
      </div>
    </div>
  </div>
  <script type="module" src="src/main.js"></script>
</body>
</html>""",
    "style.css": """:root {
  --sn-bg-base: #0a0a0f;
  --sn-bg-surface: rgba(18, 18, 28, 0.92);
  --sn-bg-elevated: rgba(30, 30, 48, 0.85);
  --sn-accent-amber: #F59E0B;
  --sn-accent-teal: #2DD4BF;
  --sn-text-primary: #F1F0ED;
  --sn-text-secondary: #9998A3;
  --sn-border: rgba(255, 255, 255, 0.08);

  --sn-font-display: 'Instrument Serif', serif;
  --sn-font-body: 'DM Sans', sans-serif;
  --sn-font-mono: 'DM Mono', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--sn-bg-base);
  color: var(--sn-text-primary);
  font-family: var(--sn-font-body);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}

kbd {
  background: rgba(255,255,255,0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--sn-font-mono);
  font-size: 0.9em;
}

#sn-player-container {
  position: relative;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 16 / 9;
  background: var(--sn-bg-elevated);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

#sn-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

#sn-audio {
  display: none;
}

#sn-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sn-logo {
  position: absolute;
  top: 24px;
  left: 24px;
  font-family: var(--sn-font-display);
  font-size: 2.5rem;
  color: var(--sn-text-primary);
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  pointer-events: none;
  z-index: 10;
}

/* Glassmorphism Controls */
.sn-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24px;
  background: var(--sn-bg-surface);
  backdrop-filter: blur(20px) saturate(1.8);
  border-top: 1px solid var(--sn-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: opacity 200ms ease-out, transform 200ms ease-out;
  transform: translateY(0);
  z-index: 20;
}

.sn-controls.hidden {
  opacity: 0;
  transform: translateY(100%);
  pointer-events: none;
}

.sn-timeline {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;
}

.sn-timeline-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  pointer-events: none;
}

.sn-timeline-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--sn-accent-teal);
  border-radius: 3px;
  pointer-events: none;
}

.sn-timeline-head {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--sn-text-primary);
  border-radius: 50%;
  pointer-events: none;
  transition: transform 120ms;
}

.sn-timeline:hover .sn-timeline-head {
  transform: translate(-50%, -50%) scale(1.5);
}

.sn-timeline-tooltip {
  position: absolute;
  top: -30px;
  background: rgba(0,0,0,0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--sn-font-mono);
  font-size: 12px;
  transform: translateX(-50%);
  display: none;
}

.sn-timeline:hover .sn-timeline-tooltip {
  display: block;
}

.sn-controls-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sn-btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sn-btn {
  background: none;
  border: none;
  color: var(--sn-text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 150ms;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sn-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sn-btn svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.sn-time {
  font-family: var(--sn-font-mono);
  font-size: 14px;
  color: var(--sn-text-secondary);
  user-select: none;
}

/* Volume control */
.sn-volume-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sn-volume-slider {
  width: 80px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  height: 4px;
  border-radius: 2px;
  outline: none;
}
.sn-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--sn-text-primary);
  cursor: pointer;
}

/* Drop Zone */
.sn-dropzone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms;
}

.sn-dropzone.active {
  opacity: 1;
}

.sn-dropzone p {
  font-family: var(--sn-font-display);
  font-size: 3rem;
  color: var(--sn-accent-teal);
}

/* Shortcuts Overlay */
.sn-shortcuts-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(10px);
}

.shortcuts-panel {
  background: var(--sn-bg-surface);
  padding: 32px;
  border-radius: 12px;
  border: 1px solid var(--sn-border);
}

.shortcuts-panel h3 {
  margin-bottom: 16px;
  font-family: var(--sn-font-display);
  font-size: 2rem;
}

.shortcuts-panel ul {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Notifications */
.sn-notifications {
  position: absolute;
  bottom: 100px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 150;
}

.sn-toast {
  background: var(--sn-bg-elevated);
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid var(--sn-accent-amber);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: slideIn 300ms ease-out;
  transition: opacity 300ms, transform 300ms;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.sn-toast.error {
  border-left-color: #ef4444;
}

/* Subtitles Overlay */
.sn-subtitle-overlay {
  position: absolute;
  bottom: 120px;
  left: 0;
  width: 100%;
  text-align: center;
  pointer-events: none;
  z-index: 10;
}

.sn-subtitle-cue {
  display: inline-block;
  background: rgba(0,0,0,0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1.2rem;
  text-shadow: 1px 1px 2px black;
  margin: 2px 0;
}
""",
    "src/main.js": """import { controlBus, Events } from './modules/ControlBus.js';
import { FileEngine } from './modules/FileEngine.js';
import { VideoCore } from './modules/VideoCore.js';
import { AudioCore } from './modules/AudioCore.js';
import { StreamCore } from './modules/StreamCore.js';
import { RenderPipeline } from './modules/RenderPipeline.js';
import { KeyboardController } from './modules/KeyboardController.js';
import { ControlBar } from './ui/ControlBar.js';
import { SubtitleOverlay } from './ui/SubtitleOverlay.js';
import { FileDropZone } from './ui/FileDropZone.js';
import { Notifications } from './ui/Notifications.js';

export const MediaState = {
  src: null,
  type: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  subtitleTrack: null,
  audioTrack: null,
  isFullscreen: false,
  isPiP: false
};

class StreamNest {
  constructor() {
    this.videoElement = document.getElementById('sn-video');
    this.audioElement = document.getElementById('sn-audio');
    this.canvasElement = document.getElementById('sn-canvas');
    this.container = document.getElementById('sn-player-container');
    
    this.fileEngine = new FileEngine();
    this.videoCore = new VideoCore(this.videoElement);
    this.audioCore = new AudioCore(this.audioElement, this.canvasElement);
    this.streamCore = new StreamCore(this.videoElement);
    
    this.renderPipeline = new RenderPipeline(this.container, this.videoElement, this.canvasElement);
    this.keyboardController = new KeyboardController();
    
    this.controlBar = new ControlBar(document.getElementById('sn-controls-container'), this.fileEngine);
    this.subtitleOverlay = new SubtitleOverlay(this.container);
    this.fileDropZone = new FileDropZone(this.container, this.fileEngine);
    this.notifications = new Notifications(document.getElementById('sn-notifications'));

    this.activeCore = null;

    this.setupSubscriptions();
    
    // Initial UI state setup
    controlBus.dispatch(Events.VOLUME_CHANGE, 1);
  }

  setupSubscriptions() {
    controlBus.subscribe(Events.FILE_LOAD, this.handleFileLoad.bind(this));
    controlBus.subscribe(Events.ERROR, (err) => this.notifications.showError(err));
  }

  handleFileLoad({ src, type, coreType }) {
    if (this.activeCore && this.activeCore.cleanup) {
      this.activeCore.cleanup();
    }

    if (coreType === 'video') {
      this.activeCore = this.videoCore;
      this.videoElement.style.display = 'block';
      this.canvasElement.style.display = 'none';
    } else if (coreType === 'audio') {
      this.activeCore = this.audioCore;
      this.videoElement.style.display = 'none';
      this.canvasElement.style.display = 'block';
    } else if (coreType === 'stream') {
      this.activeCore = this.streamCore;
      this.videoElement.style.display = 'block';
      this.canvasElement.style.display = 'none';
    }

    MediaState.src = src;
    MediaState.type = type;
    this.activeCore.load(src);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.streamNest = new StreamNest();
});
""",
    "src/modules/ControlBus.js": """export const Events = {
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  SEEK: 'SEEK',
  VOLUME_CHANGE: 'VOLUME_CHANGE',
  MUTE_TOGGLE: 'MUTE_TOGGLE',
  SPEED_CHANGE: 'SPEED_CHANGE',
  FULLSCREEN_TOGGLE: 'FULLSCREEN_TOGGLE',
  PIP_TOGGLE: 'PIP_TOGGLE',
  SUBTITLE_LOAD: 'SUBTITLE_LOAD',
  SUBTITLE_TOGGLE: 'SUBTITLE_TOGGLE',
  AUDIO_TRACK_CHANGE: 'AUDIO_TRACK_CHANGE',
  FILE_LOAD: 'FILE_LOAD',
  ERROR: 'ERROR',
  TIME_UPDATE: 'TIME_UPDATE',
  DURATION_CHANGE: 'DURATION_CHANGE',
  ENDED: 'ENDED',
  BUFFERING: 'BUFFERING'
};

class ControlBus extends EventTarget {
  dispatch(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  subscribe(eventName, callback) {
    this.addEventListener(eventName, (e) => callback(e.detail));
  }
}

export const controlBus = new ControlBus();
""",
    "src/modules/FileEngine.js": """import { controlBus, Events } from './ControlBus.js';

export class FileEngine {
  constructor() {
    this.objectUrls = new Set();
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  async processFile(file) {
    try {
      // Create Object URL
      const url = URL.createObjectURL(file);
      this.objectUrls.add(url);
      
      const type = file.type;
      let coreType = 'video';
      
      if (type.startsWith('audio/')) {
        coreType = 'audio';
      } else if (file.name.endsWith('.m3u8') || file.name.endsWith('.mpd')) {
        coreType = 'stream';
      } else if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
        controlBus.dispatch(Events.SUBTITLE_LOAD, { file, url });
        return;
      }
      
      controlBus.dispatch(Events.FILE_LOAD, { src: url, type, coreType });
    } catch (err) {
      controlBus.dispatch(Events.ERROR, 'Failed to process file: ' + err.message);
    }
  }

  processUrl(url) {
    let coreType = 'video';
    if (url.endsWith('.m3u8') || url.endsWith('.mpd')) {
      coreType = 'stream';
    }
    controlBus.dispatch(Events.FILE_LOAD, { src: url, type: 'url', coreType });
  }

  cleanup() {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls.clear();
  }
}
""",
    "src/modules/VideoCore.js": """import { controlBus, Events } from './ControlBus.js';
import { MediaState } from '../main.js';

export class VideoCore {
  constructor(videoElement) {
    this.video = videoElement;
    this.setupListeners();
    this.setupBusSubscriptions();
  }

  setupListeners() {
    this.video.addEventListener('timeupdate', () => {
      MediaState.currentTime = this.video.currentTime;
      controlBus.dispatch(Events.TIME_UPDATE, { currentTime: this.video.currentTime, buffered: this.getBuffered() });
    });

    this.video.addEventListener('durationchange', () => {
      MediaState.duration = this.video.duration;
      controlBus.dispatch(Events.DURATION_CHANGE, this.video.duration);
    });

    this.video.addEventListener('play', () => {
      MediaState.isPlaying = true;
      controlBus.dispatch(Events.PLAY);
    });

    this.video.addEventListener('pause', () => {
      MediaState.isPlaying = false;
      controlBus.dispatch(Events.PAUSE);
    });

    this.video.addEventListener('ended', () => controlBus.dispatch(Events.ENDED));
    this.video.addEventListener('waiting', () => controlBus.dispatch(Events.BUFFERING, true));
    this.video.addEventListener('playing', () => controlBus.dispatch(Events.BUFFERING, false));
    this.video.addEventListener('error', (e) => controlBus.dispatch(Events.ERROR, 'Video playback error'));
  }

  setupBusSubscriptions() {
    controlBus.subscribe(Events.PLAY, () => { if (!MediaState.isPlaying) this.play(); });
    controlBus.subscribe(Events.PAUSE, () => { if (MediaState.isPlaying) this.pause(); });
    controlBus.subscribe(Events.SEEK, (time) => this.seek(time));
    controlBus.subscribe(Events.VOLUME_CHANGE, (vol) => this.setVolume(vol));
    controlBus.subscribe(Events.MUTE_TOGGLE, () => this.setMuted(!this.video.muted));
    controlBus.subscribe(Events.SPEED_CHANGE, (rate) => this.setPlaybackRate(rate));
  }

  getBuffered() {
    if (this.video.buffered.length > 0) {
      return this.video.buffered.end(this.video.buffered.length - 1);
    }
    return 0;
  }

  async load(src) {
    this.video.src = src;
    this.video.load();
    try {
      await this.video.play();
    } catch (e) {
      console.warn("Autoplay prevented");
    }
  }

  async play() { await this.video.play(); }
  pause() { this.video.pause(); }
  seek(seconds) { this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration)); }
  setVolume(vol) { this.video.volume = vol; MediaState.volume = vol; }
  setMuted(muted) { this.video.muted = muted; MediaState.isMuted = muted; }
  setPlaybackRate(rate) { this.video.playbackRate = rate; MediaState.playbackRate = rate; }
  
  cleanup() {
    this.pause();
    this.video.src = '';
    this.video.removeAttribute('src');
  }
}
""",
    "src/modules/AudioCore.js": """import { controlBus, Events } from './ControlBus.js';
import { MediaState } from '../main.js';

export class AudioCore {
  constructor(audioElement, canvasElement) {
    this.audio = audioElement;
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.animationId = null;
    
    this.setupListeners();
    this.setupBusSubscriptions();
  }

  setupListeners() {
    this.audio.addEventListener('timeupdate', () => {
      MediaState.currentTime = this.audio.currentTime;
      controlBus.dispatch(Events.TIME_UPDATE, { currentTime: this.audio.currentTime, buffered: this.getBuffered() });
    });

    this.audio.addEventListener('durationchange', () => {
      MediaState.duration = this.audio.duration;
      controlBus.dispatch(Events.DURATION_CHANGE, this.audio.duration);
    });

    this.audio.addEventListener('play', () => {
      MediaState.isPlaying = true;
      controlBus.dispatch(Events.PLAY);
      if(!this.audioContext) this.initWebAudio();
      else if(this.audioContext.state === 'suspended') this.audioContext.resume();
      this.drawWaveform();
    });

    this.audio.addEventListener('pause', () => {
      MediaState.isPlaying = false;
      controlBus.dispatch(Events.PAUSE);
      cancelAnimationFrame(this.animationId);
    });
  }

  setupBusSubscriptions() {
    controlBus.subscribe(Events.PLAY, () => { if (!MediaState.isPlaying) this.play(); });
    controlBus.subscribe(Events.PAUSE, () => { if (MediaState.isPlaying) this.pause(); });
    controlBus.subscribe(Events.SEEK, (time) => this.seek(time));
    controlBus.subscribe(Events.VOLUME_CHANGE, (vol) => this.setVolume(vol));
    controlBus.subscribe(Events.MUTE_TOGGLE, () => this.setMuted(!this.audio.muted));
  }

  initWebAudio() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.analyser.fftSize = 256;
  }

  drawWaveform() {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      this.animationId = requestAnimationFrame(draw);
      
      const width = this.canvas.width = this.canvas.clientWidth;
      const height = this.canvas.height = this.canvas.clientHeight;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      this.ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        this.ctx.fillStyle = `rgb(${barHeight + 100}, 212, 191)`; // Teal tint
        this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    draw();
  }

  getBuffered() {
    if (this.audio.buffered.length > 0) {
      return this.audio.buffered.end(this.audio.buffered.length - 1);
    }
    return 0;
  }

  async load(src) {
    this.audio.src = src;
    this.audio.load();
    try { await this.audio.play(); } catch(e) {}
  }

  async play() { await this.audio.play(); }
  pause() { this.audio.pause(); }
  seek(seconds) { this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration)); }
  setVolume(vol) { this.audio.volume = vol; MediaState.volume = vol; }
  setMuted(muted) { this.audio.muted = muted; MediaState.isMuted = muted; }
  
  cleanup() {
    this.pause();
    this.audio.src = '';
    this.audio.removeAttribute('src');
    if(this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
""",
    "src/modules/StreamCore.js": """import { controlBus, Events } from './ControlBus.js';
import { MediaState } from '../main.js';

export class StreamCore {
  constructor(videoElement) {
    this.video = videoElement;
    this.hls = null;
    this.dash = null;
    this.setupListeners();
    this.setupBusSubscriptions();
  }

  setupListeners() {
    this.video.addEventListener('timeupdate', () => {
      MediaState.currentTime = this.video.currentTime;
      controlBus.dispatch(Events.TIME_UPDATE, { currentTime: this.video.currentTime, buffered: this.getBuffered() });
    });
    this.video.addEventListener('durationchange', () => {
      MediaState.duration = this.video.duration;
      controlBus.dispatch(Events.DURATION_CHANGE, this.video.duration);
    });
    this.video.addEventListener('play', () => { MediaState.isPlaying = true; controlBus.dispatch(Events.PLAY); });
    this.video.addEventListener('pause', () => { MediaState.isPlaying = false; controlBus.dispatch(Events.PAUSE); });
  }

  setupBusSubscriptions() {
    controlBus.subscribe(Events.PLAY, () => { if (!MediaState.isPlaying) this.play(); });
    controlBus.subscribe(Events.PAUSE, () => { if (MediaState.isPlaying) this.pause(); });
    controlBus.subscribe(Events.SEEK, (time) => this.seek(time));
    controlBus.subscribe(Events.VOLUME_CHANGE, (vol) => this.setVolume(vol));
    controlBus.subscribe(Events.MUTE_TOGGLE, () => this.setMuted(!this.video.muted));
  }

  getBuffered() {
    if (this.video.buffered.length > 0) {
      return this.video.buffered.end(this.video.buffered.length - 1);
    }
    return 0;
  }

  async load(src) {
    if (src.endsWith('.m3u8')) {
      if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = src;
        this.video.addEventListener('loadedmetadata', () => this.video.play());
      } else {
        const Hls = (await import('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.mjs')).default;
        if (Hls.isSupported()) {
          this.hls = new Hls();
          this.hls.loadSource(src);
          this.hls.attachMedia(this.video);
          this.hls.on(Hls.Events.MANIFEST_PARSED, () => this.video.play());
        } else {
          controlBus.dispatch(Events.ERROR, 'HLS not supported in this browser');
        }
      }
    } else if (src.endsWith('.mpd')) {
      // DASH support via dash.js
      const dashjs = await import('https://cdn.jsdelivr.net/npm/dashjs@4.7.4/dist/dash.all.debug.js');
      this.dash = dashjs.MediaPlayer().create();
      this.dash.initialize(this.video, src, true);
    }
  }

  async play() { await this.video.play(); }
  pause() { this.video.pause(); }
  seek(seconds) { this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration)); }
  setVolume(vol) { this.video.volume = vol; MediaState.volume = vol; }
  setMuted(muted) { this.video.muted = muted; MediaState.isMuted = muted; }

  cleanup() {
    this.pause();
    if(this.hls) { this.hls.destroy(); this.hls = null; }
    if(this.dash) { this.dash.reset(); this.dash = null; }
    this.video.src = '';
  }
}
""",
    "src/modules/SubtitleEngine.js": """import { controlBus, Events } from './ControlBus.js';

export class SubtitleEngine {
  constructor(videoElement) {
    this.video = videoElement;
    this.cues = [];
    this.activeCue = null;
    
    controlBus.subscribe(Events.SUBTITLE_LOAD, ({file}) => this.parseFile(file));
    controlBus.subscribe(Events.TIME_UPDATE, ({currentTime}) => this.update(currentTime));
  }

  async parseFile(file) {
    const text = await file.text();
    if (file.name.endsWith('.srt')) {
      this.cues = this.parseSRT(text);
    } else if (file.name.endsWith('.vtt')) {
      this.cues = this.parseVTT(text);
    }
    controlBus.dispatch('SUBTITLE_PARSED', this.cues);
  }

  parseSRT(data) {
    const srt = data.replace(/\\r/g, '');
    const regex = /\\d+\\n(\\d{2}:\\d{2}:\\d{2},\\d{3}) --> (\\d{2}:\\d{2}:\\d{2},\\d{3})\\n([\\s\\S]*?)(?=\\n\\n|\\n*$)/g;
    let cues = [];
    let match;
    while ((match = regex.exec(srt)) !== null) {
      cues.push({
        startTime: this.timeMs(match[1]),
        endTime: this.timeMs(match[2]),
        text: match[3].trim()
      });
    }
    return cues;
  }

  parseVTT(data) {
    const vtt = data.replace(/\\r/g, '');
    const regex = /(\\d{2}:)?(\\d{2}:\\d{2}\\.\\d{3}) --> (\\d{2}:)?(\\d{2}:\\d{2}\\.\\d{3})\\n([\\s\\S]*?)(?=\\n\\n|\\n*$)/g;
    let cues = [];
    let match;
    while ((match = regex.exec(vtt)) !== null) {
      cues.push({
        startTime: this.timeMs(match[2] ? match[1]+match[2] : match[2]), // Simplified
        endTime: this.timeMs(match[4] ? match[3]+match[4] : match[4]),
        text: match[5].trim()
      });
    }
    return cues;
  }

  timeMs(val) {
    if(!val) return 0;
    const match = val.match(/(?:(\\d{2}):)?(\\d{2}):(\\d{2})[,\\.](\\d{3})/);
    if(!match) return 0;
    const h = match[1] ? parseInt(match[1]) : 0;
    return (h * 3600 + parseInt(match[2]) * 60 + parseInt(match[3])) * 1000 + parseInt(match[4]);
  }

  update(timeSeconds) {
    if(!this.cues.length) return;
    const timeMs = timeSeconds * 1000;
    const cue = this.cues.find(c => timeMs >= c.startTime && timeMs <= c.endTime);
    if(cue !== this.activeCue) {
      this.activeCue = cue;
      controlBus.dispatch('SUBTITLE_CUE_CHANGE', cue ? cue.text : null);
    }
  }
}
""",
    "src/modules/AudioTrackManager.js": """import { controlBus, Events } from './ControlBus.js';

export class AudioTrackManager {
  constructor(videoElement) {
    this.video = videoElement;
  }
  
  getTracks() {
    if(this.video.audioTracks) {
      return Array.from(this.video.audioTracks);
    }
    return [];
  }
  
  switchTrack(index) {
    if(!this.video.audioTracks) return;
    for(let i=0; i<this.video.audioTracks.length; i++) {
      this.video.audioTracks[i].enabled = (i === index);
    }
  }
}
""",
    "src/modules/RenderPipeline.js": """import { controlBus, Events } from './ControlBus.js';
import { MediaState } from '../main.js';

export class RenderPipeline {
  constructor(container, video) {
    this.container = container;
    this.video = video;

    this.setupListeners();
    this.setupBusSubscriptions();
  }

  setupListeners() {
    document.addEventListener('fullscreenchange', () => {
      MediaState.isFullscreen = !!document.fullscreenElement;
    });
  }

  setupBusSubscriptions() {
    controlBus.subscribe(Events.FULLSCREEN_TOGGLE, () => this.toggleFullscreen());
    controlBus.subscribe(Events.PIP_TOGGLE, () => this.togglePiP());
  }

  async toggleFullscreen() {
    if (!document.fullscreenElement) {
      await this.container.requestFullscreen().catch(err => {
        controlBus.dispatch(Events.ERROR, 'Fullscreen denied');
      });
    } else {
      await document.exitFullscreen();
    }
  }

  async togglePiP() {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      MediaState.isPiP = false;
    } else if (document.pictureInPictureEnabled) {
      await this.video.requestPictureInPicture();
      MediaState.isPiP = true;
    }
  }
}
""",
    "src/modules/KeyboardController.js": """import { controlBus, Events } from './ControlBus.js';
import { MediaState } from '../main.js';

export class KeyboardController {
  constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        controlBus.dispatch(MediaState.isPlaying ? Events.PAUSE : Events.PLAY);
        break;
      case 'arrowleft':
        e.preventDefault();
        controlBus.dispatch(Events.SEEK, MediaState.currentTime - 5);
        break;
      case 'arrowright':
        e.preventDefault();
        controlBus.dispatch(Events.SEEK, MediaState.currentTime + 5);
        break;
      case 'arrowup':
        e.preventDefault();
        controlBus.dispatch(Events.VOLUME_CHANGE, Math.min(1, MediaState.volume + 0.05));
        break;
      case 'arrowdown':
        e.preventDefault();
        controlBus.dispatch(Events.VOLUME_CHANGE, Math.max(0, MediaState.volume - 0.05));
        break;
      case 'f':
        e.preventDefault();
        controlBus.dispatch(Events.FULLSCREEN_TOGGLE);
        break;
      case 'm':
        e.preventDefault();
        controlBus.dispatch(Events.MUTE_TOGGLE);
        break;
      case 'p':
        e.preventDefault();
        controlBus.dispatch(Events.PIP_TOGGLE);
        break;
      case '?':
        e.preventDefault();
        const overlay = document.getElementById('sn-shortcuts-overlay');
        overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
        break;
    }

    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const percent = parseInt(e.key) / 10;
      controlBus.dispatch(Events.SEEK, MediaState.duration * percent);
    }
  }
}
""",
    "src/ui/ControlBar.js": """import { controlBus, Events } from '../modules/ControlBus.js';
import { MediaState } from '../main.js';

export class ControlBar {
  constructor(container, fileEngine) {
    this.container = container;
    this.fileEngine = fileEngine;
    this.render();
    this.bindEvents();
    this.setupBusSubscriptions();
    
    this.hideTimeout = null;
    this.setupAutoHide();
  }

  setupAutoHide() {
    const reset = () => {
      this.el.classList.remove('hidden');
      clearTimeout(this.hideTimeout);
      if (MediaState.isPlaying) {
        this.hideTimeout = setTimeout(() => this.el.classList.add('hidden'), 3000);
      }
    };
    
    document.getElementById('sn-player-container').addEventListener('mousemove', reset);
    controlBus.subscribe(Events.PLAY, reset);
    controlBus.subscribe(Events.PAUSE, () => {
      clearTimeout(this.hideTimeout);
      this.el.classList.remove('hidden');
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="sn-controls" id="sn-controls">
        <div class="sn-timeline" id="sn-timeline">
          <div class="sn-timeline-buffer" id="sn-buffer"></div>
          <div class="sn-timeline-progress" id="sn-progress"></div>
          <div class="sn-timeline-head" id="sn-head"></div>
          <div class="sn-timeline-tooltip" id="sn-tooltip">00:00</div>
        </div>
        <div class="sn-controls-buttons">
          <div class="sn-btn-group">
            <label class="sn-btn">
              <input type="file" id="sn-file-input" accept="video/*,audio/*,.srt,.vtt" style="display:none;">
              <svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
            </label>
            <button class="sn-btn" id="sn-play-btn">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <div class="sn-time" id="sn-time-display">00:00 / 00:00</div>
          </div>
          <div class="sn-btn-group">
            <div class="sn-volume-wrapper">
              <button class="sn-btn" id="sn-mute-btn">
                <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              </button>
              <input type="range" class="sn-volume-slider" id="sn-volume" min="0" max="1" step="0.05" value="1">
            </div>
            <button class="sn-btn" id="sn-pip-btn">
              <svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/></svg>
            </button>
            <button class="sn-btn" id="sn-fs-btn">
              <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    this.el = document.getElementById('sn-controls');
    this.timeline = document.getElementById('sn-timeline');
    this.progress = document.getElementById('sn-progress');
    this.buffer = document.getElementById('sn-buffer');
    this.head = document.getElementById('sn-head');
    this.tooltip = document.getElementById('sn-tooltip');
    this.timeDisplay = document.getElementById('sn-time-display');
  }

  bindEvents() {
    document.getElementById('sn-play-btn').addEventListener('click', () => {
      controlBus.dispatch(MediaState.isPlaying ? Events.PAUSE : Events.PLAY);
    });

    document.getElementById('sn-fs-btn').addEventListener('click', () => {
      controlBus.dispatch(Events.FULLSCREEN_TOGGLE);
    });
    
    document.getElementById('sn-pip-btn').addEventListener('click', () => {
      controlBus.dispatch(Events.PIP_TOGGLE);
    });

    document.getElementById('sn-mute-btn').addEventListener('click', () => {
      controlBus.dispatch(Events.MUTE_TOGGLE);
    });

    document.getElementById('sn-volume').addEventListener('input', (e) => {
      controlBus.dispatch(Events.VOLUME_CHANGE, parseFloat(e.target.value));
    });

    document.getElementById('sn-file-input').addEventListener('change', (e) => {
      if(e.target.files.length) this.fileEngine.processFile(e.target.files[0]);
    });

    this.timeline.addEventListener('click', (e) => {
      if(!MediaState.duration) return;
      const rect = this.timeline.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      controlBus.dispatch(Events.SEEK, pos * MediaState.duration);
    });

    this.timeline.addEventListener('mousemove', (e) => {
      if(!MediaState.duration) return;
      const rect = this.timeline.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.tooltip.style.left = `${pos * 100}%`;
      this.tooltip.textContent = this.formatTime(pos * MediaState.duration);
    });
  }

  setupBusSubscriptions() {
    controlBus.subscribe(Events.TIME_UPDATE, ({currentTime, buffered}) => {
      if(!MediaState.duration) return;
      const percent = (currentTime / MediaState.duration) * 100;
      this.progress.style.width = `${percent}%`;
      this.head.style.left = `${percent}%`;
      
      const bufPercent = (buffered / MediaState.duration) * 100;
      this.buffer.style.width = `${bufPercent}%`;
      
      this.timeDisplay.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(MediaState.duration)}`;
    });

    controlBus.subscribe(Events.PLAY, () => {
      document.getElementById('sn-play-btn').innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    });

    controlBus.subscribe(Events.PAUSE, () => {
      document.getElementById('sn-play-btn').innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    });

    controlBus.subscribe(Events.VOLUME_CHANGE, (vol) => {
      document.getElementById('sn-volume').value = vol;
      const muteBtn = document.getElementById('sn-mute-btn');
      if(vol === 0 || MediaState.isMuted) {
        muteBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
      } else {
        muteBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
      }
    });
  }

  formatTime(seconds) {
    if(isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
""",
    "src/ui/SubtitleOverlay.js": """import { controlBus } from '../modules/ControlBus.js';
import { SubtitleEngine } from '../modules/SubtitleEngine.js';

export class SubtitleOverlay {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'sn-subtitle-overlay';
    this.container.appendChild(this.el);
    
    // We instantiate SubtitleEngine here for simplicity in this architecture
    // though ideally it might be managed by main.js
    this.engine = new SubtitleEngine(document.getElementById('sn-video'));

    controlBus.subscribe('SUBTITLE_CUE_CHANGE', (text) => {
      this.el.innerHTML = '';
      if(text) {
        const lines = text.split('\\n');
        lines.forEach(line => {
          const span = document.createElement('div');
          span.className = 'sn-subtitle-cue';
          span.textContent = line; // auto strips HTML somewhat
          this.el.appendChild(span);
        });
      }
    });
  }
}
""",
    "src/ui/FileDropZone.js": """export class FileDropZone {
  constructor(container, fileEngine) {
    this.container = container;
    this.fileEngine = fileEngine;
    this.el = document.getElementById('sn-dropzone');
    this.bindEvents();
  }

  bindEvents() {
    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.el.classList.add('active');
    });

    this.container.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.el.classList.remove('active');
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      this.el.classList.remove('active');
      if (e.dataTransfer.files.length > 0) {
        this.fileEngine.processFile(e.dataTransfer.files[0]);
      }
    });
  }
}
""",
    "src/ui/Notifications.js": """export class Notifications {
  constructor(container) {
    this.container = container;
  }

  show(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `sn-toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.show(message, true);
  }
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Project generated successfully.")
