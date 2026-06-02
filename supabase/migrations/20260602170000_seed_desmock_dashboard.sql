-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: População de Dados (Seed) para Desmockar o Dashboard do Admin
-- Criado em: 02/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Inserir motoristas no auth.users do GoTrue (necessário para a chave estrangeira)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current)
VALUES 
  ('33333333-3333-3333-3333-333333333334', 'carlos@rotaescola.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"nome":"Carlos Alberto Silva","role":"motorista"}', NOW(), NOW(), '', '', '', ''),
  ('33333333-3333-3333-3333-333333333335', 'marcos@rotaescola.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"nome":"Marcos Vinícius Souza","role":"motorista"}', NOW(), NOW(), '', '', '', ''),
  ('33333333-3333-3333-3333-333333333336', 'anajulia@rotaescola.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"nome":"Ana Julia Santos","role":"motorista"}', NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir os perfis de motoristas correspondentes na tabela public.perfis
INSERT INTO public.perfis (id, nome, tipo_usuario)
VALUES 
  ('33333333-3333-3333-3333-333333333334', 'Carlos Alberto Silva', 'Motorista'),
  ('33333333-3333-3333-3333-333333333335', 'Marcos Vinícius Souza', 'Motorista'),
  ('33333333-3333-3333-3333-333333333336', 'Ana Julia Santos', 'Motorista')
ON CONFLICT (id) DO UPDATE SET 
  nome = EXCLUDED.nome,
  tipo_usuario = EXCLUDED.tipo_usuario;

-- 3. Associar motoristas e veículos às rotas existentes
UPDATE public.rotas 
SET motorista_id = '33333333-3333-3333-3333-333333333334'::uuid,
    veiculo_id = 'a73e2840-7288-4682-9642-17cb25e36502'::uuid -- Ônibus AAA-9988
WHERE codigo = 'RT-04';

UPDATE public.rotas 
SET motorista_id = '33333333-3333-3333-3333-333333333335'::uuid,
    veiculo_id = 'a73e2840-7288-4682-9642-17cb25e36502'::uuid -- Ônibus AAA-9988
WHERE codigo = 'RT-04-T';

UPDATE public.rotas 
SET motorista_id = '33333333-3333-3333-3333-333333333336'::uuid,
    veiculo_id = 'a73e2840-7288-4682-9642-17cb25e36501'::uuid -- Van BEX-1234
WHERE codigo = 'RT-22';

UPDATE public.rotas 
SET motorista_id = '33333333-3333-3333-3333-333333333333'::uuid -- Tio Silvio
WHERE codigo = 'RT-TESTE';

-- 4. Inserir logs de embarque recentes vinculados aos alunos e rotas reais (formato de movimento: 'Ida' ou 'Volta')
INSERT INTO public.logs_embarque (id, aluno_id, motorista_id, rota_id, tipo_movimento, criado_em)
VALUES
  (
    gen_random_uuid(),
    'a73e2840-7288-4682-9642-17cb25e36102', -- Felipe Nascimento Torres
    '33333333-3333-3333-3333-333333333334', -- Carlos Alberto Silva
    '9d0f2832-7288-4682-9642-17cb25e36928', -- Rota 04
    'Ida',
    NOW() - INTERVAL '10 minutes'
  ),
  (
    gen_random_uuid(),
    'a73e2840-7288-4682-9642-17cb25e36105', -- Pedro Henrique Silva
    '33333333-3333-3333-3333-333333333334', -- Carlos Alberto Silva
    '9d0f2832-7288-4682-9642-17cb25e36928', -- Rota 04
    'Ida',
    NOW() - INTERVAL '8 minutes'
  ),
  (
    gen_random_uuid(),
    'a73e2840-7288-4682-9642-17cb25e36101', -- Mariana Costa Souza
    '33333333-3333-3333-3333-333333333336', -- Ana Julia Santos
    'b63e2840-7288-4682-9642-17cb25e36004', -- Rota 22
    'Ida',
    NOW() - INTERVAL '5 minutes'
  ),
  (
    gen_random_uuid(),
    'a73e2840-7288-4682-9642-17cb25e36103', -- Beatriz Martins Nogueira
    '33333333-3333-3333-3333-333333333336', -- Ana Julia Santos
    'b63e2840-7288-4682-9642-17cb25e36004', -- Rota 22
    'Ida',
    NOW() - INTERVAL '4 minutes'
  ),
  (
    gen_random_uuid(),
    'a73e2840-7288-4682-9642-17cb25e36104', -- Thiago Martins Nogueira
    '33333333-3333-3333-3333-333333333335', -- Marcos Vinícius Souza
    '8a723821-3928-4444-9123-ab39d1b0d777', -- Rota 04 (Tarde)
    'Volta',
    NOW() - INTERVAL '1 day' - INTERVAL '4 hours'
  )
ON CONFLICT (id) DO NOTHING;
