export const Events = {
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
