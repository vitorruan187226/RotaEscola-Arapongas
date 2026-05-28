-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Tabela perfis (criação completa) + coluna fcm_token
-- Criado em: 28/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- ═══ Tabela: perfis ═══
-- Armazena o perfil estendido do usuário autenticado.
-- Vinculada a auth.users(id) como chave primária.
-- Usada para determinar tipo_usuario (Secretaria, Responsável, Motorista, Admin)
-- e para armazenar o fcm_token do dispositivo para push notifications.
create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  tipo_usuario text not null default 'Responsável'
    check (tipo_usuario in ('Admin', 'Secretaria', 'Motorista', 'Responsável')),
  fcm_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilita RLS
alter table perfis enable row level security;

-- Cada usuário pode ler apenas seu próprio perfil
drop policy if exists "Usuarios leem proprio perfil" on perfis;
create policy "Usuarios leem proprio perfil"
  on perfis for select
  using (auth.uid() = id);

-- Cada usuário pode atualizar apenas seu próprio perfil (ex: salvar fcm_token)
drop policy if exists "Usuarios atualizam proprio perfil" on perfis;
create policy "Usuarios atualizam proprio perfil"
  on perfis for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin pode ler todos os perfis (para gestão)
drop policy if exists "Admin le todos perfis" on perfis;
create policy "Admin le todos perfis"
  on perfis for select
  using (
    exists (
      select 1 from perfis p
      where p.id = auth.uid() and p.tipo_usuario = 'Admin'
    )
  );
