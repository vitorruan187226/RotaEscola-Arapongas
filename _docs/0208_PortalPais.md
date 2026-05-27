# Portal dos Pais e Carteirinha Digital (0208)

## Propósito
Canal exclusivo para pais e responsáveis gerenciarem a documentação dos estudantes matriculados, visualizarem a carteirinha digital com QR code autorizado para transporte e rastrearem em tempo real a rota do ônibus escolar com envio rápido de alerta de ausência.

## Rota Base
- `/responsavel/dashboard` — Início (cards dos filhos e atalhos)
- `/responsavel/documentos` — Formulário de upload de 3 arquivos obrigatórios
- `/responsavel/carteirinha/[id]` — Credencial digital oficial de Arapongas
- `/responsavel/rastreio/[rota_id]` — Rastreio Mapbox e controle de faltas diárias

A visualização é forçada em formato de tela de dispositivo móvel (`max-w-md` centralizado) para manter a fidelidade com a experiência de aplicativo nativo para smartphones.

## Arquitetura de Pastas
```
app/responsavel/
├── layout.tsx                ← Layout celular com header, back-button adaptativo e logout
├── dashboard/
│   └── page.tsx              ← Boas-vindas personalizadas, lista de filhos e atalhos rápidos
├── documentos/
│   └── page.tsx              ← Fluxo de upload de arquivos (Declaração, Comprovante, Foto 3x4)
├── carteirinha/[id]/
│   └── page.tsx              ← Crachá/Credencial vertical com QR Code
└── rastreio/[rota_id]/
    └── page.tsx              ← Painel de rastreio Mapbox e botão "Meu filho não vai hoje"
```

## Páginas & Funcionalidades

### 1. Painel Inicial (`dashboard/page.tsx`)
- **Boas-Vindas:** Exibe mensagem personalizada recuperada do Supabase Auth (com fallback para CPF/nome do responsável).
- **Cards Individuais:** Cada filho tem um card elegante com sua respectiva foto, escola, ano, itinerário e status da carteirinha (`Pendente` (amarelo), `Em análise` (azul), `Aprovado` (verde)).
- **Atalhos Rápidos:** Botões para carregar documentos, abrir o mapa de rastreio ou carregar o crachá digital (só se estiver Aprovado).

### 2. Formulário de Documentação (`documentos/page.tsx`)
- Exige três arquivos essenciais: Declaração de Matrícula (PDF/Imagem), Comprovante de Residência (Copel/Sanepar) e Foto 3x4.
- Integração com Supabase Storage:
  - Bucket utilizado: `documentos-alunos`
  - Grava os metadados de upload na tabela `documentos_aluno`.
  - Tratamento elegante contra indisponibilidade do banco local, simulando o upload e persistência para demonstração.

### 3. Carteirinha Digital (`carteirinha/[id]/page.tsx`)
- Design vertical inspirado em credencial escolar oficial com as cores do município (Azul Marinho e Amarelo).
- Exibe Foto 3x4, Nome, Escola, Série, Linha, Matrícula e Validade.
- QR Code oficial renderizado com base no campo `qr_code_hash` da tabela `carteirinhas` para leitura na catraca física pelo motorista.

### 4. Rastreamento e Ausência (`rastreio/[rota_id]/page.tsx`)
- **Mapa Interativo (SVG/Mapbox):** Simulação de ruas, ponto de embarque do estudante, colégio de destino e o ônibus em movimento se aproximando no mapa em tempo real.
- **Estimativa de Chegada:** Temporizador dinâmico calculando minutos restantes para o embarque.
- **Comunicação de Ausência:** Botão "Meu filho não vai hoje" que dispara inserção/deleção na tabela `presencas_diarias` com motivo `"Notificado pelo responsável"`, ocultando o aluno no painel do motorista.

## Contratos de Dados & Tabelas
- **Tabela `documentos_aluno`:**
  ```sql
  create table documentos_aluno (
    id uuid primary key default gen_random_uuid(),
    aluno_id uuid references alunos(id),
    tipo_documento text check (tipo_documento in ('Declaracao', 'Comprovante', 'Foto3x4')),
    url_documento text,
    criado_em timestamp with time zone default timezone('utc'::text, now())
  );
  ```
- **Tabela `presencas_diarias`:**
  ```sql
  create table presencas_diarias (
    id uuid primary key default gen_random_uuid(),
    aluno_id uuid references alunos(id),
    data_presenca date default current_date,
    compareceu boolean default true,
    motivo text
  );
  ```

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 27/05/2026 | Item 5 — Desenvolvimento do Portal dos Pais, uploads storage, carteirinha digital e rastreamento com ausência |
