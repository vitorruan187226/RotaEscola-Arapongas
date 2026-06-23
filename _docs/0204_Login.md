# Tela Login (0204) — Autenticação Institucional

## Propósito
Ponto de entrada autenticado do sistema RotaEscola Arapongas. Permite que responsáveis, servidores da SEMED, motoristas e administradores acessem suas respectivas áreas.

## Rota
- `/login` → `app/login/page.tsx`
- `/login?role=motorista` → Login personalizado para motoristas (Primeiro Acesso / Login de ativação)

## Modo de Renderização
- `'use client'` — Contém estado React (`useState`) para CPF, senha, loading e erro.

## Componentes e Dependências
| Módulo | Uso |
|---|---|
| `next/navigation` | `useRouter` para redirecionamento pós-login |
| `lucide-react` | Ícones: `Lock`, `User`, `AlertCircle` |
| `utils/supabase/client` | `createClient()` para autenticação real |
| `useState` | CPF, senha, loading, erro |

## Fluxo de Autenticação

### 1. Login Mock (Desenvolvimento)
Credenciais hardcoded que setam cookies `sb-mock-login` para simular perfis:

| CPF | Senha | Cookie | Redireciona para |
|---|---|---|---|
| `99999999999` | `adminisenha` | `sb-mock-login=admin` | `/dashboard/admin` |
| `11111111111` | `secretariasenha` | `sb-mock-login=secretaria` | `/dashboard/secretaria` |
| `22222222222` | `responsavelsenha` | `sb-mock-login=responsavel` | `/responsavel/dashboard` |
| `33333333333` | `motoristasenha` | `sb-mock-login=motorista` | `/dashboard/motorista` |

### 2. Login Real (Supabase Auth)
Se as credenciais não baterem com os mocks:
1. Gera e-mail derivado: `{cpf_limpo}@rotaescola.com`
2. Chama `supabase.auth.signInWithPassword({ email, password: senha })`
3. Em caso de sucesso, busca `perfis.tipo_usuario` para determinar o dashboard correto
4. Fallback para `/responsavel/dashboard` se não encontrar perfil

### 3. Login com o Google (OAuth 2.0)
Disponível apenas no fluxo geral (ocultado quando `role=motorista`):
1. Invoca `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback?next=/login' } })`
2. Após o consentimento do Google, `/auth/callback` permuta o código temporário por sessão ativa.
3. Redireciona o navegador para `/login`, que é interceptado pelo `middleware.ts`. O middleware analisa a sessão do usuário no Supabase e encaminha-o para a respectiva dashboard (e.g. `/responsavel/dashboard`).

## IDs de Acessibilidade e Testes
| ID | Elemento |
|---|---|
| `cpf` | Input do CPF |
| `senha` | Input da senha |

## Dependências de Estilo
- `<style>` inline com classes `.login-wrapper`, `.login-card`, `.login-header`, `.login-form`
- Divisor visual `.divider-container` e botão `.btn-google` (estilo premium baseado em cores harmônicas e elevação)
- Usa variáveis CSS globais: `--background-gray`, `--primary-navy`, `--text-dark`, `--text-light`, `--border-color`
- Usa classe global: `.card-premium`

## Histórico de Alterações
| Data | Alteração |
|---|---|
| Setup inicial | Criação da tela de login com CPF e senha |
| Sprint 2 | Adição de 4 credenciais mock (admin, secretaria, responsável, motorista) |
| Sprint 2 | Integração com Supabase Auth real (signInWithPassword + perfis) |
| 28/05/2026 | Documentação criada (0204) |
| 03/06/2026 | Implementação de customização visual para motoristas via `?role=motorista` com instruções específicas de primeiro acesso. |
| 23/06/2026 | Adicionado suporte para login com o Google (OAuth 2.0) e divisor correspondente na interface do usuário. |
