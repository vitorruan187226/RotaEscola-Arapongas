-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Adição de Séries e Tipo de Escola
-- Criado em: 11/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona as colunas tipo e series na tabela escolas
alter table public.escolas add column if not exists tipo text default 'municipal';
alter table public.escolas add column if not exists series text[] not null default '{}';

-- 2. Atualiza as escolas padrão com os dados correspondentes
update public.escolas
set tipo = 'municipal', series = '{"1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"}'
where id = 'b73e2840-7288-4682-9642-17cb25e36001';

update public.escolas
set tipo = 'estadual', series = '{"6º Ano", "7º Ano", "8º Ano", "9º Ano", "1º Grau", "2º Grau", "3º Grau"}'
where id = 'b73e2840-7288-4682-9642-17cb25e36002';

update public.escolas
set tipo = 'municipal', series = '{"1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"}'
where id = 'b73e2840-7288-4682-9642-17cb25e36003';
