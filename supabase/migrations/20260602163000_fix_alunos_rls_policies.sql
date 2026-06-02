-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Ajuste de Políticas de RLS na Tabela Alunos para SEMED e Motoristas
-- Criado em: 02/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Habilitar RLS na tabela alunos (caso não esteja habilitado)
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas existentes
DROP POLICY IF EXISTS "Pais podem ver apenas os dados do próprio filho" ON public.alunos;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.alunos;
DROP POLICY IF EXISTS "Usuarios leem alunos de acordo com seu papel" ON public.alunos;
DROP POLICY IF EXISTS "Usuarios atualizam alunos de acordo com seu papel" ON public.alunos;
DROP POLICY IF EXISTS "Usuarios inserem alunos de acordo com seu papel" ON public.alunos;
DROP POLICY IF EXISTS "Admins excluem alunos" ON public.alunos;

-- 3. Criar nova política de SELECT
CREATE POLICY "Usuarios leem alunos de acordo com seu papel"
  ON public.alunos
  FOR SELECT
  TO authenticated
  USING (
    -- Admins têm acesso total
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    -- Motoristas têm acesso total (para verificar quem embarca e listas de chamada)
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Motorista', 'motorista')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Motorista', 'motorista')) OR
    -- Responsáveis (Pais) só veem seus próprios filhos
    (auth.uid() = responsavel_id)
  );

-- 4. Criar nova política de UPDATE
CREATE POLICY "Usuarios atualizam alunos de acordo com seu papel"
  ON public.alunos
  FOR UPDATE
  TO authenticated
  USING (
    -- Admins têm permissão total de alteração
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    -- Responsáveis podem atualizar os dados dos seus próprios filhos (foto, etc.)
    (auth.uid() = responsavel_id)
  )
  WITH CHECK (
    -- Admins têm permissão total de alteração
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    -- Responsáveis podem atualizar apenas registros dos seus próprios filhos
    (auth.uid() = responsavel_id)
  );

-- 5. Criar nova política de INSERT
CREATE POLICY "Usuarios inserem alunos de acordo com seu papel"
  ON public.alunos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admins podem inserir novos alunos
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    -- Responsáveis podem inserir apenas vinculando a si mesmos
    (auth.uid() = responsavel_id)
  );

-- 6. Criar nova política de DELETE
CREATE POLICY "Admins excluem alunos"
  ON public.alunos
  FOR DELETE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin'))
  );
