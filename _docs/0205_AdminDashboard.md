# Painel Administrativo SEMED (0205)

## Propósito
Área restrita da Secretaria Municipal de Educação para gestão completa do transporte escolar: KPIs, mapa de rastreamento, aprovação de documentos, gestão de frota, alunos e rotas.

## Rota Base
- `/dashboard/admin` — protegida pelo middleware via cookie `sb-mock-login=admin`
- **Credenciais de teste:** CPF `99999999999` / Senha `adminisenha`

## Arquitetura do Módulo
```
app/dashboard/admin/
├── layout.tsx          ← Layout com Sidebar + Topbar (use client)
├── page.tsx            ← Dashboard principal (KPIs + Mapa + Tabela)
├── frota/
│   └── page.tsx        ← Gestão de Veículos
├── alunos/
│   └── page.tsx        ← Gestão de Alunos
├── documentos/
│   └── page.tsx        ← Aprovação de Documentos
└── rotas/
    └── page.tsx        ← Rotas e Itinerários
```

## Layout (layout.tsx)

### Componentes
| Elemento | Descrição |
|---|---|
| `<aside class="admin-sidebar">` | Sidebar fixa, 260px, fundo `#0F172A`, colapsa no mobile |
| `<header class="admin-topbar">` | Barra superior branca, sticky, 64px |
| `<main class="admin-content">` | Conteúdo da página filha, max-width 1200px |

### Navegação Sidebar
| Rota | Ícone | Rótulo |
|---|---|---|
| `/dashboard/admin` | `LayoutDashboard` | Visão Geral |
| `/dashboard/admin/frota` | `Bus` | Frota e Veículos |
| `/dashboard/admin/alunos` | `Users` | Gestão de Alunos |
| `/dashboard/admin/documentos` | `FileCheck` | Aprovação de Documentos |
| `/dashboard/admin/rotas` | `MapPin` | Rotas e Itinerários |

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

## Histórico de Alterações
| Data | Alteração |
|---|---|
| Setup inicial | Criação do admin/page.tsx com tabela de frota simples |
| Item 3 — Painel Admin | Criação do layout.tsx com sidebar + topbar; reescrita completa do page.tsx com KPIs, mapa e tabela; criação das sub-rotas frota, alunos, documentos, rotas |
