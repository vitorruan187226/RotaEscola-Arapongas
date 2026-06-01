# Painel Administrativo SEMED (0205)

## Propósito
Área restrita da Secretaria Municipal de Educação para gestão completa do transporte escolar: KPIs, mapa de rastreamento, aprovação de documentos, gestão de frota, alunos e rotas.

## Rota Base
- `/dashboard/admin` — protegida pelo middleware via cookie `sb-mock-login=admin`
- **Credenciais de teste:** CPF `99999999999` / Senha `adminisenha`

## Arquitetura do Módulo
```
app/dashboard/admin/
├── layout.tsx          ← Layout com Sidebar + Topbar (use client) + Badge Dinâmico em Escolas
├── page.tsx            ← Dashboard principal (KPIs + Mapa + Tabela)
├── frota/
│   └── page.tsx        ← Gestão de Veículos
├── alunos/
│   └── page.tsx        ← Gestão de Alunos
├── documentos/
│   └── page.tsx        ← Análise Cadastral (Oculto da navegação lateral)
└── rotas/
    └── page.tsx        ← Rotas e Itinerários
```
> [!NOTE]
> O painel principal do administrador consolidou todas as funcionalidades e o design do antigo painel da secretaria municipal, concentrando a gestão operacional em um único local. A tela de aprovação de documentos (`documentos/page.tsx`) agora é acessada por caminhos contextuais de gestão e está oculta da sidebar para simplificar a navegação.

## Layout (layout.tsx)

### Componentes
| Elemento | Descrição |
|---|---|
| `<aside class="admin-sidebar">` | Sidebar fixa, 260px, fundo `#0F172A`, colapsa no mobile |
| `<header class="admin-topbar">` | Barra superior branca, sticky, 64px |
| `<main class="admin-content">` | Conteúdo da página filha, max-width 1200px |

### Navegação Sidebar
| Rota | Ícone | Rótulo | Indicador (Badge) |
|---|---|---|---|
| `/dashboard/admin` | `LayoutDashboard` | Visão Geral | — |
| `/dashboard/admin/escolas` | `Building2` | Entidades Escolares | 🔴 Número total de alunos com status `'Em análise'` de Arapongas (oculta se for 0) |
| `/dashboard/admin/frota` | `Bus` | Frota e Veículos | — |
| `/dashboard/admin/alunos` | `Users` | Gestão de Alunos | — |
| `/dashboard/admin/rotas` | `MapPin` | Rotas e Itinerários | — |

### Responsividade
- **Desktop (≥1024px):** Sidebar visível permanentemente à esquerda
- **Mobile (<1024px):** Sidebar oculta, botão hamburguer no topbar, overlay escuro

## Dashboard Principal (page.tsx)

### KPI Cards — Contrato de Dados
```ts
interface KpiCard {
  titulo:     string;
  valor:      string | number;
  subtitulo:  string;
  icone:      React.ElementType;
  cor:        'navy' | 'yellow' | 'red' | 'green';
  tendencia?: string;
}

// Valores mock (fallback Supabase)
const kpis = [
  { titulo: 'Alunos Cadastrados',   valor: 6000,  cor: 'navy'   },
  { titulo: 'Frota Ativa',          valor: 102,   cor: 'green'  },
  { titulo: 'Documentos Pendentes', valor: 34,    cor: 'yellow' },
  { titulo: 'Ocorrências Hoje',     valor: 0,     cor: 'red'    },
];
```

### Tabela de Atividades — Mock Tipado
```ts
interface AtividadeRecente {
  id:      number;
  aluno:   string;
  escola:  string;
  rota:    string;
  status:  'Aprovado' | 'Pendente' | 'Em análise';
  data:    string;
}
```

### Mapa Placeholder
- Container com grade CSS decorativa (30 células)
- Texto: "Mapbox será integrado aqui"
- Status badges: veículos em trânsito, próximos de escolas, concluídos

## IDs de Acessibilidade e Testes
| ID | Elemento |
|---|---|
| `btn-admin-logout` | Botão logout na sidebar |
| `btn-admin-menu` | Hamburguer mobile |
| `btn-topbar-logout` | Botão logout no topbar |
| `btn-novo-aluno` | Abre modal de novo aluno |
| `btn-novo-veiculo` | Abre modal de novo veículo |
| `btn-nova-rota` | Abre modal de nova rota |
| `search-alunos` | Campo de busca de alunos |
| `search-rotas` | Campo de busca de rotas |
| `btn-edit-rota-{id}` | Editar rota específica |
| `btn-delete-rota-{id}` | Excluir rota específica |

## Status dos Módulos Admin
| Módulo | Arquivo | Status | Tabela Supabase |
|---|---|---|---|
| Visão Geral | `page.tsx` | ✅ Ativo (KPIs mock) | — |
| Entidades Escolares | `escolas/page.tsx` | ✅ Ativo | `escolas` |
| Gestão de Alunos | `alunos/page.tsx` | ✅ Ativo (CRUD real) | `alunos` |
| Frota e Veículos | `frota/page.tsx` | ✅ Ativo (CRUD real) | `veiculos` |
| Análise de Docs | `documentos/page.tsx` | ✅ Ativo (Acessado por atalho / Oculto na sidebar) | `alunos` + `rotas` + Storage |
| Rotas e Itinerários | `rotas/page.tsx` | ✅ Ativo (CRUD real) | `rotas` |

## Novo Fluxo de Aprovação e Designação de Rota
No módulo **Aprovação de Docs** (`documentos/page.tsx`), a listagem é alimentada em tempo real com registros no status `'Em análise'`. 
- **Botão Aprovar**: Ao clicar em Aprovar, abre-se um modal popup que permite ao administrador selecionar a **Rota Escolar** da lista de rotas ativas (carregadas da tabela `rotas`).
- **Confirmação**: Ao confirmar no modal, o sistema atualiza `status_carteirinha` para `'Aprovado'` e associa o `rota_id` selecionado ao estudante.
- **Botão Rejeitar**: Atualiza o status do aluno para `'Pendente'` e define seu `rota_id` como `null`, liberando-o da fila de análise.

## Histórico de Alterações
| Data | Alteração |
|---|---|
| Setup inicial | Criação do admin/page.tsx com tabela de frota simples |
| Sprint 2 — Painel Admin | Criação do layout.tsx com sidebar + topbar; reescrita completa do page.tsx com KPIs, mapa e tabela; criação das sub-rotas frota, alunos, documentos, rotas |
| 2026-05-27 | **Ativação completa:** todos os 4 módulos convertidos de mock estático para integração real Supabase com CRUD, busca, KPIs, modais e fallback inteligente. Commit `71de8e6`. |
| 2026-05-30 | **Fase II - Designação Dinâmica:** Modificação da ação de aprovação para exigir a designação da rota escolar ao aluno (tabela `alunos` campo `rota_id`), limpando a associação em caso de rejeição. |
| 2026-06-01 | **Ajuste de Navegação Global:** Ocultação do item "Aprovação de Documentos" do menu lateral e implementação de badge dinâmico inteligente no botão "Entidades Escolares", exibindo o total de alunos com status `'Em análise'` de Arapongas. |I - Designação Dinâmica:** Modificação da ação de aprovação para exigir a designação da rota escolar ao aluno (tabela `alunos` campo `rota_id`), limpando a associação em caso de rejeição. |


