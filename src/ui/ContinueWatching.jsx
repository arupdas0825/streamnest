import React, { useEffect, useState } from 'react';
import { PlaybackManager } from '../modules/PlaybackManager.js';

const ContinueWatching = ({ onResume }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const history = PlaybackManager.getAll();
    const sortedItems = Object.values(history)
      .filter(item => item.progress < 0.95 && item.currentTime > 5)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    setItems(sortedItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Continue Watching</h2>
      
      <div className="relative group">
        <div className="flex gap-5 overflow-x-auto pb-8 scrollbar-hide mask-fade-right">
          {items.map((item) => (
            <div 
              key={item.mediaId}
              onClick={() => onResume(item)}
              className="flex-none w-[280px] h-[160px] relative rounded-xl overflow-hidden cursor-pointer 
                         border border-white/10 bg-zinc-900/50 backdrop-blur-xl
                         hover:scale-105 hover:border-primary/50 transition-all duration-500 group/card"
            >
              {/* Poster */}
              {item.thumbnail ? (
                <img src={item.thumbnail} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" alt={item.title} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <span className="material-symbols-rounded text-white/20 text-4xl">movie</span>
                </div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/30 transform scale-75 group-hover/card:scale-100 transition-transform duration-300">
                  <span className="material-symbols-rounded">play_arrow</span>
                </div>
              </div>

              {/* Metadata Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                <p className="text-sm font-semibold text-white truncate mb-2">{item.title}</p>
                
                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_8px_rgba(0,240,255,0.6)]" 
                    style={{ width: `${Math.round(item.progress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-fade-right { mask-image: linear-gradient(to right, black 85%, transparent 100%); }
      `}</style>
    </div>
  );
};

export default ContinueWatching;
