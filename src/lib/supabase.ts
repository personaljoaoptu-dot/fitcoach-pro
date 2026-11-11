import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  PersonalProfile,
  Student,
  Payment,
  Expense,
  ScheduleItem,
} from '../types';

const DEFAULT_SUPABASE_URL = 'https://hugscfekchjnapadonmd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1Z3NjZmVrY2hqbmFwYWRvbm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5ODg1MzEsImV4cCI6MjEwOTU2NDUzMX0.1dU1Cjo1H52QHir_WE-hcpBTvJVbVstjCKq_QoEBZ7o';

const STORAGE_KEY_URL = 'fitcoach_supabase_url';
const STORAGE_KEY_ANON_KEY = 'fitcoach_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON_KEY) || '' : '';

  const url = (storedUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http')),
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON_KEY, anonKey.trim());
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON_KEY);
  }
}

let clientInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  const configKey = `${url}:${anonKey}`;
  if (!clientInstance || currentConfigKey !== configKey) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      currentConfigKey = configKey;
    } catch (err) {
      console.error('Erro ao inicializar cliente Supabase:', err);
      return null;
    }
  }

  return clientInstance;
}

export interface CloudUserData {
  profile: PersonalProfile;
  students: Student[];
  payments: Payment[];
  expenses: Expense[];
  schedule: ScheduleItem[];
}

// -------------------------------------------------------------
// SERVIÇOS DE LEITURA & SINCRONIZAÇÃO COM SUPABASE
// Tabelas com namespace fitcoach_* para isolamento e segurança
// -------------------------------------------------------------

export async function fetchUserDataFromSupabase(userId: string): Promise<CloudUserData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [profileRes, studentsRes, schedulesRes, paymentsRes, expensesRes] = await Promise.all([
      client.from('fitcoach_profiles').select('*').eq('id', userId).maybeSingle(),
      client.from('fitcoach_students').select('*').eq('user_id', userId),
      client.from('fitcoach_schedules').select('*').eq('user_id', userId),
      client.from('fitcoach_payments').select('*').eq('user_id', userId),
      client.from('fitcoach_expenses').select('*').eq('user_id', userId),
    ]);

    const profile: PersonalProfile = profileRes.data
      ? {
          name: profileRes.data.name || 'Personal Trainer',
          phone: profileRes.data.phone || '',
          pixKey: profileRes.data.pix_key || '',
          pixKeyType: profileRes.data.pix_key_type || 'cpf',
          plan: profileRes.data.plan || 'free',
        }
      : {
          name: 'Personal Trainer',
          phone: '',
          pixKey: '',
          pixKeyType: 'cpf',
          plan: 'free',
        };

    const students: Student[] = (studentsRes.data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      phone: row.phone || '',
      modality: row.modality || 'presencial',
      billingType: row.billing_type || 'mensal',
      monthlyFee: Number(row.monthly_fee) || 0,
      pricePerClass: Number(row.price_per_class) || 0,
      classesDoneMonth: Number(row.classes_done_month) || 0,
      attendedDates: Array.isArray(row.attended_dates) ? row.attended_dates : [],
      dueDay: Number(row.due_day) || 10,
      status: row.status || 'active',
      pendingMakeups: Number(row.pending_makeups) || 0,
      notes: row.notes || '',
      workoutDriveUrl: row.workout_drive_url || '',
      workouts: Array.isArray(row.workouts) ? row.workouts : [],
      evolutionHistory: Array.isArray(row.evolution_history) ? row.evolution_history : [],
      createdAt: row.created_at || new Date().toISOString(),
    }));

    const schedule: ScheduleItem[] = (schedulesRes.data || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      attendanceStatus: row.attendance_status || 'scheduled',
    }));

    const payments: Payment[] = (paymentsRes.data || []).map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      month: Number(row.month),
      year: Number(row.year),
      amount: Number(row.amount) || 0,
      status: row.status || 'pending',
      paidAt: row.paid_at || undefined,
      classesCount: Number(row.classes_count) || undefined,
    }));

    const expenses: Expense[] = (expensesRes.data || []).map((row: any) => ({
      id: row.id,
      description: row.description,
      category: row.category,
      amount: Number(row.amount) || 0,
      date: row.date,
      month: Number(row.month),
      year: Number(row.year),
      paid: Boolean(row.paid),
    }));

    return {
      profile,
      students,
      payments,
      expenses,
      schedule,
    };
  } catch (err) {
    console.error('Erro ao ler dados do Supabase:', err);
    return null;
  }
}

export async function uploadFullStateToSupabase(
  userId: string,
  data: {
    profile: PersonalProfile;
    students: Student[];
    payments: Payment[];
    expenses: Expense[];
    schedule: ScheduleItem[];
  }
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Profile
    await client.from('fitcoach_profiles').upsert({
      id: userId,
      name: data.profile.name,
      phone: data.profile.phone,
      pix_key: data.profile.pixKey,
      pix_key_type: data.profile.pixKeyType,
      plan: data.profile.plan,
      updated_at: new Date().toISOString(),
    });

    // 2. Students
    if (data.students.length > 0) {
      const studentRows = data.students.map((s) => ({
        id: s.id,
        user_id: userId,
        name: s.name,
        phone: s.phone,
        modality: s.modality,
        billing_type: s.billingType,
        monthly_fee: s.monthlyFee,
        price_per_class: s.pricePerClass || 0,
        classes_done_month: s.classesDoneMonth || 0,
        attended_dates: s.attendedDates || [],
        due_day: s.dueDay,
        status: s.status,
        pending_makeups: s.pendingMakeups || 0,
        notes: s.notes || '',
        workout_drive_url: s.workoutDriveUrl || '',
        workouts: s.workouts || [],
        evolution_history: s.evolutionHistory || [],
      }));
      await client.from('fitcoach_students').upsert(studentRows);
    }

    // 3. Schedules
    if (data.schedule.length > 0) {
      const scheduleRows = data.schedule.map((item) => ({
        id: item.id,
        user_id: userId,
        student_id: item.studentId,
        day_of_week: item.dayOfWeek,
        start_time: item.startTime,
        end_time: item.endTime,
        attendance_status: item.attendanceStatus || 'scheduled',
      }));
      await client.from('fitcoach_schedules').upsert(scheduleRows);
    }

    // 4. Payments
    if (data.payments.length > 0) {
      const paymentRows = data.payments.map((p) => ({
        id: p.id,
        user_id: userId,
        student_id: p.studentId,
        month: p.month,
        year: p.year,
        amount: p.amount,
        status: p.status,
        paid_at: p.paidAt || null,
        classes_count: p.classesCount || 0,
      }));
      await client.from('fitcoach_payments').upsert(paymentRows);
    }

    // 5. Expenses
    if (data.expenses.length > 0) {
      const expenseRows = data.expenses.map((e) => ({
        id: e.id,
        user_id: userId,
        description: e.description,
        category: e.category,
        amount: e.amount,
        date: e.date,
        month: e.month,
        year: e.year,
        paid: e.paid,
      }));
      await client.from('fitcoach_expenses').upsert(expenseRows);
    }

    return true;
  } catch (err) {
    console.error('Erro ao sincronizar com Supabase:', err);
    return false;
  }
}

// -------------------------------------------------------------
// PORTAL PÚBLICO DO ALUNO (Leitura direta por ID do aluno)
// Permite que o aluno abra sua rotina no celular via WhatsApp
// -------------------------------------------------------------
export async function fetchStudentPortalData(
  studentId: string
): Promise<{ student: Student; trainerName: string; trainerPhone: string } | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('fitcoach_students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    if (error || !data) return null;

    const student: Student = {
      id: data.id,
      name: data.name,
      phone: data.phone || '',
      modality: data.modality || 'presencial',
      billingType: data.billing_type || 'mensal',
      monthlyFee: Number(data.monthly_fee) || 0,
      pricePerClass: Number(data.price_per_class) || 0,
      classesDoneMonth: Number(data.classes_done_month) || 0,
      attendedDates: Array.isArray(data.attended_dates) ? data.attended_dates : [],
      dueDay: Number(data.due_day) || 10,
      status: data.status || 'active',
      pendingMakeups: Number(data.pending_makeups) || 0,
      notes: data.notes || '',
      workoutDriveUrl: data.workout_drive_url || '',
      workouts: Array.isArray(data.workouts) ? data.workouts : [],
      evolutionHistory: Array.isArray(data.evolution_history) ? data.evolution_history : [],
      createdAt: data.created_at || new Date().toISOString(),
    };

    let trainerName = 'FitCoach Pro';
    let trainerPhone = '';
    if (data.user_id) {
      const profileRes = await client
        .from('fitcoach_profiles')
        .select('name, phone')
        .eq('id', data.user_id)
        .maybeSingle();

      if (profileRes.data) {
        trainerName = profileRes.data.name || 'FitCoach Pro';
        trainerPhone = profileRes.data.phone || '';
      }
    }

    return { student, trainerName, trainerPhone };
  } catch (err) {
    console.error('Erro ao buscar dados do portal do aluno:', err);
    return null;
  }
}
