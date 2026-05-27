-- Migration: Adicionar responsavel_id na tabela alunos e configurar politica de RLS
-- Criado em: 27/05/2026

-- 1. Cria a coluna responsavel_id se ela nao existir
do $$
begin
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'alunos' and column_name = 'responsavel_id'
  ) then
    alter table alunos add column responsavel_id uuid references auth.users(id) on delete set null;
  end if;
end $$;

-- 2. Habilita RLS na tabela alunos
alter table alunos enable row level security;

-- 3. Cria a politica RLS (se ja existir, recria)
drop policy if exists "Pais podem ver apenas os dados do próprio filho" on alunos;

create policy "Pais podem ver apenas os dados do próprio filho"
  on alunos
  for select
  using (auth.uid() = responsavel_id);

-- 4. Exemplo de insercao/update para vinculacao de testes
-- UPDATE alunos SET responsavel_id = 'id-do-usuario-responsavel' WHERE id = 'id-do-aluno';
