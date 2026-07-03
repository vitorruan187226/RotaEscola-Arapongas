-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Remediação Crítica de Segurança — RLS, Storage e Índices
-- Criado em: 03/07/2026
-- Canteiro: F1 (01_DB_RLS.md) — Onda 1
-- Quarteirão: [04XX] Supabase e Backend
--
-- Corrige:
--   L-02: Motorista vê TODOS os alunos (deve ver apenas os da sua rota)
--   L-02: Perfis com USING(true) expõe CPFs de todos
--   L-02: RPC get_email_by_cpf e check_cpf_exists públicas (harvesting)
--   L-09: Buckets de documentos de menores criados como públicos
--   L-01: Índices ausentes em alunos e localizacao_veiculo
-- ══════════════════════════════════════════════════════════════════════════════

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 1. CORREÇÃO DE RLS — TABELA ALUNOS                                     ║
-- ║ Problema: motorista com USING(true) vê TODOS os alunos do banco.       ║
-- ║ Fix: motorista vê apenas alunos vinculados à rota que ele gerencia.    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 1.1 Dropar políticas antigas permissivas
DROP POLICY IF EXISTS "Usuarios leem alunos de acordo com seu papel" ON public.alunos;
DROP POLICY IF EXISTS "Usuarios atualizam alunos de acordo com seu papel" ON public.alunos;
DROP POLICY IF EXISTS "Usuarios inserem alunos de acordo com seu papel" ON public.alunos;
DROP POLICY IF EXISTS "Admins excluem alunos" ON public.alunos;

-- 1.2 Nova política de SELECT — motorista restrito à sua rota
CREATE POLICY "alunos_select_por_papel"
  ON public.alunos
  FOR SELECT
  TO authenticated
  USING (
    -- Admins e Secretaria: acesso total
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
    ) IN ('Admin', 'admin', 'Secretaria', 'secretaria')
    OR
    -- Motorista: APENAS alunos da rota que ele gerencia (via tabela rotas)
    (
      coalesce(
        auth.jwt() -> 'user_metadata' ->> 'role',
        auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
      ) IN ('Motorista', 'motorista')
      AND rota_id IN (
        SELECT r.id FROM public.rotas r
        WHERE r.motorista_id = auth.uid()
      )
    )
    OR
    -- Responsável: apenas seus próprios filhos
    auth.uid() = responsavel_id
  );

-- 1.3 Nova política de UPDATE — admin e responsável (próprios filhos)
CREATE POLICY "alunos_update_por_papel"
  ON public.alunos
  FOR UPDATE
  TO authenticated
  USING (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
    ) IN ('Admin', 'admin', 'Secretaria', 'secretaria')
    OR auth.uid() = responsavel_id
  )
  WITH CHECK (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
    ) IN ('Admin', 'admin', 'Secretaria', 'secretaria')
    OR auth.uid() = responsavel_id
  );

-- 1.4 Nova política de INSERT — admin e responsável (vinculando a si)
CREATE POLICY "alunos_insert_por_papel"
  ON public.alunos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
    ) IN ('Admin', 'admin', 'Secretaria', 'secretaria')
    OR auth.uid() = responsavel_id
  );

-- 1.5 Nova política de DELETE — apenas admin
CREATE POLICY "alunos_delete_admin"
  ON public.alunos
  FOR DELETE
  TO authenticated
  USING (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
    ) IN ('Admin', 'admin')
  );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 2. CORREÇÃO DE RLS — TABELA PERFIS                                     ║
-- ║ Problema: USING(true) expõe CPFs e telefones de todos os usuários.     ║
-- ║ Fix: cada autenticado vê apenas seu próprio perfil, admin vê todos.    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

DROP POLICY IF EXISTS "Qualquer autenticado le perfis" ON public.perfis;

CREATE POLICY "perfis_select_restrito"
  ON public.perfis
  FOR SELECT
  TO authenticated
  USING (
    -- Usuário vê seu próprio perfil
    auth.uid() = id
    OR
    -- Admins e Secretaria veem todos os perfis
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
    ) IN ('Admin', 'admin', 'Secretaria', 'secretaria')
    OR
    -- Motorista pode ver perfis dos responsáveis dos seus alunos (para contato)
    (
      coalesce(
        auth.jwt() -> 'user_metadata' ->> 'role',
        auth.jwt() -> 'user_metadata' ->> 'tipo_usuario'
      ) IN ('Motorista', 'motorista')
      AND id IN (
        SELECT a.responsavel_id FROM public.alunos a
        WHERE a.rota_id IN (
          SELECT r.id FROM public.rotas r WHERE r.motorista_id = auth.uid()
        )
      )
    )
  );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 3. REVOGAR RPCs PÚBLICAS DE ENUMERAÇÃO DE CPF                         ║
-- ║ Problema: get_email_by_cpf e check_cpf_exists são SECURITY DEFINER     ║
-- ║   e podem ser chamadas publicamente, permitindo harvesting de CPFs.    ║
-- ║ Fix: revogar EXECUTE de anon e public; manter apenas service_role.     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 3.1 Revogar acesso público à RPC get_email_by_cpf
REVOKE EXECUTE ON FUNCTION public.get_email_by_cpf(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_email_by_cpf(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_email_by_cpf(text) FROM authenticated;

-- 3.2 Revogar acesso público à RPC check_cpf_exists
REVOKE EXECUTE ON FUNCTION public.check_cpf_exists(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_cpf_exists(text) FROM public;
REVOKE EXECUTE ON FUNCTION public.check_cpf_exists(text) FROM authenticated;

-- Nota: essas funções continuam acessíveis via service_role (usada pelo
-- backend Next.js em /api/auth/login e /api/auth/cadastro).


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 4. TORNAR BUCKETS DE DOCUMENTOS PRIVADOS                              ║
-- ║ Problema: documentos-alunos e documentos-transporte são public=true.   ║
-- ║ Fix: tornar privados + revogar políticas de SELECT público.            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 4.1 Tornar buckets privados
UPDATE storage.buckets SET public = false WHERE id = 'documentos-alunos';
UPDATE storage.buckets SET public = false WHERE id = 'documentos-transporte';

-- 4.2 Dropar políticas de leitura pública irrestrita
DROP POLICY IF EXISTS "Permitir leitura pública de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de documentos-alunos" ON storage.objects;

-- 4.3 Nova política de leitura: apenas autenticados leem documentos
CREATE POLICY "documentos_select_autenticado"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('documentos-alunos', 'documentos-transporte')
  );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 5. CRIAR ÍNDICES DE PERFORMANCE AUSENTES                              ║
-- ║ L-01: alunos(responsavel_id), alunos(rota_id),                         ║
-- ║       localizacao_veiculo(rota_id, atualizado_em DESC)                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE INDEX IF NOT EXISTS idx_alunos_responsavel
  ON public.alunos(responsavel_id);

CREATE INDEX IF NOT EXISTS idx_alunos_rota
  ON public.alunos(rota_id);

CREATE INDEX IF NOT EXISTS idx_localizacao_rota_tempo
  ON public.localizacao_veiculo(rota_id, atualizado_em DESC);
