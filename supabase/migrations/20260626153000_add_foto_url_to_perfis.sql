-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Adição de foto_url à tabela public.perfis
-- Criado em: 26/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona coluna foto_url na tabela public.perfis se ela não existir
ALTER TABLE public.perfis
ADD COLUMN IF NOT EXISTS foto_url TEXT;
