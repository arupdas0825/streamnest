import { useState, useEffect } from 'react';

/**
 * usePlayerState
 * Syncs VideoCore engine state with React state for UI rendering.
 */
export const usePlayerState = (videoCore) => {
  const [state, setState] = useState({
    isPlaying: videoCore.state.isPlaying,
    currentTime: videoCore.state.currentTime,
    duration: videoCore.state.duration,
    volume: videoCore.state.volume,
    isMuted: videoCore.state.isMuted,
    playbackRate: videoCore.state.playbackRate,
    buffered: 0,
    brightness: videoCore.state.brightness || 1,
    isTheaterMode: false,
    subtitleSize: 24,
    subtitleOpacity: 0.65,
  });

  useEffect(() => {
    const handleTime = (t) => setState(s => ({ ...s, currentTime: t }));
    const handleDuration = (d) => setState(s => ({ ...s, duration: d }));
    const handlePlay = () => setState(s => ({ ...s, isPlaying: true }));
    const handlePause = () => setState(s => ({ ...s, isPlaying: false }));
    const handleProgress = (b) => setState(s => ({ ...s, buffered: b }));
    
    videoCore.on('timeupdate', handleTime);
    videoCore.on('durationchange', handleDuration);
    videoCore.on('play', handlePlay);
    videoCore.on('pause', handlePause);
    videoCore.on('progress', handleProgress);
    videoCore.on('loadedmetadata', () => setState(s => ({ ...s, duration: videoCore.state.duration })));

    return () => {
      // Note: VideoCore doesn't have an 'off' method in current implementation
      // We should ideally add one, but for now we'll just let it be or add it.
    };
  }, [videoCore]);

  // Methods to update state that also trigger VideoCore
  const togglePlay = () => videoCore.togglePlay();
  const seek = (time) => videoCore.seek(time);
  const setVolume = (v) => {
    videoCore.setVolume(v);
    setState(s => ({ ...s, volume: v, isMuted: v === 0 }));
    localStorage.setItem('sn-volume', v);
  };
  const setMuted = (m) => {
    videoCore.setMuted(m);
    setState(s => ({ ...s, isMuted: m }));
  };
  const setPlaybackRate = (r) => {
    videoCore.setPlaybackRate(r);
    setState(s => ({ ...s, playbackRate: r }));
  };
  const setTheaterMode = (val) => {
    setState(s => ({ ...s, isTheaterMode: val }));
  };

  const setSubtitleSize = (size) => {
    setState(s => ({ ...s, subtitleSize: size }));
    document.documentElement.style.setProperty('--sub-size', `${size}px`);
  };

  const setSubtitleOpacity = (op) => {
    setState(s => ({ ...s, subtitleOpacity: op }));
    document.documentElement.style.setProperty('--sub-bg', `rgba(0,0,0,${op})`);
  };

  return { 
    ...state, 
    togglePlay, 
    seek, 
    setVolume, 
    setMuted, 
    setPlaybackRate,
    setTheaterMode,
    setSubtitleSize,
    setSubtitleOpacity
  };
};
