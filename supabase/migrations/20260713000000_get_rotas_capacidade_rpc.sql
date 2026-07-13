-- Migration: Create RPC to get routes with their capacities and current occupancy
-- Created for: Gerenciamento de Capacidade (Dashboard Secretaria)

CREATE OR REPLACE FUNCTION public.get_rotas_capacidade()
RETURNS TABLE (
  id uuid,
  codigo text,
  nome text,
  status text,
  veiculo_id uuid,
  capacidade_veiculo integer,
  alunos_vinculados integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.codigo,
    r.nome,
    r.status,
    r.veiculo_id,
    COALESCE(v.capacidade, 0) as capacidade_veiculo,
    (SELECT count(*)::int FROM public.alunos a WHERE a.rota_id = r.id AND a.status_carteirinha = 'Aprovado') as alunos_vinculados
  FROM public.rotas r
  LEFT JOIN public.veiculos v ON r.veiculo_id = v.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
