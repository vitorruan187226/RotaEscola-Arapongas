-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Corrigir RLS logs_embarque + RPC get_dashboard_metrics
-- Criado em: 17/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Habilitar RLS em logs_embarque (garantia)
alter table public.logs_embarque enable row level security;

-- 2. Limpar políticas RLS antigas e duplicadas na tabela logs_embarque
drop policy if exists "Motoristas registram embarque" on public.logs_embarque;
drop policy if exists "Motoristas registram embarques em logs_embarque" on public.logs_embarque;
drop policy if exists "Pais veem logs dos filhos" on public.logs_embarque;
drop policy if exists "Pais leem logs de seus filhos em logs_embarque" on public.logs_embarque;
drop policy if exists "Acesso total para usuários autenticados" on public.logs_embarque;

-- 3. Criar política de SELECT para Admins e Motoristas (geral)
create policy "Admins e motoristas leem todos os logs"
  on public.logs_embarque for select
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('admin', 'Admin', 'motorista', 'Motorista')
    )
  );

-- 4. Criar política de SELECT para Responsáveis (Pais) limitada aos próprios filhos
create policy "Pais leem logs de seus filhos"
  on public.logs_embarque for select
  to authenticated
  using (
    aluno_id in (
      select id from public.alunos where responsavel_id = auth.uid()
    )
  );

-- 5. Criar política de INSERT para Motoristas e Admins (com validação flexível de capitalização)
create policy "Motoristas e admins inserem logs"
  on public.logs_embarque for insert
  to authenticated
  with check (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and tipo_usuario in ('admin', 'Admin', 'motorista', 'Motorista')
    )
  );


-- 6. Recriar a função RPC de métricas do dashboard corrigindo o bug de comparação date = text e filtros
create or replace function public.get_dashboard_metrics()
returns json as $$
declare
  v_total_alunos integer;
  v_alunos_por_escola json;
  v_alunos_por_rota json;
  v_alunos_por_turno json;
  v_presencas_hoje integer;
  v_faltas_hoje integer;
  v_mais_assiduos json;
  v_mais_faltosos json;
begin
  -- 1. Total de alunos
  select count(*) into v_total_alunos from public.alunos;

  -- 2. Alunos por escola (ranking)
  select json_agg(t) into v_alunos_por_escola
  from (
    select escola, count(*) as total
    from public.alunos
    group by escola
    order by total desc
  ) t;

  -- 3. Alunos por rota
  select json_agg(t) into v_alunos_por_rota
  from (
    select coalesce(r.codigo || ' — ' || r.nome, r.codigo, a.rota_id::text, 'Sem Rota') as rota, count(*) as total
    from public.alunos a
    left join public.rotas r on a.rota_id::text = r.id::text
    group by a.rota_id, r.codigo, r.nome
    order by total desc
  ) t;

  -- 4. Alunos por turno
  select json_agg(t) into v_alunos_por_turno
  from (
    select coalesce(turno, 'Manhã') as turno, count(*) as total
    from public.alunos
    group by turno
    order by total desc
  ) t;

  -- 5. Presenças de hoje (check-in no embarque hoje - status PRESENTE na data_registro local)
  select count(distinct l.aluno_id) into v_presencas_hoje
  from public.logs_embarque l
  where l.data_registro = current_date and l.status = 'PRESENTE';

  -- 6. Faltas de hoje (ausências justificadas/informadas ou registradas hoje)
  select count(distinct f.aluno_id) into v_faltas_hoje
  from (
    select aluno_id
    from public.logs_embarque
    where data_registro = current_date and status = 'AUSENTE'
    union
    select aluno_id
    from public.presencas_diarias
    where data_presenca = current_date and compareceu = false
  ) f;

  -- 7. Mais assíduos (ranking de check-in com status PRESENTE)
  select json_agg(t) into v_mais_assiduos
  from (
    select a.nome, a.escola, count(l.id) as total_presencas
    from public.logs_embarque l
    join public.alunos a on l.aluno_id = a.id
    where l.status = 'PRESENTE'
    group by a.id, a.nome, a.escola
    order by total_presencas desc
    limit 5
  ) t;

  -- 8. Mais faltosos (ranking de ausências registradas por motorista ou notificadas por responsáveis)
  select json_agg(t) into v_mais_faltosos
  from (
    select a.nome, a.escola, count(f.data_falta) as total_faltas
    from (
      select aluno_id, data_registro as data_falta
      from public.logs_embarque
      where status = 'AUSENTE'
      union
      select aluno_id, data_presenca as data_falta
      from public.presencas_diarias
      where compareceu = false
    ) f
    join public.alunos a on f.aluno_id = a.id
    group by a.id, a.nome, a.escola
    order by total_faltas desc
    limit 5
  ) t;

  -- Retornar como JSON consolidado
  return json_build_object(
    'total_alunos', coalesce(v_total_alunos, 0),
    'alunos_por_escola', coalesce(v_alunos_por_escola, '[]'::json),
    'alunos_por_rota', coalesce(v_alunos_por_rota, '[]'::json),
    'alunos_por_turno', coalesce(v_alunos_por_turno, '[]'::json),
    'presencas_hoje', coalesce(v_presencas_hoje, 0),
    'faltas_hoje', coalesce(v_faltas_hoje, 0),
    'mais_assiduos', coalesce(v_mais_assiduos, '[]'::json),
    'mais_faltosos', coalesce(v_mais_faltosos, '[]'::json)
  );
end;
$$ language plpgsql security definer;
