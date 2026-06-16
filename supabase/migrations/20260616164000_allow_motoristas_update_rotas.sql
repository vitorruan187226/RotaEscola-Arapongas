-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Permitir que motoristas atualizem o status de suas próprias rotas
-- Criado em: 16/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Permite que motoristas atualizem o status ativa de suas próprias rotas
drop policy if exists "Motoristas atualizam suas proprias rotas" on public.rotas;
create policy "Motoristas atualizam suas proprias rotas"
  on public.rotas for update
  to authenticated
  using (
    motorista_id = auth.uid()
  )
  with check (
    motorista_id = auth.uid()
  );
