import React, { useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Student, Payment, ScheduleItem, PersonalProfile, Expense } from '../types';
import { generateBillingWhatsAppUrl } from '../utils/whatsapp';

interface DashboardTabProps {
  students: Student[];
  payments: Payment[];
  expenses: Expense[];
  schedule: ScheduleItem[];
  profile: PersonalProfile;
  onOpenNewStudent: () => void;
  onOpenUpgrade: () => void;
  onNavigateTab: (tab: 'alunos' | 'financeiro' | 'agenda') => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  payments,
  expenses,
  schedule,
  profile,
  onOpenNewStudent,
  onOpenUpgrade,
  onNavigateTab,
}) => {
  const isPro = profile.plan === 'pro';
  const activeStudents = students.filter((s) => s.status === 'active');
  const freeLimit = 5;

  const [selectedMonth, setSelectedMonth] = useState(11); // 1-12
  const [selectedYear, setSelectedYear] = useState(2026);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Filter payments & expenses for the selected month/year
  const monthPayments = payments.filter(
    (p) => p.month === selectedMonth && p.year === selectedYear
  );

  const monthExpenses = expenses.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  // Revenue calculations
  const presencialStudents = activeStudents.filter((s) => s.modality === 'presencial');
  const onlineStudents = activeStudents.filter((s) => s.modality === 'consultoria');

  const presencialRevenue = presencialStudents.reduce((acc, s) => acc + s.monthlyFee, 0);
  const onlineRevenue = onlineStudents.reduce((acc, s) => acc + s.monthlyFee, 0);
  const totalExpectedRevenue = presencialRevenue + onlineRevenue;

  const totalReceivedRevenue = monthPayments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalOverdueRevenue = monthPayments
    .filter((p) => p.status === 'overdue')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPendingRevenue = monthPayments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalToReceive = totalOverdueRevenue + totalPendingRevenue;

  // Expense calculations
  const totalExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const paidExpenses = monthExpenses
    .filter((e) => e.paid)
    .reduce((acc, e) => acc + e.amount, 0);
  const pendingExpenses = monthExpenses
    .filter((e) => !e.paid)
    .reduce((acc, e) => acc + e.amount, 0);

  // Cash flow & Balances
  const currentNetProfit = totalReceivedRevenue - paidExpenses;
  const projectedNetProfit = totalExpectedRevenue - totalExpenses;
  const pendingBalance = totalToReceive - pendingExpenses;

  const overduePayments = monthPayments.filter((p) => p.status === 'overdue');

  return (
    <div className="space-y-5">
      {/* Discreet Header Row with Month Pill */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white m-0">Visão Geral</h2>
          <p className="text-[11px] text-zinc-400">Resumo financeiro e operacional</p>
        </div>

        {/* Compact, discreet Month Selector Pill */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-1 text-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Mês anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-semibold text-zinc-200 px-1 text-[11px] min-w-[90px] text-center">
            {MONTH_NAMES[selectedMonth - 1].slice(0, 3)} / {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Próximo mês"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Free tier alert */}
      {!isPro && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-zinc-200">
              Você está usando a versão gratuita com {activeStudents.length} de {freeLimit} alunos cadastrados.
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Assine o FitCoach Pro para ter alunos ilimitados e eliminar anúncios.
            </p>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 transition whitespace-nowrap"
          >
            Ver planos (R$ 19,90)
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Alunos */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400 block mb-1">Alunos ativos</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">{activeStudents.length}</span>
            {!isPro && (
              <span className="text-xs text-zinc-500">de {freeLimit}</span>
            )}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {presencialStudents.length} presenciais • {onlineStudents.length} consultorias
          </span>
        </div>

        {/* Card 2: Saldo Líquido Atual */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400 block mb-1">Lucro Real no Bolso</span>
          <div className={`text-2xl font-bold tracking-tight ${currentNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currentNetProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Recebido ({totalReceivedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) - Despesas
          </span>
        </div>

        {/* Card 3: Previsão de Lucro Final */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400 block mb-1">Previsão de Lucro Final</span>
          <div className="text-2xl font-bold text-white tracking-tight">
            {projectedNetProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Faturamento previsto - Total despesas
          </span>
        </div>

        {/* Card 4: Despesas do Mês */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400 block mb-1">Despesas ({MONTH_NAMES[selectedMonth - 1].slice(0, 3)})</span>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {paidExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} pagas • {pendingExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a pagar
          </span>
        </div>
      </div>

      {/* PAINEL DE BALANÇO: A RECEBER vs A PAGAR */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white m-0">
              Balanço Financeiro de {MONTH_NAMES[selectedMonth - 1]}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparativo entre entradas e saídas programadas para este mês
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('financeiro')}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
          >
            Abrir financeiro <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Entradas */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 text-xs">
            <span className="text-zinc-400 text-[11px] block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Entradas (Alunos)</span>
            </span>
            <div className="mt-1.5 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Já recebido:</span>
                <span className="font-semibold text-emerald-400">
                  {totalReceivedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">A receber:</span>
                <span className="font-semibold text-zinc-200">
                  {totalToReceive.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Saídas */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 text-xs">
            <span className="text-zinc-400 text-[11px] block flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Saídas (Despesas)</span>
            </span>
            <div className="mt-1.5 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Já pagas:</span>
                <span className="font-semibold text-rose-400">
                  {paidExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">A pagar:</span>
                <span className="font-semibold text-zinc-200">
                  {pendingExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Saldo Líquido Projetado */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 text-xs flex flex-col justify-between">
            <span className="text-zinc-400 text-[11px] block flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saldo a Entrar Líquido</span>
            </span>
            <div>
              <span className="text-lg font-bold text-white block">
                {pendingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-[10px] text-zinc-500">
                (A receber dos alunos - Despesas a pagar)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divisão por Modalidade: Presencial vs Consultoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium block">🏋️ Alunos Presenciais</span>
            <span className="text-lg font-bold text-white tracking-tight mt-0.5 block">
              {presencialRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-[11px] text-zinc-500">{presencialStudents.length} alunos na academia</span>
          </div>
          <button
            onClick={() => onNavigateTab('agenda')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
          >
            Ver grade
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium block">📱 Consultoria Online</span>
            <span className="text-lg font-bold text-white tracking-tight mt-0.5 block">
              {onlineRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="text-[11px] text-zinc-500">{onlineStudents.length} alunos remotos</span>
          </div>
          <button
            onClick={() => onNavigateTab('alunos')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
          >
            Ver fichas
          </button>
        </div>
      </div>

      {/* Alunos em atraso (Quick Cobrança) */}
      {overduePayments.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white m-0">
                Mensalidades em atraso ({MONTH_NAMES[selectedMonth - 1]})
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Envie o lembrete de pagamento no WhatsApp do aluno em um clique
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('financeiro')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
            >
              Ver financeiro <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-800">
            {overduePayments.map((payment) => {
              const student = students.find((s) => s.id === payment.studentId);
              if (!student) return null;

              const whatsappUrl = generateBillingWhatsAppUrl(student, payment, profile);

              return (
                <div
                  key={payment.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-200">{student.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {student.modality === 'consultoria' ? 'Online' : 'Presencial'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Venceu dia {student.dueDay} •{' '}
                      <span className="font-semibold text-rose-400">
                        {payment.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </p>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-zinc-950 font-semibold text-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-zinc-950 stroke-none" />
                    <span>Cobrar no WhatsApp</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grade de Treinos de Hoje */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white m-0">Treinos presenciais de hoje (Segunda)</h2>
          <button
            onClick={() => onNavigateTab('agenda')}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
          >
            Ver grade completa <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {schedule
            .filter((item) => item.dayOfWeek === 'Segunda')
            .map((item) => {
              const student = students.find((s) => s.id === item.studentId);
              return (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium text-zinc-300 bg-zinc-800 px-2 py-1 rounded">
                      {item.startTime} - {item.endTime}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {student ? student.name : 'Aluno'}
                      </p>
                      {student?.notes && (
                        <p className="text-xs text-zinc-500">{student.notes}</p>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.attendanceStatus === 'present'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.attendanceStatus === 'present' ? 'Presente ✓' : 'Agendado'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Botão de Ação Primária */}
      <div className="flex justify-end">
        <button
          onClick={onOpenNewStudent}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 font-semibold text-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Aluno</span>
        </button>
      </div>
    </div>
  );
};
