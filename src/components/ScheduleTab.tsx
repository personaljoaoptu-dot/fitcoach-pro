import React, { useState } from 'react';
import { Plus, Trash2, MessageCircle, Check, XCircle } from 'lucide-react';
import { Student, ScheduleItem, ScheduleStatus } from '../types';
import { generateScheduleWhatsAppUrl } from '../utils/whatsapp';

interface ScheduleTabProps {
  students: Student[];
  schedule: ScheduleItem[];
  onOpenAddSchedule: () => void;
  onDeleteScheduleItem: (id: string) => void;
  onUpdateAttendance: (scheduleId: string, status: ScheduleStatus, studentId: string) => void;
}

const DAYS: ScheduleItem['dayOfWeek'][] = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  students,
  schedule,
  onOpenAddSchedule,
  onDeleteScheduleItem,
  onUpdateAttendance,
}) => {
  const [selectedDay, setSelectedDay] = useState<ScheduleItem['dayOfWeek']>('Segunda');

  const daySchedule = schedule
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-1.5">
          {DAYS.map((day) => {
            const count = schedule.filter((s) => s.dayOfWeek === day).length;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex flex-col items-center transition min-w-[65px] ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                  {count} aula{count === 1 ? '' : 's'}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenAddSchedule}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Aula</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
        {daySchedule.map((item) => {
          const student = students.find((s) => s.id === item.studentId);
          if (!student) return null;

          const whatsappUrl = generateScheduleWhatsAppUrl(
            student,
            selectedDay,
            item.startTime
          );

          const isPresent = item.attendanceStatus === 'present';
          const isAbsent = item.attendanceStatus === 'absent';

          return (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-medium text-zinc-200 bg-zinc-800 px-2 py-1 rounded">
                  {item.startTime} - {item.endTime}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {student.name}
                    </span>
                    {isPresent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Presente ✓
                      </span>
                    )}
                    {isAbsent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Faltou (Reposição +1)
                      </span>
                    )}
                  </div>
                  {student.notes && (
                    <span className="text-zinc-400 text-xs mt-0.5 block">
                      {student.notes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                {/* Attendance buttons */}
                <button
                  onClick={() => onUpdateAttendance(item.id, isPresent ? 'scheduled' : 'present', student.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition inline-flex items-center gap-1 ${
                    isPresent
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                  title="Marcar presença"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isPresent ? 'Presença OK' : 'Check-in'}</span>
                </button>

                <button
                  onClick={() => onUpdateAttendance(item.id, isAbsent ? 'scheduled' : 'absent', student.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition inline-flex items-center gap-1 ${
                    isAbsent
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400'
                  }`}
                  title="Marcar falta com direito a reposição"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isAbsent ? 'Falta anotada' : 'Faltou'}</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition"
                  title="Confirmar presença no WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Avisar</span>
                </a>

                <button
                  onClick={() => onDeleteScheduleItem(item.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition"
                  title="Remover horário da grade"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {daySchedule.length === 0 && (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Nenhum treino presencial agendado para {selectedDay}.
          </div>
        )}
      </div>
    </div>
  );
};
