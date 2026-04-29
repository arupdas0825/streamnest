import { controlBus, Events } from '../modules/ControlBus.js';
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
