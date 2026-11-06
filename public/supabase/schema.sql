-- ==============================================================================
-- FITCOACH PRO - SUPABASE DATABASE SCHEMA (NAMESPACED: fitcoach_*)
-- ==============================================================================
-- Utiliza o prefixo fitcoach_* para garantir isolamento total e evitar conflito
-- com quaisquer outras tabelas existentes no seu banco Supabase.
-- ==============================================================================

-- 1. TABELA DE PERFIS DOS PERSONAL TRAINERS
create table if not exists public.fitcoach_profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'Personal Trainer',
  phone text default '',
  pix_key text default '',
  pix_key_type text default 'cpf',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. TABELA DE ALUNOS DO FITCOACH
create table if not exists public.fitcoach_students (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  phone text default '',
  modality text not null default 'presencial',
  billing_type text not null default 'mensal',
  monthly_fee numeric not null default 0,
  price_per_class numeric default 0,
  classes_done_month integer not null default 0,
  attended_dates jsonb not null default '[]'::jsonb,
  due_day integer not null default 10,
  status text not null default 'active',
  pending_makeups integer not null default 0,
  notes text default '',
  workout_drive_url text default '',
  workouts jsonb not null default '[]'::jsonb,
  evolution_history jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 3. TABELA DE HORÁRIOS / GRADE SEMANAL
create table if not exists public.fitcoach_schedules (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  student_id text not null references public.fitcoach_students(id) on delete cascade,
  day_of_week text not null,
  start_time text not null,
  end_time text not null,
  attendance_status text default 'scheduled',
  created_at timestamptz default now()
);

-- 4. TABELA DE MENSALIDADES E PAGAMENTOS
create table if not exists public.fitcoach_payments (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  student_id text not null references public.fitcoach_students(id) on delete cascade,
  month integer not null,
  year integer not null,
  amount numeric not null default 0,
  status text not null default 'pending',
  paid_at timestamptz,
  classes_count integer default 0,
  created_at timestamptz default now()
);

-- 5. TABELA DE DESPESAS DO PERSONAL
create table if not exists public.fitcoach_expenses (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  description text not null,
  category text not null,
  amount numeric not null default 0,
  date text not null,
  month integer not null,
  year integer not null,
  paid boolean not null default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- Garante que cada personal trainer só enxergue e altere seus próprios dados
-- ==============================================================================
alter table public.fitcoach_profiles enable row level security;
alter table public.fitcoach_students enable row level security;
alter table public.fitcoach_schedules enable row level security;
alter table public.fitcoach_payments enable row level security;
alter table public.fitcoach_expenses enable row level security;

-- Políticas de acesso:
drop policy if exists "Users manage own fitcoach profile" on public.fitcoach_profiles;
create policy "Users manage own fitcoach profile" on public.fitcoach_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users manage own fitcoach students" on public.fitcoach_students;
create policy "Users manage own fitcoach students" on public.fitcoach_students
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own fitcoach schedules" on public.fitcoach_schedules;
create policy "Users manage own fitcoach schedules" on public.fitcoach_schedules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own fitcoach payments" on public.fitcoach_payments;
create policy "Users manage own fitcoach payments" on public.fitcoach_payments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own fitcoach expenses" on public.fitcoach_expenses;
create policy "Users manage own fitcoach expenses" on public.fitcoach_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER PARA CRIAR PERFIL FITCOACH AUTOMATICAMENTE AO REGISTRAR NOVO USUÁRIO
-- ==============================================================================
create or replace function public.handle_new_fitcoach_user()
returns trigger as $$
begin
  insert into public.fitcoach_profiles (id, name, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Personal Trainer'),
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_fitcoach on auth.users;
create trigger on_auth_user_created_fitcoach
  after insert on auth.users
  for each row execute procedure public.handle_new_fitcoach_user();

-- Índices de alta performance
create index if not exists idx_fitcoach_students_user on public.fitcoach_students(user_id);
create index if not exists idx_fitcoach_payments_user_month_year on public.fitcoach_payments(user_id, year, month);
create index if not exists idx_fitcoach_expenses_user_month_year on public.fitcoach_expenses(user_id, year, month);
create index if not exists idx_fitcoach_schedules_user on public.fitcoach_schedules(user_id);
