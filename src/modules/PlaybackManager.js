/**
 * PlaybackManager
 * Handles localStorage persistence for video progress.
 * Scalable structure with mediaId as unique key.
 */

const STORAGE_KEY = 'streamnest_playback_history';

export class PlaybackManager {
  /**
   * Save progress for a specific media item
   * @param {string} mediaId - Unique identifier (filename + size or hash)
   * @param {Object} data - { currentTime, duration, progress, title, updatedAt }
   */
  static save(mediaId, data) {
    if (!mediaId) return;
    
    try {
      const history = this.getAll();
      
      // Update or Create
      history[mediaId] = {
        ...history[mediaId],
        ...data,
        updatedAt: Date.now()
      };

      // Performance: Limit history to last 50 items to keep localStorage lean
      const keys = Object.keys(history);
      if (keys.length > 50) {
        const sorted = keys.sort((a, b) => history[b].updatedAt - history[a].updatedAt);
        const toRemove = sorted.slice(50);
        toRemove.forEach(k => delete history[k]);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('PlaybackManager: Error saving to localStorage', error);
      // Fallback: Clear oldest entries if storage is full
      if (error.name === 'QuotaExceededError') {
        localStorage.clear(); // Nuclear option or selective clearing
      }
    }
  }

  /**
   * Get progress for a specific media item
   * @param {string} mediaId 
   * @returns {Object|null}
   */
  static get(mediaId) {
    if (!mediaId) return null;
    const history = this.getAll();
    return history[mediaId] || null;
  }

  /**
   * Get all playback history for "Continue Watching" support
   */
  static getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn('PlaybackManager: Error parsing storage, returning empty object', error);
      return {};
    }
  }

  /**
   * Remove progress for a specific item
   */
  static clear(mediaId) {
    const history = this.getAll();
    delete history[mediaId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}
