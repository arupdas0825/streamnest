import { controlBus, Events } from './ControlBus.js';

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
