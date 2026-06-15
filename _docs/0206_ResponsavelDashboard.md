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
  data_nascimento: string;
  escola: string;
  serie: string;
  turno: string;
  rota_id: string; // Fica 'Pendente'/'Aguardando' até alocação
  responsavel_id: string;
  status_carteirinha: 'Pendente' | 'Em análise' | 'Aprovado';
  foto_url?: string;
}
```

### Interface Frontend (`Filho`)
```typescript
interface Filho {
  id: string;
  nome: string;
  escola: string;
  serie: string;
  statusCarteirinha: 'Pendente' | 'Em análise' | 'Aprovado';
  rotaId?: string;
  fotoUrl?: string;
  motorista_nome?: string;
  veiculo_numero?: string;
}
```

- **Empty State**: Se `filhos.length === 0`, exibe card instrutivo amigável orientando a solicitação do transporte ("Você ainda não possui estudantes cadastrados. Clique no botão 'Solicitar Transporte Escolar' acima para iniciar a auditoria de documentos.").
- **Exibição do CPF**: O CPF do usuário logado é renderizado no topo em formato mono formatado com a máscara visual `000.000.000-00`.
- **Auditoria Documental (Novo Fluxo)**: O cadastro de estudante não depende mais de "Código de Vanzeiro". A vinculação ocorre via preenchimento de dados (Nome, Nascimento, Escola, Série, Turno) e upload obrigatório de **4 tipos de documentos**: Comprovante de Residência, Doc. Aluno, Doc. Responsável e Matrícula. O status inicial de criação é sempre `'Em análise'`. A `rota_id` só é atribuída após aprovação pela SEMED.
- **Resolução Dinâmica do Motorista/Veículo**: Através de uma consulta JOIN multinível no Supabase (`alunos -> rotas -> motoristas_perfil -> perfis`), o sistema obtém e exibe automaticamente o nome do motorista e o veículo/ônibus da rota designada assim que o cadastro passa para `'Aprovado'`.
- **Carteirinha bloqueada**: O botão "Ver Carteirinha" só fica ativo se `status_carteirinha === 'Aprovado'`. Estando aprovado, o card exibe dinamicamente o Motorista Designado e o Veículo/Ônibus.
- **Upload obrigatório**: Status `'Em análise'` exibe badge informando que está sob auditoria pela SEMED.
- **Remoção de Mocks**: Usuários reais logados nunca visualizam dados mockados (`FILHOS_MOCK`).

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
| 30/05/2026 | Refatoração profunda do Fluxo de Cadastro: Remoção completa da lógica de "Código de Vanzeiro". Introdução do formulário de Auditoria Documental com upload via Storage (3 documentos obrigatórios) e exibição do Motorista/Veículo para status "Aprovado". |
| 30/05/2026 | **Fase II - Refatoração do Fluxo:** Divisão do envio em 4 documentos obrigatórios, alteração do status inicial para `'Em análise'` e carregamento dinâmico via JOIN multinível do Supabase. |
| 15/06/2026 | Correção de timezone no controle de ausências: unificação das datas locais (`getLocalDateString()`), garantindo sincronização sem shifting de data com o motorista. |
| 15/06/2026 | Implementação da exportação da carteirinha digital para imagem PNG via HTML5 Canvas, unificada no modal do responsável e na página de detalhes. |
| 15/06/2026 | Adicionado trigger interativo de upload de foto do aluno direto no avatar do painel com feedback visual (spinner/overlay) e integração assíncrona com renderização no HTML5 Canvas de exportação. |

