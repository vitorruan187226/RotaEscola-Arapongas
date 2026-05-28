-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Tabelas carteirinhas + logs_embarque
-- Criado em: 28/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- ═══ 1. Tabela: carteirinhas ═══
-- Armazena o vínculo entre o aluno e seu QR Code de carteirinha digital.
-- Referenciada pelo scanner do motorista (Flutter) e pela tela de carteirinha (Web).
create table if not exists carteirinhas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos(id) on delete cascade,
  qr_code_hash text unique not null,
  status text not null default 'Ativa'
    check (status in ('Ativa', 'Suspensa', 'Revogada')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilita RLS
alter table carteirinhas enable row level security;

-- Qualquer usuário autenticado pode ler carteirinhas (motorista precisa validar no scanner)
drop policy if exists "Autenticados leem carteirinhas" on carteirinhas;
create policy "Autenticados leem carteirinhas"
  on carteirinhas for select
  using (auth.role() = 'authenticated');

-- Índice para busca rápida por hash no scanner do motorista
create index if not exists idx_carteirinhas_hash on carteirinhas(qr_code_hash);


-- ═══ 2. Tabela: logs_embarque ═══
-- Registra cada embarque/desembarque escaneado pelo motorista.
-- Usado como gatilho de webhook para disparar push notifications.
create table if not exists logs_embarque (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos(id) on delete cascade,
  motorista_id uuid references auth.users(id) on delete set null,
  rota_id text not null,
  tipo_movimento text not null
    check (tipo_movimento in ('Ida', 'Volta')),
  criado_em timestamptz default now()
);

-- Habilita RLS
alter table logs_embarque enable row level security;

-- Motoristas autenticados podem registrar embarques
drop policy if exists "Motoristas registram embarque" on logs_embarque;
create policy "Motoristas registram embarque"
  on logs_embarque for insert
  with check (auth.role() = 'authenticated');

-- Responsáveis podem ver apenas logs dos próprios filhos (via RLS da tabela alunos)
drop policy if exists "Pais veem logs dos filhos" on logs_embarque;
create policy "Pais veem logs dos filhos"
  on logs_embarque for select
  using (
    aluno_id in (
      select id from alunos where responsavel_id = auth.uid()
    )
  );

-- Índice para consultas de histórico por aluno e data
create index if not exists idx_logs_embarque_aluno on logs_embarque(aluno_id, criado_em desc);
