export class UIController {
  constructor(videoCore, subtitleEngine, audioCore, themeManager, particleEngine) {
    this.vc = videoCore;
    this.subEngine = subtitleEngine;
    this.audioCore = audioCore;
    this.themeManager = themeManager;
    this.pe = particleEngine;
    this.bindElements();
    this.bindVideoEvents();
    this.bindUIEvents();
    this.setupIdleTimer();
    this.speeds = [1, 1.25, 1.5, 2, 0.5];
    this.speedIndex = 0;
  }

  bindElements() {
    this.landing = document.getElementById('landing-screen');
    this.dropZoneWrapper = document.getElementById('drop-zone-wrapper');
    this.dropZone = document.getElementById('drop-zone');
    this.landingFileInput = document.getElementById('landing-file-input');
    this.playerContainer = document.getElementById('video-container');
    this.controlsOverlay = document.getElementById('controls-overlay');
    this.videoTitle = document.getElementById('video-title');
    this.btnBack = document.getElementById('btn-back');
    this.btnCenterPlay = document.getElementById('btn-center-play');
    this.btnPlay = document.getElementById('btn-play');
    this.progressContainer = document.getElementById('progress-container');
    this.progressFill = document.getElementById('progress-fill');
    this.progressBuffer = document.getElementById('progress-buffer');
    this.progressThumb = document.getElementById('progress-thumb');
    this.progressTooltip = document.getElementById('progress-tooltip');
    this.btnMute = document.getElementById('btn-mute');
    this.volumeSlider = document.getElementById('volume-slider');
    this.timeCurrent = document.getElementById('time-current');
    this.timeDuration = document.getElementById('time-duration');
    this.btnSpeed = document.getElementById('btn-speed');
    this.btnSubtitle = document.getElementById('btn-subtitle');
    this.subIcon = document.getElementById('sub-icon');
    this.addSubInput = document.getElementById('add-sub-input');
    this.btnPip = document.getElementById('btn-pip');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnScreenshot = document.getElementById('btn-screenshot');
    this.btnSettings = document.getElementById('btn-settings');
    this.settingsModal = document.getElementById('settings-modal');
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // Pro Settings UI
    this.eqBands = document.querySelectorAll('.eq-band');
    this.fxBass = document.getElementById('fx-bass');
    this.fxTreble = document.getElementById('fx-treble');
    this.fxClarity = document.getElementById('fx-clarity');
    this.subSize = document.getElementById('sub-size');
    this.subColor = document.getElementById('sub-color');
    this.subBgOp = document.getElementById('sub-bg-opacity');
    this.subPos = document.getElementById('sub-pos');
    this.themeBtns = document.querySelectorAll('.theme-btn');
    this.audioTracksList = document.getElementById('audio-tracks-list');
    this.gestureFeedback = document.getElementById('gesture-feedback');
  }

  bindVideoEvents() {
    this.vc.on('play', () => {
      this.btnPlay.innerHTML = '<span class="material-symbols-rounded">pause</span>';
      this.btnCenterPlay.innerHTML = '<span class="material-symbols-rounded">pause</span>';
      this.playerContainer.classList.remove('paused');
      this.audioCore.init(); // Initialize audio context on first play!
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    });
    this.vc.on('pause', () => {
      this.btnPlay.innerHTML = '<span class="material-symbols-rounded">play_arrow</span>';
      this.btnCenterPlay.innerHTML = '<span class="material-symbols-rounded">play_arrow</span>';
      this.playerContainer.classList.add('paused');
      this.showControls();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });
    this.vc.on('timeupdate', (time) => {
      this.timeCurrent.textContent = this.formatTime(time);
      if (this.vc.state.duration) {
        const percent = (time / this.vc.state.duration) * 100;
        this.progressFill.style.width = `${percent}%`;
        this.progressThumb.style.left = `${percent}%`;
      }
    });
    this.vc.on('durationchange', (dur) => {
      this.timeDuration.textContent = this.formatTime(dur);
    });
    this.vc.on('progress', (bufferedTime) => {
      if (this.vc.state.duration) {
        const percent = (bufferedTime / this.vc.state.duration) * 100;
        this.progressBuffer.style.width = `${percent}%`;
      }
    });
    this.vc.on('loadedmetadata', () => {
      this.populateAudioTracks();
      // Restore volume
      const savedVol = localStorage.getItem('sn-volume');
      if (savedVol !== null) {
        this.volumeSlider.value = savedVol;
        this.vc.setVolume(parseFloat(savedVol));
        this.updateVolumeUI();
      }
    });
  }

  bindUIEvents() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', async () => {
        await this.vc.video.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.vc.pause();
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        this.vc.seek(this.vc.state.currentTime - 10);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        this.vc.seek(this.vc.state.currentTime + 10);
      });
    }

    this.btnPlay.addEventListener('click', () => this.vc.togglePlay());
    this.btnCenterPlay.addEventListener('click', () => this.vc.togglePlay());
    
    this.playerContainer.addEventListener('click', (e) => {
      const isControl = e.target.closest('.controls-row') || 
                        e.target.closest('.top-bar') || 
                        e.target.closest('button') || 
                        e.target.closest('input') || 
                        e.target.closest('.progress-container') ||
                        e.target.closest('.settings-modal');
      if (!isControl) {
        this.vc.togglePlay();
      }
    });

    this.mouseXPercent = 0.5;
    this.playerContainer.addEventListener('mousemove', (e) => {
      const rect = this.playerContainer.getBoundingClientRect();
      this.mouseXPercent = (e.clientX - rect.left) / rect.width;
    });
    
    this.progressContainer.addEventListener('click', (e) => {
      const rect = this.progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      this.vc.seek(pos * this.vc.state.duration);
    });
    
    let isDragging = false;
    this.progressContainer.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const rect = this.progressContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        this.vc.seek(pos * this.vc.state.duration);
      }
    });

    this.progressContainer.addEventListener('mousemove', (e) => {
      const rect = this.progressContainer.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      this.progressTooltip.style.left = `${pos * 100}%`;
      this.progressTooltip.textContent = this.formatTime(pos * this.vc.state.duration);
    });

    this.btnMute.addEventListener('click', () => {
      this.vc.setMuted(!this.vc.state.isMuted);
      this.updateVolumeUI();
    });
    this.volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.vc.setVolume(val);
      localStorage.setItem('sn-volume', val);
      if (val > 0 && this.vc.state.isMuted) this.vc.setMuted(false);
      if (val === 0) this.vc.setMuted(true);
      this.updateVolumeUI();
    });

    this.btnSpeed.addEventListener('click', () => {
      this.speedIndex = (this.speedIndex + 1) % this.speeds.length;
      const spd = this.speeds[this.speedIndex];
      this.vc.setPlaybackRate(spd);
      this.btnSpeed.textContent = spd + 'x';
    });
    
    this.btnSubtitle.addEventListener('click', () => {
      const enabled = this.subEngine.toggle();
      this.subIcon.textContent = enabled ? 'subtitles' : 'subtitles_off';
      this.btnSubtitle.classList.toggle('active', enabled);
    });

    this.addSubInput.addEventListener('click', () => { this.addSubInput.value = ''; });
    this.addSubInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        this.subEngine.loadSubtitle(e.target.files[0]);
        this.subIcon.textContent = 'subtitles';
        this.btnSubtitle.classList.add('active');
        this.subEngine.enabled = true;
      }
    });

    this.btnPip.addEventListener('click', () => this.vc.togglePiP());
    this.btnFullscreen.addEventListener('click', () => this.vc.toggleFullscreen(this.playerContainer));
    this.btnScreenshot.addEventListener('click', () => this.vc.captureScreenshot());
    
    this.btnSettings.addEventListener('click', () => this.settingsModal.classList.toggle('hidden'));
    this.btnCloseSettings.addEventListener('click', () => this.settingsModal.classList.add('hidden'));

    this.btnBack.addEventListener('click', () => {
      this.vc.unload();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.metadata = null;
      }
      if (this.currentVideoUrl) {
        URL.revokeObjectURL(this.currentVideoUrl);
        this.currentVideoUrl = null;
      }
      this.subEngine.clear();
      this.subEngine.enabled = false;
      this.videoTitle.textContent = 'No Video Loaded';
      this.subIcon.textContent = 'subtitles_off';
      this.btnSubtitle.classList.remove('active');
      
      this.landingFileInput.value = '';
      if (this.addSubInput) this.addSubInput.value = '';
      const addAudioTrackInput = document.getElementById('add-audio-track-input');
      if (addAudioTrackInput) addAudioTrackInput.value = '';

      this.landing.classList.add('active');
      this.settingsModal.classList.add('hidden');
      this.dropZone.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
      this.pe.start();
    });

    this.landingFileInput.addEventListener('click', () => { this.landingFileInput.value = ''; });
    this.landingFileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    this.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); this.dropZone.classList.add('dragover'); });
    this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('dragover'));
    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });

    this.controlsOverlay.addEventListener('dragover', (e) => e.preventDefault());
    this.controlsOverlay.addEventListener('drop', (e) => {
      e.preventDefault();
      this.handleFiles(e.dataTransfer.files);
    });

    // Add external audio track
    const addAudioTrackInput = document.getElementById('add-audio-track-input');
    if (addAudioTrackInput) {
      addAudioTrackInput.addEventListener('click', () => { addAudioTrackInput.value = ''; });
      addAudioTrackInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          Array.from(e.target.files).forEach(file => {
            this.vc.addExternalAudio(file);
          });
          this.populateAudioTracks();
        }
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (this.landing.classList.contains('active')) return;
      if (e.target.tagName === 'INPUT') return; // Don't trigger if typing in settings
      switch(e.key) {
        case ' ':
        case 'k': e.preventDefault(); this.vc.togglePlay(); break;
        case 'ArrowRight': this.vc.seek(this.vc.state.currentTime + 5); break;
        case 'ArrowLeft': this.vc.seek(this.vc.state.currentTime - 5); break;
        case 'ArrowUp': 
          e.preventDefault();
          if (this.mouseXPercent < 0.35) {
            this.volumeSlider.value = Math.min(1, parseFloat(this.volumeSlider.value) + 0.05);
            this.volumeSlider.dispatchEvent(new Event('input'));
            this.showFeedback(`🔊 ${Math.round(this.volumeSlider.value * 100)}%`);
          } else if (this.mouseXPercent > 0.65) {
            this.vc.state.brightness = Math.min(2, (this.vc.state.brightness || 1) + 0.1);
            this.vc.setBrightness(this.vc.state.brightness);
            this.showFeedback(`☀️ ${Math.round(this.vc.state.brightness * 100)}%`);
          } else {
            this.volumeSlider.value = Math.min(1, parseFloat(this.volumeSlider.value) + 0.05);
            this.volumeSlider.dispatchEvent(new Event('input'));
            this.showFeedback(`🔊 ${Math.round(this.volumeSlider.value * 100)}%`);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (this.mouseXPercent < 0.35) {
            this.volumeSlider.value = Math.max(0, parseFloat(this.volumeSlider.value) - 0.05);
            this.volumeSlider.dispatchEvent(new Event('input'));
            this.showFeedback(`🔊 ${Math.round(this.volumeSlider.value * 100)}%`);
          } else if (this.mouseXPercent > 0.65) {
            this.vc.state.brightness = Math.max(0.1, (this.vc.state.brightness || 1) - 0.1);
            this.vc.setBrightness(this.vc.state.brightness);
            this.showFeedback(`☀️ ${Math.round(this.vc.state.brightness * 100)}%`);
          } else {
            this.volumeSlider.value = Math.max(0, parseFloat(this.volumeSlider.value) - 0.05);
            this.volumeSlider.dispatchEvent(new Event('input'));
            this.showFeedback(`🔊 ${Math.round(this.volumeSlider.value * 100)}%`);
          }
          break;
        case 'f': this.vc.toggleFullscreen(this.playerContainer); break;
        case 'm': this.btnMute.click(); break;
      }
      this.showControls();
    });

    // SETTINGS UI LOGIC
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabBtns.forEach(b => b.classList.remove('active'));
        this.tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });

    // Theme bindings
    this.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.themeManager.applyTheme(btn.dataset.theme);
      });
    });

    // Subtitle bindings
    const updateSubs = () => {
      this.subEngine.setStyles(this.subSize.value, this.subColor.value, this.subBgOp.value, this.subPos.value);
    };
    this.subSize.addEventListener('input', updateSubs);
    this.subColor.addEventListener('input', updateSubs);
    this.subBgOp.addEventListener('input', updateSubs);
    this.subPos.addEventListener('input', updateSubs);

    // Audio bindings
    this.eqBands.forEach(slider => {
      slider.addEventListener('input', (e) => {
        this.audioCore.setEqBand(parseInt(e.target.dataset.index), parseFloat(e.target.value));
      });
    });
    this.fxBass.addEventListener('input', (e) => this.audioCore.setBass(parseFloat(e.target.value)));
    this.fxTreble.addEventListener('input', (e) => this.audioCore.setTreble(parseFloat(e.target.value)));
    this.fxClarity.addEventListener('input', (e) => this.audioCore.setClarity(parseFloat(e.target.value)));
  }

  populateAudioTracks() {
    const tracks = this.vc.getAudioTracks();
    const externalTracks = this.vc.externalAudios || [];
    
    this.audioTracksList.innerHTML = '';
    
    let nativeHtml = '';
    
    if(tracks.length > 0) {
      for(let i = 0; i < tracks.length; i++) {
        nativeHtml += `<div class="track-item ${tracks[i].enabled && !this.vc.activeExternalAudio ? 'active' : ''}" data-type="native" data-index="${i}">Native: ${tracks[i].label || `Track ${i+1}`}</div>`;
      }
    } else {
      nativeHtml += `<div class="track-item ${!this.vc.activeExternalAudio ? 'active' : ''}" data-type="native" data-index="0">Default Video Audio</div>`;
    }

    let extHtml = '';
    externalTracks.forEach(t => {
      const isActive = this.vc.activeExternalAudio === t.element;
      extHtml += `<div class="track-item ${isActive ? 'active' : ''}" data-type="ext" data-id="${t.id}">Ext: ${t.name}</div>`;
    });

    this.audioTracksList.innerHTML = nativeHtml + extHtml;

    // Add click listeners
    const items = this.audioTracksList.querySelectorAll('.track-item');
    items.forEach(div => {
      div.addEventListener('click', () => {
        items.forEach(el => el.classList.remove('active'));
        div.classList.add('active');
        
        if (div.dataset.type === 'native') {
          this.vc.setExternalAudio('native');
          if (tracks.length > 0) {
            this.vc.setAudioTrack(parseInt(div.dataset.index));
          }
        } else {
          this.vc.setExternalAudio(div.dataset.id);
        }
      });
    });
  }

  handleFiles(files) {
    if (!files.length) return;
    const videoFile = Array.from(files).find(f => f.type.startsWith('video/') || f.name.endsWith('.mkv'));
    const subFile = Array.from(files).find(f => f.name.endsWith('.srt') || f.name.endsWith('.vtt'));
    
    if (videoFile) {
      if (this.currentVideoUrl) {
        URL.revokeObjectURL(this.currentVideoUrl);
      }
      this.videoTitle.textContent = videoFile.name;
      const url = URL.createObjectURL(videoFile);
      this.currentVideoUrl = url;
      this.vc.load(url);
      this.landing.classList.remove('active');
      this.pe.stop();
      this.landingFileInput.value = '';
      
      this.vc.video.tabIndex = -1;
      this.vc.video.focus();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: videoFile.name,
          artist: 'StreamNest',
        });
      }
    }
    
    if (subFile) {
      this.subEngine.loadSubtitle(subFile);
      this.subIcon.textContent = 'subtitles';
      this.btnSubtitle.classList.add('active');
      this.subEngine.enabled = true;
      if (this.addSubInput) this.addSubInput.value = '';
    }
  }

  updateVolumeUI() {
    if (this.vc.state.isMuted || this.vc.state.volume === 0) {
      this.btnMute.innerHTML = '<span class="material-symbols-rounded">volume_off</span>';
      this.volumeSlider.value = 0;
    } else {
      this.btnMute.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
      this.volumeSlider.value = this.vc.state.volume;
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  setupIdleTimer() {
    let idleTimer;
    const resetIdle = () => {
      this.showControls();
      clearTimeout(idleTimer);
      if (this.vc.state.isPlaying && this.settingsModal.classList.contains('hidden')) {
        idleTimer = setTimeout(() => this.hideControls(), 3000);
      }
    };
    
    this.playerContainer.addEventListener('mousemove', resetIdle);
    this.playerContainer.addEventListener('mousedown', resetIdle);
    this.controlsOverlay.addEventListener('mousemove', resetIdle);
    
    this.vc.on('play', resetIdle);
    this.vc.on('pause', () => { clearTimeout(idleTimer); this.showControls(); });
  }

  showFeedback(text) {
    if (!this.gestureFeedback) return;
    this.gestureFeedback.textContent = text;
    this.gestureFeedback.classList.remove('hidden');
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.gestureFeedback.classList.add('hidden');
    }, 1000);
  }

  showControls() {
    this.controlsOverlay.classList.remove('idle');
    this.playerContainer.style.cursor = 'default';
  }

  hideControls() {
    this.controlsOverlay.classList.add('idle');
    this.playerContainer.style.cursor = 'none';
  }
}
