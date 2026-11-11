import React, { useState } from 'react';
import {
  X,
  Calendar,
  Scale,
  RefreshCw,
  MessageCircle,
  Clock,
  Plus,
  Trash2,
  CalendarDays,
  Dumbbell,
  Activity,
  Heart,
  Timer,
  FileText,
  ExternalLink,
  Edit2,
  Copy,
  Check,
  Smartphone,
  Share2,
} from 'lucide-react';
import { Student, EvolutionRecord, EvolutionType, WorkoutDivision } from '../types';
import { cleanPhoneNumber, formatPhoneDisplay } from '../utils/whatsapp';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateStudent: (updated: Student) => void;
}

const getDayName = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dayNames[date.getDay()];
  } catch {
    return '';
  }
};

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateStudent,
}) => {
  const isAvulso = student?.billingType === 'avulso';
  const [activeTab, setActiveTab] = useState<'treinos' | 'evolucao' | 'aulas' | 'reposicoes'>('treinos');

  // Evolution Form States
  const [evolutionType, setEvolutionType] = useState<EvolutionType>('musculacao');
  const [newWeight, setNewWeight] = useState('');
  const [newNote, setNewNote] = useState('');
  const [cardioType, setCardioType] = useState<EvolutionRecord['cardioType']>('Esteira / Corrida');
  const [cardioDistance, setCardioDistance] = useState('');
  const [cardioDuration, setCardioDuration] = useState('');
  const [cardioPace, setCardioPace] = useState('');
  const [cardioBpm, setCardioBpm] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'musculacao' | 'cardio'>('all');

  // Workout Form States
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [workoutName, setWorkoutName] = useState('Treino A');
  const [workoutMuscleGroup, setWorkoutMuscleGroup] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState('');
  const [driveUrl, setDriveUrl] = useState(student?.workoutDriveUrl || '');
  const [copiedPortal, setCopiedPortal] = useState(false);

  // Retroactive date
  const [retroactiveDate, setRetroactiveDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen || !student) return null;

  const getStudentPortalUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?aluno=${student.id}`;
  };

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(getStudentPortalUrl());
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2500);
  };

  const handleSharePortalWhatsApp = () => {
    const url = getStudentPortalUrl();
    const firstName = student.name.split(' ')[0];
    const text = encodeURIComponent(
      `Olá ${firstName}! Preparei sua ficha de treinos no FitCoach. Acesse diretamente pelo seu celular:\n\n${url}\n\nBom treino! 💪`
    );
    window.open(`https://wa.me/${cleanPhoneNumber(student.phone)}?text=${text}`, '_blank');
  };

  const directWa = `https://wa.me/${cleanPhoneNumber(student.phone)}`;
  const attendedDates = (student.attendedDates || []).slice().sort().reverse();
  const workouts = student.workouts || [];

  const handleAddEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newRecord: EvolutionRecord = {
      id: `ev_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: evolutionType,
      note: newNote.trim(),
    };

    if (evolutionType === 'musculacao') {
      newRecord.weight = newWeight ? Number(newWeight) : undefined;
    } else {
      newRecord.cardioType = cardioType;
      newRecord.cardioDistanceKm = cardioDistance ? Number(cardioDistance) : undefined;
      newRecord.cardioDurationMinutes = cardioDuration ? Number(cardioDuration) : undefined;
      newRecord.cardioPace = cardioPace.trim() || undefined;
      newRecord.cardioBpm = cardioBpm ? Number(cardioBpm) : undefined;
    }

    const updatedHistory = [newRecord, ...(student.evolutionHistory || [])];
    onUpdateStudent({
      ...student,
      evolutionHistory: updatedHistory,
    });

    setNewWeight('');
    setNewNote('');
    setCardioDistance('');
    setCardioDuration('');
    setCardioPace('');
    setCardioBpm('');
  };

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutName.trim() || !workoutExercises.trim()) return;

    const newWorkout: WorkoutDivision = {
      id: `w_${Date.now()}`,
      name: workoutName.trim(),
      muscleGroup: workoutMuscleGroup.trim() || 'Geral',
      exercises: workoutExercises.trim(),
    };

    onUpdateStudent({
      ...student,
      workouts: [...workouts, newWorkout],
    });

    setIsAddingWorkout(false);
    setWorkoutName('Treino B');
    setWorkoutMuscleGroup('');
    setWorkoutExercises('');
  };

  const handleDeleteWorkout = (workoutId: string) => {
    onUpdateStudent({
      ...student,
      workouts: workouts.filter((w) => w.id !== workoutId),
    });
  };

  const handleSaveDriveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudent({
      ...student,
      workoutDriveUrl: driveUrl.trim(),
    });
  };

  const generateWorkoutWhatsAppUrl = (workout: WorkoutDivision) => {
    const cleanPhone = cleanPhoneNumber(student.phone);
    const firstName = student.name.split(' ')[0];
    const message = `Fala ${firstName}! Segue sua ficha do *${workout.name} (${workout.muscleGroup})*:

${workout.exercises}

Bora com tudo! 💪`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleAddAttendedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retroactiveDate) return;

    const currentDates = student.attendedDates || [];
    if (currentDates.includes(retroactiveDate)) {
      alert('Esta data já foi registrada para este aluno!');
      return;
    }

    const updatedDates = [...currentDates, retroactiveDate];
    const newCount = updatedDates.length;
    const newFee = isAvulso ? newCount * (student.pricePerClass || 0) : student.monthlyFee;

    onUpdateStudent({
      ...student,
      attendedDates: updatedDates,
      classesDoneMonth: newCount,
      monthlyFee: newFee,
    });
  };

  const handleRemoveAttendedDate = (dateToRemove: string) => {
    const currentDates = student.attendedDates || [];
    const updatedDates = currentDates.filter((d) => d !== dateToRemove);
    const newCount = updatedDates.length;
    const newFee = isAvulso ? newCount * (student.pricePerClass || 0) : student.monthlyFee;

    onUpdateStudent({
      ...student,
      attendedDates: updatedDates,
      classesDoneMonth: newCount,
      monthlyFee: newFee,
    });
  };

  const handleAdjustMakeups = (delta: number) => {
    const nextVal = Math.max(0, student.pendingMakeups + delta);
    onUpdateStudent({
      ...student,
      pendingMakeups: nextVal,
    });
  };

  const filteredHistory = (student.evolutionHistory || []).filter((item) => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'musculacao') return item.type === 'musculacao' || !item.type;
    if (historyFilter === 'cardio') return item.type === 'cardio';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pb-4 border-b border-zinc-800">
          <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-bold flex items-center justify-center shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white m-0">{student.name}</h2>
              {isAvulso ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Por Aula Feita
                </span>
              ) : (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  student.modality === 'consultoria'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {student.modality === 'consultoria' ? 'Consultoria Online' : 'Presencial'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <a
                href={directWa}
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 inline-flex items-center gap-1 transition"
              >
                <MessageCircle className="w-3 h-3 text-[#25D366]" /> {formatPhoneDisplay(student.phone)}
              </a>
              <span>•</span>
              {isAvulso ? (
                <span className="text-amber-300">
                  {student.pricePerClass?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/aula
                </span>
              ) : (
                <span>
                  Mensalidade: <strong>{student.monthlyFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Tabs: Treinos vs Evolução vs Aulas */}
        <div className="flex gap-1.5 my-3.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('treinos')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'treinos'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Ficha de Treino ({workouts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evolucao')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'evolucao'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Evolução ({student.evolutionHistory?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('aulas')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'aulas'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Datas ({attendedDates.length})</span>
          </button>

          {!isAvulso && (
            <button
              onClick={() => setActiveTab('reposicoes')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reposicoes'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reposições ({student.pendingMakeups})</span>
            </button>
          )}
        </div>

        {/* TAB 1: FICHA DE TREINO (ROTINA A / B / C / DRIVE) */}
        {activeTab === 'treinos' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Compartilhar Portal Web do Aluno */}
            <div className="bg-emerald-950/30 border border-emerald-500/25 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Portal Web do Aluno</span>
                  <span className="text-[11px] text-zinc-400 block leading-tight">
                    O aluno abre no celular para marcar exercícios e avisar no WhatsApp.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPortalLink}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
                  title="Copiar link direto da ficha"
                >
                  {copiedPortal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedPortal ? 'Copiado!' : 'Copiar Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSharePortalWhatsApp}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-zinc-950 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                  title="Enviar link formatado no WhatsApp do aluno"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Enviar WhatsApp</span>
                </button>

                <a
                  href={getStudentPortalUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  title="Testar e abrir portal em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Link externo / Drive */}
            <form onSubmit={handleSaveDriveUrl} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="url"
                placeholder="Link da planilha, Google Drive ou Notion..."
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 flex-1 focus:outline-none focus:border-zinc-700"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition shrink-0"
              >
                Salvar link
              </button>
            </form>

            {/* Ações e Botão Novo Treino */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Divisão de Treinos (A/B/C)</span>
              {!isAddingWorkout && (
                <button
                  onClick={() => setIsAddingWorkout(true)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Divisão</span>
                </button>
              )}
            </div>

            {/* Formulário para Adicionar Divisão */}
            {isAddingWorkout && (
              <form onSubmit={handleSaveWorkout} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nome da Divisão</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Treino A"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Músculos / Foco</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Peito, Ombro e Tríceps"
                      value={workoutMuscleGroup}
                      onChange={(e) => setWorkoutMuscleGroup(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Exercícios, séries e repetições</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="1. Supino Reto com Barra 4x10&#10;2. Supino Inclinado Halteres 3x12&#10;3. Elevação Lateral 4x15&#10;4. Tríceps Corda 4x12"
                    value={workoutExercises}
                    onChange={(e) => setWorkoutExercises(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700 resize-none font-mono"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingWorkout(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold"
                  >
                    Salvar Divisão
                  </button>
                </div>
              </form>
            )}

            {/* Lista dos Treinos Salvos */}
            <div className="space-y-3">
              {workouts.map((w) => {
                const waUrl = generateWorkoutWhatsAppUrl(w);

                return (
                  <div key={w.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60">
                      <div>
                        <span className="font-bold text-white text-sm mr-2">{w.name}</span>
                        <span className="text-zinc-400 text-xs font-medium">({w.muscleGroup})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-[#25D366] hover:bg-[#20ba59] text-zinc-950 text-[11px] font-semibold flex items-center gap-1 transition"
                          title="Enviar esta ficha no WhatsApp do aluno"
                        >
                          <MessageCircle className="w-3 h-3 fill-zinc-950 stroke-none" />
                          <span>Enviar Ficha</span>
                        </a>

                        <button
                          onClick={() => handleDeleteWorkout(w.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-900 transition"
                          title="Excluir treino"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <pre className="text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed m-0 text-xs">
                      {w.exercises}
                    </pre>
                  </div>
                );
              })}

              {workouts.length === 0 && !isAddingWorkout && (
                <div className="text-center py-8 bg-zinc-950/60 border border-zinc-800/60 rounded-xl">
                  <Dumbbell className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-xs">Nenhum treino cadastrado para este aluno.</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">Cadastre a rotina A/B/C ou cole o link do Google Drive.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EVOLUÇÃO (MUSCULAÇÃO + CARDIO) */}
        {activeTab === 'evolucao' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <form onSubmit={handleAddEvolution} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Novo Registro de Progresso</span>
                
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setEvolutionType('musculacao')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                      evolutionType === 'musculacao'
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Dumbbell className="w-3 h-3" />
                    <span>Musculação</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvolutionType('cardio')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                      evolutionType === 'cardio'
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    <span>Cardio / Esteira</span>
                  </button>
                </div>
              </div>

              {evolutionType === 'musculacao' ? (
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Peso Corporal Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 82.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                  />
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Aparelho / Modalidade</label>
                    <select
                      value={cardioType}
                      onChange={(e) => setCardioType(e.target.value as EvolutionRecord['cardioType'])}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                    >
                      <option value="Esteira / Corrida">🏃 Esteira / Corrida</option>
                      <option value="Bike / Ciclismo">🚴 Bike / Ciclismo</option>
                      <option value="Elíptico">⚡ Elíptico</option>
                      <option value="Remo">🚣 Remo</option>
                      <option value="Caminhada">🚶 Caminhada</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Distância (km)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 5.0"
                        value={cardioDistance}
                        onChange={(e) => setCardioDistance(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Tempo (min)</label>
                      <input
                        type="number"
                        placeholder="Ex: 30"
                        value={cardioDuration}
                        onChange={(e) => setCardioDuration(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Pace ou Vel.</label>
                      <input
                        type="text"
                        placeholder="Ex: 5:45/km"
                        value={cardioPace}
                        onChange={(e) => setCardioPace(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">FC Média (bpm)</label>
                      <input
                        type="number"
                        placeholder="Ex: 155"
                        value={cardioBpm}
                        onChange={(e) => setCardioBpm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  {evolutionType === 'musculacao' ? 'Anotações de carga / séries' : 'Sensação / Observação do treino'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    evolutionType === 'musculacao'
                      ? 'Ex: Subiu supino para 35kg, agachamento 70kg...'
                      : 'Ex: Treino progressivo na esteira, sem dores...'
                  }
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition"
              >
                Salvar registro de evolução
              </button>
            </form>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-semibold text-zinc-300">Histórico de Treinos</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                    historyFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setHistoryFilter('musculacao')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                    historyFilter === 'musculacao' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Musculação
                </button>
                <button
                  onClick={() => setHistoryFilter('cardio')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                    historyFilter === 'cardio' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Cardio
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const isCardio = item.type === 'cardio';

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-3 text-xs ${
                        isCardio
                          ? 'bg-zinc-950/80 border-amber-500/30'
                          : 'bg-zinc-950 border-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </span>
                          {isCardio ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                              🏃 {item.cardioType || 'Cardio'}
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-medium">
                              🏋️ Musculação
                            </span>
                          )}
                        </div>

                        {item.weight && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <Scale className="w-3 h-3" /> {item.weight} kg
                          </span>
                        )}
                      </div>

                      {isCardio && (
                        <div className="flex flex-wrap items-center gap-3 py-1 mb-1 text-[11px] text-zinc-300 bg-zinc-900/60 px-2.5 rounded-lg border border-zinc-800">
                          {item.cardioDistanceKm && (
                            <span className="font-bold text-white">
                              {item.cardioDistanceKm} km
                            </span>
                          )}
                          {item.cardioDurationMinutes && (
                            <span className="inline-flex items-center gap-1 text-zinc-400">
                              <Timer className="w-3 h-3" /> {item.cardioDurationMinutes} min
                            </span>
                          )}
                          {item.cardioPace && (
                            <span className="text-amber-300 font-mono">
                              Pace: {item.cardioPace}
                            </span>
                          )}
                          {item.cardioBpm && (
                            <span className="inline-flex items-center gap-1 text-rose-400">
                              <Heart className="w-3 h-3" /> {item.cardioBpm} bpm
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-zinc-200 m-0 leading-relaxed">{item.note}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Nenhum registro encontrado neste filtro.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DATAS DAS AULAS (AGENDA RETROATIVA) */}
        {activeTab === 'aulas' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block">Total de aulas realizadas</span>
                <span className="text-xl font-bold text-white tracking-tight">
                  {attendedDates.length} aulas
                </span>
              </div>
              {isAvulso && (
                <div className="text-right">
                  <span className="text-[11px] text-zinc-400 block">Subtotal a cobrar</span>
                  <span className="text-lg font-bold text-amber-300">
                    {(attendedDates.length * (student.pricePerClass || 0)).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleAddAttendedDate} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-2">
              <span className="text-xs font-semibold text-zinc-200 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Lançar aula esquecida ou retroativa
              </span>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={retroactiveDate}
                  onChange={(e) => setRetroactiveDate(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 flex-1"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lançar aula</span>
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-400 block">Aulas confirmadas neste mês:</span>
              {attendedDates.length > 0 ? (
                attendedDates.map((dateStr) => {
                  const dayName = getDayName(dateStr);
                  const [y, m, d] = dateStr.split('-');
                  const formattedDate = `${d}/${m}/${y}`;

                  return (
                    <div
                      key={dateStr}
                      className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-800">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-200 block">{formattedDate}</span>
                          <span className="text-[11px] text-zinc-500">{dayName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAvulso && (
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {student.pricePerClass?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        )}
                        <button
                          onClick={() => handleRemoveAttendedDate(dateStr)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-900 transition"
                          title="Remover esta aula"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Nenhuma aula registrada ainda neste mês.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: BANCO DE REPOSIÇÕES */}
        {activeTab === 'reposicoes' && !isAvulso && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
              <span className="text-xs text-zinc-400 block">Reposições pendentes acumuladas</span>
              <span className="text-3xl font-bold text-white tracking-tight my-2 block">
                {student.pendingMakeups}
              </span>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mb-4">
                Use este controle quando o aluno desmarcar dentro do prazo combinado para saber quantas aulas ele tem direito a repor.
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleAdjustMakeups(-1)}
                  disabled={student.pendingMakeups === 0}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-medium text-zinc-300 transition"
                >
                  - Repor 1 aula dada
                </button>
                <button
                  onClick={() => handleAdjustMakeups(1)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-xs font-semibold text-zinc-950 transition"
                >
                  + Adicionar 1 falta com aviso
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
