import { PlaybackTracker } from './PlaybackTracker.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import GlobalPlayer from '../ui/GlobalPlayer.jsx';
import { formatTime } from '../utils/timeFormatter.js';
import { PlaylistManager } from './PlaylistManager.js';
import { ThumbnailGenerator } from '../utils/ThumbnailGenerator.js';
import { SkipTimingManager } from '../utils/SkipTimingManager.js';

export class UIController {
  constructor(videoCore, subtitleEngine, audioCore, themeManager, particleEngine) {
    this.vc = videoCore;
    this.subEngine = subtitleEngine;
    this.audioCore = audioCore;
    this.themeManager = themeManager;
    this.pe = particleEngine;
    this.playbackTracker = new PlaybackTracker(this.vc);
    this.resumePosition = 0;
    this.thumbnailGenerator = null;
    
    // Mount Global Player System
    this.renderGlobalPlayer();
    
    // Initialize Playlist Queue Manager
    this.playlistManager = new PlaylistManager(this);
    
    this.bindElements();
    this.bindVideoEvents();
    this.bindUIEvents();
    this.setupIdleTimer();
    this.speeds = [1, 1.25, 1.5, 2, 0.5];
    this.speedIndex = 0;
  }

  renderGlobalPlayer() {
    const container = document.getElementById('global-ui-root');
    if (!container) return;
    if (!this.globalRoot) {
      this.globalRoot = ReactDOM.createRoot(container);
    }
    this.globalRoot.render(
      <GlobalPlayer videoCore={this.vc} uiController={this} />
    );
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
    this.btnMinimize = document.getElementById('btn-minimize');
    this.btnCenterPlay = document.getElementById('btn-center-play');
    this.btnPlay = document.getElementById('btn-play');
    this.progressContainer = document.getElementById('progress-container');
    this.progressFill = document.getElementById('progress-fill');
    this.progressBuffer = document.getElementById('progress-buffer');
    this.progressThumb = document.getElementById('progress-thumb');
    this.progressTooltip = document.getElementById('progress-tooltip');
    this.seekPreviewImg = document.getElementById('seek-preview-img');
    this.seekPreviewSpinner = document.getElementById('seek-preview-spinner');
    this.seekPreviewTime = document.getElementById('seek-preview-time');
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
    
    // Playback Settings Elements
    this.settingAutoplay = document.getElementById('setting-autoplay');
    if (this.settingAutoplay) {
      const savedAutoplay = localStorage.getItem('sn-autoplay') !== 'false';
      this.settingAutoplay.checked = savedAutoplay;
    }
    this.settingSkipEnabled = document.getElementById('setting-skip-enabled');
    this.timingRecapStart = document.getElementById('timing-recap-start');
    this.timingRecapEnd = document.getElementById('timing-recap-end');
    this.timingIntroStart = document.getElementById('timing-intro-start');
    this.timingIntroEnd = document.getElementById('timing-intro-end');
    this.btnSaveTimings = document.getElementById('btn-save-timings');
    
    // Series & Episode Navigation Buttons
    this.btnPrevEp = document.getElementById('btn-prev-ep');
    this.btnNextEp = document.getElementById('btn-next-ep');
    this.btnPlaylist = document.getElementById('btn-playlist');
    this.btnRewind  = document.getElementById('btn-rewind');
    this.btnForward = document.getElementById('btn-forward');

    // Audio Tracks Elements
    this.btnAudioTracks = document.getElementById('btn-audio-tracks');
    this.addAudioTrackDrawerInput = document.getElementById('add-audio-track-drawer-input');
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
      this.emitAudioTracksUpdate();
      
      // Setup timeline thumbnail generator
      if (this.thumbnailGenerator) {
        this.thumbnailGenerator.destroy();
        this.thumbnailGenerator = null;
      }
      if (this.currentVideoUrl && this.vc.state.duration) {
        this.thumbnailGenerator = new ThumbnailGenerator(
          this.currentVideoUrl,
          this.vc.state.duration
        );
      }

      // Load Skip Timestamps for current episode
      if (this.playlistManager && this.vc.state.duration) {
        const currentEpisode = this.playlistManager.current();
        if (currentEpisode) {
          const timings = SkipTimingManager.getTimings(currentEpisode.id, this.vc.state.duration);
          if (this.timingRecapStart) this.timingRecapStart.value = timings.recapStart || '';
          if (this.timingRecapEnd) this.timingRecapEnd.value = timings.recapEnd || '';
          if (this.timingIntroStart) this.timingIntroStart.value = timings.introStart || '';
          if (this.timingIntroEnd) this.timingIntroEnd.value = timings.introEnd || '';
        }
      }
      
      // Handle Playback Resume
      if (this.resumePosition > 0) {
        console.log(`UI: Resuming at ${this.resumePosition}`);
        this.vc.seek(this.resumePosition);
        this.resumePosition = 0; // Reset after use
      }

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
    
    // Desktop Click -> Play/Pause
    this.playerContainer.addEventListener('click', (e) => {
      // Ignore if touch device
      if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) return;
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

    // Mobile Touch Gestures
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTapTime = 0;
    let isSwipe = false;
    let initialVolume = 0;
    let initialBrightness = 0;
    let activeSwipe = null;

    this.playerContainer.addEventListener('touchstart', (e) => {
      if (e.target.closest('.controls-row') || e.target.closest('.top-bar') || e.target.closest('.settings-modal') || e.target.closest('.progress-container')) return;
      
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      initialVolume = parseFloat(this.volumeSlider.value) || 1;
      initialBrightness = this.vc.state.brightness || 1;
      isSwipe = false;
      activeSwipe = null;
    }, {passive: true});

    this.playerContainer.addEventListener('touchmove', (e) => {
      if (e.target.closest('.controls-row') || e.target.closest('.top-bar') || e.target.closest('.settings-modal') || e.target.closest('.progress-container')) return;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const diffX = touchX - touchStartX;
      const diffY = touchY - touchStartY;

      if (!isSwipe && (Math.abs(diffX) > 20 || Math.abs(diffY) > 20)) {
        isSwipe = true;
        if (Math.abs(diffY) > Math.abs(diffX)) {
          const rect = this.playerContainer.getBoundingClientRect();
          if (touchStartX > rect.width / 2) {
            activeSwipe = 'volume';
          } else {
            activeSwipe = 'brightness';
          }
        }
      }

      if (isSwipe && activeSwipe) {
        if (e.cancelable) e.preventDefault();
        if (activeSwipe === 'volume') {
          const change = -diffY / 200;
          const newVol = Math.max(0, Math.min(1, initialVolume + change));
          this.vc.setVolume(newVol);
          this.volumeSlider.value = newVol;
          this.updateVolumeUI();
          this.showFeedback(`🔊 ${Math.round(newVol * 100)}%`);
        } else if (activeSwipe === 'brightness') {
          const change = -diffY / 200;
          const newBright = Math.max(0.1, Math.min(2, initialBrightness + change));
          this.vc.setBrightness(newBright);
          this.showFeedback(`☀️ ${Math.round(newBright * 100)}%`);
        }
      }
    }, {passive: false});

    this.playerContainer.addEventListener('touchend', (e) => {
      if (e.target.closest('.controls-row') || e.target.closest('.top-bar') || e.target.closest('.settings-modal') || e.target.closest('.progress-container')) return;
      
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;

      if (!isSwipe) {
        if (tapLength < 300 && tapLength > 0) {
          const rect = this.playerContainer.getBoundingClientRect();
          if (touchStartX > rect.width / 2) {
            this.vc.seek(this.vc.state.currentTime + 10);
            this.showFeedback('⏩ +10s');
          } else {
            this.vc.seek(this.vc.state.currentTime - 10);
            this.showFeedback('⏪ -10s');
          }
          if (e.cancelable) e.preventDefault();
          lastTapTime = 0;
        } else {
          if (this.controlsOverlay.classList.contains('idle')) {
            this.showControls();
          } else {
            this.hideControls();
          }
        }
      }
      lastTapTime = currentTime;
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
      
      this.progressTooltip.classList.remove('is-mobile');
      this.progressTooltip.style.left = `${pos * 100}%`;
      
      const targetTime = pos * this.vc.state.duration;
      this.seekPreviewTime.textContent = this.formatTime(targetTime);
      
      if (this.thumbnailGenerator) {
        this.seekPreviewSpinner.classList.remove('hidden');
        this.seekPreviewImg.classList.add('hidden');
        
        this.thumbnailGenerator.getThumbnail(targetTime, (dataUrl) => {
          if (dataUrl) {
            this.seekPreviewImg.src = dataUrl;
            this.seekPreviewImg.classList.remove('hidden');
            this.seekPreviewSpinner.classList.add('hidden');
          }
        });
      } else {
        this.seekPreviewSpinner.classList.add('hidden');
        this.seekPreviewImg.classList.add('hidden');
      }
    });

    // Touch screen mobile seek thumbnail dragging events
    const handleTouchUpdate = (e) => {
      if (!e.touches.length || !this.vc.state.duration) return;
      const rect = this.progressContainer.getBoundingClientRect();
      const touchX = e.touches[0].clientX;
      let pos = (touchX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      
      this.progressTooltip.classList.add('is-mobile');
      this.progressContainer.classList.add('is-active');
      this.progressTooltip.style.left = `${pos * 100}%`;
      
      const targetTime = pos * this.vc.state.duration;
      this.seekPreviewTime.textContent = this.formatTime(targetTime);
      
      if (this.thumbnailGenerator) {
        this.seekPreviewSpinner.classList.remove('hidden');
        this.seekPreviewImg.classList.add('hidden');
        
        this.thumbnailGenerator.getThumbnail(targetTime, (dataUrl) => {
          if (dataUrl) {
            this.seekPreviewImg.src = dataUrl;
            this.seekPreviewImg.classList.remove('hidden');
            this.seekPreviewSpinner.classList.add('hidden');
          }
        });
      }
    };

    this.progressContainer.addEventListener('touchstart', (e) => {
      handleTouchUpdate(e);
    }, { passive: true });

    this.progressContainer.addEventListener('touchmove', (e) => {
      handleTouchUpdate(e);
    }, { passive: true });

    this.progressContainer.addEventListener('touchend', (e) => {
      this.progressContainer.classList.remove('is-active');
      if (e.changedTouches.length && this.vc.state.duration) {
        const rect = this.progressContainer.getBoundingClientRect();
        const touchX = e.changedTouches[0].clientX;
        let pos = (touchX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        this.vc.seek(pos * this.vc.state.duration);
      }
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

    this.btnPip.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('sn-minimize-player'));
    });
    this.btnFullscreen.addEventListener('click', () => this.vc.toggleFullscreen(this.playerContainer));
    this.btnScreenshot.addEventListener('click', () => this.vc.captureScreenshot());
    
    this.btnSettings.addEventListener('click', () => this.settingsModal.classList.toggle('hidden'));
    this.btnCloseSettings.addEventListener('click', () => this.settingsModal.classList.add('hidden'));

    this.btnBack.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('sn-close-player'));
    });

    if (this.btnMinimize) {
      this.btnMinimize.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('sn-minimize-player'));
      });
    }

    if (this.btnPrevEp) {
      this.btnPrevEp.addEventListener('click', () => {
        const prev = this.playlistManager.prev();
        if (prev) {
          this.playlistManager.playEpisode(this.playlistManager.currentIndex - 1);
        }
      });
    }

    if (this.btnNextEp) {
      this.btnNextEp.addEventListener('click', () => {
        const next = this.playlistManager.next();
        if (next) {
          this.playlistManager.playEpisode(this.playlistManager.currentIndex + 1);
        }
      });
    }

    if (this.btnPlaylist) {
      this.btnPlaylist.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('sn-toggle-episodes-drawer'));
      });
    }

    // Rewind 10s
    if (this.btnRewind) {
      this.btnRewind.addEventListener('click', () => {
        this.vc.seek(Math.max(0, this.vc.state.currentTime - 10));
        this.showFeedback('⏪ -10s');
      });
    }

    // Forward 10s
    if (this.btnForward) {
      this.btnForward.addEventListener('click', () => {
        this.vc.seek(Math.min(this.vc.state.duration || 0, this.vc.state.currentTime + 10));
        this.showFeedback('⏩ +10s');
      });
    }

    // React Navigation Bindings
    window.addEventListener('sn-play-episode', (e) => {
      if (e.detail && e.detail.index !== undefined) {
        this.playlistManager.playEpisode(e.detail.index);
      }
    });

    window.addEventListener('sn-play-next', () => {
      const next = this.playlistManager.next();
      if (next) {
        this.playlistManager.playEpisode(this.playlistManager.currentIndex + 1);
      } else {
        this.closePlayer();
      }
    });

    window.addEventListener('sn-play-prev', () => {
      const prev = this.playlistManager.prev();
      if (prev) {
        this.playlistManager.playEpisode(this.playlistManager.currentIndex - 1);
      }
    });

    window.addEventListener('sn-playlist-update', () => {
      this.updateEpisodeNavButtons();
    });

    window.addEventListener('sn-close-player', () => this.closePlayer());

    if (this.btnAudioTracks) {
      this.btnAudioTracks.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('sn-toggle-audio-drawer'));
      });
    }

    if (this.addAudioTrackDrawerInput) {
      this.addAudioTrackDrawerInput.addEventListener('click', () => { this.addAudioTrackDrawerInput.value = ''; });
      this.addAudioTrackDrawerInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          Array.from(e.target.files).forEach(file => {
            this.vc.addExternalAudio(file);
          });
          this.populateAudioTracks();
          this.emitAudioTracksUpdate();
        }
      });
    }

    window.addEventListener('sn-change-audio-track', (e) => {
      if (e.detail && e.detail.id !== undefined) {
        const id = e.detail.id;
        if (id.startsWith('embedded-')) {
          const index = parseInt(id.split('-')[1]);
          this.currentEmbeddedTrackIndex = index;
          this.vc.setExternalAudio('native'); // Turn off external audio
          this.vc.setAudioTrack(index);      // Switch native track (Safari support)
        } else {
          this.vc.setExternalAudio(id);
        }
        this.populateAudioTracks();
        this.emitAudioTracksUpdate();
      }
    });

    window.addEventListener('sn-open-audio-drawer-import', () => {
      if (this.addAudioTrackDrawerInput) {
        this.addAudioTrackDrawerInput.click();
      }
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
      // ── Always block Space from clicking focused buttons ──
      // ROOT CAUSE FIX: without this, a focused btn-back fires sn-close-player
      if (e.key === ' ' &&
          e.target.tagName !== 'INPUT' &&
          e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }

      if (this.landing.classList.contains('active')) return;
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          this.vc.togglePlay();
          break;

        case 'arrowright':
          e.preventDefault();
          this.vc.seek(Math.min(this.vc.state.duration || 0, this.vc.state.currentTime + 10));
          this.showFeedback('⏩ +10s');
          break;

        case 'arrowleft':
          e.preventDefault();
          this.vc.seek(Math.max(0, this.vc.state.currentTime - 10));
          this.showFeedback('⏪ -10s');
          break;

        case 'arrowup':
          e.preventDefault();
          if (this.mouseXPercent > 0.65) {
            this.vc.state.brightness = Math.min(2, (this.vc.state.brightness || 1) + 0.1);
            this.vc.setBrightness(this.vc.state.brightness);
            this.showFeedback('☀️ ' + Math.round(this.vc.state.brightness * 100) + '%');
          } else {
            this.volumeSlider.value = Math.min(1, parseFloat(this.volumeSlider.value) + 0.05);
            this.volumeSlider.dispatchEvent(new Event('input'));
            this.showFeedback('🔊 ' + Math.round(this.volumeSlider.value * 100) + '%');
          }
          break;

        case 'arrowdown':
          e.preventDefault();
          if (this.mouseXPercent > 0.65) {
            this.vc.state.brightness = Math.max(0.1, (this.vc.state.brightness || 1) - 0.1);
            this.vc.setBrightness(this.vc.state.brightness);
            this.showFeedback('☀️ ' + Math.round(this.vc.state.brightness * 100) + '%');
          } else {
            this.volumeSlider.value = Math.max(0, parseFloat(this.volumeSlider.value) - 0.05);
            this.volumeSlider.dispatchEvent(new Event('input'));
            this.showFeedback('🔊 ' + Math.round(this.volumeSlider.value * 100) + '%');
          }
          break;

        case 'f': this.vc.toggleFullscreen(this.playerContainer); break;
        case 'm': this.btnMute.click(); break;
        case 't': window.dispatchEvent(new CustomEvent('sn-toggle-theater')); break;
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

    // Playback Settings bindings
    if (this.settingAutoplay) {
      this.settingAutoplay.addEventListener('change', () => {
        const enabled = this.settingAutoplay.checked;
        localStorage.setItem('sn-autoplay', enabled);
        window.dispatchEvent(new CustomEvent('sn-autoplay-change', { detail: { enabled } }));
      });
    }

    if (this.settingSkipEnabled) {
      this.settingSkipEnabled.checked = localStorage.getItem('sn-skip-enabled') !== 'false';
      this.settingSkipEnabled.addEventListener('change', () => {
        const enabled = this.settingSkipEnabled.checked;
        localStorage.setItem('sn-skip-enabled', enabled);
        window.dispatchEvent(new CustomEvent('sn-skip-enabled-change', { detail: { enabled } }));
      });
    }

    if (this.btnSaveTimings) {
      this.btnSaveTimings.addEventListener('click', () => {
        if (!this.playlistManager) return;
        const currentEpisode = this.playlistManager.current();
        if (!currentEpisode) return;

        const timings = {
          recapStart: Math.max(0, parseInt(this.timingRecapStart.value) || 0),
          recapEnd: Math.max(0, parseInt(this.timingRecapEnd.value) || 0),
          introStart: Math.max(0, parseInt(this.timingIntroStart.value) || 0),
          introEnd: Math.max(0, parseInt(this.timingIntroEnd.value) || 0)
        };

        SkipTimingManager.saveTimings(currentEpisode.id, timings);
        this.showFeedback('Timestamps Saved!');

        window.dispatchEvent(new CustomEvent('sn-skip-timings-change', {
          detail: {
            mediaId: currentEpisode.id,
            timings
          }
        }));
      });
    }
  }

  populateAudioTracks() {
    const tracks = this.vc.getAudioTracks();
    const externalTracks = this.vc.externalAudios || [];
    
    this.audioTracksList.innerHTML = '';
    
    let nativeHtml = '';
    
    if(tracks.length > 0) {
      for(let i = 0; i < tracks.length; i++) {
        nativeHtml += `<div class="track-item ${tracks[i].enabled && !this.vc.activeExternalAudio ? 'active' : ''}" data-type="native" data-index="${i}">Native: ${tracks[i].label || ('Track ' + (i+1))}</div>`;
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
    
    // Auto import dropped audio files
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || f.name.endsWith('.mp3') || f.name.endsWith('.m4a') || f.name.endsWith('.aac') || f.name.endsWith('.ac3') || f.name.endsWith('.ogg') || f.name.endsWith('.wav'));
    if (audioFiles.length > 0) {
      audioFiles.forEach(file => {
        this.vc.addExternalAudio(file);
      });
    }
    
    const importedEpisodes = this.playlistManager.importFiles(files);
    
    if (importedEpisodes && importedEpisodes.length > 0) {
      const isMultiple = importedEpisodes.length > 1;
      
      if (this.btnPrevEp) this.btnPrevEp.style.display = isMultiple ? 'inline-flex' : 'none';
      if (this.btnNextEp) this.btnNextEp.style.display = isMultiple ? 'inline-flex' : 'none';
      if (this.btnPlaylist) this.btnPlaylist.style.display = isMultiple ? 'inline-flex' : 'none';
      
      this.updateEpisodeNavButtons();
      this.playlistManager.playEpisode(0);

      this.landing.classList.remove('active');
      this.pe.stop();
      this.landingFileInput.value = '';
      
      this.vc.video.tabIndex = -1;
      this.vc.video.focus();
    } else {
      const subFile = Array.from(files).find(f => f.name.endsWith('.srt') || f.name.endsWith('.vtt'));
      if (subFile) {
        this.subEngine.loadSubtitle(subFile);
        this.subIcon.textContent = 'subtitles';
        this.btnSubtitle.classList.add('active');
        this.subEngine.enabled = true;
        if (this.addSubInput) this.addSubInput.value = '';
      }
    }
  }

  updateEpisodeNavButtons() {
    if (!this.playlistManager || this.playlistManager.episodes.length <= 1) return;
    const hasPrev = this.playlistManager.currentIndex > 0;
    const hasNext = this.playlistManager.currentIndex < this.playlistManager.episodes.length - 1;

    if (this.btnPrevEp) {
      this.btnPrevEp.disabled = !hasPrev;
      this.btnPrevEp.style.opacity = hasPrev ? '1' : '0.4';
      this.btnPrevEp.style.cursor = hasPrev ? 'pointer' : 'not-allowed';
    }
    if (this.btnNextEp) {
      this.btnNextEp.disabled = !hasNext;
      this.btnNextEp.style.opacity = hasNext ? '1' : '0.4';
      this.btnNextEp.style.cursor = hasNext ? 'pointer' : 'not-allowed';
    }
  }

  closePlayer() {
    this.playbackTracker.stop();
    
    if (this.thumbnailGenerator) {
      this.thumbnailGenerator.destroy();
      this.thumbnailGenerator = null;
    }

    this.vc.unload();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    }
    if (this.playlistManager) {
      this.playlistManager.clear();
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

    if (this.btnPrevEp) this.btnPrevEp.style.display = 'none';
    if (this.btnNextEp) this.btnNextEp.style.display = 'none';
    if (this.btnPlaylist) this.btnPlaylist.style.display = 'none';

    this.landing.classList.add('active');
    this.settingsModal.classList.add('hidden');
    this.dropZone.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    this.pe.start();
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

  emitAudioTracksUpdate() {
    const currentEpisode = this.playlistManager ? this.playlistManager.current() : null;
    const parsedTracks = currentEpisode ? (currentEpisode.audioTracks || []) : [];
    const nativeTracks = this.vc.getAudioTracks();
    const externalTracks = this.vc.externalAudios || [];
    const tracks = [];
    
    // Add parsed embedded tracks or native tracks
    if (parsedTracks.length > 0) {
      parsedTracks.forEach((t, i) => {
        const isActive = this.vc.activeExternalAudio 
          ? false 
          : (nativeTracks.length > 0 
              ? (nativeTracks[i]?.enabled || i === 0) 
              : (this.currentEmbeddedTrackIndex !== undefined ? this.currentEmbeddedTrackIndex === i : i === 0));
        
        tracks.push({
          id: `embedded-${i}`,
          index: i,
          name: t.name || `Track ${i + 1}`,
          language: t.language || 'unknown',
          channels: t.channels || 'Stereo',
          codec: t.codec || 'AAC',
          type: 'embedded',
          isActive: isActive
        });
      });
    } else if (nativeTracks.length > 0) {
      for (let i = 0; i < nativeTracks.length; i++) {
        const t = nativeTracks[i];
        tracks.push({
          id: `native-${i}`,
          index: i,
          name: t.label || `Track ${i + 1}`,
          language: t.language || 'unknown',
          channels: 'Stereo',
          type: 'native',
          isActive: (t.enabled && !this.vc.activeExternalAudio)
        });
      }
    } else {
      // Default fallback
      tracks.push({
        id: 'native',
        index: 0,
        name: 'Default Embedded Audio',
        language: 'default',
        type: 'native',
        isActive: !this.vc.activeExternalAudio
      });
    }

    // Add external tracks
    externalTracks.forEach(t => {
      const isActive = this.vc.activeExternalAudio === t.element;
      tracks.push({
        id: t.id,
        name: t.name,
        type: 'external',
        isActive: isActive
      });
    });

    let currentTrackId = 'native';
    if (this.vc.activeExternalAudio) {
      const activeTrack = externalTracks.find(t => t.element === this.vc.activeExternalAudio);
      if (activeTrack) currentTrackId = activeTrack.id;
    } else if (parsedTracks.length > 0) {
      currentTrackId = `embedded-${this.currentEmbeddedTrackIndex !== undefined ? this.currentEmbeddedTrackIndex : 0}`;
    } else if (nativeTracks.length > 0) {
      for (let i = 0; i < nativeTracks.length; i++) {
        if (nativeTracks[i].enabled) currentTrackId = `native-${i}`;
      }
    }

    window.dispatchEvent(new CustomEvent('sn-audio-tracks-update', {
      detail: {
        tracks,
        currentTrackId
      }
    }));
  }

  formatTime(seconds) {
    return formatTime(seconds, this.vc.state.duration);
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
