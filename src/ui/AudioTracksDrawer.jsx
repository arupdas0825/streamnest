import React from 'react';
import { usePlayerContext } from '../context/PlayerContext.jsx';

const AudioTracksDrawer = () => {
  const {
    audioTracks,
    currentAudioTrackId,
    isAudioDrawerOpen,
    closeAudioDrawer,
    selectAudioTrack
  } = usePlayerContext();

  const handleImportClick = () => {
    window.dispatchEvent(new CustomEvent('sn-open-audio-drawer-import'));
  };

  if (audioTracks.length === 0) return null;

  return (
    <>
      {/* Scrollbar and custom styling block */}
      <style dangerouslySetInnerHTML={{__html: `
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
        
        @keyframes sn-audio-card-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(0, 240, 255, 0.04), inset 0 0 10px rgba(0, 240, 255, 0.02);
            border-color: rgba(0, 240, 255, 0.18);
          }
          50% {
            box-shadow: 0 0 25px rgba(0, 240, 255, 0.12), inset 0 0 15px rgba(0, 240, 255, 0.05);
            border-color: rgba(0, 240, 255, 0.35);
          }
        }
        .sn-audio-card-active {
          animation: sn-audio-card-glow 4s ease-in-out infinite;
        }
      `}} />

      {/* Dimmed backdrop background (closes drawer on click-outside) */}
      <div 
        onClick={closeAudioDrawer}
        className={`fixed inset-0 bg-black/80 backdrop-blur-[6px] z-[988] transition-opacity duration-500 ease-out ${
          isAudioDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
          inset-x-0 bottom-0 h-[70vh] rounded-t-[2.5rem] border-t border-white/[0.08] shadow-[0_-15px_40px_rgba(0,0,0,0.85)]
          /* Desktop: right sidebar */
          md:inset-y-0 md:right-0 md:left-auto md:w-[28rem] md:h-full md:rounded-none md:border-t-0 md:border-l md:border-white/[0.06] md:shadow-[-15px_0_40px_rgba(0,0,0,0.85)]
          ${isAudioDrawerOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
        `}
      >
        {/* Mobile Swipe-Down/Drag Handle Indicator */}
        <div 
          onClick={closeAudioDrawer}
          className="md:hidden flex justify-center py-4 shrink-0 cursor-pointer group"
        >
          <div className="w-12 h-1 bg-white/20 group-hover:bg-white/40 rounded-full transition-colors" />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl tracking-tight text-white flex items-center gap-2.5">
              Audio Tracks
              <span className="text-xs bg-primary/20 border border-primary/30 text-primary px-2.5 py-0.5 rounded-full font-bold">
                {audioTracks.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-semibold mt-1 uppercase tracking-wider">
              Languages & Format sync
            </p>
          </div>
          
          <button 
            onClick={closeAudioDrawer}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-95 duration-200"
            title="Close Drawer"
          >
            <span className="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Tracks List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 sn-custom-scrollbar">
          <div className="space-y-3">
            {audioTracks.map((track) => {
              const isActive = track.isActive || track.id === currentAudioTrackId;
              const isExternal = track.type === 'external';
              
              // Formatting subtitle strings beautifully (VLC/Netflix style)
              const formatLabel = track.channels && track.codec 
                ? `${track.channels} • ${track.codec.toUpperCase()}`
                : track.channels || track.codec || 'Stereo';
              
              return (
                <div 
                  key={track.id}
                  onClick={() => {
                    selectAudioTrack(track.id);
                    // Close drawer on mobile, keep open on desktop
                    if (window.innerWidth < 768) {
                      closeAudioDrawer();
                    }
                  }}
                  className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex items-center justify-between gap-4 will-change-transform active:scale-[0.98] ${
                    isActive 
                      ? 'bg-primary/[0.04] border-primary/20 sn-audio-card-active' 
                      : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Left glowing accent line */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_10px_#00f0ff] animate-pulse" />
                  )}

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase border ${
                        isActive 
                          ? 'bg-primary/20 text-primary border-primary/20' 
                          : 'bg-white/5 text-zinc-400 border-white/5'
                      }`}>
                        {isExternal ? 'Synced Ext' : 'Embedded'}
                      </span>
                      {track.language && track.language !== 'unknown' && track.language !== 'default' && (
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                          {track.language}
                        </span>
                      )}
                    </div>
                    
                    <h4 className={`font-bold text-sm leading-snug truncate transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-zinc-100 group-hover:text-white'
                    }`}>
                      {track.name}
                    </h4>

                    <span className="text-[11px] text-zinc-500 font-medium">
                      {formatLabel}
                    </span>
                  </div>

                  {/* Checked indicator */}
                  <div className="flex items-center justify-center shrink-0 h-8 w-8 rounded-full border transition-all duration-300 cursor-pointer border-white/5 bg-white/5 group-hover:border-white/15">
                    {isActive ? (
                      <span className="material-symbols-rounded text-primary text-xl font-black">check</span>
                    ) : (
                      <span className="material-symbols-rounded text-zinc-600 group-hover:text-zinc-400 text-lg">radio_button_unchecked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with External Import Trigger */}
        <div className="p-5 border-t border-white/5 bg-zinc-950/20 shrink-0">
          <button 
            onClick={handleImportClick}
            className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2.5 text-zinc-100 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-white/5 active:scale-95"
          >
            <span className="material-symbols-rounded text-base">music_video</span>
            Import Local Audio File
          </button>
        </div>
      </div>
    </>
  );
};

export default AudioTracksDrawer;

