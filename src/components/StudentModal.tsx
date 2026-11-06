import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CalendarDays, Clock } from 'lucide-react';
import { Student, StudentModality, BillingType, ScheduleItem } from '../types';

export interface InitialScheduleSlot {
  dayOfWeek: ScheduleItem['dayOfWeek'];
  startTime: string;
  endTime: string;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (
    studentData: Omit<Student, 'id' | 'createdAt'> & {
      id?: string;
      initialSchedules?: InitialScheduleSlot[];
    }
  ) => void;
  studentToEdit?: Student | null;
}

const ALL_DAYS: ScheduleItem['dayOfWeek'][] = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSaveStudent,
  studentToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('mensal');
  const [monthlyFee, setMonthlyFee] = useState('350');
  const [pricePerClass, setPricePerClass] = useState('70');
  const [dueDay, setDueDay] = useState('10');
  const [modality, setModality] = useState<StudentModality>('presencial');
  const [notes, setNotes] = useState('');

  // Schedule setup during creation
  const [includeSchedule, setIncludeSchedule] = useState(true);
  const [selectedDays, setSelectedDays] = useState<ScheduleItem['dayOfWeek'][]>(['Segunda', 'Quarta', 'Sexta']);
  const [defaultStartTime, setDefaultStartTime] = useState('07:00');
  const [defaultEndTime, setDefaultEndTime] = useState('08:00');

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setPhone(studentToEdit.phone);
      setBillingType(studentToEdit.billingType || 'mensal');
      setMonthlyFee(String(studentToEdit.monthlyFee));
      setPricePerClass(String(studentToEdit.pricePerClass || 70));
      setDueDay(String(studentToEdit.dueDay));
      setModality(studentToEdit.modality || 'presencial');
      setNotes(studentToEdit.notes || '');
      setIncludeSchedule(false); // Don't overwrite existing schedule on edit
    } else {
      setName('');
      setPhone('');
      setBillingType('mensal');
      setMonthlyFee('350');
      setPricePerClass('70');
      setDueDay('10');
      setModality('presencial');
      setNotes('');
      setIncludeSchedule(true);
      setSelectedDays(['Segunda', 'Quarta', 'Sexta']);
      setDefaultStartTime('07:00');
      setDefaultEndTime('08:00');
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: ScheduleItem['dayOfWeek']) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleApplyPreset = (days: ScheduleItem['dayOfWeek'][]) => {
    setSelectedDays(days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPricePerClass = Number(pricePerClass);
    const finalMonthlyFee =
      billingType === 'avulso'
        ? (studentToEdit?.classesDoneMonth || 0) * finalPricePerClass
        : Number(monthlyFee);

    // Prepare initial schedules if requested and presencial
    let initialSchedules: InitialScheduleSlot[] = [];
    if (!studentToEdit && modality === 'presencial' && includeSchedule && selectedDays.length > 0) {
      initialSchedules = selectedDays.map((day) => ({
        dayOfWeek: day,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      }));
    }

    onSaveStudent({
      id: studentToEdit?.id,
      name,
      phone,
      billingType,
      monthlyFee: finalMonthlyFee,
      pricePerClass: finalPricePerClass,
      classesDoneMonth: studentToEdit?.classesDoneMonth || 0,
      dueDay: Number(dueDay),
      status: studentToEdit ? studentToEdit.status : 'active',
      modality,
      pendingMakeups: studentToEdit ? studentToEdit.pendingMakeups : 0,
      evolutionHistory: studentToEdit ? studentToEdit.evolutionHistory : [],
      notes,
      initialSchedules,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold text-white mb-1">
          {studentToEdit ? 'Editar dados do aluno' : 'Novo aluno'}
        </h2>
        <p className="text-xs text-zinc-400 mb-5">
          Cadastre as informações, valor e já defina os horários do treino
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Dados Básicos */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Nome completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                placeholder="Ex: Carlos Mendes"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">WhatsApp (DDD + Número)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                placeholder="Ex: 11987654321"
              />
            </div>
          </div>

          {/* Modalidade */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Modalidade do Aluno</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModality('presencial')}
                className={`py-2 px-3 rounded-lg border text-center transition ${
                  modality === 'presencial'
                    ? 'border-zinc-300 bg-zinc-800 text-white font-semibold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🏋️ Presencial
              </button>
              <button
                type="button"
                onClick={() => {
                  setModality('consultoria');
                  setBillingType('mensal');
                }}
                className={`py-2 px-3 rounded-lg border text-center transition ${
                  modality === 'consultoria'
                    ? 'border-zinc-300 bg-zinc-800 text-white font-semibold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📱 Consultoria Online
              </button>
            </div>
          </div>

          {/* Formato de Cobrança */}
          {modality === 'presencial' && (
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Formato de Cobrança</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillingType('mensal')}
                  className={`py-2 px-3 rounded-lg border text-center transition ${
                    billingType === 'mensal'
                      ? 'border-zinc-300 bg-zinc-800 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  📅 Mensalidade Fixa
                </button>
                <button
                  type="button"
                  onClick={() => setBillingType('avulso')}
                  className={`py-2 px-3 rounded-lg border text-center transition ${
                    billingType === 'avulso'
                      ? 'border-zinc-300 bg-zinc-800 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⏱️ Por Aula Feita
                </button>
              </div>
            </div>
          )}

          {/* Valores e Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            {billingType === 'mensal' ? (
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Mensalidade (R$)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  placeholder="350"
                />
              </div>
            ) : (
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Valor por Aula (R$)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={pricePerClass}
                  onChange={(e) => setPricePerClass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  placeholder="70"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                {billingType === 'mensal' ? 'Dia do vencimento' : 'Dia do acerto'}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                placeholder="10"
              />
            </div>
          </div>

          {/* HORÁRIOS NA GRADE (AO CADASTRAR NOVO ALUNO PRESENCIAL) */}
          {!studentToEdit && modality === 'presencial' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                  Agendar horários na grade agora?
                </span>
                <input
                  type="checkbox"
                  checked={includeSchedule}
                  onChange={(e) => setIncludeSchedule(e.target.checked)}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>

              {includeSchedule && (
                <div className="space-y-3 pt-1 border-t border-zinc-800/80">
                  {/* Presets rápidos */}
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span>Atalhos:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(['Segunda', 'Quarta', 'Sexta'])}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
                    >
                      Seg / Qua / Sex
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(['Terça', 'Quinta'])}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
                    >
                      Ter / Qui
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(ALL_DAYS)}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
                    >
                      Seg a Sáb
                    </button>
                  </div>

                  {/* Seleção dos Dias */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {ALL_DAYS.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`py-1.5 px-1 rounded-lg text-center text-xs font-medium transition ${
                            isSelected
                              ? 'bg-white text-zinc-950 font-semibold'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Horário Padrão */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Horário de início</label>
                      <input
                        type="time"
                        required={includeSchedule && selectedDays.length > 0}
                        value={defaultStartTime}
                        onChange={(e) => setDefaultStartTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Horário de término</label>
                      <input
                        type="time"
                        required={includeSchedule && selectedDays.length > 0}
                        value={defaultEndTime}
                        onChange={(e) => setDefaultEndTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ Serão criadas {selectedDays.length} aulas semanais às {defaultStartTime} na grade.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Objetivo ou anotações (Opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 resize-none"
              placeholder="Ex: Treina 3x por semana, foco em condicionamento..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs bg-white hover:bg-zinc-200 text-zinc-950 transition active:scale-95"
            >
              {studentToEdit ? 'Salvar alterações' : 'Cadastrar aluno e salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
