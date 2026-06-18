-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Adição da coluna endereco em alunos
-- Criado em: 18/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona a coluna endereco à tabela public.alunos caso não exista
alter table public.alunos add column if not exists endereco text;
