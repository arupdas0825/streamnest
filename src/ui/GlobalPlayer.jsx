import React, { useEffect, useState } from 'react';
import { PlayerProvider, usePlayerContext } from '../context/PlayerContext.jsx';
import MiniPlayer from './MiniPlayer.jsx';

const GlobalPlayerContent = ({ videoCore, uiController }) => {
  const { viewMode, videoTitle, expand, close, setViewMode } = usePlayerContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleMinimize = () => minimize();
    const handleOpen = (e) => openFull(e.detail.title);

    window.addEventListener('sn-minimize-player', handleMinimize);
    window.addEventListener('sn-open-player', handleOpen);

    return () => {
      window.removeEventListener('sn-minimize-player', handleMinimize);
      window.removeEventListener('sn-open-player', handleOpen);
    };
  }, [minimize, openFull]);

  useEffect(() => {
    const videoContainer = document.getElementById('video-container');
    const playerScreen = document.getElementById('player-screen');
    const landingScreen = document.getElementById('landing-screen');
    const miniTarget = document.getElementById('mini-player-video-target');

    if (!videoContainer || !playerScreen || !landingScreen) return;

    if (viewMode === 'full') {
      // Return to full screen
      playerScreen.appendChild(videoContainer);
      playerScreen.classList.add('active');
      landingScreen.classList.remove('active');
      videoContainer.classList.remove('is-mini');
      uiController.renderAdvancedControls();
    } else if (viewMode === 'mini') {
      // Switch to mini mode
      if (miniTarget) {
        miniTarget.appendChild(videoContainer);
      }
      playerScreen.classList.remove('active');
      landingScreen.classList.add('active');
      videoContainer.classList.add('is-mini');
      uiController.renderContinueWatching();
    } else if (viewMode === 'none') {
      // Close player
      playerScreen.classList.remove('active');
      landingScreen.classList.add('active');
      videoContainer.classList.remove('is-mini');
      playerScreen.appendChild(videoContainer);
      uiController.renderContinueWatching();
    }
  }, [viewMode, uiController]);

  if (!isMounted) return null;

  return (
    <>
      {viewMode === 'mini' && (
        <MiniPlayer 
          videoCore={videoCore} 
          title={videoTitle} 
          onExpand={expand} 
          onClose={() => {
            videoCore.unload();
            close();
          }} 
        />
      )}
    </>
  );
};

const GlobalPlayer = ({ videoCore, uiController }) => {
  return (
    <PlayerProvider>
      <GlobalPlayerContent videoCore={videoCore} uiController={uiController} />
    </PlayerProvider>
  );
};

export default GlobalPlayer;
