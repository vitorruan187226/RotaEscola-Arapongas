-- ============================================================================
-- Migração: Correção Definitiva de Políticas RLS para a tabela public.notificacoes
-- Garante que motoristas/admins consigam realizar INSERTS de alertas operacionais,
-- e reconstrói as permissões de SELECT e UPDATE para visualização no Dashboard.
-- Data: 2026-06-18
-- ============================================================================

-- Garante que o RLS está ativado
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Remove qualquer política antiga conflitante
DROP POLICY IF EXISTS "Admins e motoristas leem todas as notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Responsáveis leem notificacoes dos filhos" ON public.notificacoes;
DROP POLICY IF EXISTS "Admins e motoristas inserem notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Admins e secretarias atualizam notificacoes" ON public.notificacoes;
DROP POLICY IF EXISTS "Permite insercao para autenticados" ON public.notificacoes;
DROP POLICY IF EXISTS "Permite leitura para envolvidos" ON public.notificacoes;
DROP POLICY IF EXISTS "Permite atualizacao para admins e secretarias" ON public.notificacoes;

-- 1. Política de INSERÇÃO (Permite que qualquer usuário autenticado insira notificações)
-- Isso cobre o motorista disparando falha mecânica, bloqueio de vias ou SOS
CREATE POLICY "Permite insercao para autenticados"
  ON public.notificacoes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Política de LEITURA (SELECT)
-- - Admins, secretarias e motoristas podem visualizar qualquer notificação
-- - Responsáveis podem visualizar apenas notificações destinadas a seus filhos cadastrados
CREATE POLICY "Permite leitura para envolvidos"
  ON public.notificacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE perfis.id = auth.uid()
        AND perfis.tipo_usuario IN ('Admin', 'admin', 'Secretaria', 'secretaria', 'Motorista', 'motorista')
    )
    OR
    (aluno_id IS NOT NULL AND aluno_id IN (
      SELECT id FROM public.alunos
      WHERE responsavel_id = auth.uid()
    ))
  );

-- 3. Política de ATUALIZAÇÃO (UPDATE)
-- Admins e secretarias podem marcar alertas/notificações como lidas/resolvidas
CREATE POLICY "Permite atualizacao para admins e secretarias"
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
