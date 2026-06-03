-- ============================================================
-- Migração: Criação da tabela public.ocorrencias
-- Quarteirão [04XX] | 0211_Ocorrencias
-- Data: 2026-06-03
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ocorrencias (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id     UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  motorista_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  descricao    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pendente'
               CHECK (status IN ('pendente', 'enviada_ao_pai')),
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela public.ocorrencias

-- 1. motorista_insert_ocorrencias: motorista autenticado pode inserir ocorrências que ele mesmo registrou
DROP POLICY IF EXISTS "motorista_insert_ocorrencias" ON public.ocorrencias;
CREATE POLICY "motorista_insert_ocorrencias"
  ON public.ocorrencias
  FOR INSERT
  TO authenticated
  WITH CHECK (motorista_id = auth.uid());

-- 2. motorista_select_ocorrencias: motorista autenticado pode ver as ocorrências que ele registrou
DROP POLICY IF EXISTS "motorista_select_ocorrencias" ON public.ocorrencias;
CREATE POLICY "motorista_select_ocorrencias"
  ON public.ocorrencias
  FOR SELECT
  TO authenticated
  USING (motorista_id = auth.uid());

-- 3. admin_select_all_ocorrencias: admin e secretaria podem ver todas as ocorrências
DROP POLICY IF EXISTS "admin_select_all_ocorrencias" ON public.ocorrencias;
CREATE POLICY "admin_select_all_ocorrencias"
  ON public.ocorrencias
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE perfis.id = auth.uid()
        AND perfis.tipo_usuario IN ('Admin', 'Secretaria')
    )
  );

-- 4. admin_update_ocorrencias: admin e secretaria podem atualizar ocorrências (ex: mudar status para 'enviada_ao_pai')
DROP POLICY IF EXISTS "admin_update_ocorrencias" ON public.ocorrencias;
CREATE POLICY "admin_update_ocorrencias"
  ON public.ocorrencias
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE perfis.id = auth.uid()
        AND perfis.tipo_usuario IN ('Admin', 'Secretaria')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE perfis.id = auth.uid()
        AND perfis.tipo_usuario IN ('Admin', 'Secretaria')
    )
  );

-- 5. responsavel_select_ocorrencias_filho: o responsável pelo aluno pode visualizar ocorrências de seus filhos/dependentes
DROP POLICY IF EXISTS "responsavel_select_ocorrencias_filho" ON public.ocorrencias;
CREATE POLICY "responsavel_select_ocorrencias_filho"
  ON public.ocorrencias
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.alunos
      WHERE alunos.id = ocorrencias.aluno_id
        AND alunos.responsavel_id = auth.uid()
    )
  );
