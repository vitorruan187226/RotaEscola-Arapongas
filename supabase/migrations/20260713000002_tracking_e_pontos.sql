-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Tracking Ao Vivo e Pontos de Embarque
-- Objetivo: Rastreamento em tempo real e infraestrutura de paradas
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Tabela de Pontos de Embarque (Bus Stops)
create table if not exists public.pontos_embarque (
  id uuid default gen_random_uuid() primary key,
  rota_id uuid references public.rotas(id) on delete cascade not null,
  nome varchar not null,
  latitude double precision not null,
  longitude double precision not null,
  ordem int not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS nos Pontos
alter table public.pontos_embarque enable row level security;
create policy "Pontos visiveis para todos autenticados" on public.pontos_embarque for select to authenticated using (true);
create policy "Apenas admin gerencia pontos" on public.pontos_embarque for all to authenticated using (
  (select tipo_usuario from public.perfis where id = auth.uid()) in ('admin', 'semed_admin')
);

-- 2. Adicionar ponto_embarque aos Alunos
alter table public.alunos add column if not exists ponto_embarque_id uuid references public.pontos_embarque(id) on delete set null;

-- Nota: O rastreio ao vivo usa o canal de broadcast (Supabase Realtime channels) 
-- e a tabela existente `localizacao_veiculo` para persistência. 
