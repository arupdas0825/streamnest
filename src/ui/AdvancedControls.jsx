import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayerState } from '../hooks/usePlayerState.js';

const AdvancedControls = ({ videoCore, videoTitle, onBack }) => {
  const player = usePlayerState(videoCore);
  const [isVisible, setIsVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);
  const idleTimer = useRef(null);
  const seekRef = useRef(null);

  // Auto-hide controls
  const resetIdleTimer = useCallback(() => {
    setIsVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (player.isPlaying && !isSettingsOpen) {
      idleTimer.current = setTimeout(() => setIsVisible(false), 3000);
    }
  }, [player.isPlaying, isSettingsOpen]);

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    resetIdleTimer();
    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [resetIdleTimer]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          player.togglePlay();
          break;
        case 'f':
          videoCore.toggleFullscreen(document.getElementById('video-container'));
          break;
        case 'm':
          player.setMuted(!player.isMuted);
          break;
        case 'arrowleft':
          e.shiftKey ? player.seek(player.currentTime - 30) : player.seek(player.currentTime - 10);
          break;
        case 'arrowright':
          e.shiftKey ? player.seek(player.currentTime + 30) : player.seek(player.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault();
          player.setVolume(Math.min(1, player.volume + 0.05));
          break;
        case 'arrowdown':
          e.preventDefault();
          player.setVolume(Math.max(0, player.volume - 0.05));
          break;
        case '>':
        case '.':
          player.setPlaybackRate(Math.min(2, player.playbackRate + 0.25));
          break;
        case '<':
        case ',':
          player.setPlaybackRate(Math.max(0.25, player.playbackRate - 0.25));
          break;
        case 't':
          window.dispatchEvent(new CustomEvent('sn-toggle-theater'));
          break;
        case 'p':
          videoCore.togglePiP();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, videoCore]);

  // Formatting helpers
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Seekbar handlers
  const handleSeekMove = (e) => {
    const rect = seekRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverPos(pos * 100);
    setHoverTime(pos * player.duration);
  };

  const handleSeekClick = (e) => {
    const rect = seekRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seek(pos * player.duration);
  };

  // Mobile Gestures
  const lastTap = useRef(0);
  const handleTouchStart = (e) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const isRightSide = touchX > rect.width / 2;

    if (now - lastTap.current < 300) {
      // Double tap detected
      if (isRightSide) {
        player.seek(player.currentTime + 10);
      } else {
        player.seek(player.currentTime - 10);
      }
    }
    lastTap.current = now;
  };

  return (
    <div 
      className={`absolute inset-0 z-50 flex flex-col justify-between transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 cursor-none'}`}
      onTouchStart={handleTouchStart}
    >
      
      {/* Top Bar */}
      <div className="p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-rounded text-white text-3xl">arrow_back</span>
          </button>
          <h1 className="text-white text-lg font-medium truncate max-w-xl">{videoTitle || "No Media"}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => player.setTheaterMode(!player.isTheaterMode)}
            className={`p-2 rounded-lg text-white/70 hover:text-white transition-all ${player.isTheaterMode ? 'text-primary' : ''}`}
            title="Theater Mode (T)"
          >
            <span className="material-symbols-rounded">width_wide</span>
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all">
            <span className="material-symbols-rounded">info</span>
          </button>
        </div>
      </div>

      {/* Center Controls & Skip Intro */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="flex items-center justify-center gap-12">
          <button 
            onClick={() => player.seek(player.currentTime - 10)}
            className="text-white/80 hover:text-white transform hover:scale-110 transition-all active:scale-95"
          >
            <span className="material-symbols-rounded text-5xl">replay_10</span>
          </button>
          
          <button 
            onClick={player.togglePlay}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all transform hover:scale-110 active:scale-90"
          >
            <span className="material-symbols-rounded text-6xl">
              {player.isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button 
            onClick={() => player.seek(player.currentTime + 10)}
            className="text-white/80 hover:text-white transform hover:scale-110 transition-all active:scale-95"
          >
            <span className="material-symbols-rounded text-5xl">forward_10</span>
          </button>
        </div>

        {/* Skip Intro Button (Placeholder logic: show if within first 2 mins) */}
        {player.currentTime > 5 && player.currentTime < 120 && (
          <button 
            onClick={() => player.seek(120)}
            className="px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/20 text-white text-sm font-bold rounded-lg hover:bg-white hover:text-black transition-all animate-in fade-in slide-in-from-right-4"
          >
            SKIP INTRO
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="px-6 pb-8 bg-gradient-to-t from-black/90 to-transparent">
        
        {/* Custom Seek Bar */}
        <div 
          ref={seekRef}
          onMouseMove={handleSeekMove}
          onMouseLeave={() => setHoverTime(null)}
          onClick={handleSeekClick}
          className="group relative h-6 flex items-center cursor-pointer mb-4"
        >
          {/* Base */}
          <div className="absolute w-full h-1 bg-white/20 rounded-full overflow-hidden group-hover:h-2 transition-all duration-300">
            {/* Buffered */}
            <div 
              className="absolute h-full bg-white/20" 
              style={{ width: `${(player.buffered / player.duration) * 100}%` }}
            />
            {/* Progress */}
            <div 
              className="absolute h-full bg-primary shadow-[0_0_10px_rgba(0,240,255,0.8)]" 
              style={{ width: `${(player.currentTime / player.duration) * 100}%` }}
            />
          </div>

          {/* Hover Preview */}
          {hoverTime !== null && (
            <div 
              className="absolute bottom-8 px-2 py-1 bg-zinc-900 border border-white/10 rounded text-xs text-white transform -translate-x-1/2 pointer-events-none"
              style={{ left: `${hoverPos}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Thumb */}
          <div 
            className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 pointer-events-none"
            style={{ left: `${(player.currentTime / player.duration) * 100}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={player.togglePlay} className="text-white hover:text-primary transition-colors">
              <span className="material-symbols-rounded text-3xl">{player.isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>

            <div className="flex items-center group/vol">
              <button onClick={() => player.setMuted(!player.isMuted)} className="text-white hover:text-primary transition-colors">
                <span className="material-symbols-rounded text-2xl">
                  {player.isMuted || player.volume === 0 ? 'volume_off' : player.volume < 0.5 ? 'volume_down' : 'volume_up'}
                </span>
              </button>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={player.isMuted ? 0 : player.volume}
                onChange={(e) => player.setVolume(parseFloat(e.target.value))}
                className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-300 ml-2 accent-primary"
              />
            </div>

            <div className="text-sm font-medium text-white/80 tabular-nums">
              {formatTime(player.currentTime)} <span className="text-white/40 mx-1">/</span> {formatTime(player.duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`text-white hover:text-primary transition-colors ${isSettingsOpen ? 'text-primary' : ''}`}
            >
              <span className="material-symbols-rounded text-2xl">settings</span>
            </button>
            
            <button 
              onClick={() => videoCore.togglePiP()}
              className="text-white hover:text-primary transition-colors"
            >
              <span className="material-symbols-rounded text-2xl">picture_in_picture_alt</span>
            </button>

            <button 
              onClick={() => videoCore.toggleFullscreen(document.getElementById('video-container'))}
              className="text-white hover:text-primary transition-colors"
            >
              <span className="material-symbols-rounded text-3xl">fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="absolute right-6 bottom-24 w-72 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex border-b border-white/10 bg-white/5">
            <button className="flex-1 py-3 text-xs font-bold text-white uppercase tracking-widest border-b-2 border-primary">Playback</button>
            <button className="flex-1 py-3 text-xs font-bold text-white/40 uppercase tracking-widest">Subtitles</button>
          </div>
          
          <div className="p-2">
            <div className="text-white text-sm">
              <p className="px-3 py-2 text-white/60">Playback Speed</p>
              <div className="grid grid-cols-3 gap-1 px-2 mb-2">
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button 
                    key={rate}
                    onClick={() => player.setPlaybackRate(rate)}
                    className={`px-2 py-2 rounded text-center transition-colors ${player.playbackRate === rate ? 'bg-primary text-black' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              <hr className="border-white/10 my-2" />
              
              <p className="px-3 py-2 text-white/60">Subtitle Appearance</p>
              <div className="px-3 space-y-4 pb-2">
                <div className="flex justify-between items-center">
                  <span>Size</span>
                  <input 
                    type="range" min="16" max="48" 
                    value={player.subtitleSize}
                    onChange={(e) => player.setSubtitleSize(parseInt(e.target.value))}
                    className="w-32 accent-primary" 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Opacity</span>
                  <input 
                    type="range" min="0" max="1" step="0.1"
                    value={player.subtitleOpacity}
                    onChange={(e) => player.setSubtitleOpacity(parseFloat(e.target.value))}
                    className="w-32 accent-primary" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedControls;
