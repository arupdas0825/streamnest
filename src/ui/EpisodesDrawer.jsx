import React from 'react';
import { usePlayerContext } from '../context/PlayerContext.jsx';

const EpisodesDrawer = () => {
  const { 
    playlist, 
    currentEpisodeIndex, 
    isEpisodesDrawerOpen, 
    closeEpisodesDrawer, 
    playEpisode 
  } = usePlayerContext();

  if (!isEpisodesDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 z-[990] bg-zinc-950/85 backdrop-blur-xl border-l border-white/10 text-white flex flex-col shadow-2xl transition-all duration-300 transform translate-x-0 animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg tracking-wide text-white">Episodes Queue</h3>
          <p className="text-xs text-zinc-400 font-medium">
            {playlist.length} {playlist.length === 1 ? 'episode' : 'episodes'} loaded
          </p>
        </div>
        <button 
          onClick={closeEpisodesDrawer}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <span className="material-symbols-rounded">close</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {playlist.map((ep, idx) => {
          const isActive = idx === currentEpisodeIndex;
          const showName = ep.showName || 'Series';
          const seasonEpStr = `S${ep.season.toString().padStart(2, '0')}E${ep.episode.toString().padStart(2, '0')}`;
          
          return (
            <div 
              key={ep.id}
              onClick={() => {
                playEpisode(idx);
                closeEpisodesDrawer();
              }}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                isActive 
                  ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5' 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-md" />
              )}
              
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider mb-1.5 ${
                    isActive ? 'bg-primary text-black' : 'bg-white/10 text-zinc-300'
                  }`}>
                    {seasonEpStr}
                  </span>
                  
                  <h4 className={`font-semibold text-sm truncate pr-4 ${isActive ? 'text-primary' : 'text-white'}`}>
                    {ep.episodeTitle || `Episode ${ep.episode}`}
                  </h4>
                  
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {showName}
                  </p>
                </div>

                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 group-hover:bg-white/15 text-zinc-400 group-hover:text-white transition-all shrink-0">
                  <span className="material-symbols-rounded text-lg">
                    {isActive ? 'pause' : 'play_arrow'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {ep.progress > 0 && (
                <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isActive ? 'bg-primary' : 'bg-zinc-400'}`}
                    style={{ width: `${Math.round(ep.progress * 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodesDrawer;
