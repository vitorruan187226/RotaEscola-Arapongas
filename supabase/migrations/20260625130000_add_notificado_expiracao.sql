-- Migration: Adicionar coluna notificado_expiracao na tabela carteirinhas
-- Criado em: 25/06/2026
-- Quarteirão: [04XX] Supabase e Backend

alter table public.carteirinhas add column if not exists notificado_expiracao boolean default false;
