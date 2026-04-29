import { controlBus, Events } from './ControlBus.js';
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
