import { PlaybackTracker } from './PlaybackTracker.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ContinueWatching from '../ui/ContinueWatching.jsx';
import AdvancedControls from '../ui/AdvancedControls.jsx';
import GlobalPlayer from '../ui/GlobalPlayer.jsx';

export class UIController {
  constructor(videoCore, subtitleEngine, audioCore, themeManager, particleEngine) {
    this.vc = videoCore;
    this.subEngine = subtitleEngine;
    this.audioCore = audioCore;
    this.themeManager = themeManager;
    this.pe = particleEngine;
    this.speeds = [1, 1.25, 1.5, 2, 0.5];
    this.speedIndex = 0;
    
    // Mount Global Player System
    this.renderGlobalPlayer();
    // Mount React Continue Watching Row
    this.renderContinueWatching();
    
    this.playbackTracker = new PlaybackTracker(this.vc);
    this.resumePosition = 0;
    
    this.bindElements();
    this.bindVideoEvents();
    this.bindUIEvents();
    
    // Initial render
    this.renderContinueWatching();
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

  renderContinueWatching() {
    const container = document.getElementById('continue-watching-section');
    if (!container) return;
    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(container);
    }
    this.reactRoot.render(
      <ContinueWatching 
        onResume={() => {
          this.showFeedback("Select file to resume");
          this.landingFileInput.click();
        }} 
      />
    );
  }

  renderAdvancedControls() {
    const container = document.getElementById('advanced-controls-root');
    if (!container) return;
    if (!this.controlsRoot) {
      this.controlsRoot = ReactDOM.createRoot(container);
    }
    this.controlsRoot.render(
      <AdvancedControls 
        videoCore={this.vc} 
        videoTitle={this.videoTitleText}
        onBack={() => {
          // Instead of clicking this.btnBack, we just trigger minimize via a custom event or shared state
          // For now, we'll use a custom event that the GlobalPlayer will listen to
          window.dispatchEvent(new CustomEvent('sn-minimize-player'));
        }}
      />
    );
  }

  bindElements() {
    this.landing = document.getElementById('landing-screen');
    this.landingFileInput = document.getElementById('landing-file-input');
    this.playerContainer = document.getElementById('video-container');
    this.btnBack = document.getElementById('btn-back');
    this.gestureFeedback = document.getElementById('gesture-feedback');
    this.dropZone = document.getElementById('drop-zone');
  }

  bindVideoEvents() {
    this.vc.on('play', () => {
      this.audioCore.init();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    });
    this.vc.on('pause', () => {
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    });
    this.vc.on('loadedmetadata', () => {
      if (this.resumePosition > 0) {
        this.vc.seek(this.resumePosition);
        this.resumePosition = 0;
      }
    });
  }

  bindUIEvents() {
    // Back to Landing (Mini-player logic)
    this.btnBack.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('sn-minimize-player'));
    });

    // File Selection
    this.landingFileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    
    // Drag & Drop
    if (this.dropZone) {
      this.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); this.dropZone.classList.add('dragover'); });
      this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('dragover'));
      this.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dropZone.classList.remove('dragover');
        this.handleFiles(e.dataTransfer.files);
      });
    }
  }

  handleFiles(files) {
    if (!files.length) return;
    const videoFile = Array.from(files).find(f => f.type.startsWith('video/') || f.name.endsWith('.mkv'));
    const subFile = Array.from(files).find(f => f.name.endsWith('.srt') || f.name.endsWith('.vtt'));
    
    if (videoFile) {
      if (this.currentVideoUrl) URL.revokeObjectURL(this.currentVideoUrl);
      this.videoTitleText = videoFile.name;
      
      const mediaId = `sn-${videoFile.name}-${videoFile.size}`;
      this.resumePosition = this.playbackTracker.init(mediaId, { title: videoFile.name });

      const url = URL.createObjectURL(videoFile);
      this.currentVideoUrl = url;
      this.vc.load(url);
      
      this.landing.classList.remove('active');
      this.pe.stop();
      
      // Open Global Player in Full Mode
      window.dispatchEvent(new CustomEvent('sn-open-player', { detail: { title: videoFile.name } }));

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: videoFile.name,
          artist: 'StreamNest',
          album: 'Local Media'
        });
      }
    }
    
    if (subFile) {
      this.subEngine.loadSubtitle(subFile);
    }
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
}
