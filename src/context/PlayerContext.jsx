import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState('none'); // 'full', 'mini', 'none'
  const [videoTitle, setVideoTitle] = useState('');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  
  // Playlist System States
  const [playlist, setPlaylist] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(-1);
  const [isEpisodesDrawerOpen, setIsEpisodesDrawerOpen] = useState(false);

  // Synchronize with Vanilla PlaylistManager events
  useEffect(() => {
    const handlePlaylistUpdate = (e) => {
      if (e.detail) {
        setPlaylist(e.detail.episodes || []);
        setCurrentEpisodeIndex(e.detail.currentIndex !== undefined ? e.detail.currentIndex : -1);
      }
    };

    window.addEventListener('sn-playlist-update', handlePlaylistUpdate);
    return () => {
      window.removeEventListener('sn-playlist-update', handlePlaylistUpdate);
    };
  }, []);

  const minimize = useCallback(() => {
    if (viewMode === 'full') {
      setViewMode('mini');
    }
  }, [viewMode]);

  const expand = useCallback(() => {
    if (viewMode === 'mini') {
      setViewMode('full');
    }
  }, [viewMode]);

  const close = useCallback(() => {
    setViewMode('none');
    setVideoTitle('');
    setPlaylist([]);
    setCurrentEpisodeIndex(-1);
    setIsEpisodesDrawerOpen(false);
  }, []);

  const openFull = useCallback((title) => {
    setVideoTitle(title);
    setViewMode('full');
  }, []);

  const toggleTheater = useCallback(() => {
    setIsTheaterMode(prev => !prev);
  }, []);

  // Playlist Navigation Actions
  const playEpisode = useCallback((index) => {
    window.dispatchEvent(new CustomEvent('sn-play-episode', { detail: { index } }));
  }, []);

  const playNext = useCallback(() => {
    window.dispatchEvent(new CustomEvent('sn-play-next'));
  }, []);

  const playPrev = useCallback(() => {
    window.dispatchEvent(new CustomEvent('sn-play-prev'));
  }, []);

  const toggleEpisodesDrawer = useCallback(() => {
    setIsEpisodesDrawerOpen(prev => !prev);
  }, []);

  const closeEpisodesDrawer = useCallback(() => {
    setIsEpisodesDrawerOpen(false);
  }, []);

  return (
    <PlayerContext.Provider value={{ 
      viewMode, videoTitle, isTheaterMode,
      playlist, currentEpisodeIndex, isEpisodesDrawerOpen,
      minimize, expand, close, openFull, toggleTheater,
      setViewMode, playEpisode, playNext, playPrev,
      toggleEpisodesDrawer, closeEpisodesDrawer, setIsEpisodesDrawerOpen
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);
