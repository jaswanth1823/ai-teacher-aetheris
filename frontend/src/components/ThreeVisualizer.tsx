"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { RotateCw, Sparkles, Box } from "lucide-react";

interface ThreeVisualizerProps {
  modelType: string;
}

export const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ modelType }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);

  // Normalize modelType string
  const resolvedType = (modelType || "").toLowerCase();

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene & Camera Setup
    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1320, 0.025);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2.8, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.2, 50);
    purpleLight.position.set(-5, -3, 3);
    scene.add(purpleLight);

    // 3. Build 3D Models based on modelType
    const group = new THREE.Group();
    scene.add(group);

    const animatedItems: any[] = [];

    // -------------------------------------------------------------
    // A. BIOLOGY: 3D DNA Double Helix
    // -------------------------------------------------------------
    if (resolvedType.includes("dna") || resolvedType.includes("bio") || resolvedType.includes("cell") || resolvedType.includes("gene")) {
      const strandCount = 24;
      const radius = 1.4;
      const heightStep = 0.25;

      for (let i = 0; i < strandCount; i++) {
        const angle = i * 0.45;
        const y = (i - strandCount / 2) * heightStep;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        // Node 1 (Adenine/Thymine)
        const s1Geo = new THREE.SphereGeometry(0.16, 16, 16);
        const s1Mat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00a8ff, emissiveIntensity: 0.8 });
        const s1 = new THREE.Mesh(s1Geo, s1Mat);
        s1.position.set(x1, y, z1);
        group.add(s1);

        // Node 2 (Guanine/Cytosine)
        const s2Geo = new THREE.SphereGeometry(0.16, 16, 16);
        const s2Mat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x8800ff, emissiveIntensity: 0.8 });
        const s2 = new THREE.Mesh(s2Geo, s2Mat);
        s2.position.set(x2, y, z2);
        group.add(s2);

        // Base-pair connecting rung
        const p1 = new THREE.Vector3(x1, y, z1);
        const p2 = new THREE.Vector3(x2, y, z2);
        const rungGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const rungMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
        const rung = new THREE.Line(rungGeo, rungMat);
        group.add(rung);
      }
    }
    // -------------------------------------------------------------
    // B. ASTRONOMY / GRAVITY / SPACE: 3D Solar Planetary System
    // -------------------------------------------------------------
    else if (resolvedType.includes("solar") || resolvedType.includes("planet") || resolvedType.includes("gravity") || resolvedType.includes("orbit") || resolvedType.includes("space")) {
      // Central Sun
      const sunGeo = new THREE.SphereGeometry(1.0, 32, 32);
      const sunMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xffaa00, emissiveIntensity: 1.2 });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      group.add(sun);

      // Orbits & Planets
      const planetData = [
        { r: 2.0, size: 0.2, color: 0x00f0ff, speed: 1.5 },
        { r: 3.2, size: 0.32, color: 0x10b981, speed: 1.0 },
        { r: 4.5, size: 0.45, color: 0xa855f7, speed: 0.7 },
      ];

      planetData.forEach((p) => {
        // Orbit ring
        const orbitGeo = new THREE.TorusGeometry(p.r, 0.02, 16, 80);
        const orbitMat = new THREE.MeshBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
        const orbit = new THREE.Mesh(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        group.add(orbit);

        // Planet mesh
        const plGeo = new THREE.SphereGeometry(p.size, 20, 20);
        const plMat = new THREE.MeshStandardMaterial({ color: p.color, emissive: p.color, emissiveIntensity: 0.6 });
        const planet = new THREE.Mesh(plGeo, plMat);
        group.add(planet);
        animatedItems.push({ mesh: planet, radius: p.r, speed: p.speed, type: "orbit" });
      });
    }
    // -------------------------------------------------------------
    // C. CHEMISTRY: 3D Ball-and-Stick Molecular Structure
    // -------------------------------------------------------------
    else if (resolvedType.includes("molecule") || resolvedType.includes("chemistry") || resolvedType.includes("bond") || resolvedType.includes("organic") || resolvedType.includes("acid")) {
      // Central Carbon atom
      const cGeo = new THREE.SphereGeometry(0.65, 24, 24);
      const cMat = new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x1e293b, emissiveIntensity: 0.4 });
      const centerAtom = new THREE.Mesh(cGeo, cMat);
      group.add(centerAtom);

      // 4 Tetrahedral Bonded Hydrogen/Oxygen atoms
      const offsets = [
        new THREE.Vector3(1.4, 1.4, 1.4).normalize().multiplyScalar(2.0),
        new THREE.Vector3(-1.4, -1.4, 1.4).normalize().multiplyScalar(2.0),
        new THREE.Vector3(-1.4, 1.4, -1.4).normalize().multiplyScalar(2.0),
        new THREE.Vector3(1.4, -1.4, -1.4).normalize().multiplyScalar(2.0),
      ];

      offsets.forEach((pos, idx) => {
        const atomGeo = new THREE.SphereGeometry(0.35, 20, 20);
        const atomMat = new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0xef4444 : 0x00f0ff,
          emissive: idx === 0 ? 0x990000 : 0x0088cc,
          emissiveIntensity: 0.7,
        });
        const atom = new THREE.Mesh(atomGeo, atomMat);
        atom.position.copy(pos);
        group.add(atom);

        // Bond Cylinder
        const bondGeo = new THREE.CylinderGeometry(0.06, 0.06, pos.length(), 16);
        const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const bond = new THREE.Mesh(bondGeo, bondMat);
        bond.position.copy(pos.clone().multiplyScalar(0.5));
        bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
        group.add(bond);
      });
    }
    // -------------------------------------------------------------
    // D. COMPUTER SCIENCE: 3D Binary Tree / Algorithm Graph
    // -------------------------------------------------------------
    else if (resolvedType.includes("tree") || resolvedType.includes("algorithm") || resolvedType.includes("code") || resolvedType.includes("data_structure") || resolvedType.includes("react") || resolvedType.includes("binary")) {
      const createNode = (x: number, y: number, z: number, labelColor: number) => {
        const geo = new THREE.SphereGeometry(0.35, 20, 20);
        const mat = new THREE.MeshStandardMaterial({ color: labelColor, emissive: labelColor, emissiveIntensity: 0.7 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        group.add(mesh);
        return mesh;
      };

      const root = createNode(0, 2.2, 0, 0x00f0ff);
      const l1 = createNode(-2.0, 0.7, 0, 0xa855f7);
      const r1 = createNode(2.0, 0.7, 0, 0xa855f7);
      const l2 = createNode(-3.0, -1.0, 0, 0x10b981);
      const l3 = createNode(-1.0, -1.0, 0, 0x10b981);
      const r2 = createNode(1.0, -1.0, 0, 0x10b981);
      const r3 = createNode(3.0, -1.0, 0, 0x10b981);

      const connect = (n1: THREE.Mesh, n2: THREE.Mesh) => {
        const geo = new THREE.BufferGeometry().setFromPoints([n1.position, n2.position]);
        const mat = new THREE.LineBasicMaterial({ color: 0x64748b });
        const line = new THREE.Line(geo, mat);
        group.add(line);
      };

      connect(root, l1);
      connect(root, r1);
      connect(l1, l2);
      connect(l1, l3);
      connect(r1, r2);
      connect(r1, r3);
    }
    // -------------------------------------------------------------
    // E. ATOMIC ORBITAL / QUANTUM PHYSICS
    // -------------------------------------------------------------
    else if (resolvedType.includes("atom") || resolvedType.includes("orbital") || resolvedType.includes("quantum")) {
      const nucleusGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const nucleusMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00a8ff, emissiveIntensity: 0.8 });
      const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
      group.add(nucleus);

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

        const electronGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const electronMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x00f0ff, emissiveIntensity: 1 });
        const electron = new THREE.Mesh(electronGeo, electronMat);
        electron.position.x = radius;
        ring.add(electron);
      });
    }
    // -------------------------------------------------------------
    // F. AI & NEURAL NETWORKS
    // -------------------------------------------------------------
    else if (resolvedType.includes("neural") || resolvedType.includes("ai") || resolvedType.includes("brain") || resolvedType.includes("deep_learning")) {
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
            emissiveIntensity: 0.6,
          });
          const node = new THREE.Mesh(nodeGeo, nodeMat);
          node.position.set(x, y, 0);
          group.add(node);
          nodeMeshes.push(node);
        }
      });

      const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.4 });
      nodeMeshes.forEach((n1) => {
        nodeMeshes.forEach((n2) => {
          if (Math.abs(n1.position.x - n2.position.x) === layerSpacing) {
            const points = [n1.position, n2.position];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMat);
            group.add(line);
          }
        });
      });
    }
    // -------------------------------------------------------------
    // G. PHYSICS CIRCUIT / HYDRAULIC PIPE (Ohm's Law)
    // -------------------------------------------------------------
    else if (resolvedType.includes("circuit") || resolvedType.includes("pipe") || resolvedType.includes("current") || resolvedType.includes("voltage") || resolvedType.includes("ohm")) {
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

      const valveGeo = new THREE.TorusGeometry(1.25, 0.15, 16, 32);
      const valveMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 });
      const valve = new THREE.Mesh(valveGeo, valveMat);
      valve.rotation.y = Math.PI / 2;
      group.add(valve);

      for (let i = 0; i < 40; i++) {
        const pGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x00f0ff, emissiveIntensity: 1 });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4);
        group.add(pMesh);
        animatedItems.push({ mesh: pMesh, type: "flow" });
      }
    }
    // -------------------------------------------------------------
    // H. MATHEMATICS & DEFAULT: 3D Parametric Wave & Vector Surface
    // -------------------------------------------------------------
    else {
      const planeGeo = new THREE.PlaneGeometry(6, 6, 28, 28);
      const planeMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        wireframe: true,
        emissive: 0x004488,
        emissiveIntensity: 0.5,
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 3;
      group.add(plane);

      // Coordinate axes
      const axesHelper = new THREE.AxesHelper(3.5);
      group.add(axesHelper);
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
      const elapsed = clock.getElapsedTime() * speed;

      // Auto rotation when not dragging
      if (!isDragging) {
        group.rotation.y += 0.006 * speed;
      }

      // Model-specific animations
      animatedItems.forEach((item) => {
        if (item.type === "flow") {
          item.mesh.position.x += 0.04 * speed;
          if (item.mesh.position.x > 3) item.mesh.position.x = -3;
        } else if (item.type === "orbit") {
          item.mesh.position.x = Math.cos(elapsed * item.speed) * item.radius;
          item.mesh.position.z = Math.sin(elapsed * item.speed) * item.radius;
        }
      });

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
  }, [resolvedType, speed]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[380px] bg-slate-950/70 rounded-2xl overflow-hidden border border-cyan-500/30">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing flex-1" />

      {/* Floating 3D HUD Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl z-20 text-xs font-mono text-cyan-300">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span className="capitalize">{resolvedType.replace(/_/g, " ")} 3D Simulation</span>
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
