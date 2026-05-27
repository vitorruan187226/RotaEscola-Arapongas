-- Migration: Portal do Responsável — Status da Carteirinha + Tabela de Rastreio
-- Criado em: 27/05/2026

-- 1. Adiciona coluna status_carteirinha na tabela alunos (se não existir)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'alunos' and column_name = 'status_carteirinha'
  ) then
    alter table alunos add column status_carteirinha text not null default 'Pendente'
      check (status_carteirinha in ('Pendente', 'Em análise', 'Aprovado'));
  end if;
end $$;

-- 2. Adiciona coluna foto_url na tabela alunos (se não existir)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'alunos' and column_name = 'foto_url'
  ) then
    alter table alunos add column foto_url text;
  end if;
end $$;

-- 3. Cria tabela de localização em tempo real dos veículos (se não existir)
create table if not exists localizacao_veiculo (
  id uuid primary key default gen_random_uuid(),
  rota_id text not null,
  latitude double precision not null,
  longitude double precision not null,
  velocidade_kmh integer default 0,
  atualizado_em timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Habilita RLS na tabela localizacao_veiculo
alter table localizacao_veiculo enable row level security;

-- 5. Política: qualquer usuário autenticado pode ler a localização do veículo
drop policy if exists "Responsaveis podem ver localizacao do onibus" on localizacao_veiculo;
create policy "Responsaveis podem ver localizacao do onibus"
  on localizacao_veiculo
  for select
  using (auth.role() = 'authenticated');

-- 6. Política RLS: responsáveis podem atualizar o status_carteirinha do próprio filho
drop policy if exists "Responsavel pode atualizar status carteirinha do filho" on alunos;
create policy "Responsavel pode atualizar status carteirinha do filho"
  on alunos
  for update
  using (auth.uid() = responsavel_id)
  with check (auth.uid() = responsavel_id);

-- 7. Dado de teste para demonstração (Rota 04 - Arapongas)
insert into localizacao_veiculo (rota_id, latitude, longitude, velocidade_kmh, atualizado_em)
values 
  ('Rota 04', -23.4178, -51.4269, 35, now()),
  ('Rota 22', -23.4220, -51.4315, 0, now() - interval '1 hour')
on conflict do nothing;
