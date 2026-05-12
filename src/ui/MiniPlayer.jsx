import React, { useState, useEffect, useRef } from 'react';

const MiniPlayer = ({ videoCore, title, onExpand, onClose }) => {
  const [isMuted, setIsMuted] = useState(videoCore.state.isMuted);
  const [isPlaying, setIsPlaying] = useState(videoCore.state.isPlaying);
  const [position, setPosition] = useState({ x: window.innerWidth - 320 - 24, y: window.innerHeight - 180 - 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    videoCore.on('play', handlePlay);
    videoCore.on('pause', handlePause);
    return () => {
      // Cleanup
    };
  }, [videoCore]);

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      let newX = e.clientX - offsetRef.current.x;
      let newY = e.clientY - offsetRef.current.y;
      
      // Boundaries
      newX = Math.max(12, Math.min(newX, window.innerWidth - 320 - 12));
      newY = Math.max(12, Math.min(newY, window.innerHeight - 180 - 12));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleMute = (e) => {
    e.stopPropagation();
    videoCore.setMuted(!videoCore.state.isMuted);
    setIsMuted(videoCore.state.isMuted);
  };

  return (
    <div 
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{ left: position.x, top: position.y }}
      className={`fixed w-80 h-44 z-[999] group bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-shadow hover:shadow-primary/20 ${isDragging ? 'cursor-grabbing scale-105 shadow-3xl' : 'cursor-grab'} animate-in zoom-in-95 duration-300`}
    >
      {/* Video Overlay controls */}
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex flex-col justify-between p-3">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-white/70 font-medium truncate pr-8">{title}</p>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-black/50 hover:bg-red-500 text-white transition-colors"
          >
            <span className="material-symbols-rounded text-sm">close</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); videoCore.togglePlay(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all"
          >
            <span className="material-symbols-rounded text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-white/80 hover:text-white">
              <span className="material-symbols-rounded text-lg">{isMuted ? 'volume_off' : 'volume_up'}</span>
            </button>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-primary hover:text-black text-white text-[10px] font-bold transition-all"
          >
            <span className="material-symbols-rounded text-sm">open_in_full</span>
            EXPAND
          </button>
        </div>
      </div>

      {/* The video element in the background is still in the full player, we'll use a hack or a portal? */}
      {/* Actually, in this architecture, we'll just move the existing video container! */}
      <div id="mini-player-video-target" className="w-full h-full bg-black"></div>
    </div>
  );
};

export default MiniPlayer;
