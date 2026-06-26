# Tabela Motoristas Perfil (0407)

## Propósito
Tabela do banco de dados Supabase que gerencia os perfis operacionais e vínculos de frotas para motoristas de transporte escolar credenciados no município de Arapongas, guardando informações de habilitação (CNH) e veículos atribuídos.

## Estrutura de Banco de Dados (DDL)

```sql
create table if not exists public.motoristas_perfil (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfis(id) on delete cascade,
  placa_veiculo text not null,
  modelo_veiculo text not null,
  capacidade_van integer not null,
  cnh text,
  cnh_categoria text,
  ativo boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(perfil_id)
);
```

### Contrato de Dados (Campos)
| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `uuid` | `NOT NULL` | Identificador único do registro |
| `perfil_id` | `uuid` | `NOT NULL` | Chave estrangeira de ligação com a tabela `public.perfis.id` (Relacionamento 1:1) |
| `placa_veiculo` | `text` | `NOT NULL` | Placa do veículo associado ao motorista |
| `modelo_veiculo` | `text` | `NOT NULL` | Modelo do veículo associado ao motorista |
| `capacidade_van` | `integer` | `NOT NULL` | Capacidade (lugares) do veículo associado |
| `cnh` | `text` | `NULL` | Registro do documento de habilitação (CNH) |
| `cnh_categoria` | `text` | `NULL` | Categoria ou Modelo da habilitação (ex: Categoria D, AE) |
| `ativo` | `boolean` | `NOT NULL` | Indicador se o motorista está ativo no transporte municipal |
| `created_at` | `timestamptz` | `NULL` | Data de criação do registro |

---

## Políticas de RLS (Row Level Security)

1. **Leitura Pública de Perfis de Motoristas (`SELECT`):**
   * *Nome:* `"Leitura publica de perfis de motoristas"`
   * *Regra:* Qualquer usuário autenticado (responsáveis, motoristas, admins) pode ler perfis operacionais.
   * *SQL:* `USING (true)`

2. **Gerenciamento Completo de Perfis de Motoristas (`ALL`):**
   * *Nome:* `"Admins gerenciam perfis de motoristas"`
   * *Regra:* Apenas usuários logados com perfil `'admin'` ou `'Admin'` podem criar, alterar ou remover.
   * *SQL:* `USING (exists (select 1 from public.perfis where id = auth.uid() and tipo_usuario in ('admin', 'Admin')))`

---

## Relacionamento com Perfis Estendido
Para manter a modularidade e reuso de lógica de autenticação no Supabase, dados pessoais de contato e identificação visual do motorista vivem na tabela `public.perfis`:
* **Nome Completo** (`nome`): Salvo em `public.perfis.nome`
* **Telefone de Contato** (`telefone`): Salvo em `public.perfis.telefone`
* **Foto de Perfil** (`foto_url`): Salvo em `public.perfis.foto_url` (Coluna adicionada em 26/06/2026 para armazenamento de imagens de perfil do motorista/usuários)

---

## Histórico de Alterações

| Data | Alteração |
|---|---|
| 01/06/2026 | **Setup da Tabela:** Tabela provisionada na migration de remediação para gerenciar motoristas avulsos e vínculos. |
| 11/06/2026 | **Cadastro de Habilitação:** Adição das colunas `cnh` e `cnh_categoria` na tabela `public.motoristas_perfil` para registrar dados de CNH no formulário de inclusão de motoristas do painel administrativo. |
| 26/06/2026 | **Foto de Perfil Estendida:** Adição do campo `foto_url` na tabela relacionada `public.perfis` para dar suporte ao upload e renderização de fotos de motoristas. |
