import React, { useEffect, useRef } from 'react';
import { usePlayerContext } from '../context/PlayerContext.jsx';

const EpisodesDrawer = () => {
  const { 
    playlist, 
    currentEpisodeIndex, 
    isEpisodesDrawerOpen, 
    closeEpisodesDrawer, 
    playEpisode 
  } = usePlayerContext();

  const listRef = useRef(null);

  // Auto scroll active episode card into view
  useEffect(() => {
    if (isEpisodesDrawerOpen && listRef.current) {
      const activeCard = listRef.current.querySelector('.sn-episode-card-active');
      if (activeCard) {
        const timer = setTimeout(() => {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 180);
        return () => clearTimeout(timer);
      }
    }
  }, [isEpisodesDrawerOpen, currentEpisodeIndex]);

  if (playlist.length === 0) return null;

  return (
    <>
      {/* Soundwave equalizer animations and custom styling block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sn-soundwave-1 {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        @keyframes sn-soundwave-2 {
          0%, 100% { height: 8px; }
          50% { height: 13px; }
        }
        @keyframes sn-soundwave-3 {
          0%, 100% { height: 5px; }
          50% { height: 18px; }
        }
        .sn-wave-1 { animation: sn-soundwave-1 0.75s ease-in-out infinite; }
        .sn-wave-2 { animation: sn-soundwave-2 0.65s ease-in-out infinite; }
        .sn-wave-3 { animation: sn-soundwave-3 0.85s ease-in-out infinite; }
        
        .sn-no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .sn-no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Dimmed backdrop background (closes drawer on click-outside) */}
      <div 
        onClick={closeEpisodesDrawer}
        className={`fixed inset-0 bg-black/70 backdrop-blur-[2px] z-[988] transition-opacity duration-300 ease-out ${
          isEpisodesDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sliding Drawer Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className={`fixed z-[990] bg-zinc-950/90 backdrop-blur-2xl text-white flex flex-col shadow-3xl transition-all duration-300 ease-out border-zinc-800/60
          /* Mobile: bottom sheet */
          inset-x-0 bottom-0 h-[75vh] rounded-t-[2rem] border-t
          /* Desktop: right sidebar */
          md:inset-y-0 md:right-0 md:left-auto md:w-[26rem] md:h-full md:rounded-none md:border-t-0 md:border-l
          ${isEpisodesDrawerOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
        `}
      >
        {/* Mobile Swipe-Down/Drag Handle Indicator */}
        <div 
          onClick={closeEpisodesDrawer}
          className="md:hidden flex justify-center py-3 shrink-0 cursor-pointer group"
        >
          <div className="w-12 h-1.5 bg-white/20 group-hover:bg-white/40 rounded-full transition-colors" />
        </div>

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              Season Episodes
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-medium text-zinc-400">
                {playlist.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-1 truncate max-w-[18rem] md:max-w-[19rem]">
              {playlist[0]?.showName || 'Series Playlist'}
            </p>
          </div>
          
          <button 
            onClick={closeEpisodesDrawer}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
            title="Close Drawer"
          >
            <span className="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        {/* Episodes Scrollable List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 sn-no-scrollbar"
        >
          {playlist.map((ep, idx) => {
            const isActive = idx === currentEpisodeIndex;
            const episodeStr = `EP ${ep.episode.toString().padStart(2, '0')}`;
            const isFinished = ep.progress >= 0.95;
            
            return (
              <div 
                key={`${ep.id}-${idx}`}
                onClick={() => {
                  playEpisode(idx);
                  // Keep drawer open on desktop, close on mobile for compact playback focus
                  if (window.innerWidth < 768) {
                    closeEpisodesDrawer();
                  }
                }}
                className={`group relative p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col gap-2 ${
                  isActive 
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] sn-episode-card-active' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.07] hover:border-white/15 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* Active Indicator Left Accent Line */}
                {isActive && (
                  <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-primary rounded-r-full shadow-[0_0_8px_#00f0ff]" />
                )}
                
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider ${
                        isActive ? 'bg-primary text-black' : 'bg-white/10 text-zinc-300'
                      }`}>
                        S{ep.season.toString().padStart(2, '0')}{episodeStr}
                      </span>
                      {isFinished && !isActive && (
                        <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-0.5">
                          <span className="material-symbols-rounded text-xs">check_circle</span>
                          Watched
                        </span>
                      )}
                    </div>
                    
                    <h4 className={`font-bold text-sm truncate transition-colors duration-200 pr-2 ${
                      isActive ? 'text-primary' : 'text-zinc-100 group-hover:text-white'
                    }`}>
                      {ep.episodeTitle || `Episode ${ep.episode}`}
                    </h4>
                  </div>

                  {/* Right side icon/equalizer */}
                  <div className="flex items-center justify-center shrink-0">
                    {isActive ? (
                      <div className="flex items-end gap-[2px] h-4 w-4 shrink-0 overflow-hidden pr-0.5">
                        <div className="w-[3px] bg-primary rounded-t-full sn-wave-1" />
                        <div className="w-[3px] bg-primary rounded-t-full sn-wave-2" />
                        <div className="w-[3px] bg-primary rounded-t-full sn-wave-3" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/5 group-hover:bg-primary/25 border border-white/5 text-zinc-400 group-hover:text-primary flex items-center justify-center transition-all duration-300">
                        <span className="material-symbols-rounded text-base pl-0.5">play_arrow</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar line */}
                {ep.progress > 0 && ep.progress < 0.95 && (
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isActive ? 'bg-primary shadow-[0_0_4px_#00f0ff]' : 'bg-zinc-500'
                      }`}
                      style={{ width: `${Math.round(ep.progress * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default EpisodesDrawer;
