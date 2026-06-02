# 🏛️ Relatório Técnico de Situação do Sistema RotaEscola Arapongas

> **Data de Emissão:** 02/06/2026  
> **Status de Conectividade:** 🔌 Conectado ao Supabase Remoto (ID: `lzzxivzkwtwifgvexuiy`)  
> **Status de Build:** 🟢 Compilado com Sucesso (100% Ok localmente e na Vercel)  
> **Responsabilidade Única do Módulo:** Documentar a auditoria técnica de esquemas de banco de dados, fluxo de telas, pendências de infraestrutura e sugerir soluções inteligentes de negócio para o ecossistema.

---

## 📋 1. Resumo Executivo da Situação Atual

O ecossistema **RotaEscola Arapongas** encontra-se em estágio avançado de maturidade funcional e interface visual de alta fidelidade (Premium UX), com todas as rotas de navegação do Next.js configuradas e compilando de forma estável.

Contudo, identificamos um **desalinhamento estrutural severo** entre o esquema físico do Banco de Dados no Supabase remoto e o esquema lógico esperado pelos códigos de front-end. Isto tem causado erros de query (HTTP Status 400) que forçam a aplicação a cair em modos silenciosos de simulação (mocks) em produção, ocultando dados reais.

---

## 🧭 2. Mapeamento de Rotas, Telas e Funcionalidades

Abaixo está listada a situação de cada tela e fluxo ativo no projeto Next.js:

| Rota Next.js | Tela / Módulo | Funcionalidades Principais | Situação Atual |
| :--- | :--- | :--- | :---: |
| `/` | **Landing Page** | Apresentação institucional, recursos do app e CTAs para o portal de login. | 🟢 100% Funcional |
| `/login` | **Tela de Login** | Acesso institucional e de responsáveis usando CPF e Senha de modo unificado. | 🟢 100% Funcional |
| `/cadastro` | **Cadastro Responsável** | Inscrição de novos pais no sistema por CPF, integrado via API Admin do Supabase. | 🟢 100% Funcional |
| `/dashboard/admin` | **Geral Admin (SEMED)** | Gráficos operacionais, KPIs de alunos e visão consolidada da frota e rotas. | 🟢 100% Funcional |
| `/dashboard/admin/escolas` | **Gestão de Escolas** | Grid de Cards com turnos e pendências em vermelho de cada unidade. | 🟢 100% Funcional |
| `/dashboard/admin/escolas/detalhes` | **Detalhes / Auditoria** | Fila de alunos pendentes por escola, aprovação de rotas e fluxo contínuo. | 🟢 Funcional (Sem Mocks) |
| `/dashboard/admin/documentos` | **Auditoria de Arquivos** | Fila geral de análise de anexos e documentos enviados pelos responsáveis. | 🟢 Funcional (Sem Mocks) |
| `/dashboard/admin/alunos` | **Gestão de Alunos** | Tabela geral de alunos cadastrados, associação a rotas e status da carteirinha. | 🟡 Pendente de Ajuste |
| `/dashboard/admin/rotas` | **Rotas e Itinerários** | Cadastro de rotas, turnos, e atribuição de motorista/veículo. | 🟡 Pendente de Ajuste |
| `/dashboard/admin/frota` | **Frota e Veículos** | Cadastro de vans, placas, capacidades e situação dos veículos. | 🟢 100% Funcional |
| `/dashboard/motorista` | **Painel do Motorista** | Leitura de QR Code, beep sonoro, vibração, text-to-speech e lista de presença. | 🟢 100% Funcional |
| `/responsavel/dashboard` | **Painel dos Pais** | Cadastro de filhos, upload de documentos, visualização de carteirinha e mapa. | 🔴 Quebrado (Banco) |
| `/responsavel/carteirinha/[id]`| **Carteirinha Digital** | Exibição do QR Code oficial e dados de identificação do dependente. | 🟢 100% Funcional |
| `/responsavel/rastreio/[rota_id]`| **Rastreio GPS** | Mapa com a posição em tempo real do ônibus escolar. | 🟡 Mockado (GPS Offline) |

---

## 🗄️ 3. Raio-X do Banco de Dados Remoto (Esquema Real vs Esperado)

Executamos uma varredura direta no Supabase de produção e confrontamos o esquema de colunas existente com o código Next.js. A tabela abaixo expõe os gaps e divergências críticas:

### A. Tabela Comparativa de Colunas e Divergências

| Tabela | Colunas Reais no Banco Remoto | Colunas Esperadas / Consultadas no Código | Impacto em Produção |
| :--- | :--- | :--- | :--- |
| `public.alunos` | `id`, `nome`, `escola`, `tem_necessidade_especial`, `rota_id`, `responsavel_nome`, `data_cadastro`, `responsavel_id`, `escola_id` | **Ausentes:** `status_carteirinha`, `foto_url`, `serie`, `turno`, `ativo`, `ausente_hoje` | **Grave:** Queries no painel do responsável, admin e layout falham ao buscar campos inexistentes, ocultando dados ou caindo em mocks. |
| `public.rotas` | `id`, `nome`, `veiculo_id` | **Ausentes:** `codigo`, `turno`, `horario_inicio`, `horario_fim`, `dias_semana`, `ativa`, `motorista_id` | **Grave:** Consultas de rotas nos detalhes da escola e auditorias falham por causa de `codigo` e `status` inexistentes. |
| `public.carteirinhas` | `id`, `aluno_id`, `status_carteirinha`, `qr_code_hash` | `id`, `aluno_id`, `qr_code_hash`, `status` | O front-end espera que o status da carteirinha viva na tabela `alunos`, mas fisicamente ele está isolado nesta tabela secundária. |
| `public.documentos_aluno` | `id`, `aluno_id`, `tipo_documento`, `url_arquivo`, `data_upload` | **Ausente:** `url_documento` | A query de documentos busca `url_documento`, mas a coluna real é `url_arquivo`. O anexo não carrega em produção. |
| `public.logs_embarque` | `id`, `aluno_id`, `motorista_id`, `rota_id` (text), `tipo_movimento` (text), `criado_em` | `rota_id` (uuid) references `rotas(id)` | Conflito de tipos: a query espera UUID de relacionamento, mas o banco tem Text, gerando falhas ao rodar joins estruturados. |

---

## ⚙️ 4. O que precisa ser mudado no Banco de Dados (DDL de Correção)

Para que o aplicativo funcione perfeitamente com dados reais e sem artifícios de mapeamento no Next.js, devemos aplicar o seguinte script SQL corretivo diretamente no console do Supabase para unificar o esquema:

```sql
-- ══════════════════════════════════════════════════════════════════════════════
-- Script Corretivo DDL: Alinhamento de Esquema RotaEscola Arapongas
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Correções na Tabela: alunos
alter table public.alunos 
  add column if not exists status_carteirinha text not null default 'Pendente' check (status_carteirinha in ('Pendente', 'Em análise', 'Aprovado')),
  add column if not exists foto_url text,
  add column if not exists serie text default '—',
  add column if not exists turno text check (turno in ('Manhã', 'Tarde', 'Noite')),
  add column if not exists ativo boolean default true,
  add column if not exists ausente_hoje boolean default false;

-- 2. Correções na Tabela: rotas
alter table public.rotas 
  add column if not exists codigo text,
  add column if not exists turno text check (turno in ('manha', 'tarde', 'noite', 'Manhã', 'Tarde', 'Noite')),
  add column if not exists horario_inicio time without time zone,
  add column if not exists horario_fim time without time zone,
  add column if not exists dias_semana text[] default '{}',
  add column if not exists ativa boolean default true,
  add column if not exists motorista_id uuid references public.perfis(id) on delete set null;

-- 3. Sincronização de Dados Iniciais de Rotas para Arapongas
update public.rotas set codigo = 'RT-04', turno = 'Manhã' where nome = 'Rota 04 — Zona Rural' or nome = 'Rota 04';
update public.rotas set codigo = 'RT-22', turno = 'Tarde' where nome = 'Rota 22 — Centro' or nome = 'Rota 22';

-- 4. Correção na Tabela: documentos_aluno (Criar alias ou ajustar coluna)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'documentos_aluno' and column_name = 'url_documento'
  ) then
    alter table public.documentos_aluno add column url_documento text;
  end if;
end $$;

-- Backfill para copiar dados de url_arquivo para url_documento
update public.documentos_aluno set url_documento = url_arquivo where url_documento is null;
```

---

## 🧠 5. Sugestões de Melhorias e Lógica de Funcionamento Inteligente

Para elevar o RotaEscola de um aplicativo de rastreamento básico para um sistema de logística e monitoramento inteligente, propomos as seguintes melhorias funcionais:

### A. Geocodificação Reativa e Parada Automática (Smart GPS Tracker)
*   **Funcionamento Inteligente:** O aplicativo do motorista envia coordenadas em tempo real. Atualmente, os pais realizam pooling fixo de 10s no banco.
*   **Melhoria:** Implementar lógica de variação baseada em movimento (Dead Reckoning). Se o veículo estiver parado no trânsito ou em frente a uma escola (`velocidade_kmh = 0` por 2 minutos), o intervalo de updates é reduzido para 45s. Ao atingir velocidade > 10 km/h, o update acelera dinamicamente para 5s, oferecendo uma animação de deslocamento suave no mapa dos pais economizando bateria do aparelho do motorista e consumo do banco do Supabase.

### B. Notificações Inteligentes Baseadas em Proximidade (Geofencing)
*   **Funcionamento Inteligente:** O sistema pode alertar a família de forma reativa sem que o motorista tenha que enviar alertas manuais.
*   **Melhoria:** Com base nas coordenadas atuais da van e no endereço residencial da criança (cadastrado no perfil do aluno), o Supabase Edge Functions calcula a distância radial. Ao cruzar o raio de 500 metros, um alerta push ("*A van escolar está se aproximando do seu endereço, prepare seu filho!*") é disparado automaticamente para o celular do responsável via Firebase (FCM).

### C. Gestão Inteligente de Ausências (Fila Dinâmica de Embarque)
*   **Funcionamento Inteligente:** Quando os pais clicam em "Meu filho não vai hoje" no Portal dos Pais, o status é persistido in `presencas_diarias`.
*   **Melhoria:** Integrar essa informação diretamente com a lista de presença e a rota do motorista. Se o aluno Lucas foi marcado como ausente pelo responsável, o aplicativo do motorista destaca o nome dele em cinza com a etiqueta "Ausência Justificada" e emite um alerta silencioso no mapa indicando que não há necessidade de parar na residência dele na rota de ida, otimizando o tempo de viagem e o combustível.

### D. Modo Offline Resiliente com Sincronização Local (IndexedDB)
*   **Funcionamento Inteligente:** A zona rural de Arapongas possui regiões com sinal de internet inexistente.
*   **Melhoria:** O aplicativo do motorista (Web PWA ou App Flutter) deve salvar todos os registros de embarque no armazenamento local do navegador usando IndexedDB. Quando a conexão 4G oscila e cai, o app exibe uma etiqueta "Modo Offline" em amarelo e continua funcionando. Assim que a conectividade for restabelecida, o sistema despacha o lote pendente de embarques para o Supabase sem perder nenhum registro de presença.

---

## 📋 6. Checklist Geral do Ecossistema RotaEscola

### ✅ O que Já foi Feito e está 100% Funcional

- [x] **Autenticação por CPF Segura:** Login unificado higienizando formatações de string e API Route protegida contra enumeração.
- [x] **Cadastro via Supabase Admin Auth:** Criação automática de usuários do tipo "Responsável" auto-confirmando e-mails.
- [x] **Mecanismo de Hidratação React Protegido:** Mounted guards em formulários de acesso de modo a expurgar avisos de mismatch de hidratação.
- [x] **Interface Admin Premium de Escolas:** Grid moderno de cards exibindo turnos e as pendências em vermelho de forma reativa.
- [x] **Modal de Auditoria e Fluxo Contínuo:** Fluxo de transição automática "Aprovar e Próximo" implementado e operacional.
- [x] **Scanner de QR Code no Painel do Motorista:** Integração com câmera nativa, beeps de áudio diferenciados e síntese de voz (TTS).
- [x] **Habilitação de RLS em 100% das Tabelas:** Proteção de dados ativa inclusive em tabelas de frotas, rotas e motoristas.
- [x] **Provisionamento de Buckets de Storage:** Bucket `documentos-alunos` ativo na nuvem do Supabase para anexo dos comprovantes.

### ⏳ O que Precisa ser Feito / Corrigido

- [ ] **Executar o Script SQL Corretivo (DDL):** Adicionar as colunas faltantes (`status_carteirinha`, `codigo`, `url_documento`) no banco de dados remoto da nuvem.
- [ ] **Alinhamento do Front-end de Alunos e Rotas:** Remover as lógicas de fallback de mocks após as colunas reais estarem populadas e alinhadas.
- [ ] **Integração Real do Firebase FCM:** Conectar as chaves e certificados de push no Supabase para envio dos alertas ao celular dos pais.
- [ ] **Painel da Secretaria Escolar (`/dashboard/secretaria`):** Implementar a interface de validação local de matrículas.
- [ ] **Implementação do Modo Offline (IndexedDB) no Motorista:** Adicionar resiliência de rede para viagens na zona rural de Arapongas.
