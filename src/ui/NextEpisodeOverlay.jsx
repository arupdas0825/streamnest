import React, { useState, useEffect, useRef } from 'react';
import { usePlayerContext } from '../context/PlayerContext.jsx';

const NextEpisodeOverlay = ({ videoCore }) => {
  const { playlist, currentEpisodeIndex, playNext } = usePlayerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [initialCountdown, setInitialCountdown] = useState(10);
  const [nextEp, setNextEp] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const activeEpisodeRef = useRef(currentEpisodeIndex);

  useEffect(() => {
    activeEpisodeRef.current = currentEpisodeIndex;
    setIsVisible(false);
    setIsCancelled(false);
  }, [currentEpisodeIndex]);

  useEffect(() => {
    const video = videoCore.video;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (isCancelled || playlist.length === 0 || activeEpisodeRef.current === -1) return;
      
      const nextIndex = activeEpisodeRef.current + 1;
      if (nextIndex >= playlist.length) return; // No next episode

      const duration = video.duration;
      const currentTime = video.currentTime;

      if (!isNaN(duration) && duration > 0) {
        const remainingTime = duration - currentTime;

        // Show overlay 15 seconds before ending
        if (remainingTime <= 15 && remainingTime > 0.5) {
          if (!isVisible) {
            const nextEpisode = playlist[nextIndex];
            setNextEp(nextEpisode);
            setIsVisible(true);
            const remainingCeil = Math.ceil(remainingTime);
            setCountdown(remainingCeil);
            setInitialCountdown(remainingCeil);
          }
        } else {
          if (isVisible && remainingTime > 15) {
            setIsVisible(false);
          }
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoCore, playlist, isCancelled, isVisible]);

  // Countdown timer logic
  useEffect(() => {
    if (!isVisible || isCancelled) return;

    if (countdown <= 0) {
      playNext();
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisible, countdown, isCancelled, playNext]);

  // Listen to ending event of video as a fallback to trigger autoplay immediately if overlay was active
  useEffect(() => {
    const video = videoCore.video;
    if (!video) return;

    const handleEnded = () => {
      if (!isCancelled && playlist.length > 0 && activeEpisodeRef.current !== -1) {
        const nextIndex = activeEpisodeRef.current + 1;
        if (nextIndex < playlist.length) {
          playNext();
        }
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoCore, playlist, isCancelled, playNext]);

  if (!isVisible || !nextEp) return null;

  const handlePlayNow = () => {
    playNext();
    setIsVisible(false);
  };

  const handleCancel = () => {
    setIsCancelled(true);
    setIsVisible(false);
  };

  const progressPercent = initialCountdown > 0 ? (countdown / initialCountdown) * 100 : 0;

  return (
    <div className="fixed bottom-24 right-6 md:right-8 z-[980] max-w-sm md:max-w-md w-full bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-white shadow-2xl flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom duration-300">
      {/* Autoplay progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-2xl overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex gap-4">
        {/* Next Card Thumbnail Preview */}
        <div className="relative w-28 h-16 md:w-36 md:h-20 bg-gradient-to-tr from-purple-900/30 to-zinc-800 rounded-lg overflow-hidden border border-white/5 shrink-0 flex items-center justify-center">
          <span className="material-symbols-rounded text-white/30 text-3xl">play_circle</span>
          <div className="absolute bottom-1 right-1 bg-black/60 text-[9px] font-semibold px-1 rounded tracking-wide">
            S{nextEp.season.toString().padStart(2, '0')}E{nextEp.episode.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-[11px] font-bold text-primary tracking-wider uppercase">UP NEXT IN {countdown}S</p>
          <h4 className="font-bold text-sm md:text-base truncate text-white mt-0.5">
            {nextEp.episodeTitle || `Episode ${nextEp.episode}`}
          </h4>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {nextEp.showName || 'Series'}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 mt-1.5">
        <button 
          onClick={handleCancel}
          className="text-xs font-semibold px-4 py-2 hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button 
          onClick={handlePlayNow}
          className="text-xs font-bold px-5 py-2.5 bg-primary text-black hover:bg-primary/95 rounded-lg shadow-lg hover:shadow-primary/20 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span className="material-symbols-rounded text-sm">play_arrow</span>
          Play Now
        </button>
      </div>
    </div>
  );
};

export default NextEpisodeOverlay;
