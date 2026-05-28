-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Add tag_visual to alunos + tipo_usuario to perfis + policies
-- Criado em: 28/05/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Garante colunas de compatibilidade
alter table public.perfis add column if not exists tipo_usuario text check (tipo_usuario in ('admin', 'motorista', 'responsavel'));
alter table public.perfis add column if not exists fcm_token text;
alter table public.perfis add column if not exists criado_em timestamptz default now();

alter table public.alunos add column if not exists tag_visual text;

-- Sincroniza dados legados de perfis.tipo para tipo_usuario se nulo
update public.perfis 
set tipo_usuario = case 
    when tipo::text = 'admin' then 'admin'
    when tipo::text = 'motorista' then 'motorista'
    else 'responsavel'
end
where tipo_usuario is null;

-- 2. Habilita RLS em todas as tabelas
alter table public.perfis enable row level security;
alter table public.rotas enable row level security;
alter table public.alunos enable row level security;
alter table public.logs_embarque enable row level security;

-- 3. Políticas: Acesso total para usuários autenticados
drop policy if exists "Acesso total para usuários autenticados" on public.perfis;
create policy "Acesso total para usuários autenticados" on public.perfis for all to authenticated using (true);

drop policy if exists "Acesso total para usuários autenticados" on public.rotas;
create policy "Acesso total para usuários autenticados" on public.rotas for all to authenticated using (true);

drop policy if exists "Acesso total para usuários autenticados" on public.alunos;
create policy "Acesso total para usuários autenticados" on public.alunos for all to authenticated using (true);

drop policy if exists "Acesso total para usuários autenticados" on public.logs_embarque;
create policy "Acesso total para usuários autenticados" on public.logs_embarque for all to authenticated using (true);
