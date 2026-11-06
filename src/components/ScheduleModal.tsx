import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Student, ScheduleItem } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveSchedule: (item: Omit<ScheduleItem, 'id'>) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveSchedule,
}) => {
  const presencialStudents = students.filter((s) => s.modality === 'presencial');
  const [studentId, setStudentId] = useState(presencialStudents[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<ScheduleItem['dayOfWeek']>('Segunda');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    onSaveSchedule({
      studentId,
      dayOfWeek,
      startTime,
      endTime,
      attendanceStatus: 'scheduled',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold text-white mb-1">Agendar horário</h2>
        <p className="text-xs text-zinc-400 mb-5">
          Adicione um novo horário fixo para treinos presenciais
        </p>

        {presencialStudents.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center text-xs text-zinc-400">
            Você não possui alunos presenciais cadastrados. Cadastre um aluno com modalidade Presencial para agendar horários na grade.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Aluno Presencial</label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              >
                {presencialStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Dia da semana</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as ScheduleItem['dayOfWeek'])}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              >
                <option value="Segunda">Segunda-feira</option>
                <option value="Terça">Terça-feira</option>
                <option value="Quarta">Quarta-feira</option>
                <option value="Quinta">Quinta-feira</option>
                <option value="Sexta">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Início</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Término</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs bg-white hover:bg-zinc-200 text-zinc-950 transition active:scale-95"
              >
                Salvar na grade
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
