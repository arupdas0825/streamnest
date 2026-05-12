import React, { useEffect, useRef } from 'react';

const AmbientTheater = ({ videoElement, isActive }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isActive || !videoElement) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    const updateAmbient = () => {
      if (videoElement.paused || videoElement.ended) {
        animationRef.current = requestAnimationFrame(updateAmbient);
        return;
      }

      // Draw small version of video to canvas for average color/glow
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      animationRef.current = requestAnimationFrame(updateAmbient);
    };

    updateAmbient();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, videoElement]);

  return (
    <div 
      className={`absolute inset-0 z-0 transition-opacity duration-1000 overflow-hidden pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`}
    >
      <canvas
        ref={canvasRef}
        width="32"
        height="18"
        className="w-full h-full scale-150 blur-[100px] opacity-60 saturate-150"
      />
      {/* Vignette/Dark overlay to keep focus on player */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
    </div>
  );
};

export default AmbientTheater;
