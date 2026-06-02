# Persistência de Rotas e Integração de Autenticação Supabase (0405)

## Propósito
Este documento descreve o alinhamento de segurança e infraestrutura para garantir que as contas de demonstração (mock) e o cadastro de rotas e alunos sejam persistidos diretamente no Supabase em produção, resolvendo o comportamento de desaparecimento de registros ao atualizar a página.

---

## 🔐 1. Alinhamento de Perfis e Contas no Auth

Para que o aplicativo funcione com dados reais no Supabase sob políticas de Row Level Security (RLS) que exigem o papel `authenticated`, as contas mock foram provisionadas fisicamente no banco de dados.

### Modificações na Tabela `public.perfis`
*   Adicionadas as colunas `cpf` (text) e `telefone` (text) para permitir consultas baseadas em CPF e celular.
*   Criado o índice `idx_perfis_cpf` para buscas rápidas no login e cadastro.

```sql
alter table public.perfis add column if not exists cpf text;
alter table public.perfis add column if not exists telefone text;
create index if not exists idx_perfis_cpf on public.perfis(cpf);
```

### Trigger de Sincronização de Cadastro (`handle_new_user`)
A função do trigger de novos usuários foi corrigida para mapear corretamente as colunas e higienizar a capitalização do `tipo_usuario` para corresponder à restrição do check constraint:
```sql
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
declare
  role_val text;
begin
  role_val := coalesce(new.raw_user_meta_data->>'tipo_usuario', new.raw_user_meta_data->>'role', 'Responsável');
  
  role_val := case lower(role_val)
    when 'admin' then 'Admin'
    when 'secretaria' then 'Secretaria'
    when 'motorista' then 'Motorista'
    else 'Responsável'
  end;

  insert into public.perfis (id, nome, tipo_usuario, telefone, cpf)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    role_val,
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'cpf'
  );
  return new;
end;
$$;
```

---

## 🚪 2. Fluxo de Autenticação Real para Contas Mock

A API de Login (`app/api/auth/login/route.ts`) foi modificada. Quando o sistema detecta um login mock, ele realiza em segundo plano a chamada real `supabase.auth.signInWithPassword` usando o email derivado (`{cpf}@rotaescola.com`) e a senha mock correspondente.

Isso garante que:
1.  Os cookies da sessão da API do Supabase sejam gerados e transmitidos nas chamadas de rede.
2.  O cliente do navegador faça requisições sob a role `authenticated`, atendendo aos requisitos de RLS do banco.
3.  O cookie de controle legado `sb-mock-login` continue sendo setado para garantir compatibilidade com as lógicas internas do Next.js.

---

## 🧩 3. Ajuste de Fallback no Front-end (React)

As páginas administratvas de rotas (`/dashboard/admin/rotas`) e alunos (`/dashboard/admin/alunos`) foram alteradas para tratar respostas de consultas bem-sucedidas de forma inteligente:

*   **Comportamento Antigo:** Se a lista retornada estivesse vazia (`lista.length === 0`), a tela forçava o `usingMock(true)` (Modo Demo) e caía nos mocks estáticos locais. Isso impedia que novos dados fossem inseridos quando o banco estivesse limpo.
*   **Comportamento Novo:** O Modo Demo e o uso de dados locais simulados são ativados **somente** em caso de erro real na query (ex. `error` retornado pelo Supabase Client). Se a query retornar com sucesso uma lista vazia, a tela permanece no modo real, permitindo inserções no banco remoto.

---

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 02/06/2026 | **Persistência de Rotas:** Correção da API de login, DDL de tabelas, trigger de cadastro e páginas do frontend. |
