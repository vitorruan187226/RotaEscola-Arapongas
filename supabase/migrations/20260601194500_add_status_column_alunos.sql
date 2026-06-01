-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Adiciona coluna status de suporte operacional na tabela alunos
-- Criado em: 01/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona a coluna status na tabela alunos (se não existir)
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'alunos' and column_name = 'status'
  ) then
    alter table public.alunos add column status text not null default 'Em análise'
      check (status in ('Pendente', 'Em análise', 'Aprovado', 'Rejeitado'));
  end if;
end $$;

-- 2. Backfill de dados: Sincroniza a nova coluna status com base na coluna legada status_carteirinha
update public.alunos
set status = case 
  when status_carteirinha = 'Pendente' then 'Rejeitado'
  when status_carteirinha = 'Aprovado' then 'Aprovado'
  else 'Em análise'
end
where status is null or status = 'Em análise';
