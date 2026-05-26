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

  // Audio Tracks System States
  const [audioTracks, setAudioTracks] = useState([]);
  const [currentAudioTrackId, setCurrentAudioTrackId] = useState('native');
  const [isAudioDrawerOpen, setIsAudioDrawerOpen] = useState(false);

  // Synchronize with Vanilla PlaylistManager events
  useEffect(() => {
    const handlePlaylistUpdate = (e) => {
      if (e.detail) {
        setPlaylist(e.detail.episodes || []);
        setCurrentEpisodeIndex(e.detail.currentIndex !== undefined ? e.detail.currentIndex : -1);
      }
    };

    const handleToggleDrawer = () => {
      setIsEpisodesDrawerOpen(prev => !prev);
    };

    const handleCloseDrawer = () => {
      setIsEpisodesDrawerOpen(false);
    };

    window.addEventListener('sn-playlist-update', handlePlaylistUpdate);
    window.addEventListener('sn-toggle-episodes-drawer', handleToggleDrawer);
    window.addEventListener('sn-close-episodes-drawer', handleCloseDrawer);

    return () => {
      window.removeEventListener('sn-playlist-update', handlePlaylistUpdate);
      window.removeEventListener('sn-toggle-episodes-drawer', handleToggleDrawer);
      window.removeEventListener('sn-close-episodes-drawer', handleCloseDrawer);
    };
  }, []);

  // Synchronize with Audio Track events
  useEffect(() => {
    const handleAudioTracksUpdate = (e) => {
      if (e.detail) {
        setAudioTracks(e.detail.tracks || []);
        setCurrentAudioTrackId(e.detail.currentTrackId || 'native');
      }
    };

    const handleToggleAudioDrawer = () => {
      setIsAudioDrawerOpen(prev => !prev);
    };

    const handleCloseAudioDrawer = () => {
      setIsAudioDrawerOpen(false);
    };

    window.addEventListener('sn-audio-tracks-update', handleAudioTracksUpdate);
    window.addEventListener('sn-toggle-audio-drawer', handleToggleAudioDrawer);
    window.addEventListener('sn-close-audio-drawer', handleCloseAudioDrawer);

    return () => {
      window.removeEventListener('sn-audio-tracks-update', handleAudioTracksUpdate);
      window.removeEventListener('sn-toggle-audio-drawer', handleToggleAudioDrawer);
      window.removeEventListener('sn-close-audio-drawer', handleCloseAudioDrawer);
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
    setIsAudioDrawerOpen(false);
    setAudioTracks([]);
    setCurrentAudioTrackId('native');
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

  const toggleAudioDrawer = useCallback(() => {
    setIsAudioDrawerOpen(prev => !prev);
  }, []);

  const closeAudioDrawer = useCallback(() => {
    setIsAudioDrawerOpen(false);
  }, []);

  const selectAudioTrack = useCallback((id) => {
    window.dispatchEvent(new CustomEvent('sn-change-audio-track', { detail: { id } }));
  }, []);

  return (
    <PlayerContext.Provider value={{ 
      viewMode, videoTitle, isTheaterMode,
      playlist, currentEpisodeIndex, isEpisodesDrawerOpen,
      audioTracks, currentAudioTrackId, isAudioDrawerOpen,
      minimize, expand, close, openFull, toggleTheater,
      setViewMode, playEpisode, playNext, playPrev,
      toggleEpisodesDrawer, closeEpisodesDrawer, setIsEpisodesDrawerOpen,
      toggleAudioDrawer, closeAudioDrawer, selectAudioTrack
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);
