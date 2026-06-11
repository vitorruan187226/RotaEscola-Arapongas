-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Add cnh and cnh_categoria to motoristas_perfil
-- Criado em: 11/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- Adiciona as colunas cnh e cnh_categoria na tabela public.motoristas_perfil
alter table public.motoristas_perfil add column if not exists cnh text;
alter table public.motoristas_perfil add column if not exists cnh_categoria text;
