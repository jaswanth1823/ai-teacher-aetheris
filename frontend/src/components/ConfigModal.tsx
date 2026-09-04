"use client";

import React, { useState } from "react";
import { LearnerProfile, uploadMaterial } from "@/lib/api";
import { Hero3DScene } from "@/components/Hero3DScene";
import { TiltCard } from "@/components/TiltCard";
import { 
  BookOpen, 
  Clock, 
  Globe2, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Compass, 
  Cpu, 
  Zap, 
  Layers 
} from "lucide-react";

interface ConfigModalProps {
  onStartLesson: (topic: string, docId?: string, profile?: LearnerProfile) => void;
  isLoading: boolean;
}

const QUICK_SUBJECTS = [
  { label: "🧬 DNA & Genetics", topic: "Structure and Function of DNA & Genetic Replication", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300" },
  { label: "🪐 Planetary Orbits", topic: "Gravitational Motion & Solar System Orbits", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300" },
  { label: "🍎 Newton's Laws", topic: "Newton's Three Laws of Motion & Force Dynamics", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300" },
  { label: "⚡ Circuits & Ohm's Law", topic: "Electric Circuits, Voltage, Current, and Ohm's Law", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300" },
  { label: "🧪 Chemical Bonds", topic: "Covalent and Ionic Chemical Bonding in Molecules", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300" },
  { label: "💻 React & Binary Trees", topic: "Binary Search Tree Data Structures and React Virtual DOM", color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300" },
  { label: "🧠 Neural Networks", topic: "Artificial Neural Networks and Deep Learning Fundamentals", color: "from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300" },
  { label: "📐 Calculus & Derivatives", topic: "Differential Calculus, Derivatives, and Rates of Change", color: "from-indigo-500/20 to-cyan-500/20 border-indigo-500/30 text-indigo-300" },
];

export const ConfigModal: React.FC<ConfigModalProps> = ({
  onStartLesson,
  isLoading,
}) => {
  const [topic, setTopic] = useState<string>("Structure and Function of DNA & Genetic Replication");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [timeMinutes, setTimeMinutes] = useState<number>(20);
  const [language, setLanguage] = useState<string>("Hinglish");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsUploading(true);

    try {
      const resp = await uploadMaterial(file);
      setDocId(resp.doc_id);
      setTopic(file.name.replace(/\.[^/.]+$/, ""));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = () => {
    const profile: LearnerProfile = {
      level,
      available_time_minutes: timeMinutes,
      language,
      subject_goal: "Master foundational principles and solve Socratic checkpoints",
    };
    onStartLesson(topic, docId, profile);
  };

  return (
    <div className="w-full max-w-7xl flex flex-col items-center gap-10 my-4 z-10 animate-in fade-in duration-500">
      {/* VisionOS Hero Section with 3D Core */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Headline & Pitch (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-xl shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>AI INNOVATION HACKATHON 2026 • SPATIAL AI EDUCATOR</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            The AI Teacher <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
              Of The Future
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-light leading-relaxed">
            Experience spatial learning reimagined. An autonomous multimodal professor that understands educational materials, draws live on a digital smartboard, demonstrates interactive 3D simulations, and adapts via real-time Socratic voice diagnostics.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-white/5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> &lt;0.5s Fast-Track Engine
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-white/5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> 8+ Interactive 3D Simulations
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-white/5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" /> Socratic Misconception AI
            </span>
          </div>
        </div>

        {/* Right Interactive 3D Geometric Scene (5 cols) */}
        <div className="lg:col-span-5 w-full h-[320px] sm:h-[380px] lg:h-[440px] relative rounded-3xl overflow-hidden bg-slate-950/40 border border-white/5 backdrop-blur-2xl shadow-2xl flex items-center justify-center">
          <Hero3DScene />
          
          <div className="absolute bottom-4 right-4 text-[11px] font-mono text-cyan-400/80 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/20 backdrop-blur-md">
            Drag to Rotate Spatial Core
          </div>
        </div>
      </div>

      {/* Main Control Deck / Studio Setup Card */}
      <TiltCard className="w-full p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl">
        {/* Quick Subject Explorer */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              1. Quick Subject Explorer (Click Any Subject to Load)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {QUICK_SUBJECTS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(s.topic)}
                className={`text-left p-3 rounded-2xl border text-xs font-medium transition-all flex flex-col justify-between h-[68px] ${
                  topic === s.topic
                    ? "border-cyan-400 bg-cyan-950/60 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50"
                    : "border-white/5 bg-slate-950/50 text-slate-300 hover:border-white/20 hover:bg-slate-900/70"
                }`}
              >
                <span className="font-semibold text-sm truncate">{s.label}</span>
                <span className="text-[10px] text-slate-400 truncate">Instant 3D Simulation</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar & Document Upload */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Custom Topic Input (7 cols) */}
          <div className="md:col-span-7">
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              2. Custom Topic or Question (Type Anything)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Physics, React Hooks, Photosynthesis, French Revolution..."
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-950/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
            />
          </div>

          {/* Upload Notes (5 cols) */}
          <div className="md:col-span-5">
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-purple-400" />
              Or Upload Learning Notes (PDF, DOCX, PPTX)
            </label>
            <label className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-slate-950/90 border border-dashed border-white/10 hover:border-cyan-400 cursor-pointer transition text-sm text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[180px]">
                {uploadedFile ? uploadedFile.name : "Select Textbook / PDF"}
              </span>
              <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.pptx,.txt" className="hidden" />
            </label>
            {docId && (
              <span className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Grounded RAG Extraction Ready
              </span>
            )}
          </div>
        </div>

        {/* Level, Time, Language Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5 mb-8">
          {/* Level */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2.5">
              Learner Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition ${
                    level === l
                      ? "border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-md shadow-cyan-500/10"
                      : "border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/10 hover:text-slate-200"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Time Constraint */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Available Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 20, 60].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeMinutes(t)}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition ${
                    timeMinutes === t
                      ? "border-amber-400 bg-amber-950/60 text-amber-200 shadow-md shadow-amber-500/10"
                      : "border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/10 hover:text-slate-200"
                  }`}
                >
                  {t} Mins
                </button>
              ))}
            </div>
          </div>

          {/* Teaching Language */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2.5 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> Teaching Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="Hinglish">Hinglish (Hindi + English Mix)</option>
              <option value="English">English (Global Academic)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
            </select>
          </div>
        </div>

        {/* Big Launch Button */}
        <button
          onClick={handleStart}
          disabled={isLoading || isUploading || !topic.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 font-bold text-white text-base shadow-2xl shadow-cyan-500/30 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          {isLoading ? (
            <span className="relative z-10">Architecting 3D Spatial Video Lesson...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Launch Live Spatial AI Classroom</span>
            </>
          )}
        </button>
      </TiltCard>
    </div>
  );
};
