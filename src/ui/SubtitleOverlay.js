import { controlBus } from '../modules/ControlBus.js';
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
        const lines = text.split('\n');
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
