-- Migration: Políticas robustas de SELECT e INSERT para a tabela carteirinhas
-- Criado em: 25/06/2026
-- Quarteirão: [04XX] Supabase e Backend

-- 1. Garante a política de select para autenticados
drop policy if exists "Autenticados leem carteirinhas" on public.carteirinhas;
create policy "Autenticados leem carteirinhas"
  on public.carteirinhas for select
  to authenticated
  using (true);

-- 2. Garante a política de insert para autenticados
drop policy if exists "Autenticados inserem carteirinhas" on public.carteirinhas;
create policy "Autenticados inserem carteirinhas"
  on public.carteirinhas for insert
  to authenticated
  with check (true);
