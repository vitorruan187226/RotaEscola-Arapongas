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
| `/dashboard/admin/alunos` | `Users` | Relatórios e Métricas | — |
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
| Gestão de Alunos | `alunos/page.tsx` | ✅ Ativo (Dashboard de Relatórios) | `alunos` + logs_embarque + presencas_diarias |
| Frota e Veículos | `frota/page.tsx` | ✅ Ativo (CRUD real) | `veiculos` |
| Análise de Docs | `documentos/page.tsx` | ✅ Ativo (Acessado por atalho / Oculto na sidebar) | `alunos` + `rotas` + Storage |
| Rotas e Itinerários | `rotas/page.tsx` | ✅ Ativo (CRUD real + Motorista Designado) | `rotas` + `perfis` |

## Fila de Auditoria Cadastral (documentos/page.tsx)
O módulo de **Aprovação de Docs** (`documentos/page.tsx`) foi reestruturado de uma árvore complexa de 4 níveis colapsáveis para uma fila linear direta e moderna:
- **Botão de Voltar**: Botão contextual superior ligando de volta à Visão Geral do painel.
- **Abas de Status (Tabs)**:
  - **Aguardando Análise**: Solicitações com status `'aguardando'` (status_carteirinha = `'Em análise'`).
  - **Aprovados**: Solicitações com status `'aprovado'`.
  - **Pendências / Rejeitados**: Solicitações com status `'rejeitado'` ou `'pendente_correcao'`.
- **Filtros e Busca**: Barra de pesquisa direta por nome do estudante e seletor dropdown para filtragem por instituição escolar.
- **Visualização Linear**: Alunos listados diretamente em um grid de cards contendo a foto real do aluno (`foto_url`) ou avatar com as iniciais correspondentes.
- **Ações Rápidas**:
  - **Ver Anexos**: Abre modal para auditoria dos documentos anexados (Storage).
  - **Aprovar**: Abre modal para vincular a rota de transporte (tabela `rotas`), alterando `status_carteirinha` para `'Aprovado'`.
  - **Corrigir**: Envia solicitação de correção com feedback textual ao responsável, definindo status para `'pendente_correcao'`.

## Histórico de Alterações
| Data | Alteração |
|---|---|
| Setup inicial | Criação do admin/page.tsx com tabela de frota simples |
| Sprint 2 — Painel Admin | Criação do layout.tsx com sidebar + topbar; reescrita completa do page.tsx com KPIs, mapa e tabela; criação das sub-rotas frota, alunos, documentos, rotas |
| 2026-05-27 | **Ativação completa:** todos os 4 módulos convertidos de mock estático para integração real Supabase com CRUD, busca, KPIs, modais e fallback inteligente. Commit `71de8e6`. |
| 2026-05-30 | **Fase II - Designação Dinâmica:** Modificação da ação de aprovação para exigir a designação da rota escolar ao aluno (tabela `alunos` campo `rota_id`), limpando a associação em caso de rejeição. |
| 2026-06-01 | **Ajuste de Navegação Global:** Ocultação do item "Aprovação de Documentos" do menu lateral e implementação de badge dinâmico inteligente no botão "Entidades Escolares", exibindo o total de alunos com status `'Em análise'` de Arapongas. |
| 02/06/2026 | **Correção do Badge da Sidebar (layout.tsx):** Corrigido o bug na checagem de banco ativo que usava `escolasDB.length` combinado com `head: true` (retornando array vazio). Ajustado para validar via propriedade `count` do Supabase, evitando o fallback para o modo de simulação e atualizando dinamicamente a contagem do badge vermelho para 0 quando os alunos forem analisados. |
| 02/06/2026 | **Desmock Completo do Dashboard Principal (page.tsx):** Remoção de dados estáticos para o monitoramento de rotas ativas, auditoria de embarque diário e solicitações. Integração em tempo real com o banco de dados remoto do Supabase via queries em paralelo no Server Component. |
| 02/06/2026 | **Cadastro Real de Motoristas (frota/page.tsx + /api/admin/motoristas):** Criada API Route com Service Role para criar motoristas no Supabase Auth + tabelas `perfis` e `motoristas_perfil`. Modal de cadastro adicionado ao painel de Frota. Select de motoristas reais adicionado ao formulário de criação de veículos. |
| 02/06/2026 | **Designação de Motorista nas Rotas (rotas/page.tsx):** Adicionado campo "Motorista Designado" (dropdown) no modal de criação e edição de rotas. Motoristas buscados da tabela `perfis` (tipo_usuario = 'Motorista') com join em `motoristas_perfil`. `motorista_id` (uuid) persistido na coluna `rotas.motorista_id` → FK para `perfis.id`. Coluna "Motorista" exibida na tabela de listagem. Build validado: 19/19 páginas sem erros. |
| 03/06/2026 | **Seleção Inteligente de Motorista:** Adicionada a busca por `motorista_id` na lista de veículos e implementada auto-seleção automática do motorista no formulário do modal ao escolher um veículo que já possui vínculo na tabela `veiculos`. |
| 08/06/2026 | **Paginação Inteligente na Frota:** Adicionada paginação (Google-like) na tabela de veículos (`frota/page.tsx`) com 5 itens por página para melhorar a experiência do usuário e impedir a quebra de layout de listas longas. |
| 08/06/2026 | **Motoristas Avulsos na Frota:** Integração dos motoristas recém-criados e não atribuídos diretamente na lista principal de frota (`frota/page.tsx`), recebendo o status de 'Aguardando Veículo' e um atalho rápido para atribuição de veículo, melhorando a UX da secretaria. |
| 11/06/2026 | **Governança de Rotas:** Remoção dos campos "Veículo Designado" and "Motorista Designado" no modal de criação e edição de Rotas (`rotas/page.tsx`). A atribuição do veículo e do motorista para a rota agora ocorre de forma centralizada e exclusiva na tela de Frota e Veículos, evitando conflitos de dados e mantendo a fonte da verdade em um único local. |
| 11/06/2026 | **Campos de Habilitação no Cadastro:** Inclusão dos campos de CNH e Modelo/Categoria da CNH no formulário de cadastro de motoristas reais (`frota/page.tsx`), integrando-os com o backend do Supabase via rota da API POST `/api/admin/motoristas`. |
| 12/06/2026 | **Refatoração Estrutural:** Centralização do CRUD de Alunos (Edição, Exclusão e Transferência de Escola) contextualmente nos Detalhes da Escola (Entidades Escolares). Conversão do módulo de Gestão de Alunos em Dashboard de Relatórios e Assiduidade com agregação PostgreSQL via RPC. |
| 12/06/2026 | **Desmock do Dashboard de Relatórios:** Remoção total de dados simulados de fallback e do indicador 'Modo Simulação', conectando a UI estritamente à resposta da RPC do banco de dados. |
| 12/06/2026 | **Simplificação de UX:** Remoção do botão redundante 'Alterar Rota' da listagem de alunos aprovados nos detalhes de escolas, mantendo apenas a atribuição e edição via modal unificado. |
| 12/06/2026 | **Correção de Mismatch de Opções:** Implementada injeção dinâmica de escola e série do estudante nos dropdowns do modal de edição de alunos para impedir a perda de dados em escolas não cadastradas (como Marques de Caravelas) ou formatações de séries personalizadas. |
| 16/06/2026 | Tradução e Status de Rota Ativa: Traduzido o status das rotas para o português na tabela gerencial do dashboard central, refletindo de forma correta e síncrona o estado real de "Em Rota" ou "Fora de Rota" atualizado pelos motoristas. |
| 16/06/2026 | Adicionado o componente cliente `<AutoRefresh>` no painel administrativo principal para re-renderizar em segundo plano as métricas operacionais e o status de rotas a cada 10 segundos. |
| 17/06/2026 | **Ajustes de Fotos e Redesign do Fluxo de Análise:** Integração do campo `foto_url` na fila e na listagem de Últimas Solicitações do admin; reestruturação de `/dashboard/admin/documentos` para exibir uma fila linear simplificada com abas por status, busca direta, filtro de escolas e suporte a foto real do estudante. |
| 18/06/2026 | **Correção de Cache e Status Ciente:** Implementado `fetchCache = 'force-no-store'` e desativação global do cache fetch do Supabase no servidor (`cache: 'no-store'`) para garantir que os alertas operacionais sumam imediatamente da tela inicial do administrador ao serem resolvidos. |
| 23/06/2026 | **Redirecionamento do botão Analisar:** Alterado o link "Analisar" na seção de "Últimas Solicitações" para apontar para a listagem de "Entidades Escolares" (`/dashboard/admin/escolas`) em vez da fila linear direta de documentos (`/dashboard/admin/documentos`). |
| 23/06/2026 | **Remoção de Motoristas Mockups:** Implementado filtro para ocultar motoristas com IDs de desenvolvimento (prefixados com '33333333-') das listas de veículos e rotas, removendo a exibição indesejada de múltiplos motoristas de simulação como 'Aguardando Veículo' na paginação da frota. |
| 25/06/2026 | **Simulador de Validade de Carteirinhas:** Integração do componente `<SimulatorWidget />` no painel principal, permitindo à secretaria definir e testar a expiração e o bloqueio de carteirinhas de estudantes (validade de 1 ano) diretamente pelo banco de dados remoto. |
| 25/06/2026 | **Aba Expirados & Notificação:** Adicionada a aba **"Expirados"** com contagem dinâmica nos Detalhes da Escola, botões provisórios **"Expirar (Teste) / Reativar (Teste)"** para testes de transição e a ação de **"Notificar Responsável"** que grava `notificado_expiracao = true` no Supabase. |



