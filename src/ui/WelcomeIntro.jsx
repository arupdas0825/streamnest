import React, { useState, useEffect, useMemo } from 'react';

const WelcomeIntro = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [bloomActive, setBloomActive] = useState(false);

  // Generate a randomized set of background particles once
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        id: i,
        size: Math.random() * 4 + 2, // 2px - 6px
        top: Math.random() * 100, // 0% - 100%
        left: Math.random() * 100,
        delay: Math.random() * 8, // 0s - 8s delay
        duration: Math.random() * 15 + 15, // 15s - 30s drift
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    // Check if intro has already been watched in the current session
    const isIntroWatched = sessionStorage.getItem('sn_intro_watched');
    
    if (isIntroWatched === 'true') {
      // Reveal landing screen instantly
      const landing = document.getElementById('landing-screen');
      if (landing) landing.classList.add('active');
      setIsVisible(false);
      return;
    }

    // Otherwise, boot the intro experience
    setIsVisible(true);
    document.body.classList.add('intro-running');

    const landing = document.getElementById('landing-screen');
    if (landing) {
      landing.classList.remove('active');
      landing.classList.remove('intro-transition');
    }

    // Cinematic Stage 2: Logo expansion & Starburst Lens Bloom at 2.0s
    const expandTimer = setTimeout(() => {
      setIsExpanded(true);
      setBloomActive(true);
    }, 2000);

    // Cinematic Stage 3: Smooth dissolve transition into landing screen at 5.0s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      document.body.classList.remove('intro-running');
      if (landing) {
        landing.classList.add('active');
        landing.classList.add('intro-transition');
      }
    }, 5000);

    // Fully remove the intro overlay from DOM at 6.2s (after transitions complete)
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('sn_intro_watched', 'true');
    }, 6200);

    // Skip triggers on keyboard shortcuts (Space, Enter, Escape)
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

    // Complete the skip transition quickly (in 1.2s to match CSS fade transition)
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('sn_intro_watched', 'true');
    }, 1200);
  };

  if (!isVisible) return null;

  return (
    <div className={`welcome-intro-screen ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Background Starry Particles */}
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

      {/* Layered Cinematic Glow Orbs */}
      <div className="ambient-glow-orb ambient-glow-primary" />
      <div className="ambient-glow-orb ambient-glow-secondary" />

      {/* Ambient Fog Layer */}
      <div className="ambient-fog" />

      {/* Center Cinematic Lens Flare / Starburst (Blooms when expanded) */}
      <div className={`intro-lens-flare ${bloomActive ? 'bloom-active' : ''}`} />

      {/* Brand logo container */}
      <div className={`intro-brand-container ${isExpanded ? 'is-expanded' : ''}`}>
        {/* Dynamic Netflix-style S-to-StreamNest text expansion */}
        <div className="intro-logo-wrapper">
          <span className="intro-char-s">S</span>
          <span className="intro-text-rest">treamNest</span>
        </div>
        
        {/* Subtitle / Tagline */}
        <p className="intro-tagline">Cinematic Media Space</p>
      </div>

      {/* Skip Intro Glass Pill Button */}
      <button
        onClick={triggerSkip}
        className="skip-btn-intro fixed bottom-8 right-8 z-[10001] px-5 py-2.5 rounded-full backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 text-xs font-bold tracking-wider text-zinc-300 hover:text-white uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xl hover:shadow-white/5"
      >
        Skip Intro
        <span className="material-symbols-rounded text-sm">arrow_forward</span>
      </button>
    </div>
  );
};

export default WelcomeIntro;
