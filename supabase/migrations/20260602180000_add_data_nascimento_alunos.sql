-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Adiciona coluna data_nascimento na tabela alunos
-- Criado em: 02/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona a coluna data_nascimento na tabela alunos (se não existir)
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS data_nascimento DATE;
