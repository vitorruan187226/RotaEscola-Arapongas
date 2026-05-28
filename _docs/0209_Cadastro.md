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
| `utils/supabase/client` | `createClient()` para login automático com `signInWithPassword` no front-end após cadastro |
| `app/api/auth/cadastro/route.ts` | Rota de API do Servidor que encapsula a lógica com o cliente Admin e previne limite de e-mail |
| `useState` | Nome, CPF, Telefone, Senhas, Loading, Erro e Sucesso |

## Regras de Negócio e Validações

### 1. Máscaras de Entrada (Client-side)
*   **CPF:** Input formatado dinamicamente para a máscara `000.000.000-00` em tempo de digitação.
*   **Telefone:** Input formatado dinamicamente para a máscara `(00) 00000-0000` em tempo de digitação.

### 2. Validações de Campo
*   **Verificação de Senhas:** Valida no cliente se as duas senhas fornecidas coincidem.
*   **Algoritmo de CPF:** Validação rígida baseada no cálculo matemático padrão dos dois dígitos verificadores do CPF brasileiro, bloqueando CPFs fictícios simples (ex: `11111111111`).
*   **Unicidade do CPF:** Resolvida diretamente no servidor (API Route) fazendo uma consulta à tabela `perfis`. Isso evita o uso de RPC client-side exposta e melhora a segurança contra vazamento de e-mails.

### 3. Integração Supabase Admin Auth & Metadados
Para evitar o rate limit de e-mails e a necessidade de validação complexa do usuário nas primeiras etapas, o formulário dispara uma requisição POST para a API Route `/api/auth/cadastro`.
A API inicializa um cliente admin do Supabase (isoldado no servidor, usando a `SUPABASE_SERVICE_ROLE_KEY` secreta) e cria o usuário com confirmação automática de e-mail:
```typescript
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: `${cpfLimpo}@rotaescola.com`,
  password: senha,
  email_confirm: true, // Auto-confirma instantaneamente no Auth
  user_metadata: {
    full_name: nomeCompleto,
    nome: nomeCompleto, // Passa ambos para evitar quebra se a trigger buscar por 'nome'
    cpf: cpfLimpo,
    telefone: telefone,
    role: 'responsavel',
    tipo_usuario: 'responsavel'
  }
});
```

### 4. Sincronização e Triggers (PostgreSQL)
A trigger remota `on_auth_user_created` intercepta a criação do usuário em `auth.users` e dispara a função `public.handle_new_user()`, que insere na tabela pública `public.perfis`:
*   `auth_user_id` ← ID do usuário no Auth.
*   `nome` ← Extraído do metadado `full_name` ou `nome`.
*   `email` ← Extraído do e-mail derivado do CPF.
*   `tipo` e `tipo_usuario` ← Definidos como `'responsavel'`.
*   `telefone` ← Extraído do metadado `telefone`.
*   `cpf` ← Extraído do metadado `cpf`.

Para garantir que a trigger execute com sucesso e não quebre a transação do banco, os metadados são enviados de forma redundante/enriquecida (`nome`/`full_name`, `role`/`tipo_usuario`).

### 5. Tratamento de Erros e Logs
A API possui tratamento de erro try/catch detalhado. Se a criação de usuário ou inserção falhar por motivos do banco (como duplicidade de e-mail na tabela auth ou restrições na trigger), a mensagem exata do erro é registrada nos logs do servidor com o prefixo `[ERRO CADASTRO DEv]` e devolvida de forma limpa para exibição em Toasts/Alertas no front-end.

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 28/05/2026 | Criação da tela de cadastro, migração de colunas `cpf`/`telefone`, RPCs de validação e documentação técnica inicial. |
| 28/05/2026 | Ajuste Fino: Migração para cadastro via Admin Auth no servidor (`/api/auth/cadastro`) e enriquecimento de metadados para compatibilidade com trigger. |
