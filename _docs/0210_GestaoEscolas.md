# Gestão de Escolas Admin (0210)

## Propósito
Interface administrativa da Secretaria de Educação (SEMED) para a catalogação, auditoria e gerenciamento operacional das unidades escolares parceiras atendidas pelo transporte público municipal.

## Rota
- `/dashboard/admin/escolas` → `app/dashboard/admin/escolas/page.tsx`

---

## Componentes e Dependências
| Módulo | Uso |
|---|---|
| `@supabase/supabase-js` | Conexão com o banco (tabela `escolas`) |
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

### 1. Visualização e Busca
- **Contagem Geral:** O cabeçalho exibe dinamicamente a contagem de escolas cadastradas.
- **Barra de Pesquisa:** Um input realiza a filtragem reativa instantânea por Nome ou Endereço da escola.
- **Empty State:** Caso não existam registros cadastrados ou correspondentes à pesquisa, renderiza card com instruções.

### 2. Fluxo CRUD Completo
- **Nova Escola:** Abre modal popup com os campos: *Nome*, *Endereço* e *Turnos Atendidos* (Checkboxes selecionando Manhã, Tarde e Noite). Valida e libera o botão de salvar somente com todos os dados preenchidos.
- **Editar Escola:** Abre modal pré-carregado com os dados da escola selecionada para alteração pontual de Nome, Endereço ou Turnos.
- **Exclusão Segura:** Ao clicar no ícone de exclusão, solicita uma caixa de diálogo de confirmação segura antes de remover permanentemente a escola do banco.

---

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 30/05/2026 | **Criação da Tela:** Interface CRUD dinâmica de gestão de escolas conectada ao Supabase com fallback mock para modo de demonstração. |
