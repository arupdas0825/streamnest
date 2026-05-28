/**
 * ThumbnailGenerator
 * Highly optimized offscreen video frame capture and caching system for seek previews.
 * Features:
 * - Dynamic interval scaling based on video duration
 * - Throttled on-demand debounced seeking to prevent main-thread/video lag
 * - Memory-friendly offscreen canvas scale down and tiny JPEG compression
 * - Idle background generation loop
 * - Clean resource destruction
 */
export class ThumbnailGenerator {
  constructor(videoUrl, duration, onReady = null) {
    this.videoUrl = videoUrl;
    this.duration = duration;
    this.cache = new Map(); // key: roundedTime, value: dataUrl
    this.isReady = false;
    this.onReady = onReady;

    // Calculate dynamic interval (2s for short clips, up to 30s for long movies)
    this.interval = this.calculateInterval();

    // Setup offscreen canvas and context
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 90;
    this.ctx = this.canvas.getContext('2d');

    // Debounce timer for on-demand seeks
    this.seekDebounceTimer = null;
    this.isSeeking = false;
    this.currentSeekCallback = null;

    // Background pre-generation state
    this.bgIndex = 0;
    this.bgTargets = [];
    this.bgTimer = null;
    this.isUserInteracting = false;

    // Initialize offscreen video
    this.initVideo();
  }

  initVideo() {
    this.video = document.createElement('video');
    this.video.src = this.videoUrl;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = 'auto';
    this.video.crossOrigin = 'anonymous';

    // Hide the offscreen video completely
    this.video.style.position = 'fixed';
    this.video.style.top = '0';
    this.video.style.left = '0';
    this.video.style.width = '1px';
    this.video.style.height = '1px';
    this.video.style.opacity = '0.01';
    this.video.style.pointerEvents = 'none';
    this.video.style.zIndex = '-9999';
    document.body.appendChild(this.video);

    // Event listeners
    this.video.addEventListener('loadeddata', () => {
      this.isReady = true;
      this.setupBackgroundTargets();
      if (this.onReady) this.onReady();
      this.startBackgroundGeneration();
    });

    this.video.addEventListener('seeked', () => this.handleSeeked());
  }

  calculateInterval() {
    if (this.duration < 180) return 2;      // < 3 minutes: every 2 seconds
    if (this.duration < 600) return 5;      // < 10 minutes: every 5 seconds
    if (this.duration < 3600) return 10;    // < 60 minutes: every 10 seconds
    return 30;                              // > 60 minutes: every 30 seconds
  }

  setupBackgroundTargets() {
    // Generate targets list (0, interval, 2*interval, ... duration)
    this.bgTargets = [];
    for (let t = 0; t <= this.duration; t += this.interval) {
      this.bgTargets.push(t);
    }
  }

  /**
   * Request a thumbnail for a specific timestamp
   * @param {number} seconds 
   * @param {function} callback - Receives the dataUrl
   */
  getThumbnail(seconds, callback) {
    if (!this.isReady) {
      callback(null);
      return;
    }

    const roundedTime = Math.min(
      this.duration,
      Math.max(0, Math.round(seconds / this.interval) * this.interval)
    );

    // 1. Check cache first for immediate return
    if (this.cache.has(roundedTime)) {
      callback(this.cache.get(roundedTime));
      return;
    }

    // 2. Prioritize this on-demand seek
    this.isUserInteracting = true;
    
    // Stop background generator temporarily
    if (this.bgTimer) {
      clearTimeout(this.bgTimer);
      this.bgTimer = null;
    }

    // Debounce the seek by 50ms so fast mouse movements don't lock the offscreen video
    if (this.seekDebounceTimer) clearTimeout(this.seekDebounceTimer);
    
    this.seekDebounceTimer = setTimeout(() => {
      this.isSeeking = true;
      this.currentSeekTime = roundedTime;
      this.currentSeekCallback = (dataUrl) => {
        callback(dataUrl);
        // Resume background pre-generation after a brief quiet period
        this.resumeBackgroundGeneration();
      };
      
      this.video.currentTime = roundedTime;
    }, 50);
  }

  handleSeeked() {
    if (!this.video) return;

    try {
      // Draw offscreen frame to canvas
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Extremely light JPEG compression (0.6 quality gives ~3KB per thumbnail)
      const dataUrl = this.canvas.toDataURL('image/jpeg', 0.6);
      
      const currentTime = Math.round(this.video.currentTime);
      const roundedTime = Math.round(currentTime / this.interval) * this.interval;
      
      // Save to cache
      this.cache.set(roundedTime, dataUrl);

      // Trigger active on-demand callback if matching seek
      if (this.isSeeking && this.currentSeekCallback) {
        this.isSeeking = false;
        const cb = this.currentSeekCallback;
        this.currentSeekCallback = null;
        cb(dataUrl);
      } else {
        // Background extraction seek completed
        this.isSeeking = false;
        this.bgIndex++;
        this.scheduleNextBackgroundStep();
      }
    } catch (e) {
      console.warn('ThumbnailGenerator: Seeked extraction failed', e);
      this.isSeeking = false;
      if (this.isUserInteracting) {
        this.resumeBackgroundGeneration();
      } else {
        this.bgIndex++;
        this.scheduleNextBackgroundStep();
      }
    }
  }

  startBackgroundGeneration() {
    this.isUserInteracting = false;
    this.scheduleNextBackgroundStep();
  }

  scheduleNextBackgroundStep() {
    if (this.bgTimer) clearTimeout(this.bgTimer);
    if (!this.isReady || this.isSeeking || this.isUserInteracting) return;

    // Check if background extraction is finished
    if (this.bgIndex >= this.bgTargets.length) {
      console.log(`ThumbnailGenerator: Cached ${this.cache.size} keyframes successfully.`);
      return;
    }

    const targetTime = this.bgTargets[this.bgIndex];
    
    // Skip if already in cache
    if (this.cache.has(targetTime)) {
      this.bgIndex++;
      this.scheduleNextBackgroundStep();
      return;
    }

    // Process background seek with a safe idle lag (300ms) to ensure 0% impact on main thread
    this.bgTimer = setTimeout(() => {
      if (this.isUserInteracting) return;
      this.isSeeking = true;
      this.video.currentTime = targetTime;
    }, 300);
  }

  resumeBackgroundGeneration() {
    // Wait for 2.5 seconds of mouse quiet time before resuming background extraction
    if (this.bgTimer) clearTimeout(this.bgTimer);
    this.bgTimer = setTimeout(() => {
      this.startBackgroundGeneration();
    }, 2500);
  }

  destroy() {
    this.isReady = false;
    
    if (this.bgTimer) clearTimeout(this.bgTimer);
    if (this.seekDebounceTimer) clearTimeout(this.seekDebounceTimer);

    if (this.video) {
      try {
        this.video.pause();
        this.video.removeAttribute('src');
        this.video.load();
        if (this.video.parentNode) {
          this.video.parentNode.removeChild(this.video);
        }
      } catch (e) {
        // already removed
      }
      this.video = null;
    }

    this.cache.clear();
    this.canvas = null;
    this.ctx = null;
    this.currentSeekCallback = null;
  }
}
