-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Corrigir RPC get_dashboard_metrics para Unificar Faltas
-- Criado em: 30/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS json AS $$
DECLARE
  v_total_alunos integer;
  v_alunos_por_escola json;
  v_alunos_por_rota json;
  v_alunos_por_turno json;
  v_presencas_hoje integer;
  v_faltas_hoje integer;
  v_mais_assiduos json;
  v_mais_faltosos json;
BEGIN
  -- 1. Total de alunos
  SELECT count(*) INTO v_total_alunos FROM public.alunos;

  -- 2. Alunos por escola (ranking)
  SELECT json_agg(t) INTO v_alunos_por_escola
  FROM (
    SELECT escola, count(*) as total
    FROM public.alunos
    GROUP BY escola
    ORDER BY total DESC
  ) t;

  -- 3. Alunos por rota
  SELECT json_agg(t) INTO v_alunos_por_rota
  FROM (
    SELECT coalesce(r.codigo || ' — ' || r.nome, r.codigo, a.rota_id::text, 'Sem Rota') as rota, count(*) as total
    FROM public.alunos a
    LEFT JOIN public.rotas r ON a.rota_id::text = r.id::text
    GROUP BY a.rota_id, r.codigo, r.nome
    ORDER BY total DESC
  ) t;

  -- 4. Alunos por turno
  SELECT json_agg(t) INTO v_alunos_por_turno
  FROM (
    SELECT coalesce(turno, 'Manhã') as turno, count(*) as total
    FROM public.alunos
    GROUP BY turno
    ORDER BY total DESC
  ) t;

  -- 5. Presenças de hoje (check-in no embarque hoje - status PRESENTE na data_registro local)
  SELECT count(distinct l.aluno_id) INTO v_presencas_hoje
  FROM public.logs_embarque l
  WHERE l.data_registro = current_date AND l.status = 'PRESENTE';

  -- 6. Faltas de hoje (ausências justificadas/informadas ou registradas hoje)
  SELECT count(distinct f.aluno_id) INTO v_faltas_hoje
  FROM (
    SELECT aluno_id
    FROM public.logs_embarque
    WHERE data_registro = current_date AND status = 'AUSENTE'
    UNION
    SELECT aluno_id
    FROM public.presencas_diarias
    WHERE data_presenca = current_date AND compareceu = false
  ) f;

  -- 7. Mais assíduos (ranking de check-in com status PRESENTE)
  SELECT json_agg(t) INTO v_mais_assiduos
  FROM (
    SELECT a.nome, a.escola, count(l.id) as total_presencas
    FROM public.logs_embarque l
    JOIN public.alunos a ON l.aluno_id = a.id
    WHERE l.status = 'PRESENTE'
    GROUP BY a.id, a.nome, a.escola
    ORDER BY total_presencas DESC
    LIMIT 5
  ) t;

  -- 8. Mais faltosos (ranking de ausências unificadas de logs_embarque status='AUSENTE' e presencas_diarias compareceu=false)
  SELECT json_agg(t) INTO v_mais_faltosos
  FROM (
    SELECT a.nome, a.escola, count(f.data_falta) as total_faltas
    FROM (
      SELECT aluno_id, data_registro AS data_falta
      FROM public.logs_embarque
      WHERE status = 'AUSENTE'
      UNION
      SELECT aluno_id, data_presenca AS data_falta
      FROM public.presencas_diarias
      WHERE compareceu = false
    ) f
    JOIN public.alunos a ON f.aluno_id = a.id
    GROUP BY a.id, a.nome, a.escola
    ORDER BY total_faltas DESC
    LIMIT 5
  ) t;

  -- Retornar como JSON consolidado
  RETURN json_build_object(
    'total_alunos', coalesce(v_total_alunos, 0),
    'alunos_por_escola', coalesce(v_alunos_por_escola, '[]'::json),
    'alunos_por_rota', coalesce(v_alunos_por_rota, '[]'::json),
    'alunos_por_turno', coalesce(v_alunos_por_turno, '[]'::json),
    'presencas_hoje', coalesce(v_presencas_hoje, 0),
    'faltas_hoje', coalesce(v_faltas_hoje, 0),
    'mais_assiduos', coalesce(v_mais_assiduos, '[]'::json),
    'mais_faltosos', coalesce(v_mais_faltosos, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
