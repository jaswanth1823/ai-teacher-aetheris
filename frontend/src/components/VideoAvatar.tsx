"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Activity, User, Box } from "lucide-react";
import { ThreeAvatar3D } from "@/components/ThreeAvatar3D";

interface VideoAvatarProps {
  spokenText: string;
  emotion: string;
  gesture: string;
  audioBase64?: string;
  isPlaying: boolean;
  onAudioEnded?: () => void;
}

export const VideoAvatar: React.FC<VideoAvatarProps> = ({
  spokenText,
  emotion,
  gesture,
  audioBase64,
  isPlaying,
  onAudioEnded,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioBase64 && audioRef.current) {
      audioRef.current.src = audioBase64;
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.log("Audio autoplay prevented:", e));
      }
    }
  }, [audioBase64, isPlaying]);

  const emotionColors: Record<string, string> = {
    welcoming: "border-cyan-400 bg-cyan-950/40 text-cyan-300",
    explaining: "border-purple-400 bg-purple-950/40 text-purple-300",
    questioning: "border-amber-400 bg-amber-950/40 text-amber-300",
    encouraging: "border-emerald-400 bg-emerald-950/40 text-emerald-300",
    celebrating: "border-yellow-400 bg-yellow-950/40 text-yellow-300",
    thinking: "border-blue-400 bg-blue-950/40 text-blue-300",
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
      {/* Audio element */}
      <audio
        ref={audioRef}
        muted={isMuted}
        onEnded={onAudioEnded}
      />

      {/* Header with emotion badge, 3D toggle & audio toggle */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">AI Professor (Live)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* 3D Mode Toggle */}
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1 transition ${
              is3DMode ? "border-cyan-400 bg-cyan-950/60 text-cyan-300" : "border-slate-700 bg-slate-800 text-slate-400"
            }`}
            title="Toggle 3D Holographic Avatar"
          >
            <Box className="w-3 h-3" />
            <span>{is3DMode ? "3D" : "2D"}</span>
          </button>

          <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${emotionColors[emotion] || emotionColors.explaining}`}>
            {emotion.toUpperCase()}
          </span>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Avatar Visual Frame */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[220px] rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 overflow-hidden">
        {/* Ambient Glow */}
        <div className={`absolute inset-0 opacity-20 transition-all duration-700 ${isPlaying ? 'bg-cyan-500 blur-3xl' : 'bg-slate-800'}`} />

        {/* Dynamic 3D or 2D Avatar Mesh */}
        {is3DMode ? (
          <ThreeAvatar3D isPlaying={isPlaying} emotion={emotion} />
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-2xl ${isPlaying ? 'border-cyan-400 shadow-cyan-500/50 scale-105' : 'border-slate-700'}`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white">
                <User className="w-12 h-12 text-white/90" />
              </div>
            </div>

            {isPlaying && (
              <div className="flex items-center gap-1 mt-4">
                <div className="w-1 bg-cyan-400 rounded-full animate-sound-wave" style={{ animationDelay: "0ms" }} />
                <div className="w-1 bg-cyan-400 rounded-full animate-sound-wave" style={{ animationDelay: "150ms" }} />
                <div className="w-1 bg-cyan-400 rounded-full animate-sound-wave" style={{ animationDelay: "300ms" }} />
                <div className="w-1 bg-cyan-400 rounded-full animate-sound-wave" style={{ animationDelay: "450ms" }} />
                <div className="w-1 bg-cyan-400 rounded-full animate-sound-wave" style={{ animationDelay: "200ms" }} />
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-3 text-xs font-mono text-slate-400 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 z-10">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Gesture: {gesture.replace("_", " ")}</span>
        </div>
      </div>

      {/* Subtitles & Spoken Dialogue Card */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="text-[11px] font-mono text-slate-500 uppercase mb-1 tracking-wider">Teacher Speech</div>
        <p className="text-sm font-medium text-slate-100 leading-relaxed italic">
          "{spokenText}"
        </p>
      </div>
    </div>
  );
};
