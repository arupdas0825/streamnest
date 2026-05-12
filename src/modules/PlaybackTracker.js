import { PlaybackManager } from './PlaybackManager.js';

/**
 * PlaybackTracker
 * Logic to automatically track and save video progress.
 * Handles throttling, events, and edge cases.
 */
export class PlaybackTracker {
  constructor(videoCore) {
    this.vc = videoCore;
    this.currentMediaId = null;
    this.saveInterval = null;
    this.lastSavedTime = -10; // Ensure first save happens
    this.metadata = {};
    
    this.setupListeners();
  }

  /**
   * Start tracking a new media item
   */
  init(mediaId, metadata = {}) {
    this.stop(); // Stop previous tracking
    
    this.currentMediaId = mediaId;
    this.metadata = metadata;
    this.lastSavedTime = -10;
    
    // Auto-save interval (every 10 seconds)
    this.saveInterval = setInterval(() => this.save(), 10000);
    
    console.log(`PlaybackTracker: Initialized for ${mediaId}`);
    
    // Check for existing progress to resume
    const saved = PlaybackManager.get(mediaId);
    if (saved && saved.progress < 0.95 && saved.currentTime > 5) {
      console.log(`PlaybackTracker: Found saved progress at ${saved.currentTime}s`);
      return saved.currentTime;
    }
    
    return 0;
  }

  /**
   * Save current state to storage
   */
  save() {
    if (!this.currentMediaId || !this.vc.video || isNaN(this.vc.video.duration)) return;

    const currentTime = this.vc.video.currentTime;
    const duration = this.vc.video.duration;
    
    // Throttle: Don't save if we haven't moved at least 2 seconds (unless paused/closed)
    if (Math.abs(currentTime - this.lastSavedTime) < 2) return;

    const progress = currentTime / duration;

    // Capture thumbnail if not already present in metadata (or every once in a while)
    if (!this.metadata.thumbnail && currentTime > 5) {
        this.metadata.thumbnail = this.captureThumbnail();
    }

    const data = {
      mediaId: this.currentMediaId,
      currentTime,
      duration,
      progress,
      ...this.metadata
    };

    PlaybackManager.save(this.currentMediaId, data);
    this.lastSavedTime = currentTime;
  }

  /**
   * Stop tracking current media
   */
  stop() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    
    if (this.currentMediaId) {
      this.save(); // Final save
      this.currentMediaId = null;
    }
  }

  /**
   * Capture a small thumbnail from the video
   */
  captureThumbnail() {
    try {
      const canvas = document.createElement('canvas');
      // Low resolution for storage efficiency
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.vc.video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.7); // JPEG for better compression
    } catch (e) {
      return null;
    }
  }

  setupListeners() {
    // Save on specific events
    this.vc.on('pause', () => this.save());
    
    // Native listeners for abrupt changes
    window.addEventListener('beforeunload', () => this.save());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.save();
      }
    });

    // Handle route changes / back button in StreamNest
    // We'll call stop() manually from UIController when needed
  }
}
