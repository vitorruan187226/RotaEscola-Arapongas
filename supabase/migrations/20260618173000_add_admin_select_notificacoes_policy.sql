-- ============================================================
-- Migração: Políticas de RLS para a tabela public.notificacoes
-- Permite que administradores, secretarias e motoristas leiam alertas
-- e que administradores e secretarias marquem alertas como lidos.
-- Data: 2026-06-18
-- ============================================================

-- 1. Permite leitura de notificações para admins, secretarias e motoristas (ex: alertas de frota/SOS/vias com aluno_id = null)
DROP POLICY IF EXISTS "Admins e motoristas leem todas as notificacoes" ON public.notificacoes;
CREATE POLICY "Admins e motoristas leem todas as notificacoes"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE perfis.id = auth.uid()
        AND perfis.tipo_usuario IN ('Admin', 'admin', 'Secretaria', 'secretaria', 'Motorista', 'motorista')
    )
  );

-- 2. Permite atualização de notificações para admins e secretarias (ex: para marcar alertas de frota como resolvidos/lidos)
DROP POLICY IF EXISTS "Admins e secretarias atualizam notificacoes" ON public.notificacoes;
CREATE POLICY "Admins e secretarias atualizam notificacoes"
  ON public.notificacoes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE perfis.id = auth.uid()
        AND perfis.tipo_usuario IN ('Admin', 'admin', 'Secretaria', 'secretaria')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE perfis.id = auth.uid()
        AND perfis.tipo_usuario IN ('Admin', 'admin', 'Secretaria', 'secretaria')
    )
  );
