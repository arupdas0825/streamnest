import { controlBus, Events } from './ControlBus.js';
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
