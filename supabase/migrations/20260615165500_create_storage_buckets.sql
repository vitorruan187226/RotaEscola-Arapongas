-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Criação dos Buckets de Armazenamento e Políticas RLS
-- Criado em: 15/06/2026
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Criação do bucket documentos-transporte caso não exista
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos-transporte',
  'documentos-transporte',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- 2. Criação do bucket documentos-alunos caso não exista
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos-alunos',
  'documentos-alunos',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- 3. Criação de políticas RLS para o bucket documentos-transporte
drop policy if exists "Permitir upload de documentos por usuários autenticados" on storage.objects;
drop policy if exists "Permitir leitura pública de documentos" on storage.objects;
drop policy if exists "Permitir atualização de documentos pelo proprietário" on storage.objects;
drop policy if exists "Permitir exclusão de documentos pelo proprietário" on storage.objects;

create policy "Permitir upload de documentos por usuários autenticados"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documentos-transporte');

create policy "Permitir leitura pública de documentos"
on storage.objects for select
to public
using (bucket_id = 'documentos-transporte');

create policy "Permitir atualização de documentos pelo proprietário"
on storage.objects for update
to authenticated
using (bucket_id = 'documentos-transporte')
with check (bucket_id = 'documentos-transporte');

create policy "Permitir exclusão de documentos pelo proprietário"
on storage.objects for delete
to authenticated
using (bucket_id = 'documentos-transporte');

-- 4. Criação de políticas RLS para o bucket documentos-alunos
drop policy if exists "Permitir upload de documentos-alunos por usuários autenticados" on storage.objects;
drop policy if exists "Permitir leitura pública de documentos-alunos" on storage.objects;
drop policy if exists "Permitir atualização de documentos-alunos pelo proprietário" on storage.objects;
drop policy if exists "Permitir exclusão de documentos-alunos pelo proprietário" on storage.objects;

create policy "Permitir upload de documentos-alunos por usuários autenticados"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documentos-alunos');

create policy "Permitir leitura pública de documentos-alunos"
on storage.objects for select
to public
using (bucket_id = 'documentos-alunos');

create policy "Permitir atualização de documentos-alunos pelo proprietário"
on storage.objects for update
to authenticated
using (bucket_id = 'documentos-alunos')
with check (bucket_id = 'documentos-alunos');

create policy "Permitir exclusão de documentos-alunos pelo proprietário"
on storage.objects for delete
to authenticated
using (bucket_id = 'documentos-alunos');
