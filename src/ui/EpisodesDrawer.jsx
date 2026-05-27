import React, { useEffect, useRef, useState } from 'react';
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
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Group unique seasons and sort them
  const uniqueSeasons = Array.from(new Set(playlist.map(ep => ep.season))).sort((a, b) => a - b);

  // Auto-sync selected season tab when the active episode changes
  useEffect(() => {
    if (currentEpisodeIndex !== -1 && playlist[currentEpisodeIndex]) {
      setSelectedSeason(playlist[currentEpisodeIndex].season);
    }
  }, [currentEpisodeIndex, playlist]);

  // Auto scroll active episode card into view
  useEffect(() => {
    if (isEpisodesDrawerOpen && listRef.current) {
      const activeCard = listRef.current.querySelector('.sn-episode-card-active');
      if (activeCard) {
        const timer = setTimeout(() => {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 220);
        return () => clearTimeout(timer);
      }
    }
  }, [isEpisodesDrawerOpen, currentEpisodeIndex, selectedSeason]);

  if (playlist.length === 0) return null;

  // Filter episodes by selected season (if multiple seasons exist)
  const filteredEpisodes = uniqueSeasons.length > 1
    ? playlist.filter(ep => ep.season === selectedSeason)
    : playlist;

  // Generate premium cinematic abstract thumbnail gradients based on episode number
  const getThumbnailGradient = (idx) => {
    const gradients = [
      'from-[#0b192c] via-[#004e64] to-[#000814]', // Cinematic Dark Ocean Teal
      'from-[#2d001b] via-[#6f003a] to-[#0f000b]', // Cinematic Deep Plum/Rose
      'from-[#14002e] via-[#3a006f] to-[#070014]', // Cinematic Cosmic Violet
      'from-[#2d1b00] via-[#5c3a00] to-[#120b00]', // Cinematic Golden Amber
      'from-[#051a0e] via-[#104b2a] to-[#020d06]', // Cinematic Shadow Forest
      'from-[#1c1c1e] via-[#2c2c2e] to-[#111112]'  // Cinematic Carbon Grey
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <>
      {/* Soundwave equalizer animations and custom premium styling block */}
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
        
        .sn-custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .sn-custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sn-custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          transition: background 0.3s;
        }
        .sn-custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.3);
        }
        .sn-custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
        }
        
        @keyframes sn-card-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(0, 240, 255, 0.04), inset 0 0 10px rgba(0, 240, 255, 0.02);
            border-color: rgba(0, 240, 255, 0.18);
          }
          50% {
            box-shadow: 0 0 25px rgba(0, 240, 255, 0.12), inset 0 0 15px rgba(0, 240, 255, 0.05);
            border-color: rgba(0, 240, 255, 0.35);
          }
        }
        .sn-episode-card-active {
          animation: sn-card-glow 4s ease-in-out infinite;
        }
      `}} />

      {/* Dimmed backdrop background (closes drawer on click-outside) */}
      <div 
        onClick={closeEpisodesDrawer}
        className={`fixed inset-0 bg-black/80 backdrop-blur-[6px] z-[988] transition-opacity duration-500 ease-out ${
          isEpisodesDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sliding Drawer Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className={`fixed z-[990] bg-[#09090d]/92 md:bg-[#07070a]/92 backdrop-blur-3xl text-white flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-zinc-800/40
          /* Mobile: bottom sheet */
          inset-x-0 bottom-0 h-[80vh] rounded-t-[2.5rem] border-t border-white/[0.08] shadow-[0_-15px_40px_rgba(0,0,0,0.85)]
          /* Desktop: right sidebar */
          md:inset-y-0 md:right-0 md:left-auto md:w-[28rem] md:h-full md:rounded-none md:border-t-0 md:border-l md:border-white/[0.06] md:shadow-[-15px_0_40px_rgba(0,0,0,0.85)]
          ${isEpisodesDrawerOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
        `}
      >
        {/* Mobile Swipe-Down/Drag Handle Indicator */}
        <div 
          onClick={closeEpisodesDrawer}
          className="md:hidden flex justify-center py-4 shrink-0 cursor-pointer group"
        >
          <div className="w-12 h-1 bg-white/20 group-hover:bg-white/40 rounded-full transition-colors" />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl tracking-tight text-white flex items-center gap-2.5">
              Episodes
              <span className="text-xs bg-primary/20 border border-primary/30 text-primary px-2.5 py-0.5 rounded-full font-bold">
                {playlist.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-semibold mt-1 uppercase tracking-wider truncate max-w-[18rem] md:max-w-[19rem]">
              {playlist[0]?.showName || 'Series Playlist'}
            </p>
          </div>
          
          <button 
            onClick={closeEpisodesDrawer}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-95 duration-200"
            title="Close Drawer"
          >
            <span className="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        {/* Multi-Season Selector Tabs */}
        {uniqueSeasons.length > 1 && (
          <div className="flex gap-2 px-6 py-3 border-b border-white/5 overflow-x-auto sn-no-scrollbar shrink-0 bg-zinc-950/20">
            {uniqueSeasons.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-300 cursor-pointer active:scale-95 ${
                  selectedSeason === s
                    ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                Season {s}
              </button>
            ))}
          </div>
        )}

        {/* Episodes Scrollable List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-5 space-y-3.5 sn-custom-scrollbar"
        >
          {filteredEpisodes.map((ep) => {
            const isActive = ep.index === currentEpisodeIndex;
            const episodeStr = `EP ${ep.episode.toString().padStart(2, '0')}`;
            const isFinished = ep.progress >= 0.95;
            
            return (
              <div 
                key={`${ep.id}-${ep.index}`}
                onClick={() => {
                  playEpisode(ep.index);
                  // Keep drawer open on desktop, close on mobile for compact playback focus
                  if (window.innerWidth < 768) {
                    closeEpisodesDrawer();
                  }
                }}
                className={`group relative p-3 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col gap-2.5 will-change-transform active:scale-[0.98] ${
                  isActive 
                    ? 'bg-primary/[0.04] border-primary/20 sn-episode-card-active' 
                    : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
                }`}
              >
                {/* Active Indicator Left Accent Line */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_10px_#00f0ff] animate-pulse" />
                )}
                
                <div className="flex gap-3.5">
                  {/* Aspect-Video Thumbnail Placeholder */}
                  <div className="relative aspect-video w-28 shrink-0 rounded-xl overflow-hidden bg-zinc-950 border border-white/[0.06] group-hover:border-white/10 transition-colors duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getThumbnailGradient(ep.index)} opacity-60`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Play/Equalizer State overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isActive ? (
                        <div className="flex items-end gap-[3px] h-4">
                          <div className="w-[3px] bg-primary rounded-t-full sn-wave-1 shadow-[0_0_8px_#00f0ff]" />
                          <div className="w-[3px] bg-primary rounded-t-full sn-wave-2 shadow-[0_0_8px_#00f0ff]" />
                          <div className="w-[3px] bg-primary rounded-t-full sn-wave-3 shadow-[0_0_8px_#00f0ff]" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-[3px] border border-white/10 flex items-center justify-center scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
                          <span className="material-symbols-rounded text-lg text-primary pl-0.5">play_arrow</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar precisely anchored at the bottom edge of the thumbnail */}
                    {ep.progress > 0 && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isActive ? 'bg-primary shadow-[0_0_6px_#00f0ff]' : 'bg-zinc-400'
                          }`}
                          style={{ width: `${Math.round(ep.progress * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Metadata Container */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase border ${
                          isActive 
                            ? 'bg-primary/20 text-primary border-primary/20' 
                            : 'bg-white/5 text-zinc-400 border-white/5'
                        }`}>
                          {episodeStr}
                        </span>
                        {isFinished && !isActive && (
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                            <span className="material-symbols-rounded text-[11px] fill-current">check_circle</span>
                            Watched
                          </span>
                        )}
                      </div>
                      
                      <h4 className={`font-bold text-sm leading-snug line-clamp-2 transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-zinc-100 group-hover:text-white'
                      }`}>
                        {ep.episodeTitle || `Episode ${ep.episode}`}
                      </h4>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mt-1">
                      <span>Season {ep.season}</span>
                      {ep.progress > 0 && ep.progress < 0.95 && (
                        <span className="text-zinc-500 font-normal">
                          {Math.round(ep.progress * 100)}% watched
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default EpisodesDrawer;

