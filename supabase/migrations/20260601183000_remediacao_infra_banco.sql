-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Remediação de Segurança e Infraestrutura de Banco (Supabase)
-- Criado em: 01/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- ═══ A. CRIAÇÃO DE TABELAS AUSENTES E RELACIONAMENTOS ═══

-- 1. Tabela: motoristas_perfil (Se não existir)
create table if not exists public.motoristas_perfil (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis(id) on delete cascade,
  placa_veiculo text not null,
  modelo_veiculo text not null,
  capacidade_van integer not null,
  ativo boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(perfil_id)
);

-- 2. Tabela: presencas_diarias (Se não existir)
create table if not exists public.presencas_diarias (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  data_presenca date not null default current_date,
  compareceu boolean not null default true,
  motivo text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(aluno_id, data_presenca)
);

-- 3. Tabela: notificacoes (Se não existir)
create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references public.alunos(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  criado_em timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Tabela: localizacao_veiculo (Garantia/Recriação)
create table if not exists public.localizacao_veiculo (
  id uuid primary key default gen_random_uuid(),
  rota_id text not null,
  latitude double precision not null,
  longitude double precision not null,
  velocidade_kmh integer default 0,
  atualizado_em timestamp with time zone default timezone('utc'::text, now())
);


-- ═══ B. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) ═══

alter table public.motoristas_perfil enable row level security;
alter table public.presencas_diarias enable row level security;
alter table public.notificacoes enable row level security;
alter table public.localizacao_veiculo enable row level security;

-- Habilita RLS nas tabelas expostas de frotas/rotas
alter table public.veiculos enable row level security;
alter table public.rotas enable row level security;


-- ═══ C. CRIAÇÃO DE POLÍTICAS DE RLS ═══

-- 1. Políticas para: motoristas_perfil
drop policy if exists "Leitura publica de perfis de motoristas" on public.motoristas_perfil;
create policy "Leitura publica de perfis de motoristas"
  on public.motoristas_perfil for select
  to authenticated
  using (true);

drop policy if exists "Admins gerenciam perfis de motoristas" on public.motoristas_perfil;
create policy "Admins gerenciam perfis de motoristas"
  on public.motoristas_perfil for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('admin', 'Admin')
    )
  );

-- 2. Políticas para: presencas_diarias
drop policy if exists "Pais leem presencas de seus filhos" on public.presencas_diarias;
create policy "Pais leem presencas de seus filhos"
  on public.presencas_diarias for select
  to authenticated
  using (
    aluno_id in (
      select id from public.alunos where responsavel_id = auth.uid()
    )
  );

drop policy if exists "Pais gerenciam presencas de seus filhos" on public.presencas_diarias;
create policy "Pais gerenciam presencas de seus filhos"
  on public.presencas_diarias for all
  to authenticated
  using (
    aluno_id in (
      select id from public.alunos where responsavel_id = auth.uid()
    )
  );

drop policy if exists "Motoristas e Admins leem todas as presencas" on public.presencas_diarias;
create policy "Motoristas e Admins leem todas as presencas"
  on public.presencas_diarias for select
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('admin', 'Admin', 'motorista', 'Motorista')
    )
  );

-- 3. Políticas para: notificacoes
drop policy if exists "Responsáveis leem notificacoes dos filhos" on public.notificacoes;
create policy "Responsáveis leem notificacoes dos filhos"
  on public.notificacoes for select
  to authenticated
  using (
    aluno_id in (
      select id from public.alunos where responsavel_id = auth.uid()
    )
  );

drop policy if exists "Admins e motoristas inserem notificacoes" on public.notificacoes;
create policy "Admins e motoristas inserem notificacoes"
  on public.notificacoes for insert
  to authenticated
  with check (true);

-- 4. Políticas para: localizacao_veiculo
drop policy if exists "Qualquer autenticado visualiza localizacao" on public.localizacao_veiculo;
create policy "Qualquer autenticado visualiza localizacao"
  on public.localizacao_veiculo for select
  to authenticated
  using (true);

drop policy if exists "Motoristas e Admins atualizam localizacao" on public.localizacao_veiculo;
create policy "Motoristas e Admins atualizam localizacao"
  on public.localizacao_veiculo for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('admin', 'Admin', 'motorista', 'Motorista')
    )
  );

-- 5. Políticas de remediação para: veiculos
drop policy if exists "Usuarios autenticados leem veiculos" on public.veiculos;
create policy "Usuarios autenticados leem veiculos"
  on public.veiculos for select
  to authenticated
  using (true);

drop policy if exists "Admins gerenciam veiculos" on public.veiculos;
create policy "Admins gerenciam veiculos"
  on public.veiculos for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('admin', 'Admin')
    )
  );

-- 6. Políticas de remediação para: rotas
drop policy if exists "Usuarios autenticados leem rotas" on public.rotas;
create policy "Usuarios autenticados leem rotas"
  on public.rotas for select
  to authenticated
  using (true);

drop policy if exists "Admins gerenciam rotas" on public.rotas;
create policy "Admins gerenciam rotas"
  on public.rotas for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('admin', 'Admin')
    )
  );
