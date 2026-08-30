"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface ThreeAvatar3DProps {
  isPlaying: boolean;
  emotion: string;
}

export const ThreeAvatar3D: React.FC<ThreeAvatar3DProps> = ({ isPlaying, emotion }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 280;
    const height = mountRef.current.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 3, 20);
    cyanLight.position.set(2, 3, 4);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 20);
    purpleLight.position.set(-2, -2, 3);
    scene.add(purpleLight);

    // Avatar Group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // 1. Holographic Head Mesh
    const headGeo = new THREE.IcosahedronGeometry(1.2, 3);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      wireframe: true,
      emissive: 0x0055aa,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    avatarGroup.add(head);

    // Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(0.7, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    avatarGroup.add(core);

    // 2. Holographic Rotating Energy Rings
    const ring1Geo = new THREE.TorusGeometry(1.8, 0.02, 16, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.1, 0.02, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    scene.add(ring2);

    // 3. Animation Loop
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Floating idle animation
      avatarGroup.position.y = Math.sin(elapsed * 1.5) * 0.1;

      // Rotating Scanner Rings
      ring1.rotation.z += 0.01;
      ring2.rotation.y += 0.015;

      // Speech morphing reaction
      if (isPlaying) {
        head.scale.set(
          1 + Math.sin(elapsed * 12) * 0.06,
          1 + Math.cos(elapsed * 12) * 0.08,
          1 + Math.sin(elapsed * 12) * 0.06
        );
        avatarGroup.rotation.y = Math.sin(elapsed * 2) * 0.15;
        coreMat.emissiveIntensity = 1.4 + Math.sin(elapsed * 15) * 0.4;
      } else {
        head.scale.set(1, 1, 1);
        avatarGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.08;
        coreMat.emissiveIntensity = 0.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, emotion]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div ref={mountRef} className="w-full h-full min-h-[220px]" />
    </div>
  );
};
