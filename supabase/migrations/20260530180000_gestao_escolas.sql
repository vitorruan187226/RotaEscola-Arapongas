-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Gestão de Entidades Escolares
-- Criado em: 30/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Cria a tabela de escolas
create table if not exists public.escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text not null,
  turnos text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilita RLS em public.escolas
alter table public.escolas enable row level security;

-- Política de RLS: Qualquer usuário autenticado pode ver as escolas
drop policy if exists "Qualquer usuario autenticado pode ver as escolas" on public.escolas;
create policy "Qualquer usuario autenticado pode ver as escolas"
  on public.escolas for select
  using (auth.role() = 'authenticated');

-- Política de RLS: Admins podem fazer qualquer operação
drop policy if exists "Admins podem gerenciar escolas" on public.escolas;
create policy "Admins podem gerenciar escolas"
  on public.escolas for all
  using (auth.role() = 'authenticated');

-- 2. Adiciona a coluna escola_id na tabela alunos
alter table public.alunos add column if not exists escola_id uuid references public.escolas(id) on delete set null;

-- 3. Insere escolas padrão de Arapongas para povoamento inicial (seed)
insert into public.escolas (id, nome, endereco, turnos)
values
  ('b73e2840-7288-4682-9642-17cb25e36001', 'Escola Municipal Dorcelina Folador', 'Rua das Gralhas, 123 - Arapongas', '{"Manhã", "Tarde"}'),
  ('b73e2840-7288-4682-9642-17cb25e36002', 'Colégio Estadual Julia Wanderley', 'Av. Arapongas, 456 - Centro', '{"Manhã", "Tarde", "Noite"}'),
  ('b73e2840-7288-4682-9642-17cb25e36003', 'Escola Municipal Codorna', 'Rua Codorna, 789 - Zona Sul', '{"Manhã", "Tarde"}')
on conflict (id) do update 
set nome = excluded.nome, endereco = excluded.endereco, turnos = excluded.turnos;

-- 4. Atualiza os alunos existentes para vincularem-se às escolas por nome (backfill)
update public.alunos
set escola_id = 'b73e2840-7288-4682-9642-17cb25e36001'
where escola = 'Escola Municipal Dorcelina Folador';

update public.alunos
set escola_id = 'b73e2840-7288-4682-9642-17cb25e36002'
where escola = 'Colégio Estadual Julia Wanderley';

update public.alunos
set escola_id = 'b73e2840-7288-4682-9642-17cb25e36003'
where escola = 'Escola Municipal Codorna';
