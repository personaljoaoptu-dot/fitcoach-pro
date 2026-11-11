import React, { useState } from 'react';
import { Dumbbell, Check, ExternalLink, MessageCircle, ArrowLeft, Trophy, Calendar } from 'lucide-react';
import { Student } from '../types';

interface StudentPortalProps {
  student: Student;
  trainerName: string;
  trainerPhone: string;
  onExit?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  trainerName,
  trainerPhone,
  onExit,
}) => {
  const workouts = student.workouts || [];
  const [selectedDivisionIndex, setSelectedDivisionIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  const currentWorkout = workouts[selectedDivisionIndex];

  // Parse exercise lines
  const parseExercises = (text: string) => {
    if (!text) return [];
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const exerciseLines = currentWorkout ? parseExercises(currentWorkout.exercises) : [];

  const toggleExercise = (idx: number) => {
    const key = `${selectedDivisionIndex}-${idx}`;
    setCompletedExercises((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = exerciseLines.filter((_, idx) => completedExercises[`${selectedDivisionIndex}-${idx}`]).length;
  const progressPercent = exerciseLines.length > 0 ? Math.round((completedCount / exerciseLines.length) * 100) : 0;

  const handleFinishWorkout = () => {
    const cleanPhone = trainerPhone.replace(/\D/g, '');
    const divisionName = currentWorkout ? currentWorkout.name : 'Treino';
    const text = encodeURIComponent(
      `Olá ${trainerName}! Concluí meu treino hoje (${divisionName}) pelo FitCoach! 💪🔥`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-28">
      {/* Top Header */}
      <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onExit && (
              <button
                onClick={onExit}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition mr-1"
                title="Voltar ao app do Personal"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                {student.name}
              </h1>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Personal: <span className="text-zinc-200 font-medium">{trainerName || 'FitCoach'}</span>
              </p>
            </div>
          </div>

          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
            {student.modality === 'presencial' ? 'Presencial' : 'Consultoria'}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-4 py-4 flex-1 space-y-4">
        {/* Workout Division Selector Tabs */}
        {workouts.length > 0 ? (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {workouts.map((w, idx) => (
                <button
                  key={w.id || idx}
                  onClick={() => setSelectedDivisionIndex(idx)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    selectedDivisionIndex === idx
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {w.name || `Treino ${String.fromCharCode(65 + idx)}`}
                </button>
              ))}
            </div>

            {/* Current Workout Card */}
            {currentWorkout && (
              <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {currentWorkout.name}
                    </h2>
                    <span className="text-xs text-emerald-400 font-medium">
                      {currentWorkout.muscleGroup || 'Grupamentos do dia'}
                    </span>
                  </div>
                  {progressPercent === 100 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Trophy className="w-3 h-3" />
                      100% Concluído
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-950 rounded-full h-2 mb-4 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Exercise Checklist */}
                <div className="space-y-2">
                  {exerciseLines.map((ex, idx) => {
                    const isDone = Boolean(completedExercises[`${selectedDivisionIndex}-${idx}`]);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleExercise(idx)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none active:scale-[0.99] ${
                          isDone
                            ? 'bg-zinc-950/60 border-zinc-800/60 text-zinc-500'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                              : 'border-zinc-700 bg-zinc-900 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className={`text-xs leading-relaxed flex-1 ${isDone ? 'line-through text-zinc-500' : ''}`}>
                          {ex}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* External Drive Link */}
                {student.workoutDriveUrl && (
                  <div className="mt-4 pt-3 border-t border-zinc-800">
                    <a
                      href={student.workoutDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Planilha / Vídeos Completos (Drive)</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 space-y-2">
            <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs">Nenhum treino montado pelo personal ainda.</p>
            <p className="text-[11px] text-zinc-500">Seu professor cadastrará sua ficha em breve!</p>
          </div>
        )}

        {/* Card of Cardio / Observation if present */}
        {student.notes && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Orientações do Professor
            </span>
            <p className="text-zinc-300 whitespace-pre-wrap">{student.notes}</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Bar: Notify Trainer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleFinishWorkout}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <MessageCircle className="w-4 h-4 fill-zinc-950" />
            <span>Finalizar Treino & Avisar no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
