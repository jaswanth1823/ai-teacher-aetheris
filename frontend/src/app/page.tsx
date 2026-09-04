"use client";

import React, { useState, useEffect } from "react";
import { 
  LessonPlanResponse, 
  LessonBeat, 
  LearnerProfile, 
  AssessmentReport, 
  MisconceptionAnalysis,
  generateLesson, 
  generateTTSAudio, 
  submitFinalAssessment 
} from "@/lib/api";
import { SmartBoard } from "@/components/SmartBoard";
import { VideoAvatar } from "@/components/VideoAvatar";
import { SocraticModal } from "@/components/SocraticModal";
import { ConfigModal } from "@/components/ConfigModal";
import { AnalyticsView } from "@/components/AnalyticsView";
import { BackgroundParticleField } from "@/components/BackgroundParticleField";
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  GraduationCap, 
  Sparkles,
  ArrowLeft
} from "lucide-react";

export default function ClassroomPage() {
  const [lessonPlan, setLessonPlan] = useState<LessonPlanResponse | null>(null);
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<LessonBeat | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [assessmentReport, setAssessmentReport] = useState<AssessmentReport | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});

  const currentBeat: LessonBeat | null = lessonPlan ? lessonPlan.beats[currentBeatIndex] : null;

  // Load audio when beat changes
  useEffect(() => {
    if (!currentBeat || !lessonPlan) return;

    let isMounted = true;
    const fetchAudio = async () => {
      const audio = await generateTTSAudio(currentBeat.spoken_text, lessonPlan.language);
      if (isMounted) {
        setAudioUrl(audio);
        setIsPlaying(true);
      }
    };

    fetchAudio();

    // Trigger checkpoint if beat is a checkpoint
    if (currentBeat.is_checkpoint && currentBeat.question) {
      setActiveCheckpoint(currentBeat);
      setIsPlaying(false);
    }

    return () => {
      isMounted = false;
    };
  }, [currentBeatIndex, lessonPlan]);

  const handleStartLesson = async (topic: string, docId?: string, profile?: LearnerProfile) => {
    setIsLoading(true);
    try {
      const plan = await generateLesson({
        topic,
        doc_id: docId,
        profile: profile || {
          level: "Beginner",
          available_time_minutes: 20,
          language: "Hinglish",
        },
      });
      setLessonPlan(plan);
      setCurrentBeatIndex(0);
      setAssessmentReport(null);
      setStudentAnswers({});
    } catch (e) {
      console.error(e);
      alert("Failed to start lesson. Make sure backend is running on http://localhost:8000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextBeat = () => {
    if (!lessonPlan) return;
    if (currentBeatIndex < lessonPlan.beats.length - 1) {
      setCurrentBeatIndex((prev) => prev + 1);
    } else {
      // Lesson Complete -> Trigger Final Assessment
      handleFinishLesson();
    }
  };

  const handlePrevBeat = () => {
    if (currentBeatIndex > 0) {
      setCurrentBeatIndex((prev) => prev - 1);
    }
  };

  const handleCheckpointResolved = (analysis: MisconceptionAnalysis) => {
    if (activeCheckpoint && activeCheckpoint.question) {
      setStudentAnswers((prev) => ({
        ...prev,
        [activeCheckpoint.question!.question_id]: analysis.is_correct ? "correct" : "misconception_remediated",
      }));
    }
    setActiveCheckpoint(null);
    setIsPlaying(true);
  };

  const handleFinishLesson = async () => {
    if (!lessonPlan) return;
    setIsLoading(true);
    try {
      const report = await submitFinalAssessment(lessonPlan.lesson_id, studentAnswers);
      setAssessmentReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#06080f] text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden">
      {/* Futuristic Spatial Particle Background */}
      <BackgroundParticleField />

      {/* VisionOS Floating Navigation Header */}
      <header className="w-full max-w-7xl flex items-center justify-between py-3.5 px-6 bg-slate-900/40 border border-white/10 rounded-3xl mb-6 backdrop-blur-2xl z-30 shadow-2xl relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-white tracking-wider">AETHERIS</h1>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
                SPATIAL AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-light hidden sm:block">Autonomous Multimodal Educator</p>
          </div>
        </div>

        {lessonPlan && !assessmentReport && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950/70 text-slate-300 border border-white/10 hidden sm:inline-block">
              {lessonPlan.target_level}
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950/70 text-slate-300 border border-white/10 hidden sm:inline-block">
              {lessonPlan.language}
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30">
              {lessonPlan.total_duration_minutes} Mins
            </span>
            <button
              onClick={() => setLessonPlan(null)}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Studio Viewport */}
      <div className="w-full max-w-7xl flex-1 flex flex-col items-center justify-center z-10">
        {/* State 1: Configuration & Setup */}
        {!lessonPlan && !assessmentReport && (
          <ConfigModal onStartLesson={handleStartLesson} isLoading={isLoading} />
        )}

        {/* State 2: Active Classroom Session */}
        {lessonPlan && !assessmentReport && currentBeat && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Split Screen: Avatar Left, SmartBoard Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
              {/* Left Column: Avatar & Speech (4 cols) */}
              <div className="lg:col-span-4 h-full">
                <VideoAvatar
                  spokenText={currentBeat.spoken_text}
                  emotion={currentBeat.avatar_emotion}
                  gesture={currentBeat.avatar_gesture}
                  audioBase64={audioUrl}
                  language={lessonPlan.language}
                  isPlaying={isPlaying}
                  onAudioEnded={() => setIsPlaying(false)}
                />
              </div>

              {/* Right Column: Smart Blackboard (8 cols) */}
              <div className="lg:col-span-8 h-full">
                <SmartBoard
                  action={currentBeat.board_action}
                  lessonTitle={lessonPlan.lesson_title}
                  currentBeat={currentBeatIndex + 1}
                  totalBeats={lessonPlan.beats.length}
                />
              </div>
            </div>

            {/* Bottom Control & Stepper Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-900/60 border border-white/10 rounded-3xl backdrop-blur-2xl gap-4 shadow-2xl">
              {/* Beat Stepper Dots */}
              <div className="flex items-center gap-2">
                {lessonPlan.beats.map((b, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBeatIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentBeatIndex
                        ? "w-8 bg-cyan-400 shadow-lg shadow-cyan-400/50"
                        : idx < currentBeatIndex
                        ? "w-2.5 bg-emerald-500/80"
                        : "w-2.5 bg-slate-700"
                    }`}
                    title={`Beat ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Media Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevBeat}
                  disabled={currentBeatIndex === 0}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition border border-white/5"
                  title="Previous Beat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? "Pause Lecture" : "Play Lecture"}</span>
                </button>

                <button
                  onClick={handleNextBeat}
                  className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-white/10 transition active:scale-95"
                  title="Next Beat"
                >
                  <span>{currentBeatIndex === lessonPlan.beats.length - 1 ? "Complete Lesson" : "Next Beat"}</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Final Analytics & 7-Day Roadmap */}
        {assessmentReport && (
          <AnalyticsView
            report={assessmentReport}
            onRestart={() => {
              setLessonPlan(null);
              setAssessmentReport(null);
            }}
          />
        )}

        {/* Socratic Checkpoint Modal Overlay */}
        {activeCheckpoint && activeCheckpoint.question && (
          <SocraticModal
            question={activeCheckpoint.question}
            lessonId={lessonPlan?.lesson_id || "lsn_default"}
            beatId={activeCheckpoint.beat_id}
            language={lessonPlan?.language || "English"}
            onResolved={handleCheckpointResolved}
          />
        )}
      </div>
    </main>
  );
}
