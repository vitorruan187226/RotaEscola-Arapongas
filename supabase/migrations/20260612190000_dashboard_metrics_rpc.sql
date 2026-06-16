-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: RPC para Métricas Consolidadas do Dashboard de Alunos
-- Criado em: 12/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

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

  -- 5. Presenças de hoje (check-in no embarque hoje)
  select count(distinct l.aluno_id) into v_presencas_hoje
  from public.logs_embarque l
  where l.criado_em::date = current_date;

  -- 6. Faltas de hoje (ausências justificadas/informadas hoje)
  select count(distinct p.aluno_id) into v_faltas_hoje
  from public.presencas_diarias p
  where p.data_presenca = current_date and p.compareceu = false;

  -- 7. Mais assíduos (ranking de check-in)
  select json_agg(t) into v_mais_assiduos
  from (
    select a.nome, a.escola, count(l.id) as total_presencas
    from public.logs_embarque l
    join public.alunos a on l.aluno_id = a.id
    group by a.id, a.nome, a.escola
    order by total_presencas desc
    limit 5
  ) t;

  -- 8. Mais faltosos (ranking de ausências justificadas ou registradas)
  select json_agg(t) into v_mais_faltosos
  from (
    select a.nome, a.escola, count(p.aluno_id) as total_faltas
    from public.presencas_diarias p
    join public.alunos a on p.aluno_id = a.id
    where p.compareceu = false
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
