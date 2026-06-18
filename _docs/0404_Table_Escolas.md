# Tabela public.escolas (0404)

## Propósito
Tabela dedicada a catalogar de forma relacional e centralizada as Entidades Escolares (escolas) atendidas pela rede municipal de transporte escolar de Arapongas, permitindo filtros operacionais consistentes e relatórios consolidados por escola.

## Relações e Chaves Estrangeiras
- Vinculado por **Chave Estrangeira** na tabela `alunos` via coluna `escola_id uuid references public.escolas(id) on delete set null`.

---

## Estrutura do Esquema (DDL)

```sql
create table public.escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text not null,
  turnos text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Detalhamento das Colunas
| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `uuid` | Chave Primária | Identificador único autogerado da escola |
| `nome` | `text` | `not null` | Nome oficial da instituição escolar |
| `endereco` | `text` | `not null` | Endereço físico completo da escola |
| `turnos` | `text[]` | `not null` default `'{}'` | Array de turnos em atividade (ex: `{'Manhã', 'Tarde'}`) |
| `created_at` | `timestamptz` | default `now()` | Timestamp de registro no banco |

---

## Políticas de RLS (Row Level Security)
Segurança em nível de linha ativada para proteger e isolar as operações da tabela.

```sql
alter table public.escolas enable row level security;
```

### Regras Aplicadas
1. **Leitura Pública Autenticada:**
   - **Nome:** `"Qualquer usuario autenticado pode ver as escolas"`
   - **Ação:** `SELECT`
   - **Regra:** `using (auth.role() = 'authenticated')`
   - **Descrição:** Permite que responsáveis e motoristas leiam as escolas do dropdown do formulário e dos painéis informativos.

2. **Acesso Total Administrativo:**
   - **Nome:** `"Admins podem gerenciar escolas"`
   - **Ação:** `ALL` (INSERT, UPDATE, DELETE)
   - **Regra:** `using (auth.role() = 'authenticated')`
   - **Descrição:** Garante controle operacional total ao administrador da SEMED.

---

## Dados de Povoamento Inicial (Seed / Arapongas)
```sql
insert into public.escolas (id, nome, endereco, turnos)
values
  ('b73e2840-7288-4682-9642-17cb25e36001', 'Escola Municipal Dorcelina Folador', 'Rua das Gralhas, 123 - Arapongas', '{"Manhã", "Tarde"}'),
  ('b73e2840-7288-4682-9642-17cb25e36002', 'Colégio Estadual Julia Wanderley', 'Av. Arapongas, 456 - Centro', '{"Manhã", "Tarde", "Noite"}'),
  ('b73e2840-7288-4682-9642-17cb25e36003', 'Escola Municipal Codorna', 'Rua Codorna, 789 - Zona Sul', '{"Manhã", "Tarde"}');
```

---

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 30/05/2026 | **Criação da Tabela:** DDL inicial de `escolas`, FK `escola_id` em `alunos` e migração executada. |
