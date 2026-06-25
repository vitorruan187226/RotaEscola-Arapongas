-- Migration: Adicionar data_vencimento e RLS update para carteirinhas
-- Criado em: 25/06/2026
-- Quarteirão: [04XX] Supabase e Backend

-- 1. Adiciona a coluna data_vencimento com valor padrão de 1 ano a partir de hoje
alter table public.carteirinhas add column if not exists data_vencimento timestamptz default (now() + interval '1 year');

-- 2. Adiciona a política de atualização para permitir que admins/secretaria simulem e alterem o vencimento no painel
drop policy if exists "Autenticados atualizam carteirinhas" on public.carteirinhas;
create policy "Autenticados atualizam carteirinhas"
  on public.carteirinhas for update
  to authenticated
  using (true)
  with check (true);
