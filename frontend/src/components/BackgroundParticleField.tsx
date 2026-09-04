"use client";

import React from "react";

export const BackgroundParticleField: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient Gradient Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: "4s" }} />

      {/* Cyberpunk / Spatial Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
};
