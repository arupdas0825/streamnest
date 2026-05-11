import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * usePlayback Hook
 * A reusable React hook for local resume playback system.
 * 
 * @param {string} mediaId - Unique key for the media
 * @param {Object} videoRef - React ref to the video element
 * @param {Object} metadata - Optional metadata (title, etc.)
 */
export const usePlayback = (mediaId, videoRef, metadata = {}) => {
  const [resumeTime, setResumeTime] = useState(0);
  const STORAGE_KEY = 'streamnest_playback_history';
  const saveTimerRef = useRef(null);

  // Persistence logic
  const saveProgress = useCallback((force = false) => {
    const video = videoRef.current;
    if (!video || !mediaId || isNaN(video.duration)) return;

    const currentTime = video.currentTime;
    const duration = video.duration;
    const progress = currentTime / duration;

    // Don't save if almost started or almost ended (unless forced)
    if (!force && (currentTime < 5 || progress > 0.98)) return;

    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      history[mediaId] = {
        mediaId,
        currentTime,
        duration,
        progress,
        updatedAt: Date.now(),
        ...metadata
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('usePlayback: Save failed', e);
    }
  }, [mediaId, videoRef, metadata]);

  useEffect(() => {
    if (!mediaId) return;

    // Load progress
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const saved = history[mediaId];
      if (saved && saved.progress < 0.95 && saved.currentTime > 5) {
        setResumeTime(saved.currentTime);
      }
    } catch (e) {
      console.error('usePlayback: Load failed', e);
    }

    // Auto-save interval
    saveTimerRef.current = setInterval(() => saveProgress(), 10000);

    // Event listeners
    const handleUnload = () => saveProgress(true);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(saveTimerRef.current);
      window.removeEventListener('beforeunload', handleUnload);
      saveProgress(true); // Final save on unmount
    };
  }, [mediaId, saveProgress]);

  return { resumeTime };
};
