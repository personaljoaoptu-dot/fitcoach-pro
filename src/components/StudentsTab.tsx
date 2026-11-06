import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, MessageCircle, Calendar, History, RefreshCw, Clock } from 'lucide-react';
import { Student, PersonalProfile } from '../types';
import { cleanPhoneNumber, formatPhoneDisplay } from '../utils/whatsapp';

interface StudentsTabProps {
  students: Student[];
  profile: PersonalProfile;
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onOpenStudentDetail: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  profile,
  onOpenAddStudent,
  onEditStudent,
  onOpenStudentDetail,
  onDeleteStudent,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState<'all' | 'presencial' | 'consultoria' | 'avulso'>('all');
  const isPro = profile.plan === 'pro';

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesFilter = true;
    if (modalityFilter === 'presencial') matchesFilter = s.modality === 'presencial' && s.billingType === 'mensal';
    if (modalityFilter === 'consultoria') matchesFilter = s.modality === 'consultoria';
    if (modalityFilter === 'avulso') matchesFilter = s.billingType === 'avulso';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou anotação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <button
          onClick={onOpenAddStudent}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Aluno</span>
          {!isPro && (
            <span className="text-[10px] text-zinc-500 font-normal ml-0.5">
              ({students.length}/5)
            </span>
          )}
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setModalityFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
            modalityFilter === 'all'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Todos ({students.length})
        </button>
        <button
          onClick={() => setModalityFilter('presencial')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
            modalityFilter === 'presencial'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Mensalidade ({students.filter((s) => s.billingType === 'mensal' && s.modality === 'presencial').length})
        </button>
        <button
          onClick={() => setModalityFilter('avulso')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
            modalityFilter === 'avulso'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Por Aula Feita ({students.filter((s) => s.billingType === 'avulso').length})
        </button>
        <button
          onClick={() => setModalityFilter('consultoria')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
            modalityFilter === 'consultoria'
              ? 'bg-zinc-100 text-zinc-900 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Consultoria Online ({students.filter((s) => s.modality === 'consultoria').length})
        </button>
      </div>

      {/* Students List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
        {filteredStudents.map((student) => {
          const rawPhone = cleanPhoneNumber(student.phone);
          const directWa = `https://wa.me/${rawPhone}`;
          const formattedPhone = formatPhoneDisplay(student.phone);
          const isAvulso = student.billingType === 'avulso';

          return (
            <div
              key={student.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                student.status === 'inactive' ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <button
                  onClick={() => onOpenStudentDetail(student)}
                  className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center shrink-0 border border-zinc-700/60 transition"
                  title="Ver evolução e detalhes"
                >
                  {student.name.charAt(0).toUpperCase()}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onOpenStudentDetail(student)}
                      className="text-sm font-semibold text-white hover:underline text-left"
                    >
                      {student.name}
                    </button>

                    {isAvulso ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Por Aula Feita
                      </span>
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        student.modality === 'consultoria'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {student.modality === 'consultoria' ? 'Online' : 'Presencial'}
                      </span>
                    )}

                    {student.pendingMakeups > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5" /> {student.pendingMakeups} reposição
                      </span>
                    )}

                    <button
                      onClick={() => onToggleStatus(student.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition ${
                        student.status === 'active'
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mt-0.5">
                    <a
                      href={directWa}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-emerald-400 inline-flex items-center gap-1 transition"
                    >
                      <MessageCircle className="w-3 h-3 text-[#25D366]" /> {formattedPhone}
                    </a>
                    <span>•</span>
                    
                    {isAvulso ? (
                      <span className="font-medium text-amber-300">
                        {student.pricePerClass?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/aula
                        <span className="text-zinc-400 font-normal ml-1">
                          ({student.classesDoneMonth || 0} aulas feitas = {((student.classesDoneMonth || 0) * (student.pricePerClass || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                        </span>
                      </span>
                    ) : (
                      <span className="font-medium text-zinc-200">
                        {student.monthlyFee.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                        /mês
                      </span>
                    )}

                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <Calendar className="w-3 h-3" /> {isAvulso ? 'Fechamento dia' : 'Vence dia'} {student.dueDay}
                    </span>
                  </div>

                  {student.notes && (
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                      {student.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                <button
                  onClick={() => onOpenStudentDetail(student)}
                  className="px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition inline-flex items-center gap-1"
                  title="Ver evolução e detalhes"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Evolução</span>
                </button>
                <button
                  onClick={() => onEditStudent(student)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                  title="Editar dados"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteStudent(student.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
                  title="Excluir aluno"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Nenhum aluno encontrado neste filtro.
          </div>
        )}
      </div>
    </div>
  );
};
