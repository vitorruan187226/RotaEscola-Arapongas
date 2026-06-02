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

###### 3. Políticas de Segurança RLS Robustas
Para atender os diferentes papéis de acesso na rede municipal (SEMED/Administradores, Motoristas e Responsáveis), configuramos as seguintes regras de segurança na tabela `alunos`:

#### A. Leitura (SELECT)
Permite acesso total a administradores (SEMED) e motoristas, e restringe os responsáveis à visualização exclusiva dos próprios filhos:
```sql
CREATE POLICY "Usuarios leem alunos de acordo com seu papel"
  ON public.alunos
  FOR SELECT
  TO authenticated
  USING (
    -- Admins têm acesso total
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    -- Motoristas têm acesso total para checagem de QR Code e chamada
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Motorista', 'motorista')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Motorista', 'motorista')) OR
    -- Responsáveis (Pais) veem apenas seus próprios filhos
    (auth.uid() = responsavel_id)
  );
```

#### B. Atualização (UPDATE)
Permite que administradores modifiquem quaisquer registros (como aprovar/rejeitar e designar rota), e responsáveis atualizem registros dos próprios filhos (ex: atualizar fotos ou documentos):
```sql
CREATE POLICY "Usuarios atualizam alunos de acordo com seu papel"
  ON public.alunos
  FOR UPDATE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    (auth.uid() = responsavel_id)
  )
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    (auth.uid() = responsavel_id)
  );
```

#### C. Inserção (INSERT)
Administradores podem inserir novos alunos, e os responsáveis podem inserir novos registros de alunos desde que vinculados a si mesmos (`responsavel_id` igual ao seu `auth.uid()`):
```sql
CREATE POLICY "Usuarios inserem alunos de acordo com seu papel"
  ON public.alunos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    (auth.uid() = responsavel_id)
  );
```

#### D. Exclusão (DELETE)
Restrito exclusivamente aos administradores da Secretaria de Educação (SEMED):
```sql
CREATE POLICY "Admins excluem alunos"
  ON public.alunos
  FOR DELETE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin'))
  );
```

## Como aplicar no console do Supabase
1. Acesse o painel do [Supabase](https://supabase.com).
2. Selecione o projeto **RotaEscola Arapongas**.
3. Navegue até a seção **SQL Editor** na barra lateral.
4. Clique em **New Query** (Nova consulta).
5. Copie e cole as instruções de reestruturação de RLS de alunos.
6. Clique em **Run** (Executar) para aplicar.

## Histórico de Modificações
| Data | Alteração |
|---|---|
| 27/05/2026 | Item 6 — Criação do script de migração e ativação da política RLS no banco de dados |
| 02/06/2026 | **Expansão do RLS para Auditoria Admin:** Substituída a política única de SELECT por políticas granulares de SELECT, INSERT, UPDATE e DELETE. Adicionada permissão total para a equipe admin (SEMED) e motoristas, corrigindo o erro de gravação e visualização que forçava a interface a cair no Modo Simulação. |
