import React, { useState } from 'react';
import {
  Check,
  RotateCcw,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Receipt,
  Tag,
} from 'lucide-react';
import { Student, Payment, PaymentStatus, PersonalProfile, Expense, ExpenseCategory } from '../types';
import { generateBillingWhatsAppUrl, generateReceiptWhatsAppUrl } from '../utils/whatsapp';

interface FinancialTabProps {
  students: Student[];
  payments: Payment[];
  expenses: Expense[];
  profile: PersonalProfile;
  onUpdatePaymentStatus: (paymentId: string, newStatus: PaymentStatus) => void;
  onGenerateMonthPayments: (month: number, year: number) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  academia: '🏋️ Taxa Academia',
  transporte: '🚗 Transporte / Gasolina',
  cref: '📋 Anuidade CREF',
  equipamentos: '🥊 Equipamentos',
  cursos: '🎓 Cursos / Especialização',
  outros: '📦 Outros Gastos',
};

export const FinancialTab: React.FC<FinancialTabProps> = ({
  students,
  payments,
  expenses,
  profile,
  onUpdatePaymentStatus,
  onGenerateMonthPayments,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [activeSection, setActiveSection] = useState<'receitas' | 'despesas'>('receitas');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2026);

  // New Expense form state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('academia');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);

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

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount) return;

    onAddExpense({
      description: expenseDesc.trim(),
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
      month: selectedMonth,
      year: selectedYear,
      paid: true,
    });

    setIsAddingExpense(false);
    setExpenseDesc('');
    setExpenseAmount('');
  };

  // Month filters
  const monthPayments = payments.filter(
    (p) => p.month === selectedMonth && p.year === selectedYear
  );

  const monthExpenses = expenses.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  const totalPaidRevenue = monthPayments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPendingRevenue = monthPayments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalOverdueRevenue = monthPayments
    .filter((p) => p.status === 'overdue')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalExpenses = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalPaidRevenue - totalExpenses;

  const filteredPayments = monthPayments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-4">
      {/* Month Navigator & Summary Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        {/* Month Selector Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-white tracking-tight min-w-[130px] text-center">
              {MONTH_NAMES[selectedMonth - 1]} / {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Lucro Líquido Real</span>
            <span className={`text-base sm:text-lg font-bold tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        {/* 3 Metric Badges: Recebido vs Despesas vs Lucro */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <span className="text-zinc-400 text-[11px] block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Recebido (Pix)</span>
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 block">
              {totalPaidRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <span className="text-zinc-400 text-[11px] block flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-400" />
              <span>Despesas</span>
            </span>
            <span className="text-sm sm:text-base font-bold text-rose-400 mt-0.5 block">
              {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <span className="text-zinc-400 text-[11px] block flex items-center gap-1">
              <Wallet className="w-3 h-3 text-zinc-300" />
              <span>A Receber</span>
            </span>
            <span className="text-sm sm:text-base font-bold text-zinc-200 mt-0.5 block">
              {(totalPendingRevenue + totalOverdueRevenue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Switch: Receitas dos Alunos vs Despesas do Personal */}
      <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
        <button
          onClick={() => setActiveSection('receitas')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSection === 'receitas'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Mensalidades dos Alunos ({monthPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('despesas')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSection === 'despesas'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          <span>Despesas do Personal ({monthExpenses.length})</span>
        </button>
      </div>

      {/* SEÇÃO 1: MENSALIDADES DOS ALUNOS */}
      {activeSection === 'receitas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === 'all'
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                Todos ({monthPayments.length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === 'paid'
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                Pagos ({monthPayments.filter((p) => p.status === 'paid').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === 'pending'
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                A vencer ({monthPayments.filter((p) => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === 'overdue'
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                Atrasados ({monthPayments.filter((p) => p.status === 'overdue').length})
              </button>
            </div>

            {monthPayments.length === 0 && (
              <button
                onClick={() => onGenerateMonthPayments(selectedMonth, selectedYear)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Gerar mensalidades deste mês</span>
              </button>
            )}
          </div>

          {/* List of Payments */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
            {filteredPayments.map((payment) => {
              const student = students.find((s) => s.id === payment.studentId);
              if (!student) return null;

              const isAvulso = student.billingType === 'avulso';
              const billingWhatsAppUrl = generateBillingWhatsAppUrl(student, payment, profile);
              const receiptWhatsAppUrl = generateReceiptWhatsAppUrl(student, payment, profile);

              return (
                <div
                  key={payment.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {student.name}
                        </span>

                        {isAvulso ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {payment.classesCount ?? student.classesDoneMonth ?? 0} aulas feitas (Avulso)
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {student.modality === 'consultoria' ? 'Consultoria' : 'Mensalidade'}
                          </span>
                        )}

                        {payment.status === 'paid' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Pago ✓
                          </span>
                        )}
                        {payment.status === 'overdue' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Atrasado
                          </span>
                        )}
                        {payment.status === 'pending' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                            A vencer
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-400 mt-0.5">
                        {isAvulso ? 'Fechamento' : 'Vencimento'}: dia {student.dueDay} •{' '}
                        <span className="font-semibold text-zinc-200">
                          {payment.amount.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                        {payment.paidAt && (
                          <span className="text-zinc-500 ml-1.5">
                            (Pago em {new Date(payment.paidAt).toLocaleDateString('pt-BR')})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    {payment.status !== 'paid' ? (
                      <>
                        <button
                          onClick={() => onUpdatePaymentStatus(payment.id, 'paid')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirmar recebimento</span>
                        </button>

                        <a
                          href={billingWhatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-zinc-950 font-semibold transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-zinc-950 stroke-none" />
                          <span>Cobrar no WhatsApp</span>
                        </a>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <a
                          href={receiptWhatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition"
                          title="Enviar recibo formatado no WhatsApp"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Enviar Recibo</span>
                        </a>

                        <button
                          onClick={() => onUpdatePaymentStatus(payment.id, 'pending')}
                          title="Desmarcar recebimento"
                          className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Desfazer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {monthPayments.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Nenhuma mensalidade lançada para {MONTH_NAMES[selectedMonth - 1]} de {selectedYear}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEÇÃO 2: DESPESAS DO PERSONAL */}
      {activeSection === 'despesas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              Despesas lançadas em {MONTH_NAMES[selectedMonth - 1]}:
            </span>

            {!isAddingExpense && (
              <button
                onClick={() => setIsAddingExpense(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Despesa</span>
              </button>
            )}
          </div>

          {/* Form para Adicionar Despesa */}
          {isAddingExpense && (
            <form onSubmit={handleSaveExpense} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
              <span className="font-semibold text-white block">Cadastrar Gasto / Despesa</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Descrição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Taxa de Personal Academia, Gasolina..."
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Categoria</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-zinc-700"
                  >
                    <option value="academia">🏋️ Taxa Academia</option>
                    <option value="transporte">🚗 Transporte / Gasolina</option>
                    <option value="cref">📋 Anuidade CREF</option>
                    <option value="equipamentos">🥊 Equipamentos</option>
                    <option value="cursos">🎓 Cursos / Educação</option>
                    <option value="outros">📦 Outros Gastos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Ex: 150.00"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          )}

          {/* Lista de Despesas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
            {monthExpenses.map((exp) => (
              <div key={exp.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-rose-400 shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{exp.description}</span>
                    <div className="flex items-center gap-2 text-zinc-400 text-[11px] mt-0.5">
                      <span>{CATEGORY_LABELS[exp.category]}</span>
                      <span>•</span>
                      <span>{new Date(exp.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-400 text-sm">
                    -{exp.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 transition"
                    title="Excluir despesa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {monthExpenses.length === 0 && !isAddingExpense && (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Nenhuma despesa lançada para {MONTH_NAMES[selectedMonth - 1]}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
