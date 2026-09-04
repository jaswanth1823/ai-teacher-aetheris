"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export const Hero3DScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 400;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 3. Lighting (Dynamic Point Lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 4, 30);
    cyanLight.position.set(3, 4, 5);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xa855f7, 3.5, 30);
    violetLight.position.set(-4, -3, 4);
    scene.add(violetLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 2, 25);
    emeraldLight.position.set(0, -4, 2);
    scene.add(emeraldLight);

    // 4. Hero 3D Geometric Core (VisionOS Floating Holographic Torus Knot)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Outer Iridescent Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.38, 128, 32, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a192f,
      emissive: 0x002244,
      emissiveIntensity: 0.8,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.6,
      thickness: 1.2,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    coreGroup.add(knotMesh);

    // Inner Glowing Core Sphere
    const innerCoreGeo = new THREE.IcosahedronGeometry(0.85, 4);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.5,
      wireframe: true,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCore);

    // 5. Surrounding Floating Spatial Micro-Particles
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Smooth Mouse Spring Damping Interaction
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 2.2;
      targetY = -y * 2.2;
    };

    window.addEventListener("mousemove", onMouseMove);

    // 7. Animation Loop
    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Spring physics interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      coreGroup.rotation.x = elapsed * 0.35 + currentY * 0.6;
      coreGroup.rotation.y = elapsed * 0.5 + currentX * 0.8;

      innerCore.rotation.y = -elapsed * 0.8;
      innerCore.rotation.z = elapsed * 0.4;

      // Floating wave translation
      coreGroup.position.y = Math.sin(elapsed * 1.5) * 0.15;
      coreGroup.position.x = currentX * 0.4;

      // Dynamic light movement
      cyanLight.position.x = Math.sin(elapsed * 1.2) * 4;
      cyanLight.position.y = Math.cos(elapsed * 1.5) * 4;

      particles.rotation.y = elapsed * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[360px] md:min-h-[460px] flex items-center justify-center pointer-events-none">
      <div ref={mountRef} className="w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing" />
    </div>
  );
};
