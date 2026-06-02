# Painel e Leitor do Motorista (0207)

## Propósito
Área restrita de uso do motorista/monitor escolar para registro diário de embarque de passageiros, escaneamento de carteirinhas (QR code) e envio de alertas de ocorrências rápidas de trânsito em Arapongas.

## Rota Base
- `/dashboard/motorista` — Painel do veículo (checklist, scanner e ocorrências)

A visualização é forçada em formato de tela de dispositivo móvel (`max-w-md` com fundo de alto contraste e bordas centralizadas no desktop com sombra premium e contornos discretos) para atender ao uso em smartphones no painel do veículo.

## Arquitetura de Pastas
```
app/dashboard/motorista/
└── page.tsx           ← Painel completo redesenhado consolidado do motorista (use client)
```

## Páginas & Funcionalidades (Redesenho Premium)

### 1. Cabeçalho de Status
- Mantém o encapsulamento móvel responsivo.
- Seletor de conectividade no topo (**ONLINE / OFFLINE**) com efeitos de cor verde (online) e vermelho pulsante (offline) baseados em opacidades sutis.
- Título minimalista e selo do município ("Arapongas · Bordo").

### 2. Card de Rota e Turno (Topo)
- **Seletor de Viagem:** Card integrado com fundo escuro (`bg-slate-900/60`) e bordas sutis (`border-slate-800/80`).
- **Contador Dinâmico & Lotação:** Exibe a lotação do veículo em formato mono (`4 / 5`).
- **Barra de Progresso Suave:** Barra gradiente abaixo do seletor que ilustra a lotação em tempo real (de `0%` a `100%`).

### 3. Leitor de Carteirinha (Scanner QR Code)
- Visor central sem bordas duras internas.
- Cantoneiras arredondadas discretas no estilo foco de câmera (`border-amber-400`).
- Laser neon vermelho pulsante simulando leitura (`shadow-[0_0_15px_rgba(239,68,68,0.7)]`).
- **Botões Simuladores:** Pílulas arredondadas (`rounded-full`) de cores sólidas e opacidade sutil (`bg-emerald-600` e `bg-rose-600`).
- **Overlay de Validação:** Cards sobrepostos com cantos arredondados e desfoques de vidro para exibir feedback imediato de sucesso ou erro (com áudio em pt-BR).

### 4. Lista de Passageiros (Card Clean)
- Organizada em lista contínua com divisores sutis (`divide-y divide-slate-800/40`).
- **Três Estados de Checklist:**
  - **Pendente:** Nome em cor neutra, badge cinza escrito "Pendente".
  - **Presente (Confirmado):** Card com borda verde e fundo esverdeado sutil. Nome em verde e badge verde escrito "Presente". Chip de texto "Presente" antes do nome.
  - **Faltou (Ausente):** Card com borda vermelha e fundo avermelhado sutil. Nome em vermelho e badge vermelho escrito "Faltou". Chip de texto "Faltou" destacado antes do nome.
- **Tags NEE:** Pílulas semitransparentes com cores pastéis (ex: Autismo = `bg-amber-500/10 text-amber-400 border border-amber-500/20`).

### 5. Botão "Finalizar Checklist e Notificar"
- **Feedback de Sucesso:** Ao ser clicado, processa o lote, exibe o toast "Lista enviada com sucesso!" e muda de cor para verde (sucesso) exibindo o ícone check e o texto "Lista Enviada com Sucesso!".
- **Reset Automático:** Após 3 segundos da confirmação, limpa e reseta todos os status locais dos alunos para "Pendente", redefinindo a lista para a próxima viagem.
- **Salvamento no Banco:** Registra a data atual do evento (`data_registro`) e mapeia o seletor 'Turno de Trabalho' (Manhã -> 'Matutino', Tarde -> 'Vespertino', Noite -> 'Noturno') na tabela `logs_embarque`.

### 6. Menu Inferior de Ocorrências Rápidas
- Barra flutuante com efeito blur de vidro (`backdrop-blur-md bg-slate-900/80 border-t border-slate-800/60`).
- Botões super arredondados com ícones Lucide minimalistas e rótulos curtos.
- Botão **SOS** destacado com fundo vermelho escuro e borda suave (`bg-rose-950/20 border-rose-900/20`) e ícone vermelho pulsante.

## Mocks Utilizados
```ts
interface Aluno {
  id: number | string;
  nome: string;
  escola: string;
  nee: boolean;
  tipoNee?: string;
  aBordo: boolean;
  fotoUrl?: string;
  statusLocal: 'pendente' | 'presente' | 'ausente';
}
```

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 27/05/2026 | Reconstrução total com design premium estilo iOS/Android nativo |
| 28/05/2026 | Refinamento do checklist (ciclo de 3 estados, reset automático, data e turno no lote Supabase) |
| 02/06/2026 | Correção no carregamento de dados (loadData): mapeamento correto das colunas id (em vez de auth_user_id), nome (em vez de nome_rota) e filtro de motorista_id |
