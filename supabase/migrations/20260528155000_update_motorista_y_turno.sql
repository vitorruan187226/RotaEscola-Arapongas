-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Add column turno to alunos + re-create logs_embarque + seed data
-- Criado em: 28/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona coluna turno na tabela alunos
alter table alunos add column if not exists turno text check (turno in ('Manhã', 'Tarde', 'Noite'));

-- 2. Recria a tabela logs_embarque para se alinhar exatamente aos tipos corretos
drop table if exists logs_embarque cascade;
create table logs_embarque (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos(id) on delete cascade,
  motorista_id uuid references auth.users(id) on delete set null,
  rota_id uuid not null references rotas(id) on delete cascade,
  tipo_movimento text not null check (tipo_movimento in ('IDA', 'VOLTA', 'Ida', 'Volta')),
  criado_em timestamptz default now()
);

-- Habilita RLS em logs_embarque
alter table logs_embarque enable row level security;

-- Política de RLS: Qualquer usuário autenticado pode criar logs de embarque (como motoristas)
drop policy if exists "Motoristas registram embarques em logs_embarque" on logs_embarque;
create policy "Motoristas registram embarques em logs_embarque"
  on logs_embarque for insert
  with check (auth.role() = 'authenticated');

-- Política de RLS: Pais veem logs de embarque de seus respectivos filhos
drop policy if exists "Pais leem logs de seus filhos em logs_embarque" on logs_embarque;
create policy "Pais leem logs de seus filhos em logs_embarque"
  on logs_embarque for select
  using (
    aluno_id in (
      select id from alunos where responsavel_id = auth.uid()
    )
  );

-- 3. Insere motorista_perfil de teste para o perfil do Tio Silvio ('467c9e69-fbce-456e-86d4-51747287301d')
insert into motoristas_perfil (id, perfil_id, placa_veiculo, modelo_veiculo, capacidade_van, ativo)
values (
  '123e4567-e89b-12d3-a456-426614174000',
  '467c9e69-fbce-456e-86d4-51747287301d',
  'BBB-5678',
  'Ônibus Mercedes-Benz',
  40,
  true
)
on conflict (id) do nothing;

-- 4. Insere Rota de Teste para o perfil de motorista do Tio Silvio
insert into rotas (id, motorista_id, nome_rota, turno, horario_inicio, horario_fim, dias_semana, ativa)
values (
  '9d0f2832-7288-4682-9642-17cb25e36928',
  '123e4567-e89b-12d3-a456-426614174000',
  'Rota 04 — Zona Rural',
  'manha',
  '06:30:00',
  '12:30:00',
  '{"Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"}',
  true
)
on conflict (id) do nothing;

insert into rotas (id, motorista_id, nome_rota, turno, horario_inicio, horario_fim, dias_semana, ativa)
values (
  '8a723821-3928-4444-9123-ab39d1b0d777',
  '123e4567-e89b-12d3-a456-426614174000',
  'Rota 04 — Zona Rural (Tarde)',
  'tarde',
  '13:00:00',
  '18:00:00',
  '{"Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"}',
  true
)
on conflict (id) do nothing;

-- 5. Insere alunos de teste vinculados à rota e aos turnos
insert into alunos (id, nome, escola, serie, data_nascimento, responsavel_id, rota_id, turno, ativo, ausente_hoje)
values (
  'bfee6123-1111-2222-3333-444444444444',
  'Lucas Lima Souza',
  'Escola Municipal Dorcelina Folador',
  '5ª Série',
  '2015-05-10',
  '1e45bfd4-2113-4e06-b231-e8f2f1136151',
  '9d0f2832-7288-4682-9642-17cb25e36928',
  'Manhã',
  true,
  false
)
on conflict (id) do nothing;

insert into alunos (id, nome, escola, serie, data_nascimento, responsavel_id, rota_id, turno, ativo, ausente_hoje)
values (
  'cfee6123-1111-2222-3333-444444444444',
  'Ana Beatriz Silveira',
  'Escola Municipal Dorcelina Folador',
  '4ª Série',
  '2016-08-12',
  '1e45bfd4-2113-4e06-b231-e8f2f1136151',
  '9d0f2832-7288-4682-9642-17cb25e36928',
  'Manhã',
  true,
  false
)
on conflict (id) do nothing;

insert into alunos (id, nome, escola, serie, data_nascimento, responsavel_id, rota_id, turno, ativo, ausente_hoje)
values (
  'dfee6123-1111-2222-3333-444444444444',
  'Enzo Gabriel Silva',
  'Escola Municipal Dorcelina Folador',
  '3ª Série',
  '2017-02-20',
  '2aec5cb3-45d0-4754-821d-ff00eecd7fbf',
  '8a723821-3928-4444-9123-ab39d1b0d777',
  'Tarde',
  true,
  false
)
on conflict (id) do nothing;
