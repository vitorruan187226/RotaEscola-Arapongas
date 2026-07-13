-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Proteção de Buckets de Armazenamento e RLS
-- Objetivo: Fechar acesso público e aplicar restrições de segurança
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Tornar o bucket documentos-alunos PRIVADO
update storage.buckets
set public = false
where id = 'documentos-alunos';

-- 2. Remover a política antiga e super permissiva ("public")
drop policy if exists "Permitir leitura pública de documentos-alunos" on storage.objects;

-- 3. Criar nova política permitindo select apenas para usuários autenticados
create policy "Permitir leitura de documentos-alunos por usuarios autenticados"
on storage.objects for select
to authenticated
using (bucket_id = 'documentos-alunos');

-- Nota: Estamos mantendo o acesso genérico `authenticated` para que a secretaria 
-- consiga analisar (dashboard/admin), bem como o próprio responsável 
-- (dashboard/responsavel) consiga baixar seus próprios envios.
