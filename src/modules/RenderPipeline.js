import { controlBus, Events } from './ControlBus.js';
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
