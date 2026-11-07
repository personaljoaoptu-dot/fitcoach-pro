import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
} from 'lucide-react';
import {
  PersonalProfile,
  Student,
  Payment,
  ScheduleItem,
  Expense,
  PaymentStatus,
  ScheduleStatus,
  PlanType,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadStudents,
  saveStudents,
  loadPayments,
  savePayments,
  loadExpenses,
  saveExpenses,
  loadSchedule,
  saveSchedule,
} from './utils/storage';

import { Header } from './components/Header';
import { AdBanner } from './components/AdBanner';
import { DashboardTab } from './components/DashboardTab';
import { StudentsTab } from './components/StudentsTab';
import { FinancialTab } from './components/FinancialTab';
import { ScheduleTab } from './components/ScheduleTab';
import { UpgradeModal } from './components/UpgradeModal';
import { ProfileModal } from './components/ProfileModal';
import { StudentModal } from './components/StudentModal';
import { ScheduleModal } from './components/ScheduleModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { AuthScreen } from './components/AuthScreen';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import {
  getSupabaseClient,
  fetchUserDataFromSupabase,
  uploadFullStateToSupabase,
} from './lib/supabase';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<PersonalProfile>(loadProfile);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [payments, setPayments] = useState<Payment[]>(loadPayments);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(loadSchedule);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'alunos' | 'financeiro' | 'agenda'>('dashboard');

  // Auth & Cloud State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('fitcoach_guest_mode') === 'true';
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Modals
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<Student | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadCloudData = async (userId: string) => {
    try {
      const cloudData = await fetchUserDataFromSupabase(userId);
      if (cloudData) {
        if (cloudData.students && cloudData.students.length > 0) {
          setStudents(cloudData.students);
          setProfile(cloudData.profile);
          setPayments(cloudData.payments);
          setExpenses(cloudData.expenses);
          setSchedule(cloudData.schedule);
          showToast('Dados sincronizados do Supabase');
        } else {
          // New cloud account: start completely clean
          if (cloudData.profile) {
            setProfile(cloudData.profile);
          }
          setStudents([]);
          setPayments([]);
          setExpenses([]);
          setSchedule([]);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados da nuvem:', e);
    }
  };

  // Check auth session
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        loadCloudData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        loadCloudData(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    setCurrentUser(null);
    setIsGuestMode(true);
    localStorage.setItem('fitcoach_guest_mode', 'true');
    showToast('Você saiu da sua conta');
  };

  const handleManualSyncToSupabase = async () => {
    if (!currentUser) return;
    showToast('Sincronizando com a nuvem...');
    const success = await uploadFullStateToSupabase(currentUser.id, {
      profile,
      students,
      payments,
      expenses,
      schedule,
    });
    if (success) {
      showToast('Dados salvos no Supabase com sucesso!');
    } else {
      showToast('Erro ao sincronizar com Supabase.');
    }
  };

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveSchedule(schedule);
  }, [schedule]);

  const handleTogglePlanSimulation = () => {
    const newPlan: PlanType = profile.plan === 'free' ? 'pro' : 'free';
    const updated: PersonalProfile = { ...profile, plan: newPlan };
    setProfile(updated);
    showToast(
      newPlan === 'pro'
        ? 'Modo Pro ativado: sem anúncios e limite liberado'
        : 'Modo Free ativado: com anúncios e limite de 5 alunos'
    );
  };

  const handleConfirmUpgrade = () => {
    setProfile((prev) => ({ ...prev, plan: 'pro' }));
    setIsUpgradeModalOpen(false);
    showToast('Plano Pro ativado com sucesso.');
  };

  const handleOpenNewStudent = () => {
    if (profile.plan === 'free' && students.length >= 5) {
      setUpgradeReason(
        'Você atingiu o limite gratuito de 5 alunos. Assine o plano Pro para cadastrar sem restrições.'
      );
      setIsUpgradeModalOpen(true);
      return;
    }
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (
    data: Omit<Student, 'id' | 'createdAt'> & {
      id?: string;
      initialSchedules?: Array<{
        dayOfWeek: ScheduleItem['dayOfWeek'];
        startTime: string;
        endTime: string;
      }>;
    }
  ) => {
    if (data.id) {
      setStudents((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
      );
      setPayments((prev) =>
        prev.map((p) =>
          p.studentId === data.id && p.status === 'pending'
            ? { ...p, amount: data.monthlyFee }
            : p
        )
      );
      showToast('Dados do aluno atualizados');
    } else {
      const newId = String(Date.now());
      const newStudent: Student = {
        ...data,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      setStudents((prev) => [...prev, newStudent]);

      const newPayment: Payment = {
        id: `p_${Date.now()}`,
        studentId: newId,
        month: 11,
        year: 2026,
        amount: newStudent.monthlyFee,
        status: 'pending',
      };
      setPayments((prev) => [...prev, newPayment]);

      if (data.initialSchedules && data.initialSchedules.length > 0) {
        const newScheduleItems: ScheduleItem[] = data.initialSchedules.map((slot, index) => ({
          id: `s_${Date.now()}_${index}`,
          studentId: newId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          attendanceStatus: 'scheduled',
        }));
        setSchedule((prev) => [...prev, ...newScheduleItems]);
        showToast(`Aluno cadastrado e ${newScheduleItems.length} horários criados na grade!`);
      } else {
        showToast('Aluno cadastrado com sucesso');
      }
    }
  };

  const handleUpdateStudentDetails = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (updated.billingType === 'avulso') {
      const totalAmount = (updated.classesDoneMonth || 0) * (updated.pricePerClass || 0);
      setPayments((prev) =>
        prev.map((p) =>
          p.studentId === updated.id && p.status !== 'paid'
            ? { ...p, amount: totalAmount, classesCount: updated.classesDoneMonth }
            : p
        )
      );
    }
    setSelectedDetailStudent(updated);
    showToast('Registro salvo');
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Deseja excluir este aluno?')) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setPayments((prev) => prev.filter((p) => p.studentId !== id));
      setSchedule((prev) => prev.filter((s) => s.studentId !== id));
      showToast('Aluno removido');
    }
  };

  const handleToggleStudentStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  };

  const handleUpdatePaymentStatus = (paymentId: string, newStatus: PaymentStatus) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: newStatus,
              paidAt: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
            }
          : p
      )
    );
    showToast(newStatus === 'paid' ? 'Pagamento confirmado como recebido' : 'Status atualizado');
  };

  const handleGenerateMonthPayments = (month: number, year: number) => {
    const activeStudents = students.filter((s) => s.status === 'active');
    const existing = payments.filter((p) => p.month === month && p.year === year);
    const existingIds = new Set(existing.map((p) => p.studentId));

    const newPayments: Payment[] = [];
    activeStudents.forEach((s) => {
      if (!existingIds.has(s.id)) {
        newPayments.push({
          id: `p_${Date.now()}_${s.id}`,
          studentId: s.id,
          month,
          year,
          amount: s.monthlyFee,
          status: 'pending',
          classesCount: s.billingType === 'avulso' ? s.classesDoneMonth : undefined,
        });
      }
    });

    if (newPayments.length > 0) {
      setPayments((prev) => [...prev, ...newPayments]);
      showToast(`${newPayments.length} mensalidades geradas para este mês!`);
    } else {
      showToast('Todas as mensalidades deste mês já estavam lançadas.');
    }
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast('Despesa registrada');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Despesa excluída');
  };

  const handleRestoreBackup = (jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.profile) setProfile(parsed.profile);
      if (Array.isArray(parsed.students)) setStudents(parsed.students);
      if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
      if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (Array.isArray(parsed.schedule)) setSchedule(parsed.schedule);
      showToast('Dados restaurados com sucesso a partir do backup!');
    } catch {
      alert('Arquivo de backup inválido ou corrompido.');
    }
  };

  const handleSaveSchedule = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `s_${Date.now()}`,
    };
    setSchedule((prev) => [...prev, newItem]);
    showToast('Horário adicionado à grade');
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
    showToast('Horário removido da grade');
  };

  const handleUpdateAttendance = (
    scheduleId: string,
    status: ScheduleStatus,
    studentId: string
  ) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, attendanceStatus: status } : s))
    );

    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    if (status === 'present') {
      const todayIso = new Date().toISOString().split('T')[0];

      if (targetStudent.billingType === 'avulso') {
        const currentDates = targetStudent.attendedDates || [];
        const updatedDates = currentDates.includes(todayIso) ? currentDates : [...currentDates, todayIso];
        const updatedCount = updatedDates.length;
        const newTotalFee = updatedCount * (targetStudent.pricePerClass || 0);

        setStudents((prev) =>
          prev.map((st) =>
            st.id === studentId
              ? {
                  ...st,
                  attendedDates: updatedDates,
                  classesDoneMonth: updatedCount,
                  monthlyFee: newTotalFee,
                }
              : st
          )
        );

        setPayments((prev) =>
          prev.map((p) =>
            p.studentId === studentId && p.status !== 'paid'
              ? { ...p, amount: newTotalFee, classesCount: updatedCount }
              : p
          )
        );

        showToast(`Presença confirmada! (${updatedCount}ª aula do mês adicionada à conta)`);
      } else {
        const currentDates = targetStudent.attendedDates || [];
        const updatedDates = currentDates.includes(todayIso) ? currentDates : [...currentDates, todayIso];
        setStudents((prev) =>
          prev.map((st) =>
            st.id === studentId ? { ...st, attendedDates: updatedDates } : st
          )
        );
        showToast('Presença confirmada ✓');
      }
    } else if (status === 'absent') {
      if (targetStudent.billingType === 'mensal') {
        setStudents((prev) =>
          prev.map((st) =>
            st.id === studentId
              ? { ...st, pendingMakeups: st.pendingMakeups + 1 }
              : st
          )
        );
        showToast('Falta anotada. +1 reposição creditada para o aluno');
      } else {
        showToast('Falta anotada.');
      }
    }
  };

  if (!currentUser && !isGuestMode) {
    return (
      <>
        <AuthScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsGuestMode(false);
            localStorage.removeItem('fitcoach_guest_mode');
            loadCloudData(user.id);
          }}
          onContinueGuest={() => {
            setIsGuestMode(true);
            localStorage.setItem('fitcoach_guest_mode', 'true');
          }}
          onOpenConfig={() => setIsConfigModalOpen(true)}
        />
        <SupabaseConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onConnected={() => {
            showToast('Supabase conectado com sucesso!');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-24 sm:pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs px-3.5 py-2.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <Header
        profile={profile}
        userEmail={currentUser?.email || null}
        isCloudConnected={Boolean(currentUser)}
        onOpenUpgrade={() => {
          setUpgradeReason(undefined);
          setIsUpgradeModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onTogglePlanSimulation={handleTogglePlanSimulation}
        onSignOut={handleSignOut}
        onOpenAuth={() => {
          setIsGuestMode(false);
          localStorage.removeItem('fitcoach_guest_mode');
        }}
        onOpenDbConfig={() => setIsConfigModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
        {/* Desktop Segmented Navigation */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visão geral</span>
          </button>

          <button
            onClick={() => setActiveTab('alunos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeTab === 'alunos'
                ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Alunos ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financeiro')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeTab === 'financeiro'
                ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financeiro</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
              activeTab === 'agenda'
                ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Grade semanal</span>
          </button>
        </div>

        {/* Tab views */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            students={students}
            payments={payments}
            expenses={expenses}
            schedule={schedule}
            profile={profile}
            onOpenNewStudent={handleOpenNewStudent}
            onOpenUpgrade={() => {
              setUpgradeReason('Cadastre alunos ilimitados com o plano Pro');
              setIsUpgradeModalOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'alunos' && (
          <StudentsTab
            students={students}
            profile={profile}
            onOpenAddStudent={handleOpenNewStudent}
            onEditStudent={handleEditStudent}
            onOpenStudentDetail={(st) => setSelectedDetailStudent(st)}
            onDeleteStudent={handleDeleteStudent}
            onToggleStatus={handleToggleStudentStatus}
          />
        )}

        {activeTab === 'financeiro' && (
          <FinancialTab
            students={students}
            payments={payments}
            expenses={expenses}
            profile={profile}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onGenerateMonthPayments={handleGenerateMonthPayments}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'agenda' && (
          <ScheduleTab
            students={students}
            schedule={schedule}
            onOpenAddSchedule={() => setIsScheduleModalOpen(true)}
            onDeleteScheduleItem={handleDeleteScheduleItem}
            onUpdateAttendance={handleUpdateAttendance}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${
            activeTab === 'dashboard' ? 'text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => setActiveTab('alunos')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${
            activeTab === 'alunos' ? 'text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Alunos</span>
        </button>

        <button
          onClick={() => setActiveTab('financeiro')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${
            activeTab === 'financeiro' ? 'text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span className="text-[10px]">Financeiro</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${
            activeTab === 'agenda' ? 'text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px]">Grade</span>
        </button>
      </nav>

      {/* Modals */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onConfirmUpgrade={handleConfirmUpgrade}
        reason={upgradeReason}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => {
          setProfile(updated);
          showToast('Dados atualizados');
        }}
        onRestoreBackup={handleRestoreBackup}
        onOpenSupabaseConfig={() => setIsConfigModalOpen(true)}
        onSyncToSupabase={handleManualSyncToSupabase}
        userEmail={currentUser?.email || null}
      />

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConnected={() => {
          showToast('Supabase conectado com sucesso!');
        }}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSaveStudent={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      <StudentDetailModal
        isOpen={Boolean(selectedDetailStudent)}
        onClose={() => setSelectedDetailStudent(null)}
        student={selectedDetailStudent}
        onUpdateStudent={handleUpdateStudentDetails}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        students={students.filter((s) => s.status === 'active')}
        onSaveSchedule={handleSaveSchedule}
      />
    </div>
  );
};

export default App;
