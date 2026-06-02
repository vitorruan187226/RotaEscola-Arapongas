-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Corrige RLS para Documentos Aluno e Perfis
-- Criado em: 02/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. CORREÇÃO DE RLS NA TABELA public.perfis
DROP POLICY IF EXISTS "Qualquer autenticado le perfis" ON public.perfis;
CREATE POLICY "Qualquer autenticado le perfis"
  ON public.perfis
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. HABILITAR E CONFIGURAR RLS NA TABELA public.documentos_aluno
ALTER TABLE public.documentos_aluno ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leem documentos de seus filhos" ON public.documentos_aluno;
DROP POLICY IF EXISTS "Usuarios inserem documentos de seus filhos" ON public.documentos_aluno;

CREATE POLICY "Usuarios leem documentos de seus filhos"
  ON public.documentos_aluno
  FOR SELECT
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    EXISTS (
      SELECT 1 FROM public.alunos 
      WHERE alunos.id = documentos_aluno.aluno_id 
        AND alunos.responsavel_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios inserem documentos de seus filhos"
  ON public.documentos_aluno
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    EXISTS (
      SELECT 1 FROM public.alunos 
      WHERE alunos.id = aluno_id 
        AND alunos.responsavel_id = auth.uid()
    )
  );
