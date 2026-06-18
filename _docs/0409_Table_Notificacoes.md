# Tabela Notificações (0409)

## Propósito
Tabela do banco de dados Supabase que armazena os alertas operacionais (falha mecânica, interrupção de vias, pânico SOS) e notificações destinadas aos responsáveis pelos estudantes (ex: confirmação de embarque ou ocorrência disciplinar).

## Estrutura de Banco de Dados (DDL)

```sql
create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references public.alunos(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  criado_em timestamp with time zone default timezone('utc'::text, now())
);
```

### Contrato de Dados (Campos)
| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `uuid` | `NOT NULL` | Identificador único da notificação |
| `aluno_id` | `uuid` | `NULL` | Identificador do aluno associado (nulo para alertas operacionais de frota e vias) |
| `titulo` | `text` | `NOT NULL` | Título informativo da notificação |
| `mensagem` | `text` | `NOT NULL` | Conteúdo detalhado do alerta ou aviso |
| `lida` | `boolean` | `NOT NULL` | Status de visualização (padrão: `false`) |
| `criado_em` | `timestamptz` | `NULL` | Data e hora de criação do registro |

---

## Políticas de RLS (Row Level Security)

1. **Inserção de Notificações (`INSERT`):**
   * *Nome:* `"Permite insercao para autenticados"`
   * *Regra:* Qualquer usuário autenticado no sistema (Administradores, Secretarias e Motoristas) pode inserir alertas e avisos na tabela.
   * *SQL:* `TO authenticated WITH CHECK (true)`

2. **Leitura de Notificações (`SELECT`):**
   * *Nome:* `"Permite leitura para envolvidos"`
   * *Regra:* Usuários operacionais (Admin, Secretaria, Motorista) podem ler todas as notificações operacionais (inclusive as globais com aluno_id nulo), e responsáveis de alunos podem ler notificações que possuem `aluno_id` atrelado aos seus filhos cadastrados.
   * *SQL:* 
     ```sql
     TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM public.perfis
         WHERE perfis.id = auth.uid()
           AND perfis.tipo_usuario IN ('Admin', 'admin', 'Secretaria', 'secretaria', 'Motorista', 'motorista')
       )
       OR
       (aluno_id IS NOT NULL AND aluno_id IN (
         SELECT id FROM public.alunos
         WHERE responsavel_id = auth.uid()
       ))
     )
     ```

3. **Atualização de Notificações (`UPDATE`):**
   * *Nome:* `"Permite atualizacao para admins e secretarias"`
   * *Regra:* Somente usuários operacionais com perfil administrativo (Admin, Secretaria) podem atualizar notificações (por exemplo, marcar alertas operacionais de frota como resolvidos/lidos).
   * *SQL:*
     ```sql
     TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM public.perfis
         WHERE perfis.id = auth.uid()
           AND perfis.tipo_usuario IN ('Admin', 'admin', 'Secretaria', 'secretaria')
       )
     )
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM public.perfis
         WHERE perfis.id = auth.uid()
           AND perfis.tipo_usuario IN ('Admin', 'admin', 'Secretaria', 'secretaria')
       )
     )
     ```

---

## Histórico de Alterações

| Data | Alteração |
|---|---|
| 01/06/2026 | **Criação da Tabela:** Provisionamento da tabela `notificacoes` para suportar avisos de embarque de passageiros aos responsáveis. |
| 18/06/2026 | **Suporte a Alertas Operacionais de Frota/Vias:** Acoplamento dos relatórios operacionais do motorista (Mecânico, Vias, SOS) na tabela `notificacoes` (com `aluno_id = null`). Criação de políticas robustas de RLS para INSERT/SELECT/UPDATE e validação com tratamento de erros no front-end para evitar falhas silenciosas. |
