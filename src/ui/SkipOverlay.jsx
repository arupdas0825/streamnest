import React, { useState, useEffect, useRef } from 'react';
import { usePlayerContext } from '../context/PlayerContext.jsx';
import { SkipTimingManager } from '../utils/SkipTimingManager.js';

const SkipOverlay = ({ videoCore }) => {
  const { playlist, currentEpisodeIndex } = usePlayerContext();
  const [isSkipEnabled, setIsSkipEnabled] = useState(localStorage.getItem('sn-skip-enabled') !== 'false');
  const [timings, setTimings] = useState({ recapStart: 0, recapEnd: 0, introStart: 0, introEnd: 0 });
  const [showSkipRecap, setShowSkipRecap] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);

  const activeEpisodeRef = useRef(currentEpisodeIndex);

  // Sync preferences and timings inside window listeners
  useEffect(() => {
    const handleSkipEnabledChange = (e) => {
      if (e.detail && e.detail.enabled !== undefined) {
        setIsSkipEnabled(e.detail.enabled);
      }
    };

    const handleSkipTimingsChange = (e) => {
      if (e.detail && e.detail.timings && playlist[currentEpisodeIndex]) {
        const currentEp = playlist[currentEpisodeIndex];
        if (e.detail.mediaId === currentEp.id) {
          setTimings(e.detail.timings);
        }
      }
    };

    window.addEventListener('sn-skip-enabled-change', handleSkipEnabledChange);
    window.addEventListener('sn-skip-timings-change', handleSkipTimingsChange);

    return () => {
      window.removeEventListener('sn-skip-enabled-change', handleSkipEnabledChange);
      window.removeEventListener('sn-skip-timings-change', handleSkipTimingsChange);
    };
  }, [playlist, currentEpisodeIndex]);

  // Handle episode loading & timings sync
  useEffect(() => {
    activeEpisodeRef.current = currentEpisodeIndex;
    setShowSkipRecap(false);
    setShowSkipIntro(false);

    const video = videoCore.video;
    if (!video || playlist.length === 0 || currentEpisodeIndex === -1) return;

    const currentEpisode = playlist[currentEpisodeIndex];
    if (!currentEpisode) return;

    const loadTimings = () => {
      const t = SkipTimingManager.getTimings(currentEpisode.id, video.duration);
      setTimings(t);
    };

    // Try loading immediately
    loadTimings();

    // Listen to metadata/duration load to ensure correct defaults
    video.addEventListener('loadedmetadata', loadTimings);
    video.addEventListener('durationchange', loadTimings);

    return () => {
      video.removeEventListener('loadedmetadata', loadTimings);
      video.removeEventListener('durationchange', loadTimings);
    };
  }, [videoCore, playlist, currentEpisodeIndex]);

  // Video timeupdate hook to trigger prompts dynamically
  useEffect(() => {
    const video = videoCore.video;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isSkipEnabled || playlist.length === 0 || activeEpisodeRef.current === -1) {
        setShowSkipRecap(false);
        setShowSkipIntro(false);
        return;
      }

      const currentTime = video.currentTime;

      // 1. Skip Recap Prompt
      const inRecap = currentTime >= timings.recapStart && 
                      currentTime <= timings.recapEnd && 
                      timings.recapEnd > timings.recapStart;
      setShowSkipRecap(inRecap);

      // 2. Skip Intro Prompt (Netflix allows Skip Intro if recap is not visible)
      const inIntro = !inRecap && 
                      currentTime >= timings.introStart && 
                      currentTime <= timings.introEnd && 
                      timings.introEnd > timings.introStart;
      setShowSkipIntro(inIntro);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoCore, isSkipEnabled, timings, playlist]);

  const handleSkipRecap = () => {
    const video = videoCore.video;
    if (video && timings.recapEnd > 0) {
      video.currentTime = timings.recapEnd;
      setShowSkipRecap(false);
    }
  };

  const handleSkipIntro = () => {
    const video = videoCore.video;
    if (video && timings.introEnd > 0) {
      video.currentTime = timings.introEnd;
      setShowSkipIntro(false);
    }
  };

  // Render Skip Recap Pill
  if (showSkipRecap) {
    return (
      <div className="fixed bottom-28 right-8 md:right-10 z-[980] animate-in fade-in slide-in-from-right duration-300">
        <button
          onClick={handleSkipRecap}
          className="text-xs font-extrabold px-5 py-3 bg-zinc-950/80 hover:bg-zinc-950 border border-white/20 hover:border-white/30 text-white rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.8),_0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.8),_0_0_20px_rgba(0,240,255,0.12)] flex items-center gap-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-[1px] active:translate-y-0"
        >
          <span className="material-symbols-rounded text-sm">skip_next</span>
          Skip Recap
        </button>
      </div>
    );
  }

  // Render Skip Intro Pill
  if (showSkipIntro) {
    return (
      <div className="fixed bottom-28 right-8 md:right-10 z-[980] animate-in fade-in slide-in-from-right duration-300">
        <button
          onClick={handleSkipIntro}
          className="text-xs font-extrabold px-5 py-3 bg-zinc-950/80 hover:bg-zinc-950 border border-white/20 hover:border-white/30 text-white rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.8),_0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.8),_0_0_20px_rgba(0,240,255,0.12)] flex items-center gap-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-[1px] active:translate-y-0"
        >
          <span className="material-symbols-rounded text-sm">skip_next</span>
          Skip Intro
        </button>
      </div>
    );
  }

  return null;
};

export default SkipOverlay;
