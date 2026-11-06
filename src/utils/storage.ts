import { PersonalProfile, Student, Payment, ScheduleItem, Expense } from '../types';

export const STORAGE_KEYS = {
  PROFILE: 'fitcoach_profile',
  STUDENTS: 'fitcoach_students',
  PAYMENTS: 'fitcoach_payments',
  SCHEDULE: 'fitcoach_schedule',
  EXPENSES: 'fitcoach_expenses',
};

const DEFAULT_PROFILE: PersonalProfile = {
  name: 'Lucas Personal',
  phone: '11999998888',
  pixKey: 'lucas.personal@email.com',
  pixKeyType: 'email',
  plan: 'free',
};

const DEFAULT_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Carlos Mendes',
    phone: '11987654321',
    billingType: 'mensal',
    monthlyFee: 400,
    dueDay: 5,
    status: 'active',
    modality: 'presencial',
    pendingMakeups: 1,
    attendedDates: ['2026-11-02', '2026-11-04'],
    notes: 'Foco em hipertrofia e fortalecimento lombar',
    workouts: [
      {
        id: 'w1',
        name: 'Treino A',
        muscleGroup: 'Peito, Ombro e Tríceps',
        exercises: '1. Supino Reto com Barra 4x8-10\n2. Supino Inclinado com Halteres 3x10\n3. Desenvolvimento Militar 3x10\n4. Elevação Lateral 4x12\n5. Tríceps Corda na Polia 4x12-15',
      },
      {
        id: 'w2',
        name: 'Treino B',
        muscleGroup: 'Costas, Trapézio e Bíceps',
        exercises: '1. Puxada Frontal 4x10\n2. Remada Curvada 4x8\n3. Crucifixo Inverso 3x12\n4. Rosca Direta com Barra W 3x10\n5. Rosca Martelo 3x12',
      },
    ],
    evolutionHistory: [
      { id: 'ev1', date: '2026-10-15', type: 'musculacao', weight: 82.5, note: 'Supino 30kg x 10 reps. Sem dor lombar.' },
      { id: 'ev2', date: '2026-11-01', type: 'musculacao', weight: 81.2, note: 'Subiu supino para 34kg. Boa postura no agachamento.' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mariana Silva',
    phone: '11976543210',
    billingType: 'mensal',
    monthlyFee: 450,
    dueDay: 10,
    status: 'active',
    modality: 'presencial',
    pendingMakeups: 0,
    attendedDates: ['2026-11-03', '2026-11-05'],
    notes: 'Treino funcional e definição',
    workouts: [
      {
        id: 'w3',
        name: 'Treino A',
        muscleGroup: 'Membros Inferiores Completo',
        exercises: '1. Agachamento Livre 4x10\n2. Leg Press 45º 4x12\n3. Stiff com Halteres 3x12\n4. Cadeira Extensora 3x15\n5. Panturrilha em pé 4x15',
      },
    ],
    evolutionHistory: [
      { id: 'ev3', date: '2026-10-20', type: 'musculacao', weight: 64.0, note: 'Iniciou ciclo de força. Cargas estabilizadas.' },
      { id: 'ev3_cardio', date: '2026-11-03', type: 'cardio', cardioType: 'Esteira / Corrida', cardioDistanceKm: 4.0, cardioDurationMinutes: 25, cardioPace: '6:15 /km', note: 'Aquecimento e tiros de 1 min na esteira.' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Juliana Rocha',
    phone: '11988884444',
    billingType: 'avulso',
    monthlyFee: 480,
    pricePerClass: 80,
    classesDoneMonth: 6,
    attendedDates: [
      '2026-11-02',
      '2026-11-04',
      '2026-11-06',
      '2026-11-09',
      '2026-11-11',
      '2026-11-13',
    ],
    dueDay: 30,
    status: 'active',
    modality: 'presencial',
    pendingMakeups: 0,
    notes: 'Paga por aula realizada (R$ 80/hora)',
    evolutionHistory: [
      { id: 'ev6', date: '2026-11-04', type: 'musculacao', weight: 60.5, note: 'Treino de pernas com ênfase em posterior.' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Fernanda Lima',
    phone: '11954321098',
    billingType: 'mensal',
    monthlyFee: 180,
    dueDay: 20,
    status: 'active',
    modality: 'consultoria',
    pendingMakeups: 0,
    attendedDates: [],
    workoutDriveUrl: 'https://docs.google.com/spreadsheets/d/exemplo_treino_corrida',
    notes: 'Projeto Corrida 10km (Foco em cardio e esteira)',
    evolutionHistory: [
      {
        id: 'ev_cardio1',
        date: '2026-10-24',
        type: 'cardio',
        cardioType: 'Esteira / Corrida',
        cardioDistanceKm: 6.0,
        cardioDurationMinutes: 34,
        cardioPace: '5:40 /km',
        cardioBpm: 158,
        note: 'Treino progressivo na esteira. Frequência cardíaca controlada.',
      },
      {
        id: 'ev_cardio2',
        date: '2026-11-02',
        type: 'cardio',
        cardioType: 'Esteira / Corrida',
        cardioDistanceKm: 8.5,
        cardioDurationMinutes: 46,
        cardioPace: '5:24 /km',
        cardioBpm: 162,
        note: 'Longão excelente! Baixou o pace médio sem quebrar.',
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PAYMENTS: Payment[] = [
  // Outubro / 2026
  { id: 'p_out_1', studentId: '1', month: 10, year: 2026, amount: 400, status: 'paid', paidAt: '2026-10-05' },
  { id: 'p_out_2', studentId: '2', month: 10, year: 2026, amount: 450, status: 'paid', paidAt: '2026-10-10' },
  { id: 'p_out_3', studentId: '3', month: 10, year: 2026, amount: 400, classesCount: 5, status: 'paid', paidAt: '2026-10-28' },
  { id: 'p_out_4', studentId: '4', month: 10, year: 2026, amount: 180, status: 'paid', paidAt: '2026-10-20' },

  // Novembro / 2026
  { id: 'p1', studentId: '1', month: 11, year: 2026, amount: 400, status: 'paid', paidAt: '2026-11-05' },
  { id: 'p2', studentId: '2', month: 11, year: 2026, amount: 450, status: 'paid', paidAt: '2026-11-06' },
  { id: 'p3', studentId: '3', month: 11, year: 2026, amount: 480, classesCount: 6, status: 'pending' },
  { id: 'p4', studentId: '4', month: 11, year: 2026, amount: 180, status: 'overdue' },
];

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'e1',
    description: 'Taxa de Personal - Academia Smart',
    category: 'academia',
    amount: 300,
    date: '2026-11-05',
    month: 11,
    year: 2026,
    paid: true,
  },
  {
    id: 'e2',
    description: 'Combustível / Deslocamento semanal',
    category: 'transporte',
    amount: 140,
    date: '2026-11-03',
    month: 11,
    year: 2026,
    paid: true,
  },
  {
    id: 'e3',
    description: 'Kit de Minibands e Elásticos novos',
    category: 'equipamentos',
    amount: 85,
    date: '2026-11-04',
    month: 11,
    year: 2026,
    paid: true,
  },
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: 's1', studentId: '1', dayOfWeek: 'Segunda', startTime: '07:00', endTime: '08:00', attendanceStatus: 'present' },
  { id: 's2', studentId: '2', dayOfWeek: 'Segunda', startTime: '08:15', endTime: '09:15', attendanceStatus: 'scheduled' },
  { id: 's3', studentId: '3', dayOfWeek: 'Segunda', startTime: '10:00', endTime: '11:00', attendanceStatus: 'scheduled' },
  { id: 's4', studentId: '1', dayOfWeek: 'Quarta', startTime: '07:00', endTime: '08:00', attendanceStatus: 'scheduled' },
  { id: 's5', studentId: '3', dayOfWeek: 'Quarta', startTime: '10:00', endTime: '11:00', attendanceStatus: 'scheduled' },
  { id: 's6', studentId: '2', dayOfWeek: 'Sexta', startTime: '08:15', endTime: '09:15', attendanceStatus: 'scheduled' },
];

export const loadProfile = (): PersonalProfile => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : DEFAULT_PROFILE;
};

export const saveProfile = (profile: PersonalProfile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const loadStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) return DEFAULT_STUDENTS;
  try {
    const parsed = JSON.parse(data);
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
  return data ? JSON.parse(data) : DEFAULT_PAYMENTS;
};

export const savePayments = (payments: Payment[]) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const loadExpenses = (): Expense[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return data ? JSON.parse(data) : DEFAULT_EXPENSES;
};

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const loadSchedule = (): ScheduleItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
  return data ? JSON.parse(data) : DEFAULT_SCHEDULE;
};

export const saveSchedule = (schedule: ScheduleItem[]) => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
};

// Export & Backup Helpers
export const exportBackupAsJson = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: loadProfile(),
    students: loadStudents(),
    payments: loadPayments(),
    expenses: loadExpenses(),
    schedule: loadSchedule(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitcoach_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportStudentsAsCsv = () => {
  const students = loadStudents();
  let csv = 'Nome,Telefone,Modalidade,Tipo de Cobranca,Valor Mensalidade,Valor por Aula,Dia Vencimento,Status\n';

  students.forEach((s) => {
    csv += `"${s.name}","${s.phone}","${s.modality}","${s.billingType}",${s.monthlyFee},${s.pricePerClass || 0},${s.dueDay},"${s.status}"\n`;
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alunos_fitcoach_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
