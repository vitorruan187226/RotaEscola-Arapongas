-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Adição da coluna logo_url em escolas + bucket logos-escolas
-- Criado em: 18/06/2026
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona a coluna logo_url à tabela public.escolas caso não exista
alter table public.escolas add column if not exists logo_url text;

-- 2. Criação do bucket logos-escolas caso não exista
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos-escolas',
  'logos-escolas',
  true,
  2097152, -- 2MB
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do nothing;

-- 3. Criação de políticas RLS para o bucket logos-escolas
drop policy if exists "Permitir upload de logos por usuários autenticados" on storage.objects;
drop policy if exists "Permitir leitura pública de logos" on storage.objects;
drop policy if exists "Permitir atualização de logos por usuários autenticados" on storage.objects;
drop policy if exists "Permitir exclusão de logos por usuários autenticados" on storage.objects;

create policy "Permitir upload de logos por usuários autenticados"
on storage.objects for insert
to authenticated
with check (bucket_id = 'logos-escolas');

create policy "Permitir leitura pública de logos"
on storage.objects for select
to public
using (bucket_id = 'logos-escolas');

create policy "Permitir atualização de logos por usuários autenticados"
on storage.objects for update
to authenticated
using (bucket_id = 'logos-escolas')
with check (bucket_id = 'logos-escolas');

create policy "Permitir exclusão de logos por usuários autenticados"
on storage.objects for delete
to authenticated
using (bucket_id = 'logos-escolas');
