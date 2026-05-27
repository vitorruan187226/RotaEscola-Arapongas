# Relação Alunos-Responsáveis e Políticas RLS (0402)

## Propósito
Este documento detalha o ajuste estrutural no banco de dados Supabase para viabilizar a segurança em nível de linha (RLS) para o Portal dos Pais, garantindo que os responsáveis só tenham acesso de visualização aos dados cadastrais e carteirinhas digitais de seus próprios filhos.

## Alterações de Esquema (DDL)

### 1. Injeção de Relação na Tabela `alunos`
Para vincular o estudante ao seu respectivo guardião ou responsável legal no Supabase Auth (`auth.users`), adicionamos a coluna `responsavel_id`:
```sql
alter table alunos add column responsavel_id uuid references auth.users(id) on delete set null;
```

### 2. Ativação de Row Level Security (RLS)
Garantimos que a tabela alunos tenha as restrições de RLS ativadas antes de aplicar as regras de controle de acesso:
```sql
alter table alunos enable row level security;
```

### 3. Política de Segurança RLS
Criamos uma regra dedicada que restringe consultas do tipo `SELECT` baseando-se no ID do usuário atualmente autenticado (`auth.uid()`):
- **Nome da política:** `"Pais podem ver apenas os dados do próprio filho"`
- **Ação:** `SELECT`
- **Condição:** `auth.uid() = responsavel_id`

```sql
create policy "Pais podem ver apenas os dados do próprio filho"
  on alunos
  for select
  using (auth.uid() = responsavel_id);
```

## Como aplicar no console do Supabase
1. Acesse o painel do [Supabase](https://supabase.com).
2. Selecione o projeto **RotaEscola Arapongas**.
3. Navegue até a seção **SQL Editor** na barra lateral.
4. Clique em **New Query** (Nova consulta).
5. Copie e cole as instruções contidas no arquivo de migração: [20260527161200_fix_alunos_responsavel_rls.sql](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/supabase/migrations/20260527161200_fix_alunos_responsavel_rls.sql).
6. Clique em **Run** (Executar) para aplicar.

## Histórico de Modificações
| Data | Alteração |
|---|---|
| 27/05/2026 | Item 6 — Criação do script de migração e ativação da política RLS no banco de dados |
