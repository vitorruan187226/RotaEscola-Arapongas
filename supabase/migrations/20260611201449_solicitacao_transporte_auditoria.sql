-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Solicitação de Transporte Escolar e Fila de Auditoria da SEMED
-- Criado em: 11/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Criação dos enums periodo_letivo e status_analise se não existirem
do $$
begin
  if not exists (select 1 from pg_type where typname = 'periodo_letivo') then
    create type periodo_letivo as enum ('manha', 'tarde', 'noite');
  end if;
  if not exists (select 1 from pg_type where typname = 'status_analise') then
    create type status_analise as enum ('aguardando', 'aprovado', 'rejeitado', 'pendente_correcao');
  end if;
end $$;

-- 2. Adequação da tabela alunos
alter table public.alunos add column if not exists escola_id uuid references public.escolas(id) on delete set null;
alter table public.alunos add column if not exists ano_serie text;
alter table public.alunos add column if not exists turma text;
alter table public.alunos add column if not exists periodo periodo_letivo;
alter table public.alunos add column if not exists status status_analise default 'aguardando';
alter table public.alunos add column if not exists observacao_secretaria text;
alter table public.alunos add column if not exists criado_em timestamp with time zone default now();

-- 3. Criação ou adequação da tabela documentos_aluno
create table if not exists public.documentos_aluno (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos(id) on delete cascade,
  tipo_documento text not null,
  url_arquivo text not null,
  url_documento text,
  data_upload timestamp with time zone default now()
);

-- 4. Função de sincronização automática para manter retrocompatibilidade
create or replace function public.sync_alunos_columns()
returns trigger as $$
declare
  esc_nome text;
  esc_id uuid;
begin
  -- 4.1 Sincronia de status (status_analise) -> status_carteirinha (text)
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    new.status_carteirinha := case new.status
      when 'aprovado' then 'Aprovado'
      when 'aguardando' then 'Em análise'
      when 'pendente_correcao' then 'Pendente'
      when 'rejeitado' then 'Pendente'
      else 'Pendente'
    end;
  elsif (new.status_carteirinha is distinct from old.status_carteirinha) then
    new.status := case new.status_carteirinha
      when 'Aprovado' then 'aprovado'::status_analise
      when 'Em análise' then 'aguardando'::status_analise
      when 'Pendente' then 'pendente_correcao'::status_analise
      else 'aguardando'::status_analise
    end;
  end if;

  -- 4.2 Sincronia de periodo (periodo_letivo) -> turno (text)
  if (tg_op = 'INSERT') or (new.periodo is distinct from old.periodo) then
    new.turno := case new.periodo
      when 'manha' then 'Manhã'
      when 'tarde' then 'Tarde'
      when 'noite' then 'Noite'
      else new.turno
    end;
  elsif (new.turno is distinct from old.turno) then
    new.periodo := case lower(new.turno)
      when 'manhã' then 'manha'::periodo_letivo
      when 'manha' then 'manha'::periodo_letivo
      when 'tarde' then 'tarde'::periodo_letivo
      when 'noite' then 'noite'::periodo_letivo
      else new.periodo
    end;
  end if;

  -- 4.3 Sincronia de ano_serie + turma -> serie (text)
  if (tg_op = 'INSERT') or (new.ano_serie is distinct from old.ano_serie) or (new.turma is distinct from old.turma) then
    if new.ano_serie is not null and new.turma is not null and new.turma <> '' then
      new.serie := new.ano_serie || ' - ' || new.turma;
    elsif new.ano_serie is not null then
      new.serie := new.ano_serie;
    end if;
  elsif (new.serie is distinct from old.serie) and (new.serie is not null) then
    if new.serie like '% - %' then
      new.ano_serie := split_part(new.serie, ' - ', 1);
      new.turma := split_part(new.serie, ' - ', 2);
    else
      new.ano_serie := new.serie;
    end if;
  end if;

  -- 4.4 Sincronia de escola_id -> escola (text)
  if (tg_op = 'INSERT') or (new.escola_id is distinct from old.escola_id) then
    if new.escola_id is not null then
      select nome into esc_nome from public.escolas where id = new.escola_id;
      if esc_nome is not null then
        new.escola := esc_nome;
      end if;
    end if;
  elsif (new.escola is distinct from old.escola) and (new.escola is not null) then
    select id into esc_id from public.escolas where nome = new.escola limit 1;
    if esc_id is not null then
      new.escola_id := esc_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- 5. Aplicação do Trigger
drop trigger if exists sync_alunos_columns_trg on public.alunos;
create trigger sync_alunos_columns_trg
  before insert or update on public.alunos
  for each row execute function public.sync_alunos_columns();
