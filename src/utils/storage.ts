import { PersonalProfile, Student, Payment, ScheduleItem, Expense } from '../types';

export const STORAGE_KEYS = {
  PROFILE: 'fitcoach_profile',
  STUDENTS: 'fitcoach_students',
  PAYMENTS: 'fitcoach_payments',
  SCHEDULE: 'fitcoach_schedule',
  EXPENSES: 'fitcoach_expenses',
};

const DEFAULT_PROFILE: PersonalProfile = {
  name: 'Personal Trainer',
  phone: '',
  pixKey: '',
  pixKeyType: 'cpf',
  plan: 'pro',
};

const DEFAULT_STUDENTS: Student[] = [];
const DEFAULT_PAYMENTS: Payment[] = [];
const DEFAULT_EXPENSES: Expense[] = [];
const DEFAULT_SCHEDULE: ScheduleItem[] = [];

export const loadProfile = (): PersonalProfile => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!data) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(data);
    if (parsed.name === 'Lucas Personal') {
      return DEFAULT_PROFILE;
    }
    return parsed;
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: PersonalProfile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const loadStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) return DEFAULT_STUDENTS;
  try {
    const parsed = JSON.parse(data);
    // Purge old mock data
    if (Array.isArray(parsed) && parsed.some((s: any) => s.name === 'Carlos Mendes' || s.id === '1')) {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      return [];
    }
    return parsed.map((s: Student) => ({
      ...s,
      billingType: s.billingType || 'mensal',
      pricePerClass: s.pricePerClass || 70,
      classesDoneMonth: typeof s.classesDoneMonth === 'number' ? s.classesDoneMonth : 0,
      attendedDates: Array.isArray(s.attendedDates) ? s.attendedDates : [],
      workouts: s.workouts || [],
      workoutDriveUrl: s.workoutDriveUrl || '',
      modality: s.modality || 'presencial',
      pendingMakeups: typeof s.pendingMakeups === 'number' ? s.pendingMakeups : 0,
      evolutionHistory: s.evolutionHistory || [],
    }));
  } catch {
    return DEFAULT_STUDENTS;
  }
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const loadPayments = (): Payment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  if (!data) return DEFAULT_PAYMENTS;
  try {
    const parsed = JSON.parse(data);
    // Purge old mock payments
    if (Array.isArray(parsed) && parsed.some((p: any) => p.id === 'p1' || p.id === 'p_out_1')) {
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      return [];
    }
    return parsed;
  } catch {
    return DEFAULT_PAYMENTS;
  }
};

export const savePayments = (payments: Payment[]) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const loadExpenses = (): Expense[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!data) return DEFAULT_EXPENSES;
  try {
    const parsed = JSON.parse(data);
    // Purge old mock expenses
    if (Array.isArray(parsed) && parsed.some((e: any) => e.id === 'e1' || e.description?.includes('Aluguel'))) {
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      return [];
    }
    return parsed;
  } catch {
    return DEFAULT_EXPENSES;
  }
};

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const loadSchedule = (): ScheduleItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
  if (!data) return DEFAULT_SCHEDULE;
  try {
    const parsed = JSON.parse(data);
    // Purge old mock schedule
    if (Array.isArray(parsed) && parsed.some((s: any) => s.id === 's1')) {
      localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
      return [];
    }
    return parsed;
  } catch {
    return DEFAULT_SCHEDULE;
  }
};

export const saveSchedule = (schedule: ScheduleItem[]) => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
};

// -------------------------------------------------------------
// BACKUP & RESTORE COMPLETO (JSON)
// -------------------------------------------------------------

export function exportBackupAsJson() {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    profile: loadProfile(),
    students: loadStudents(),
    payments: loadPayments(),
    expenses: loadExpenses(),
    schedule: loadSchedule(),
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitcoach_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function restoreBackupFromJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') return false;

    if (parsed.profile) saveProfile(parsed.profile);
    if (Array.isArray(parsed.students)) saveStudents(parsed.students);
    if (Array.isArray(parsed.payments)) savePayments(parsed.payments);
    if (Array.isArray(parsed.expenses)) saveExpenses(parsed.expenses);
    if (Array.isArray(parsed.schedule)) saveSchedule(parsed.schedule);

    return true;
  } catch (err) {
    console.error('Falha ao restaurar backup:', err);
    return false;
  }
}

// -------------------------------------------------------------
// EXPORTAÇÃO EM CSV (EXCEL)
// -------------------------------------------------------------

export function exportStudentsAsCsv() {
  const students = loadStudents();
  if (students.length === 0) {
    alert('Nenhum aluno cadastrado para exportar.');
    return;
  }

  const headers = [
    'ID',
    'Nome',
    'WhatsApp',
    'Modalidade',
    'Tipo de Cobrança',
    'Valor Mensalidade (R$)',
    'Valor Aula Avulsa (R$)',
    'Aulas Feitas no Mês',
    'Dia de Vencimento',
    'Status',
    'Reposições Pendentes',
    'Anotações',
  ];

  const rows = students.map((s) => [
    s.id,
    `"${s.name}"`,
    `"${s.phone}"`,
    s.modality,
    s.billingType === 'avulso' ? 'Por Aula' : 'Mensalidade Fixa',
    s.monthlyFee,
    s.pricePerClass || 0,
    s.classesDoneMonth || 0,
    s.dueDay,
    s.status === 'active' ? 'Ativo' : 'Inativo',
    s.pendingMakeups || 0,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitcoach_alunos_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
