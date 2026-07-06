-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Add sentido_atual and turno_atual to rotas
-- Data: 06/07/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- Adiciona colunas para rastrear o estado em tempo real da rota ativa
alter table public.rotas add column if not exists sentido_atual text check (sentido_atual in ('IDA', 'VOLTA'));
alter table public.rotas add column if not exists turno_atual text check (turno_atual in ('Manhã', 'Tarde', 'Noite'));
