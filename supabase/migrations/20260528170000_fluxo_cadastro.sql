-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Fluxo de Cadastro Seguro (Responsáveis)
-- Criado em: 28/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Garante que as colunas cpf e telefone existam na tabela pública perfis
alter table public.perfis add column if not exists cpf text;
alter table public.perfis add column if not exists telefone text;

-- 2. Cria índice para busca rápida por CPF
create index if not exists idx_perfis_cpf on public.perfis(cpf);

-- 3. Atualiza ou recria a função de trigger para sincronização de novos cadastros
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.perfis (auth_user_id, nome, email, tipo, tipo_usuario, telefone, cpf)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::tipo_usuario, (new.raw_user_meta_data->>'tipo')::tipo_usuario, 'responsavel'::tipo_usuario),
    coalesce(new.raw_user_meta_data->>'role', new.raw_user_meta_data->>'tipo', 'responsavel'),
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'cpf'
  );
  return new;
end;
$$;

-- 4. Garante que a trigger esteja ativa no auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Backfill de CPFs antigos com base nos e-mails mockados (formato cpf@rotaescola.com)
update public.perfis
set cpf = substring(email from '^([0-9]{11})@')
where cpf is null and email ~ '^[0-9]{11}@';

-- 6. Função RPC check_cpf_exists para validar duplicidade no client-side de forma pública
create or replace function public.check_cpf_exists(cpf_to_check text)
returns boolean
security definer
language plpgsql
as $$
begin
  return exists(
    select 1 from public.perfis where cpf = cpf_to_check
  );
end;
$$;

-- 7. Função RPC get_email_by_cpf para resolução de CPF no servidor
create or replace function public.get_email_by_cpf(cpf_to_find text)
returns text
security definer
language plpgsql
as $$
begin
  return (
    select email from public.perfis where cpf = cpf_to_find limit 1
  );
end;
$$;
