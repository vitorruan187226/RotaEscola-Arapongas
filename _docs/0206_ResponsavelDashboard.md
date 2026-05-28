# Dashboard do Responsável (0206)

## Propósito
Hub principal do Portal dos Pais/Guardiões. Lista os filhos vinculados ao responsável logado, exibe o status de cada carteirinha e oferece ações rápidas (ver carteirinha, enviar documentos, rastrear ônibus).

## Rota
- `/responsavel/dashboard` → `app/responsavel/dashboard/page.tsx`

## Layout Wrapper
- `app/responsavel/layout.tsx` — Moldura celular simulada (`max-w-md`), header premium com botão voltar condicional e botão logout com `signOut()`.

## Modo de Renderização
- `'use client'` — Contém múltiplos `useState` e `useEffect` para carregar dados do Supabase.

## Componentes e Dependências
| Módulo | Uso |
|---|---|
| `@supabase/supabase-js` | Autenticação + queries dinâmicas |
| `utils/supabase/client` | `createClient()` para browser |
| `next/link` | Navegação para sub-rotas |
| `lucide-react` | Ícones variados |
| `useState`, `useEffect` | Gerenciamento de estado e lifecycle |

## Fluxo de Dados (Supabase)
1. `supabase.auth.getUser()` → Obtém a sessão e o ID do usuário logado.
2. `supabase.from('perfis').select('nome, cpf').eq('id', user.id)` → Busca o nome completo e o CPF do responsável logado para exibição do cabeçalho.
3. `supabase.from('alunos').select('id, nome, escola, serie, rota_id, status_carteirinha, foto_url').eq('responsavel_id', user.id)` → Lista alunos reais do responsável (filtrado por RLS).

## Contratos de Dados
### Tabela `alunos` (campos utilizados)
```typescript
{
  id: string;
  nome: string;
  escola: string;
  serie: string;
  rota_id: string;
  responsavel_id: string;
  status_carteirinha: 'Pendente' | 'Em análise' | 'Aprovado';
  foto_url?: string;
}
```

## Regras de Negócio
- **Empty State**: Se `filhos.length === 0`, exibe card instrutivo amigável orientando o cadastramento do filho ("Você ainda não possui estudantes cadastrados. Clique no botão 'Cadastrar Filho' acima para iniciar.").
- **Exibição do CPF**: O CPF do usuário logado é renderizado no topo em formato mono formatado com a máscara visual `000.000.000-00`.
- **Carteirinha bloqueada**: O botão "Ver Carteirinha" só fica ativo se `status_carteirinha === 'Aprovado'`.
- **Upload obrigatório**: Status `'Pendente'` exibe badge amarela e direciona para envio de documentos.
- **Remoção de Mocks**: Usuários reais logados nunca visualizam dados mockados (`FILHOS_MOCK`) nem a badge "Modo Demonstração". A interface exibe dados vazios ou dinâmicos de forma autêntica.

## Sub-rotas Acessíveis
| Ação | Rota de Destino | Condição |
|---|---|---|
| Ver Carteirinha | `/responsavel/carteirinha/{id}` | `status_carteirinha === 'Aprovado'` |
| Enviar Documentos | `/responsavel/documentos?alunoId={id}` | Sempre disponível |
| Rastrear Ônibus | `/responsavel/rastreio/{rota_id}` | Sempre disponível |

## Mock Fallback (Lei 4)
Constante `FILHOS_MOCK` tipada como `Filho[]` para uso demonstrativo. É carregada unicamente se o portal for acessado de forma deslogada (sem sessão de usuário no Auth).

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 27/05/2026 | Criação do dashboard dinâmico com Supabase, Empty State, status_carteirinha |
| 28/05/2026 | Documentação criada (0206) |
| 28/05/2026 | Integração Real: Remoção de mocks para contas reais autenticadas, query de CPF na tabela `perfis`, exibição de CPF formatado e ajuste do texto do empty state. |
