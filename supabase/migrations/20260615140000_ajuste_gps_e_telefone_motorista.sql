-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Adição de Telefone ao Perfil dos Usuários (para contato WhatsApp)
-- Criado em: 15/06/2026
-- Quarteirão: [04XX] Supabase e Backend
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adiciona coluna telefone na tabela public.perfis se ela não existir
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- 2. Atualiza os telefones dos motoristas de teste cadastrados
UPDATE public.perfis 
SET telefone = '43999999991' -- Carlos Alberto Silva
WHERE id = '33333333-3333-3333-3333-333333333334';

UPDATE public.perfis 
SET telefone = '43999999992' -- Marcos Vinícius Souza
WHERE id = '33333333-3333-3333-3333-333333333335';

UPDATE public.perfis 
SET telefone = '43999999993' -- Ana Julia Santos
WHERE id = '33333333-3333-3333-3333-333333333336';

UPDATE public.perfis 
SET telefone = '43999999990' -- Tio Silvio
WHERE id = '33333333-3333-3333-3333-333333333333';
