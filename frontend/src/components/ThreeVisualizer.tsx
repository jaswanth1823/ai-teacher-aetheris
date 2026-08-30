"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { RotateCw, ZoomIn, Eye, Sparkles, Layers } from "lucide-react";

interface ThreeVisualizerProps {
  modelType: string;
}

export const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ modelType }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene & Camera Setup
    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1320, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 50);
    purpleLight.position.set(-5, -3, 3);
    scene.add(purpleLight);

    // 3. Build 3D Models based on modelType
    const group = new THREE.Group();
    scene.add(group);

    const particlesList: THREE.Mesh[] = [];

    if (modelType === "atomic_orbital") {
      // Nucleus
      const nucleusGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const nucleusMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00a8ff,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
      group.add(nucleus);

      // Orbital Rings
      [2.2, 3.2, 4.0].forEach((radius, i) => {
        const ringGeo = new THREE.TorusGeometry(radius, 0.03, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({
          color: i === 0 ? 0x00f0ff : i === 1 ? 0xa855f7 : 0x10b981,
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / (2 + i * 0.5);
        ring.rotation.y = i * 0.8;
        group.add(ring);

        // Orbiting Electrons
        const electronGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const electronMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0x00f0ff,
          emissiveIntensity: 1,
        });
        const electron = new THREE.Mesh(electronGeo, electronMat);
        electron.position.x = radius;
        ring.add(electron);
      });
    } else if (modelType === "neural_network") {
      // 3-Layer Neural Network Nodes in 3D
      const layers = [3, 4, 3];
      const layerSpacing = 3;
      const nodeMeshes: THREE.Mesh[] = [];

      layers.forEach((count, lIdx) => {
        const x = (lIdx - 1) * layerSpacing;
        for (let nIdx = 0; nIdx < count; nIdx++) {
          const y = (nIdx - (count - 1) / 2) * 1.5;
          const nodeGeo = new THREE.SphereGeometry(0.35, 24, 24);
          const nodeMat = new THREE.MeshStandardMaterial({
            color: lIdx === 0 ? 0x00f0ff : lIdx === 1 ? 0xa855f7 : 0x10b981,
            emissive: lIdx === 0 ? 0x0088ff : lIdx === 1 ? 0x8800ff : 0x00aa44,
            emissiveIntensity: 0.5,
          });
          const node = new THREE.Mesh(nodeGeo, nodeMat);
          node.position.set(x, y, 0);
          group.add(node);
          nodeMeshes.push(node);
        }
      });

      // Synaptic Connections Lines
      const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.4 });
      nodeMeshes.forEach((n1, i) => {
        nodeMeshes.forEach((n2, j) => {
          if (Math.abs(n1.position.x - n2.position.x) === layerSpacing) {
            const points = [n1.position, n2.position];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMat);
            group.add(line);
          }
        });
      });
    } else if (modelType === "physics_circuit") {
      // Transparent Pipe with Flowing Charges (Hydraulic / Ohm's Analogy)
      const pipeGeo = new THREE.CylinderGeometry(1.2, 1.2, 6, 32, 1, true);
      const pipeMat = new THREE.MeshPhysicalMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        transmission: 0.8,
        thickness: 0.5,
        side: THREE.DoubleSide,
      });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.rotation.z = Math.PI / 2;
      group.add(pipe);

      // Squeezed Resistance Ring
      const valveGeo = new THREE.TorusGeometry(1.25, 0.15, 16, 32);
      const valveMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
      });
      const valve = new THREE.Mesh(valveGeo, valveMat);
      valve.rotation.y = Math.PI / 2;
      group.add(valve);

      // Flowing Electron/Water Particles
      for (let i = 0; i < 40; i++) {
        const pGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const pMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x00f0ff,
          emissiveIntensity: 1,
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.4
        );
        group.add(pMesh);
        particlesList.push(pMesh);
      }
    } else {
      // 3D Mathematical Parametric Wave Surface
      const planeGeo = new THREE.PlaneGeometry(6, 6, 30, 30);
      const planeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        wireframe: true,
        emissive: 0x0055aa,
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 3;
      group.add(plane);
    }

    // 4. Mouse Drag & Orbit Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      group.rotation.y += deltaX * 0.008;
      group.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = mountRef.current;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime() * speed;

      // Auto rotation
      if (!isDragging) {
        group.rotation.y += 0.005 * speed;
      }

      // Model-specific continuous animation
      if (modelType === "physics_circuit") {
        particlesList.forEach((p) => {
          p.position.x += 0.04 * speed;
          if (p.position.x > 3) p.position.x = -3;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (domElement.contains(renderer.domElement)) {
        domElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelType, wireframe, speed]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[380px] bg-slate-950/60 rounded-2xl overflow-hidden border border-cyan-500/30">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing flex-1" />

      {/* Floating 3D HUD Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl z-20 text-xs font-mono text-cyan-300">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span>3D Interactive Simulation</span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-slate-900/80 border border-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-mono text-slate-400 z-20">
        <span className="flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          Click & Drag to Orbit 360°
        </span>

        <div className="flex items-center gap-3">
          <span>Speed: {speed.toFixed(1)}x</span>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
