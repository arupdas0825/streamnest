import { controlBus, Events } from './ControlBus.js';

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
