"use client";

import React, { useState } from "react";
import { InteractiveQuestion, MisconceptionAnalysis, evaluateResponse } from "@/lib/api";
import { HelpCircle, Mic, MicOff, Send, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";

interface SocraticModalProps {
  question: InteractiveQuestion;
  lessonId: string;
  beatId: number;
  language: string;
  onResolved: (analysis: MisconceptionAnalysis) => void;
}

export const SocraticModal: React.FC<SocraticModalProps> = ({
  question,
  lessonId,
  beatId,
  language,
  onResolved,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<MisconceptionAnalysis | null>(null);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser. Please type your answer.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language.toLowerCase().includes("hindi") ? "hi-IN" : "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTextAnswer(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    const finalAnswer = selectedOption || textAnswer;
    if (!finalAnswer.trim()) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateResponse({
        lesson_id: lessonId,
        beat_id: beatId,
        question_id: question.question_id,
        student_answer: finalAnswer,
        language: language,
      });
      setAnalysis(result);
    } catch (e) {
      console.error("Evaluation error:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Interactive Socratic Checkpoint</span>
            <h3 className="text-lg font-semibold text-white">Let's Check Your Intuition</h3>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="mb-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
          <p className="text-base md:text-lg font-medium text-slate-100 leading-relaxed">
            {question.prompt}
          </p>
        </div>

        {/* Not Evaluated yet: Answer Form */}
        {!analysis && (
          <div className="space-y-4">
            {/* MCQ Options if available */}
            {question.options && question.options.length > 0 && (
              <div className="space-y-2.5">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedOption(opt);
                      setTextAnswer(opt);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedOption === opt
                        ? "border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-lg shadow-cyan-500/10"
                        : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Free Text / Voice Input */}
            <div className="relative mt-4">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Or speak/type your conceptual reasoning..."
                className="w-full pl-4 pr-24 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-lg transition ${
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-slate-400 hover:text-cyan-400"
                  }`}
                  title="Speak your answer"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isEvaluating || (!selectedOption && !textAnswer.trim())}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <span>AI Diagnosing Conceptual Model...</span>
              ) : (
                <>
                  <span>Submit Understanding</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Evaluated: Show Misconception Diagnosis or Success */}
        {analysis && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {analysis.is_correct ? (
              <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Concept Fully Mastered!</span>
                </div>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  {analysis.explanation_analogy}
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-500/40">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-base mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Cognitive Misconception Detected</span>
                </div>
                <div className="text-xs font-mono text-amber-300 mb-2">
                  Root Cause: {analysis.root_cause}
                </div>
                <p className="text-sm text-slate-100 leading-relaxed bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-semibold block mb-1">Teacher's Analogy:</span>
                  {analysis.explanation_analogy}
                </p>

                {analysis.follow_up_question && (
                  <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/30 text-xs text-cyan-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Follow-up check:</span>
                      {analysis.follow_up_question}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => onResolved(analysis)}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-sm border border-cyan-500/30 transition flex items-center justify-center gap-2"
            >
              <span>Apply Remediation & Resume Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
