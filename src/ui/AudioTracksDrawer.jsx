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

  // Detect Chromium/Firefox restriction (native multi-track limitations)
  const isChromiumBased = !('audioTracks' in HTMLVideoElement.prototype);

  return (
    <>
      {/* Dimmed backdrop background (closes drawer on click-outside) */}
      <div 
        onClick={closeAudioDrawer}
        className={`fixed inset-0 bg-black/70 backdrop-blur-[2px] z-[988] transition-opacity duration-300 ease-out ${
          isAudioDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
          inset-x-0 bottom-0 h-[70vh] rounded-t-[2rem] border-t
          /* Desktop: right sidebar */
          md:inset-y-0 md:right-0 md:left-auto md:w-[26rem] md:h-full md:rounded-none md:border-t-0 md:border-l
          ${isAudioDrawerOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
        `}
      >
        {/* Mobile Swipe-Down/Drag Handle Indicator */}
        <div 
          onClick={closeAudioDrawer}
          className="md:hidden flex justify-center py-3 shrink-0 cursor-pointer group"
        >
          <div className="w-12 h-1.5 bg-white/20 group-hover:bg-white/40 rounded-full transition-colors" />
        </div>

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              Audio Tracks
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-medium text-zinc-400">
                {audioTracks.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Select audio language or sync external tracks
            </p>
          </div>
          
          <button 
            onClick={closeAudioDrawer}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/5"
            title="Close Drawer"
          >
            <span className="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Tracks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Dynamic Browser Support Notice */}
          {isChromiumBased && (
            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-2xl flex flex-col gap-1.5 text-xs text-zinc-300 shadow-inner">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-rounded text-sm">info</span>
                Chromium Engine Restrict
              </div>
              <p className="leading-relaxed">
                Google Chrome, Edge, and Firefox restrict playing multiple embedded audio tracks on local video decoders.
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
                <span className="material-symbols-rounded text-xs">sync</span>
                Cinema-Sync audio engine active
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {audioTracks.map((track) => {
              const isActive = track.isActive || track.id === currentAudioTrackId;
              const isExternal = track.type === 'external';
              
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
                  className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex items-center justify-between gap-3 ${
                    isActive 
                      ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.07] hover:border-white/15 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  {/* Left glowing accent line */}
                  {isActive && (
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_8px_#00f0ff]" />
                  )}

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider ${
                        isActive ? 'bg-primary text-black' : 'bg-white/10 text-zinc-300'
                      }`}>
                        {isExternal ? 'SYNCED EXTERNAL' : 'EMBEDDED'}
                      </span>
                      {track.language && track.language !== 'unknown' && (
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                          {track.language}
                        </span>
                      )}
                    </div>
                    
                    <h4 className={`font-bold text-sm truncate transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-zinc-100 group-hover:text-white'
                    }`}>
                      {track.name}
                    </h4>
                  </div>

                  {/* Checked indicator */}
                  <div className="flex items-center justify-center shrink-0 h-7 w-7 rounded-full transition-all duration-300">
                    {isActive ? (
                      <span className="material-symbols-rounded text-primary text-xl font-bold">check</span>
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
        <div className="p-4 border-t border-white/5 bg-zinc-950/45 shrink-0">
          <button 
            onClick={handleImportClick}
            className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 text-zinc-100 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-white/5"
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
