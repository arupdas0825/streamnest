import React, { useState, useEffect, useRef } from 'react';
import { usePlayerContext } from '../context/PlayerContext.jsx';

const NextEpisodeOverlay = ({ videoCore }) => {
  const { playlist, currentEpisodeIndex, playNext, isAutoplayEnabled } = usePlayerContext();
  const [isVisible, setIsVisible] = useState(false);
  const [nextEp, setNextEp] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [progressPercent, setProgressPercent] = useState(100);
  
  const activeEpisodeRef = useRef(currentEpisodeIndex);
  const hasTriggeredRef = useRef(false);

  // Sync current episode index
  useEffect(() => {
    activeEpisodeRef.current = currentEpisodeIndex;
    hasTriggeredRef.current = false;
    setIsVisible(false);
    setIsCancelled(false);
    setCountdown(10);
    setProgressPercent(100);
  }, [currentEpisodeIndex]);

  // Video timeupdate hook for bulletproof mathematical timing
  useEffect(() => {
    const video = videoCore.video;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Safety checks: playlist empty, invalid index, or no next episode
      if (playlist.length === 0 || activeEpisodeRef.current === -1) return;
      
      const nextIndex = activeEpisodeRef.current + 1;
      if (nextIndex >= playlist.length) return; // No next episode exists

      const duration = video.duration;
      const currentTime = video.currentTime;

      if (!isNaN(duration) && duration > 0) {
        const remainingTime = duration - currentTime;

        // Reset cancellation state if user seeks back past the 20s autoplay trigger window
        if (remainingTime > 20) {
          if (isCancelled) setIsCancelled(false);
          if (hasTriggeredRef.current) hasTriggeredRef.current = false;
          if (isVisible) setIsVisible(false);
          return;
        }

        // Trigger autoplay window when remaining time <= 20 seconds
        if (remainingTime <= 20 && remainingTime > 0.5 && !isCancelled && isAutoplayEnabled) {
          // If not visible, show popup and cache next episode data
          if (!isVisible) {
            setNextEp(playlist[nextIndex]);
            setIsVisible(true);
          }

          // Mathematical countdown of 10 seconds (ends when 10 seconds are remaining in the video)
          const countdownDecimal = Math.max(0, remainingTime - 10);
          
          // Display integer ticks 10..9..8..1
          setCountdown(Math.ceil(countdownDecimal));

          // Smooth progress percentage calculation
          const percent = Math.min(100, Math.max(0, (countdownDecimal / 10) * 100));
          setProgressPercent(percent);

          // Auto-trigger transition at exactly 10s remaining (countdown reaches 0)
          if (remainingTime <= 10) {
            if (!hasTriggeredRef.current) {
              hasTriggeredRef.current = true;
              setIsVisible(false);
              playNext();
            }
          }
        } else {
          // Hide popup if conditions are no longer met (e.g. seeking outside bounds)
          if (isVisible && (remainingTime <= 0.5 || isCancelled)) {
            setIsVisible(false);
          }
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoCore, playlist, isCancelled, isVisible, isAutoplayEnabled, playNext]);

  // Video ended event listener as an absolute backup trigger (if overlay was cancelled but video completes)
  useEffect(() => {
    const video = videoCore.video;
    if (!video) return;

    const handleEnded = () => {
      // If autoplay was disabled or cancelled, we don't automatically trigger next on ended
      // This is a premium UX safety constraint
      if (isAutoplayEnabled && !isCancelled && playlist.length > 0 && activeEpisodeRef.current !== -1) {
        const nextIndex = activeEpisodeRef.current + 1;
        if (nextIndex < playlist.length && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          playNext();
        }
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoCore, playlist, isCancelled, isAutoplayEnabled, playNext]);

  if (!isVisible || !nextEp) return null;

  const handlePlayNow = () => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setIsVisible(false);
      playNext();
    }
  };

  const handleCancel = () => {
    setIsCancelled(true);
    setIsVisible(false);
  };

  // Circular SVG progress ring equations
  const radius = 18;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed bottom-24 right-6 md:right-8 z-[980] max-w-sm md:max-w-md w-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl text-white shadow-[0_10px_50px_rgba(0,0,0,0.8),_0_0_30px_rgba(0,240,255,0.06)] flex flex-col gap-4 animate-in fade-in slide-in-from-bottom duration-300">
      
      {/* Top Banner section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3.5 items-center">
          {/* Circular Countdown Progress Ring */}
          <div className="relative flex items-center justify-center shrink-0 w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              {/* Underlay tracking circle */}
              <circle
                className="text-white/10"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="24"
                cy="24"
              />
              {/* Animated progress circle */}
              <circle
                className="text-primary transition-all duration-300 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="24"
                cy="24"
              />
            </svg>
            <span className="absolute text-xs font-black text-primary tracking-tighter">{countdown}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-primary tracking-wider uppercase">Next Episode Autoplay</span>
            <h4 className="font-bold text-sm md:text-base truncate text-white mt-0.5 leading-snug">
              {nextEp.episodeTitle || `Episode ${nextEp.episode}`}
            </h4>
          </div>
        </div>

        {/* Dismiss icon button */}
        <button 
          onClick={handleCancel}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded-full hover:bg-white/5"
          title="Dismiss Autoplay"
        >
          <span className="material-symbols-rounded text-lg">close</span>
        </button>
      </div>

      {/* Media info card details */}
      <div className="flex gap-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
        {/* Next Card Thumbnail Preview */}
        <div className="relative w-28 h-16 md:w-36 md:h-20 bg-gradient-to-tr from-purple-950/40 to-zinc-900 rounded-lg overflow-hidden border border-white/5 shrink-0 flex items-center justify-center">
          <span className="material-symbols-rounded text-primary/40 text-3xl">play_circle</span>
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase text-zinc-300">
            S{nextEp.season.toString().padStart(2, '0')}E{nextEp.episode.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Text descriptions */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
            {nextEp.showName || 'Series'}
          </p>
          <h5 className="font-semibold text-xs md:text-sm text-zinc-200 truncate mt-0.5">
            {nextEp.displayName}
          </h5>
          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
            Season {nextEp.season}, Episode {nextEp.episode}
          </p>
        </div>
      </div>

      {/* Dynamic Action Control Buttons */}
      <div className="flex items-center justify-end gap-3 mt-1">
        <button 
          onClick={handleCancel}
          className="text-xs font-semibold px-4 py-2 hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          Keep Watching
        </button>
        <button 
          onClick={handlePlayNow}
          className="text-xs font-bold px-5 py-2.5 bg-primary text-black hover:bg-primary/95 rounded-lg shadow-lg hover:shadow-primary/20 flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-[1px] active:translate-y-0"
        >
          <span className="material-symbols-rounded text-sm">play_arrow</span>
          Play Now
        </button>
      </div>
    </div>
  );
};

export default NextEpisodeOverlay;
