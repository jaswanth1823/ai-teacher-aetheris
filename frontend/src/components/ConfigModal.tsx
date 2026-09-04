"use client";

import React, { useState } from "react";
import { LearnerProfile, uploadMaterial } from "@/lib/api";
import { BookOpen, Clock, Globe2, Sparkles, Upload, FileText, CheckCircle2, Compass } from "lucide-react";

interface ConfigModalProps {
  onStartLesson: (topic: string, docId?: string, profile?: LearnerProfile) => void;
  isLoading: boolean;
}

const QUICK_SUBJECTS = [
  { label: "🧬 DNA & Genetics", topic: "Structure and Function of DNA & Genetic Replication" },
  { label: "🪐 Planetary Orbits", topic: "Gravitational Motion & Solar System Orbits" },
  { label: "🍎 Newton's Laws", topic: "Newton's Three Laws of Motion & Force Dynamics" },
  { label: "⚡ Ohm's Law & Circuits", topic: "Electric Circuits, Voltage, Current, and Ohm's Law" },
  { label: "🧪 Chemical Bonds", topic: "Covalent and Ionic Chemical Bonding in Molecules" },
  { label: "💻 React & Binary Trees", topic: "Binary Search Tree Data Structures and React Virtual DOM" },
  { label: "🧠 Neural Networks", topic: "Artificial Neural Networks and Deep Learning Fundamentals" },
  { label: "📐 Calculus & Derivatives", topic: "Differential Calculus, Derivatives, and Rates of Change" },
  { label: "🌿 Photosynthesis", topic: "Cellular Energy, Chloroplasts, and Photosynthesis" },
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
    <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          AI INNOVATION HACKATHON 2026
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Aetheris AI Educator Studio
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-2">
          Learn ANY Subject through 3D Simulations, Synchronized Live Blackboard, and Socratic Adaptation
        </p>
      </div>

      {/* Quick Subject Chips */}
      <div className="mb-6 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2.5">
          <Compass className="w-3.5 h-3.5" />
          Quick Explore Any Subject (Click to Learn)
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_SUBJECTS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTopic(s.topic)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                topic === s.topic
                  ? "border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-md shadow-cyan-500/10"
                  : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Form */}
      <div className="space-y-6">
        {/* Topic Input or File Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              1. Topic or Question (Type Anything)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Newton's Laws, Quantum Physics, React Hooks..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-purple-400" />
              Or Upload Textbook / Notes (PDF, DOCX, PPTX)
            </label>
            <label className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-cyan-400 cursor-pointer transition text-sm text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="truncate max-w-[200px]">
                {uploadedFile ? uploadedFile.name : "Select Textbook or PDF Notes"}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          {/* Level */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
              Learner Depth
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`py-2 rounded-xl text-xs font-medium border transition ${
                    level === l
                      ? "border-cyan-400 bg-cyan-950/50 text-cyan-200"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Time Constraint */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Available Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 20, 60].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeMinutes(t)}
                  className={`py-2 rounded-xl text-xs font-medium border transition ${
                    timeMinutes === t
                      ? "border-amber-400 bg-amber-950/50 text-amber-200"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {t} Mins
                </button>
              ))}
            </div>
          </div>

          {/* Teaching Language */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
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

        {/* Submit Start */}
        <button
          onClick={handleStart}
          disabled={isLoading || isUploading || !topic.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 font-bold text-white text-base shadow-xl shadow-cyan-500/25 hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <span>Architecting Synchronized 3D Video Lesson...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Launch Live AI Classroom Session</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
