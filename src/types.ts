export type PlanType = 'free' | 'pro';
export type StudentModality = 'presencial' | 'consultoria';
export type BillingType = 'mensal' | 'avulso'; // 'mensal' = valor fixo, 'avulso' = por aula realizada
export type EvolutionType = 'musculacao' | 'cardio';

export interface WorkoutDivision {
  id: string;
  name: string;
  muscleGroup: string;
  exercises: string;
}

export interface EvolutionRecord {
  id: string;
  date: string;
  type?: EvolutionType;
  weight?: number;
  
  // Cardio / Esteira metrics
  cardioType?: 'Esteira / Corrida' | 'Bike / Ciclismo' | 'Elíptico' | 'Remo' | 'Caminhada';
  cardioDistanceKm?: number;
  cardioDurationMinutes?: number;
  cardioPace?: string;
  cardioBpm?: number;
  
  note: string;
}

export interface PersonalProfile {
  name: string;
  phone: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  plan: PlanType;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  billingType: BillingType;
  monthlyFee: number;
  pricePerClass?: number;
  classesDoneMonth?: number;
  attendedDates?: string[];
  dueDay: number;
  status: 'active' | 'inactive';
  modality: StudentModality;
  pendingMakeups: number;
  evolutionHistory?: EvolutionRecord[];
  workouts?: WorkoutDivision[];
  workoutDriveUrl?: string;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Payment {
  id: string;
  studentId: string;
  month: number;
  year: number;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  classesCount?: number;
}

export type ScheduleStatus = 'scheduled' | 'present' | 'absent' | 'makeup';

export interface ScheduleItem {
  id: string;
  studentId: string;
  dayOfWeek: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado';
  startTime: string;
  endTime: string;
  attendanceStatus?: ScheduleStatus;
}

// Despesas do Personal
export type ExpenseCategory =
  | 'academia'     // Taxa de uso / Entrada na academia
  | 'transporte'   // Combustível, estacionamento, deslocamento
  | 'cref'         // Anuidade do conselho de Ed. Física
  | 'equipamentos' // Elásticos, kettlebell, balança
  | 'cursos'       // Certificações, congressos, livros
  | 'outros';      // Outras despesas profissionais

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  month: number;
  year: number;
  paid: boolean;
}
