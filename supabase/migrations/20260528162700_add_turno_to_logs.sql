-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Add column turno (Matutino, Vespertino, Noturno) to logs_embarque
-- Criado em: 28/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.logs_embarque add column if not exists turno text check (turno in ('Matutino', 'Vespertino', 'Noturno'));
