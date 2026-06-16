# Tabela Veículos (0406)

## Propósito
Tabela do banco de dados Supabase que armazena os registros físicos da frota de ônibus, vans e micro-ônibus utilizados no transporte escolar do município de Arapongas, associando as informações operacionais ao painel administrativo.

## Estrutura de Banco de Dados (DDL)

```sql
create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  placa varchar(10) not null unique,
  modelo text,
  capacidade integer not null default 0,
  tipo varchar(50) not null default 'Próprio',
  status varchar(50) not null default 'Ativo',
  tem_acessibilidade boolean not null default false,
  motorista_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Contrato de Dados (Campos)
| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `uuid` | `NOT NULL` | Identificador único do veículo |
| `placa` | `varchar` | `NOT NULL` | Placa de identificação vehicular em caixa alta (ex: `AAA-1234`) |
| `modelo` | `text` | `NULL` | Modelo do veículo (ex: `Volare W9 Escolar`) |
| `capacidade` | `integer` | `NOT NULL` | Quantidade máxima de passageiros sentados |
| `tipo` | `varchar` | `NOT NULL` | Tipo do veículo/vínculo (ex: `Próprio`, `Terceirizado`) |
| `status` | `varchar` | `NOT NULL` | Situação de uso (ex: `Ativo`, `Manutenção`) |
| `tem_acessibilidade` | `boolean` | `NOT NULL` | Indicador se o veículo possui elevador para cadeirantes |
| `motorista_id` | `text` | `NULL` | Nome por extenso ou ID do motorista designado |
| `created_at` | `timestamptz` | `NULL` | Data e hora de inclusão do registro |

---

## Políticas de RLS (Row Level Security)

1. **Leitura Pública de Veículos (`SELECT`):**
   * *Nome:* `"Usuarios autenticados leem veiculos"`
   * *Regra:* Qualquer usuário autenticado no sistema (Pais, Administradores, Motoristas) tem permissão de leitura sobre a frota.
   * *SQL:* `USING (true)`

2. **Gerenciamento de Veículos (`ALL`):**
   * *Nome:* `"Admins gerenciam veiculos"`
   * *Regra:* Apenas usuários logados com perfil `'Admin'` podem cadastrar, atualizar ou deletar veículos.
   * *SQL:* `USING ((((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'Admin'::text) OR (((auth.jwt() -> 'user_metadata'::text) ->> 'tipo_usuario'::text) = 'Admin'::text))`

---

## Histórico de Alterações

| Data | Alteração |
|---|---|
| 02/06/2026 | **Criação do Bloquinho e Ajuste de DDL:** Provisionamento das colunas `modelo` e `motorista_id` para suportar a inserção direta do front-end na tabela `veiculos`, evitando erros de sintaxe SQL e sumiço de dados ao recarregar a tela. |
| 02/06/2026 | **Implementação de Botão de Status (Ações):** Inclusão da coluna de ações e do botão "Alternar Status" na tabela de frota de veículos, acionando a query de UPDATE de status no Supabase de `'Ativo'` para `'Manutenção'` e vice-versa de forma persistente. |
| 03/06/2026 | **Associação de Rotas a Veículos:** Adicionada a coluna "Rota Atribuída" e a ação de "Vincular Rota" na tela de frotas. O vínculo limpa o veículo de rotas anteriores e atualiza a coluna `veiculo_id` na tabela `public.rotas` no Supabase. |
| 08/06/2026 | **Sincronia de Motorista-Rota (Bugfix):** Correção no fluxo de vínculo de rota via Frota. Agora, ao atribuir uma Rota ao Veículo, o sistema não só limpa/atribui o `veiculo_id`, mas também pesquisa o motorista atual do veículo na tabela `veiculos` e preenche o `motorista_id` na tabela `rotas`, resolvendo o bug onde o painel do motorista ficava vazio. |
| 16/06/2026 | **Mapeamento de Status em Tempo Real:** Atualizado o status do veículo no front-end para refletir a ativação em tempo real da rota atribuída ("Em Rota", "Fora de Rota", "Aguardando"), associado à inscrição em tempo real (Supabase Realtime) para refletir alterações instantaneamente. |


