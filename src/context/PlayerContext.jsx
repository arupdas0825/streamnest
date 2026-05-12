import React, { createContext, useContext, useState, useCallback } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState('none'); // 'full', 'mini', 'none'
  const [videoTitle, setVideoTitle] = useState('');
  
  const minimize = useCallback(() => {
    if (viewMode === 'full') {
      setViewMode('mini');
      // In a real app, we'd navigate to home here
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
  }, []);

  const openFull = useCallback((title) => {
    setVideoTitle(title);
    setViewMode('full');
  }, []);

  return (
    <PlayerContext.Provider value={{ viewMode, videoTitle, minimize, expand, close, openFull, setViewMode }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);
