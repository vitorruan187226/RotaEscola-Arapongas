-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Add status and data_registro columns to logs_embarque
-- Criado em: 28/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Garante as colunas status e data_registro na tabela logs_embarque
alter table public.logs_embarque add column if not exists status text check (status in ('PRESENTE', 'AUSENTE'));
alter table public.logs_embarque add column if not exists data_registro date default current_date not null;

-- 2. Atualiza os registros existentes (se houver) para 'PRESENTE' como padrão
update public.logs_embarque set status = 'PRESENTE' where status is null;
