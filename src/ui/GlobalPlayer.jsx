import React, { useState, useEffect } from 'react';
import { PlayerProvider, usePlayerContext } from '../context/PlayerContext.jsx';
import MiniPlayer from './MiniPlayer.jsx';
import AmbientTheater from './AmbientTheater.jsx';

const GlobalPlayerContent = ({ videoCore, uiController }) => {
  const { viewMode, videoTitle, isTheaterMode, expand, close, setViewMode, toggleTheater, openFull, minimize } = usePlayerContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleMinimize = () => minimize();
    const handleOpen = (e) => openFull(e.detail.title);
    const handleTheater = () => toggleTheater();

    window.addEventListener('sn-minimize-player', handleMinimize);
    window.addEventListener('sn-open-player', handleOpen);
    window.addEventListener('sn-toggle-theater', handleTheater);

    return () => {
      window.removeEventListener('sn-minimize-player', handleMinimize);
      window.removeEventListener('sn-open-player', handleOpen);
      window.removeEventListener('sn-toggle-theater', handleTheater);
    };
  }, [minimize, openFull, toggleTheater]);

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
      
      if (isTheaterMode) {
        videoContainer.classList.add('is-theater');
      } else {
        videoContainer.classList.remove('is-theater');
      }
    } else if (viewMode === 'mini') {
      // Switch to mini mode
      if (miniTarget) {
        miniTarget.appendChild(videoContainer);
      }
      playerScreen.classList.remove('active');
      landingScreen.classList.add('active');
      videoContainer.classList.add('is-mini');
    } else if (viewMode === 'none') {
      // Close player
      playerScreen.classList.remove('active');
      landingScreen.classList.add('active');
      videoContainer.classList.remove('is-mini');
      playerScreen.appendChild(videoContainer);
    }
  }, [viewMode, uiController]);

  if (!isMounted) return null;

  return (
    <>
      {viewMode === 'full' && (
        <AmbientTheater videoElement={videoCore.video} isActive={true} />
      )}
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
