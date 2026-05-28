# Tela de Cadastro (0209) — Criação de Conta Familiar

## Propósito
Permite o cadastro seguro e self-service de novos responsáveis familiares municipais no ecossistema RotaEscola Arapongas, integrando o cadastro de autenticação ao Supabase Auth e garantindo a correta sincronização de metadados no banco de dados.

## Rota
- `/cadastro` → `app/cadastro/page.tsx`

## Modo de Renderização
- `'use client'` — Contém estados reativos para validações client-side, máscaras e feedbacks.

## Componentes e Dependências
| Módulo | Uso |
|---|---|
| `next/navigation` | `useRouter` para redirecionamento após cadastro com sessão ativa |
| `next/link` | Link para retornar à tela de login |
| `lucide-react` | Ícones: `User`, `Lock`, `Mail`, `Phone`, `Shield`, `AlertCircle`, `CheckCircle2` |
| `utils/supabase/client` | `createClient()` para chamada à API de `signUp` do Supabase Auth |
| `useState` | Nome, CPF, E-mail, Telefone, Senhas, Loading, Erro e Sucesso |

## Regras de Negócio e Validações

### 1. Máscaras de Entrada (Client-side)
*   **CPF:** Input formatado dinamicamente para a máscara `000.000.000-00` em tempo de digitação.
*   **Telefone:** Input formatado dinamicamente para a máscara `(00) 00000-0000` em tempo de digitação.

### 2. Validações de Campo
*   **Verificação de Senhas:** Valida no cliente se as duas senhas fornecidas coincidem.
*   **Algoritmo de CPF:** Validação rígida baseada no cálculo matemático padrão dos dois dígitos verificadores do CPF brasileiro, bloqueando CPFs fictícios simples (ex: `11111111111`).
*   **Unicidade do CPF:** Antes de disparar o cadastro, o client-side chama a função RPC remota `check_cpf_exists` para garantir que o CPF informado já não esteja associado a outra conta.

### 3. Integração Supabase Auth & Metadados
Após validação, o formulário dispara a criação de usuário:
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: nomeCompleto,
      cpf: cleanCpf,
      telefone: telefone,
      role: 'responsavel'
    }
  }
});
```

### 4. Sincronização e Triggers (PostgreSQL)
A trigger remota `on_auth_user_created` intercepta a criação do usuário em `auth.users` e dispara a função `public.handle_new_user()`, que insere na tabela pública `public.perfis`:
*   `auth_user_id` ← ID do usuário no Auth.
*   `nome` ← Extraído do metadado `full_name`.
*   `email` ← Extraído do e-mail do usuário.
*   `tipo` e `tipo_usuario` ← Definidos como `'responsavel'`.
*   `telefone` ← Extraído do metadado `telefone`.
*   `cpf` ← Extraído do metadado `cpf`.

### 5. Fluxo de Confirmação de E-mail
*   Se o servidor Supabase exigir confirmação de e-mail (comportamento padrão de produção), a tela renderiza um estado de sucesso orientando o usuário a acessar a caixa de entrada para ativação.
*   Se o e-mail for auto-confirmado (ambiente local/desenvolvimento), o sistema cria a sessão ativa, define o cookie `sb-mock-login=responsavel` para retrocompatibilidade do middleware e redireciona para `/responsavel/dashboard`.

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 28/05/2026 | Criação da tela de cadastro, migração de colunas `cpf`/`telefone`, RPCs de validação e documentação técnica inicial. |
