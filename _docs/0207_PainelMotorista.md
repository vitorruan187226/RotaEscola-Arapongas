# Painel e Leitor do Motorista (0207)

## Propósito
Área restrita de uso do motorista/monitor escolar para registro diário de embarque de passageiros, escaneamento de carteirinhas (QR code) e envio de alertas de ocorrências rápidas de trânsito em Arapongas.

## Rota Base
- `/motorista/painel` — Início (checklist de passageiros)
- `/motorista/leitor` — Escaneamento de QR Code (offline-first)
- `/motorista/ocorrencias` — Registro de problemas de percurso

A visualização é forçada em formato de tela de dispositivo móvel (`max-w-md` com bordas e sombra centralizada em desktops) para simular o comportamento de aplicativo nativo de celular.

## Arquitetura de Pastas
```
app/motorista/
├── layout.tsx         ← Layout do celular com Bottom Navigation e Toggle Offline/Online (use client)
├── painel/
│   └── page.tsx       ← Escolha da Rota e Checklist de Presença (use client)
├── leitor/
│   └── page.tsx       ← Simulador de Câmera de QR Code com áudio e feedbacks de status (use client)
└── ocorrencias/
    └── page.tsx       ← Botões gigantes de 1 toque para alertas de trânsito e histórico (use client)
```

## Páginas & Funcionalidades

### 1. Layout (`layout.tsx`)
- Mantém o encapsulamento móvel responsivo.
- Possui um seletor visual discreto no cabeçalho superior que permite alternar a rede local de **ONLINE** para **OFFLINE** para fins de teste.
- Bottom Navigation com transição suave e ícones Lucide.

### 2. Painel de Início (`painel/page.tsx`)
- **Seletor de Viagem:** Permite que o motorista defina o veículo e a rota no início do turno (dados mockados sincronizados).
- **Contador Dinâmico:** Exibe instantaneamente a fração de alunos embarcados em tempo real (ex: `4/6`).
- **Lista de Passageiros:** Checklist interativo que marca/desmarca a bordo de forma manual.
- **Acessibilidade NEE:** Alunos com Necessidades Educacionais Especiais são destacados com bordas amarelas, ícones de cadeira de rodas/acessibilidade e a respectiva tag de restrição (Autismo, Deficiência Visual, Cadeirante).

### 3. Leitor de Carteirinha (`leitor/page.tsx`)
- Moldura de câmera simulada com laser horizontal vermelho animado de varredura.
- **Botões de Simulação:** Permite que a equipe teste os seguintes comportamentos do scanner:
  - **Sucesso:** Painel verde gigante com a escrita "EMBARQUE AUTORIZADO" e dados do aluno. Emissão de feedback de voz: *"Embarque autorizado"*.
  - **Erro de Rota:** Painel vermelho gigante com a escrita "ALUNO NÃO PERTENCE A ESTA ROTA" com a rota correspondente. Feedback de voz: *"Rota inválida"*.
  - **Expirada:** Painel vermelho escuro com "CARTEIRINHA VENCIDA". Feedback de voz: *"Carteirinha vencida"*.
- **Modo Offline:** Se o sinalizador de rede estiver offline, a tela exibe um aviso de alerta informando que os registros de escaneamento estão sendo guardados no banco local para sincronização em nuvem posterior.

### 4. Ocorrências Rápidas (`ocorrencias/page.tsx`)
- **Botões de Toque Único (64px altura):**
  - *Trânsito Intenso* (Azul)
  - *Problema Mecânico* (Laranja)
  - *Via Interditada / Barro* (Slate)
  - *Emergência* (Vermelho pulsante)
- **Histórico Diário:** Lista todas as ocorrências reportadas no percurso atual, marcando-as como "Transmitido" (se online) ou "Pendente (Offline)" (se offline).

## Mocks Utilizados
```ts
interface Aluno {
  id: number;
  nome: string;
  escola: string;
  nee: boolean;
  tipoNee?: string;
  aBordo: boolean;
}
```

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 27/05/2026 | Item 4 — Criação de rotas, painéis, simulador de QR e ocorrências mobile-first |
