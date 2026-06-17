import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * DottedSurface — Three.js animated dotted wave background.
 * StreamNest edition: vivid cyan/blue/purple palette, tuned for dark backgrounds.
 */
export function DottedSurface({ className = '', style = {}, ...props }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1200;

    // Grid density — reduced on smaller screens for GPU performance
    const SEPARATION = isMobile ? 185 : isTablet ? 160 : 145;
    const AMOUNTX   = isMobile ? 24  : isTablet ? 32  : 42;
    const AMOUNTY   = isMobile ? 30  : isTablet ? 40  : 54;

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 360, 1240);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // transparent canvas

    containerRef.current.appendChild(renderer.domElement);

    // ── Geometry ──────────────────────────────────────────────────────
    const totalPoints = AMOUNTX * AMOUNTY;
    const positions   = new Float32Array(totalPoints * 3);
    const colors      = new Float32Array(totalPoints * 3);

    // StreamNest palette: vivid cyan → blue → purple, front-to-back gradient
    // All values are 0-1 normalized for THREE.BufferAttribute with vertexColors
    let idx = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[idx * 3]     = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[idx * 3 + 1] = 0; // Y animated per frame
        positions[idx * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        // Front (iy=0): pure cyan  #00e8ff → (0.0, 0.91, 1.0)
        // Back  (iy=1): purple     #7928ca → (0.47, 0.16, 0.79)
        // Left-to-right: slight blue shift
        const tz = iy  / (AMOUNTY - 1); // 0 (front) → 1 (back)
        const tx = ix  / (AMOUNTX - 1); // 0 (left)  → 1 (right)

        const r = 0.0  + tz * 0.47 + tx * 0.10;
        const g = 0.91 - tz * 0.75 + tx * 0.02;
        const b = 1.0  - tz * 0.21 - tx * 0.04;

        colors[idx * 3]     = Math.max(0, Math.min(1, r));
        colors[idx * 3 + 1] = Math.max(0, Math.min(1, g));
        colors[idx * 3 + 2] = Math.max(0, Math.min(1, b));

        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    // ── Material ──────────────────────────────────────────────────────
    const material = new THREE.PointsMaterial({
      size: isMobile ? 8 : 13,          // visible dot size
      vertexColors: true,
      transparent: true,
      opacity: isMobile ? 0.72 : 0.88,  // high enough to see on dark bg
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

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          // Overlapping sine waves → rolling ocean-like surface
          posArr[i * 3 + 1] =
            Math.sin((ix + count) * 0.26) * 58 +
            Math.sin((iy + count) * 0.42) * 48;
          i++;
        }
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.065; // cinematic, unhurried pace
    };

    animate();

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = { scene, camera, renderer, points, animationId };

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', onResize);
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
  }, []);

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
