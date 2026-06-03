-- Migration: 20260602200000_add_senha_alterada_perfis.sql
-- Adiciona campo de controle de primeiro acesso para motoristas

ALTER TABLE public.perfis
  ADD COLUMN IF NOT EXISTS senha_alterada BOOLEAN NOT NULL DEFAULT FALSE;

-- Usuários não-motoristas (admins, responsáveis, secretaria) não precisam trocar senha
UPDATE public.perfis
  SET senha_alterada = TRUE
  WHERE tipo_usuario != 'Motorista';

-- O motorista mock de desenvolvimento (CPF 33333333333) já tem senha customizada
UPDATE public.perfis
  SET senha_alterada = TRUE
  WHERE cpf = '33333333333';
