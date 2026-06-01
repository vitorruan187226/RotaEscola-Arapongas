# Gestão de Escolas Admin (0210)

## Propósito
Interface administrativa da Secretaria de Educação (SEMED) para a catalogação, auditoria e gerenciamento operacional das unidades escolares parceiras atendidas pelo transporte público municipal.

## Rota
- `/dashboard/admin/escolas` → `app/dashboard/admin/escolas/page.tsx`

---

## Componentes e Dependências
| Módulo | Uso |
|---|---|
| `@supabase/supabase-js` | Conexão com o banco (tabelas `escolas` e `alunos`) |
| `utils/supabase/client` | `createClient()` para execução no browser |
| `lucide-react` | Ícones `Building2`, `Plus`, `Search`, `Edit2`, `Trash2`, `X`, `MapPin`, `Clock` |
| `useState`, `useEffect` | Lifecycle, estados do modal e formulários |

---

## Contrato de Dados (Frontend)
```typescript
interface Escola {
  id: string;
  nome: string;
  endereco: string;
  turnos: string[]; // ['Manhã', 'Tarde', 'Noite']
}
```

---

## Funcionalidades e Ações

### 1. Visualização em Grid de Cards Modernos
- **Layout Moderno:** Substitui a listagem tradicional de tabelas por um Grid responsivo de Cards modernos que representam cada unidade escolar.
- **Conteúdo do Card:** O card expõe o Nome da escola, o Endereço completo (com ícone) e os turnos de atendimento (badges estéticas baseadas em relógio).
- **Badge de Pendências por Escola:** No canto superior direito de cada card, um contador em vermelho (`animate-pulse`) indica dinamicamente a quantidade de alunos matriculados naquela escola que possuem pendências na aprovação de documentos (status `'Em análise'`). Se o contador for zero, a badge é ocultada de forma limpa.
- **Ação de Clique e Roteamento:** O card inteiro é interativo e clicável. Ao ser selecionado, redireciona o usuário dinamicamente para `/dashboard/admin/alunos?escola=NomeDaEscola`, onde a tela de listagem de estudantes lê esse parâmetro na URL (`window.location.search`) e pré-filtra automaticamente a listagem para mostrar apenas alunos daquela instituição.

### 2. Ações de Gestão e Segurança
- **Abertura de Anexos:** O clique em "Ver Documentos" abre um modal responsivo trazendo os arquivos reais armazenados no Supabase Storage.
- **Ações Rápidas de Fila:** Disponibilização dos botões "Aprovar Cadastro" e "Rejeitar".
- **Fluxo Contínuo "Aprovar e Próximo":** No canto inferior direito do modal de auditoria, o administrador conta com a ação contínua "Aprovar e Próximo" (sinalizado com ícone `Sparkles`). Ao ser acionada, ela realiza a designação da rota do aluno atual e, imediatamente após salvar, transiciona o modal de forma transparente carregando os dados e anexos do próximo estudante na fila de pendências (status `'Em análise'`) da mesma escola. Caso o fluxo contínuo seja concluído para todos os alunos da instituição, o modal é fechado e um alerta de sucesso é apresentado à equipe da SEMED: *"Todos os documentos desta instituição foram analisados!"*.

---

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 30/05/2026 | **Criação da Tela:** Interface CRUD dinâmica de gestão de escolas conectada ao Supabase com fallback mock para modo de demonstração. |
| 01/06/2026 | **Refatoração para Layout de Cards:** Substituída a listagem em tabela por um Grid de Cards modernos e responsivos. Adicionado contador/badge em vermelho de alunos pendentes ("Em análise") por unidade escolar, redirecionamento ao clicar no card com passagem do filtro via query string (?escola=...), e interceptação do clique em ações internas (e.stopPropagation()). |
| 01/06/2026 | **Modal de Auditoria e Fluxo Contínuo:** Implementado o fluxo "Aprovar e Próximo" para transição de fila transparente e automática de análise de documentos por instituição de ensino. |
