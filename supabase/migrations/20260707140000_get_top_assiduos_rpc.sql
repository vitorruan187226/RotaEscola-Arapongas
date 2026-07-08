-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Create RPC to get top assiduos IDs
-- Data: 07/07/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_top_assiduos_ids()
RETURNS TABLE(aluno_id uuid, total_presencas bigint) AS $$
DECLARE
  v_max_presences bigint;
BEGIN
  -- Identifica o maior número de presenças no sistema (apenas se for >= 20)
  SELECT count(l.id) INTO v_max_presences
  FROM public.logs_embarque l
  WHERE l.status = 'PRESENTE'
  GROUP BY l.aluno_id
  HAVING count(l.id) >= 20
  ORDER BY count(l.id) DESC
  LIMIT 1;

  -- Se houver algum registro (e >= 20), retorna até 2 alunos que empatam no 1º lugar, desempate alfabético
  IF v_max_presences IS NOT NULL THEN
    RETURN QUERY
    SELECT l.aluno_id, count(l.id) as total_presencas
    FROM public.logs_embarque l
    JOIN public.alunos a ON l.aluno_id = a.id
    WHERE l.status = 'PRESENTE'
    GROUP BY l.aluno_id, a.nome
    HAVING count(l.id) = v_max_presences
    ORDER BY a.nome ASC
    LIMIT 2;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
