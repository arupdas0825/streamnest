export class VideoCore {
  constructor(videoElement) {
    this.video = videoElement;
    this.externalAudios = [];
    this.activeExternalAudio = null;
    this.state = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      playbackRate: 1,
      brightness: 1
    };
    this.listeners = {};
    
    this.video.addEventListener('timeupdate', () => {
      this.state.currentTime = this.video.currentTime;
      this.syncExternalAudio();
      this.emit('timeupdate', this.state.currentTime);
    });
    this.video.addEventListener('durationchange', () => {
      this.state.duration = this.video.duration;
      this.emit('durationchange', this.state.duration);
    });
    this.video.addEventListener('play', () => {
      this.state.isPlaying = true;
      if (this.activeExternalAudio) this.activeExternalAudio.play();
      this.emit('play');
    });
    this.video.addEventListener('pause', () => {
      this.state.isPlaying = false;
      if (this.activeExternalAudio) this.activeExternalAudio.pause();
      this.emit('pause');
    });
    this.video.addEventListener('seeked', () => {
      if (this.activeExternalAudio) this.activeExternalAudio.currentTime = this.video.currentTime;
    });
    this.video.addEventListener('waiting', () => {
      if (this.activeExternalAudio) this.activeExternalAudio.pause();
    });
    this.video.addEventListener('playing', () => {
      if (this.activeExternalAudio) this.activeExternalAudio.play();
    });
    this.video.addEventListener('progress', () => {
      if (this.video.buffered.length > 0) {
        this.emit('progress', this.video.buffered.end(this.video.buffered.length - 1));
      }
    });
    this.video.addEventListener('loadedmetadata', () => {
      this.state.duration = this.video.duration;
      this.emit('loadedmetadata');
    });
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  load(url) {
    this.video.src = url;
    this.video.load();
    this.play();
  }

  play() { this.video.play().catch(e => console.log('Autoplay prevented', e)); }
  pause() { this.video.pause(); }
  togglePlay() { this.video.paused ? this.play() : this.pause(); }
  
  unload() {
    this.pause();
    this.video.removeAttribute("src");
    this.video.load();
    this.state.currentTime = 0;
    
    // Clean up external audios
    if (this.externalAudios) {
      this.externalAudios.forEach(t => {
        t.element.pause();
        t.element.removeAttribute("src");
        t.element.load();
        if (t.url) URL.revokeObjectURL(t.url);
      });
      this.externalAudios = [];
    }
    this.activeExternalAudio = null;
  }
  
  seek(time) { 
    this.video.currentTime = Math.max(0, Math.min(time, this.state.duration)); 
    if (this.activeExternalAudio) {
      this.activeExternalAudio.currentTime = this.video.currentTime;
    }
  }
  
  setVolume(vol) { 
    this.video.volume = vol; 
    this.state.volume = vol; 
    if(this.activeExternalAudio) this.activeExternalAudio.volume = vol;
  }
  
  setMuted(muted) { 
    this.video.muted = muted; 
    this.state.isMuted = muted; 
    if(this.activeExternalAudio) this.activeExternalAudio.muted = muted;
  }
  
  setPlaybackRate(rate) { 
    this.video.playbackRate = rate; 
    this.state.playbackRate = rate; 
    if(this.activeExternalAudio) this.activeExternalAudio.playbackRate = rate;
  }
  
  setBrightness(val) {
    this.state.brightness = val;
    this.video.style.filter = `brightness(${val})`;
  }
  
  toggleFullscreen(container) {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  }

  togglePiP() {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      this.video.requestPictureInPicture();
    }
  }

  captureScreenshot() {
    const canvas = document.createElement('canvas');
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
    const dataURI = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURI;
    a.download = `StreamNest-Screenshot-${Date.now()}.png`;
    a.click();
  }

  getAudioTracks() {
    return this.video.audioTracks || [];
  }

  setAudioTrack(index) {
    if(this.video.audioTracks && this.video.audioTracks.length > index) {
      for (let i = 0; i < this.video.audioTracks.length; i++) {
        this.video.audioTracks[i].enabled = (i === index);
      }
    }
  }

  addExternalAudio(file) {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    const id = 'ext_' + Date.now() + Math.floor(Math.random()*1000);
    this.externalAudios.push({ id, name: file.name, url, element: audio });
    return this.externalAudios;
  }

  setExternalAudio(id) {
    if (this.activeExternalAudio) {
      this.activeExternalAudio.pause();
    }
    
    if (id === 'native') {
      this.activeExternalAudio = null;
      this.video.muted = this.state.isMuted;
    } else {
      const track = this.externalAudios.find(t => t.id === id);
      if (track) {
        this.activeExternalAudio = track.element;
        this.activeExternalAudio.volume = this.state.volume;
        this.activeExternalAudio.muted = this.state.isMuted;
        this.activeExternalAudio.playbackRate = this.state.playbackRate;
        this.activeExternalAudio.currentTime = this.video.currentTime;
        this.video.muted = true;
        if (this.state.isPlaying) {
          this.activeExternalAudio.play().catch(e => console.log('Audio autoplay prevented', e));
        }
      }
    }
  }

  syncExternalAudio() {
    if (this.activeExternalAudio && Math.abs(this.activeExternalAudio.currentTime - this.video.currentTime) > 0.3) {
      this.activeExternalAudio.currentTime = this.video.currentTime;
    }
  }
}
