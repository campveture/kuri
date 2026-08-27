"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type HeroParticlesProps = {
  color?: number;
  count?: number;
  opacity?: number;
  size?: number;
  className?: string;
};

// A restrained drifting-particle layer (rising tea dust) rendered over the
// hero illustrations. Kept subtle on purpose: low opacity, slow movement,
// no pointer interaction -- a detail, not a spectacle.
export function HeroParticles({
  color = 0xc89a3e,
  count = 46,
  opacity = 0.55,
  size = 4.5,
  className,
}: HeroParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mounted = true;
    const width = canvas.clientWidth || 1440;
    const height = canvas.clientHeight || 640;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.z = 420;

    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const drifts = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width * 1.15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height * 1.15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220;
      speeds[i] = 6 + Math.random() * 14;
      drifts[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const clock = new THREE.Clock();
    let raf = 0;

    function animate() {
      if (!mounted) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= speeds[i] * dt * 4;
        pos[i * 3] += Math.sin(pos[i * 3 + 1] * 0.01 + drifts[i]) * 0.25;
        if (pos[i * 3 + 1] < -height / 2 - 20) {
          pos[i * 3 + 1] = height / 2 + 20;
          pos[i * 3] = (Math.random() - 0.5) * width * 1.15;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      if (!canvas) return;
      const w = canvas.clientWidth || width;
      const h = canvas.clientHeight || height;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [color, count, opacity, size]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
