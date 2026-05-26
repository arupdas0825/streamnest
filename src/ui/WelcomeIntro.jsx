import React, { useState, useEffect, useMemo } from 'react';

const WelcomeIntro = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [bloomActive, setBloomActive] = useState(false);

  // Optimized background drift particles (Limited count, zero blur filters)
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        id: i,
        size: Math.random() * 3 + 2, // 2px - 5px
        top: Math.random() * 80 + 10, // Avoid clipping borders
        left: Math.random() * 80 + 10,
        delay: Math.random() * 1.5,
        duration: Math.random() * 8 + 10, // Snappy drift duration
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    // Check local persistence
    const isIntroWatched = sessionStorage.getItem('sn_intro_watched');
    
    // Query system preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isIntroWatched === 'true' || prefersReducedMotion) {
      // Reveal home page instantly
      const landing = document.getElementById('landing-screen');
      if (landing) landing.classList.add('active');
      setIsVisible(false);
      return;
    }

    // Launch intro experience
    setIsVisible(true);
    document.body.classList.add('intro-running');

    const landing = document.getElementById('landing-screen');
    if (landing) {
      landing.classList.remove('active');
      landing.classList.remove('intro-transition');
    }

    // Stage 2: S scales and "treamNest" unfolds at 800ms
    const expandTimer = setTimeout(() => {
      setIsExpanded(true);
      setBloomActive(true);
    }, 800);

    // Stage 3: Smooth dissolve transition into landing screen at 2.4s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      document.body.classList.remove('intro-running');
      if (landing) {
        landing.classList.add('active');
        landing.classList.add('intro-transition');
      }
    }, 2400);

    // Completely remove intro layer from DOM at 3.4s
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('sn_intro_watched', 'true');
    }, 3400);

    // Shortcuts for quick bypasses
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        triggerSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('intro-running');
    };
  }, []);

  const triggerSkip = () => {
    if (isFadingOut) return;
    
    setIsFadingOut(true);
    document.body.classList.remove('intro-running');
    
    const landing = document.getElementById('landing-screen');
    if (landing) {
      landing.classList.add('active');
      landing.classList.add('intro-transition');
    }

    // Wrap up skip fade transition quickly
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('sn_intro_watched', 'true');
    }, 800);
  };

  if (!isVisible) return null;

  return (
    <div className={`welcome-intro-screen ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Optimized particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="cinematic-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: `${p.top}%`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Layered cinematic atmospheres (zero costly blur filters) */}
      <div className="ambient-glow-orb ambient-glow-primary" />
      <div className="ambient-glow-orb ambient-glow-secondary" />

      {/* Cinematic Fog */}
      <div className="ambient-fog" />

      {/* Center starburst flare */}
      <div className={`intro-lens-flare ${bloomActive ? 'bloom-active' : ''}`} />

      {/* Logo container */}
      <div className={`intro-brand-container ${isExpanded ? 'is-expanded' : ''}`}>
        <div className="intro-logo-wrapper">
          <span className="intro-char-s">S</span>
          <span className="intro-text-rest">treamNest</span>
        </div>
        <p className="intro-tagline">Cinematic Media Space</p>
      </div>

      {/* Bypass button (pure color layout, avoiding expensive backdrop blur filters) */}
      <button
        onClick={triggerSkip}
        className="skip-btn-intro fixed bottom-8 right-8 z-[10001] px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xl hover:shadow-zinc-800/10 text-xs font-bold tracking-wider"
      >
        Skip Intro
        <span className="material-symbols-rounded text-sm">arrow_forward</span>
      </button>
    </div>
  );
};

export default WelcomeIntro;
