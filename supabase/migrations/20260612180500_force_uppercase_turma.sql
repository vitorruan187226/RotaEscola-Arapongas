-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Forçar Turma em Maiúsculo para Padronização no Banco de Dados
-- Criado em: 12/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Recria a função de sincronização de alunos forçando o campo turma a ser sempre maiúsculo
create or replace function public.sync_alunos_columns()
returns trigger as $$
declare
  esc_nome text;
  esc_id uuid;
begin
  -- Forçar turma em maiúsculo se fornecida
  if new.turma is not null then
    new.turma := upper(new.turma);
  end if;

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
      new.turma := upper(split_part(new.serie, ' - ', 2));
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
