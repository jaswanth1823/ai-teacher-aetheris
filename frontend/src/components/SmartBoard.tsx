"use client";

import React, { useEffect, useState } from "react";
import { BlackboardAction } from "@/lib/api";
import { ThreeVisualizer } from "@/components/ThreeVisualizer";
import { FormulaDisplay } from "@/components/FormulaDisplay";
import { Sparkles, Terminal, Code2, Cpu, CheckCircle2, Box, FunctionSquare } from "lucide-react";

interface SmartBoardProps {
  action: BlackboardAction | null;
  lessonTitle: string;
  currentBeat: number;
  totalBeats: number;
}

export const SmartBoard: React.FC<SmartBoardProps> = ({
  action,
  lessonTitle,
  currentBeat,
  totalBeats,
}) => {
  const [renderedContent, setRenderedContent] = useState<string>("");

  useEffect(() => {
    if (!action) return;
    setRenderedContent(action.content);
  }, [action]);

  if (!action) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 text-center text-slate-400 shadow-2xl">
        <Cpu className="w-16 h-16 text-cyan-400/40 mb-4 animate-pulse" />
        <h3 className="text-xl font-semibold text-slate-200">Interactive Spatial Blackboard</h3>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          Ready to synthesize live formulas, interactive 3D simulations, Mermaid diagrams, and code demonstrations.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950/85 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
            {action.type === "3d_simulation" ? (
              <Box className="w-3.5 h-3.5 text-cyan-400" />
            ) : action.type === "latex" ? (
              <FunctionSquare className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {action.type.toUpperCase()} MODE
          </span>
          <h2 className="text-sm font-medium text-slate-200 truncate max-w-xs md:max-w-md">
            {action.title}
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-800/80 px-3.5 py-1 rounded-full border border-white/5">
          Beat {currentBeat} of {totalBeats}
        </div>
      </div>

      {/* Main Board Canvas */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-center items-center">
        {/* 3D INTERACTIVE SIMULATION RENDERER */}
        {action.type === "3d_simulation" && (
          <div className="w-full h-full min-h-[380px] flex flex-col">
            <ThreeVisualizer modelType={renderedContent || "physics_circuit"} />
          </div>
        )}

        {/* LATEX EQUATION RENDERER */}
        {action.type === "latex" && (
          <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-cyan-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-cyan-500/5 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient specular highlight */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            <div className="text-xs font-mono text-cyan-400 mb-4 tracking-wider uppercase flex items-center justify-center gap-1.5">
              <FunctionSquare className="w-4 h-4 text-cyan-400" />
              Governing Mathematical Expression
            </div>

            {/* High-Fidelity Typography Render */}
            <FormulaDisplay formula={renderedContent} />

            <div className="mt-6 text-xs font-mono text-slate-400 border-t border-white/10 pt-3.5 flex items-center justify-between px-2">
              <span>Standard Academic Derivation</span>
              <span className="text-cyan-400/80">Active Mental Model</span>
            </div>
          </div>
        )}

        {/* CODE DEMONSTRATION RENDERER */}
        {action.type === "code" && (
          <div className="w-full max-w-3xl bg-slate-950/90 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-purple-300">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-400" />
                {action.language || "python"} implementation
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Executable
              </span>
            </div>
            <pre className="p-6 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{renderedContent}</code>
            </pre>
            {action.execution_output && (
              <div className="bg-slate-900/90 border-t border-slate-800 p-4 font-mono text-xs text-emerald-400 flex items-start gap-2">
                <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block mb-0.5">Terminal Output:</span>
                  {action.execution_output}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MERMAID / DIAGRAM RENDERER */}
        {(action.type === "mermaid" || action.type === "diagram") && (
          <div className="w-full max-w-2xl bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-8 shadow-xl">
            <div className="text-xs font-mono text-emerald-400 mb-4 text-center tracking-wider uppercase">
              System Dynamics & Conceptual Flow
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {renderedContent}
            </div>
          </div>
        )}

        {/* BULLET POINTS & SYNTHESIS RENDERER */}
        {action.type === "bullet_points" && (
          <div className="w-full max-w-2xl bg-slate-900/90 border border-amber-500/30 rounded-2xl p-8 shadow-xl">
            <div className="text-xs font-mono text-amber-400 mb-4 tracking-wider uppercase">
              Core Principles & Observations
            </div>
            <div className="space-y-3 text-slate-200 text-base leading-relaxed whitespace-pre-line font-sans">
              {renderedContent}
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="px-6 py-3 bg-slate-950/90 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Aetheris 3D Spatial Canvas</span>
        <span className="text-cyan-400/80">WebGL Multi-Layer Rendering</span>
      </div>
    </div>
  );
};
