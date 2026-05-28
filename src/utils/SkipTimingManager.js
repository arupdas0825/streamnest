/**
 * SkipTimingManager
 * Scalable local database to manage Skip Intro and Skip Recap offsets for local files.
 * Caches timings in localStorage under unique mediaIds and serves smart out-of-the-box defaults.
 */

const STORAGE_KEY = 'streamnest_skip_timings';

export class SkipTimingManager {
  /**
   * Get timings for a specific media item
   * @param {string} mediaId 
   * @param {number} duration - Current video duration in seconds
   * @returns {Object} { recapStart, recapEnd, introStart, introEnd }
   */
  static getTimings(mediaId, duration) {
    if (!mediaId) return this.getDefaults(duration);

    try {
      const allTimings = this.getAll();
      if (allTimings[mediaId]) {
        return {
          recapStart: Number(allTimings[mediaId].recapStart ?? 0),
          recapEnd: Number(allTimings[mediaId].recapEnd ?? 0),
          introStart: Number(allTimings[mediaId].introStart ?? 0),
          introEnd: Number(allTimings[mediaId].introEnd ?? 0)
        };
      }
    } catch (e) {
      console.warn('SkipTimingManager: Failed to get saved timings', e);
    }

    return this.getDefaults(duration);
  }

  /**
   * Save custom timings for a media item
   * @param {string} mediaId 
   * @param {Object} timings - { recapStart, recapEnd, introStart, introEnd }
   */
  static saveTimings(mediaId, timings) {
    if (!mediaId) return;

    try {
      const allTimings = this.getAll();
      allTimings[mediaId] = {
        recapStart: Number(timings.recapStart ?? 0),
        recapEnd: Number(timings.recapEnd ?? 0),
        introStart: Number(timings.introStart ?? 0),
        introEnd: Number(timings.introEnd ?? 0),
        updatedAt: Date.now()
      };

      // Limit storage: keep last 100 entries to prevent memory bloat
      const keys = Object.keys(allTimings);
      if (keys.length > 100) {
        const sorted = keys.sort((a, b) => allTimings[b].updatedAt - allTimings[a].updatedAt);
        const toRemove = sorted.slice(100);
        toRemove.forEach(k => delete allTimings[k]);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTimings));
    } catch (e) {
      console.error('SkipTimingManager: Failed to save timings to localStorage', e);
    }
  }

  /**
   * Helper to retrieve all stored timings
   */
  static getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Generate smart, standard defaults for episodes
   * Recap: 0 to 20 seconds
   * Intro: 30 to 85 seconds
   * Ignores short clips (< 2 minutes)
   */
  static getDefaults(duration) {
    // If the video is extremely short (e.g. trailers/clips), do not apply defaults
    if (!duration || duration < 120) {
      return { recapStart: 0, recapEnd: 0, introStart: 0, introEnd: 0 };
    }

    // Standard high-quality defaults matching typical TV shows
    return {
      recapStart: 0,
      recapEnd: 20,
      introStart: 30,
      introEnd: 85
    };
  }
}
