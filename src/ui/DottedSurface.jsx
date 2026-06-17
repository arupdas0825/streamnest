import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * DottedSurface — Three.js animated dotted wave background.
 *
 * Adapted from the shadcn/TSX version to plain React JSX for the
 * Vite-based StreamNest project. next-themes and TypeScript removed.
 * Colors tuned to StreamNest's cyan / blue / purple palette.
 */
export function DottedSurface({ className = '', style = {}, ...props }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Grid density — reduced on mobile for performance ─────────────
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1200;

    const SEPARATION = isMobile ? 190 : isTablet ? 165 : 148;
    const AMOUNTX  = isMobile ? 22  : isTablet ? 30  : 38;
    const AMOUNTY  = isMobile ? 28  : isTablet ? 38  : 50;

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // fully transparent bg

    containerRef.current.appendChild(renderer.domElement);

    // ── Geometry ──────────────────────────────────────────────────────
    const geometry = new THREE.BufferGeometry();
    const totalPoints = AMOUNTX * AMOUNTY;

    const positions = new Float32Array(totalPoints * 3);
    const colors    = new Float32Array(totalPoints * 3);

    // StreamNest palette anchors (r,g,b normalized 0-1)
    // We use a subtle gradient across the grid:
    //   top-left  → deep cyan   (#00c8ff  → 0, 0.78, 1)
    //   top-right → blue        (#3b82f6  → 0.23, 0.51, 0.96)
    //   bottom    → purple      (#7c3aed  → 0.49, 0.23, 0.93)
    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions[i * 3]     = x;
        positions[i * 3 + 1] = 0; // Y animated each frame
        positions[i * 3 + 2] = z;

        // Blend color across the grid
        const tx = ix / AMOUNTX;         // 0 → 1 left-to-right
        const ty = iy / AMOUNTY;         // 0 → 1 front-to-back

        // Cyan (#00f0ff) → Blue (#3b82f6) horizontally
        // mixed with Purple (#7c3aed) → Cyan vertically
        const r = 0.0  + tx * 0.23 + ty * 0.20;   // stays low → muted
        const g = 0.78 * (1 - tx) * (1 - ty * 0.5) + 0.51 * tx * 0.6;
        const b = 1.0  - ty * 0.10 - tx * 0.06;

        colors[i * 3]     = Math.min(r, 1);
        colors[i * 3 + 1] = Math.min(g, 1);
        colors[i * 3 + 2] = Math.min(b, 1);

        i++;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    // ── Material ──────────────────────────────────────────────────────
    const material = new THREE.PointsMaterial({
      size: isMobile ? 5 : 7,
      vertexColors: true,
      transparent: true,
      opacity: isMobile ? 0.45 : 0.60,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Animation ─────────────────────────────────────────────────────
    let count = 0;
    let animationId;
    const posAttr = geometry.attributes.position;
    const posArr  = posAttr.array;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      let idx = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          posArr[idx * 3 + 1] =
            Math.sin((ix + count) * 0.28) * 55 +
            Math.sin((iy + count) * 0.45) * 45;
          idx++;
        }
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.07; // slightly slower → cinematic feel
    };

    animate();

    // ── Resize handler ────────────────────────────────────────────────
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Store refs for cleanup
    sceneRef.current = { scene, camera, renderer, points, animationId };

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', handleResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        sceneRef.current.scene.traverse((obj) => {
          if (obj instanceof THREE.Points) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });

        sceneRef.current.renderer.dispose();

        if (
          containerRef.current &&
          sceneRef.current.renderer.domElement.parentNode === containerRef.current
        ) {
          containerRef.current.removeChild(sceneRef.current.renderer.domElement);
        }

        sceneRef.current = null;
      }
    };
  }, []); // runs once on mount — theme is always dark in StreamNest

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        ...style,
      }}
      {...props}
    />
  );
}

export default DottedSurface;
