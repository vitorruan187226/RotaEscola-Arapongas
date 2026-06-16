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
- **Seletor de Sentido da Viagem:** Seletor interativo premium para o motorista definir explicitamente se a viagem é de **Ida (Escola)** ou **Volta (Casa)**, inicializado de acordo com o turno selecionado (Ida no turno Manhã, Volta no turno Tarde/Noite) com possibilidade de override manual.
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

### 6. Menu Inferior de Ações Rápidas
- Barra flutuante com efeito blur de vidro (`backdrop-blur-md bg-slate-900/80 border-t border-slate-800/60`).
- Botões super arredondados com ícones Lucide minimalistas e rótulos curtos.
- Botão **Prestar Ocorrência** (substituiu o antigo "Trânsito") destacado em laranja (`bg-orange-950/20 border-orange-900/20`) com ícone `ShieldAlert` âmbar.
  - Ao clicar, abre o **Modal de Ocorrência** (ver seção 7).
- Botão **Mecânico** com ícone `Wrench` âmbar.
- Botão **Vias** com ícone `Map` neutro.
- Botão **SOS** destacado com fundo vermelho escuro e ícone `AlertOctagon` pulsante.

### 7. Modal de Prestar Ocorrência (Fluxo 2 Estágios)
Overlay completo sobre o painel (z-50), com dois estágios sequenciais:

**Estágio 1 — Scan:**
- Câmera abre via `html5-qrcode` (instância separada: `ocorrencia-reader`).
- Laser laranja pulsante + cantoneiras laranjas no visor.
- Banner informativo: "Aguardando leitura da carteirinha..."
- Ao identificar o aluno, para o scanner e avança automaticamente para o Estágio 2.
- Se o aluno não for encontrado, avisa por voz (pt-BR) e reinicia o scanner.
- **Fallback de Seleção Manual:** Botão "Selecionar Aluno Manualmente" que interrompe o scanner e exibe uma lista de busca dinâmica para o motorista selecionar o aluno pelo nome (dos cadastrados na rota/viagem ativa). Ao selecionar, avança para o Estágio 2.

**Estágio 2 — Descrição:**
- Card com foto + nome + escola do aluno identificado (borda laranja).
- `<textarea>` para o motorista descrever o ocorrido (mínimo 5 caracteres para habilitar envio).
- Contador de caracteres em tempo real.
- Botão **"Enviar Ocorrência"** com gradiente laranja → âmbar; desabilitado enquanto descrição for curta.
- Ao confirmar: INSERT em `public.ocorrencias` → status `'pendente'`.

**Confirmação:**
- Tela de sucesso com ícone verde e texto: "Ocorrência Registrada! A secretaria foi notificada e tomará as devidas providências."
- Modal fecha automaticamente após 2,5 segundos.

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
| 03/06/2026 | Botão "Trânsito" substituído por "Prestar Ocorrência" (ShieldAlert laranja). Modal de 2 estágios: Scan QR → Descrição → Envio para `public.ocorrencias`. Veja `_docs/0211_Ocorrencias.md`. |
| 03/06/2026 | Correção no loadData para evitar carregamento de fallback mock para motoristas reais cadastrados sem rotas atreladas, adicionando tratamento de estado vazio. |
| 09/06/2026 | Correção no leitor de QR Code (handleQrCodeScanned e handleOcorrenciaScan) para permitir a validação tanto por UUID direto, hash customizado cadastrado ou formato fallback da carteirinha digital. |
| 09/06/2026 | Otimização do escâner real com remoção da restrição de 'qrbox' para escanear a imagem completa e ajuste do aluno Carlos no banco de dados para a rota teste/turno manhã. |
| 09/06/2026 | Correção do bug de loop de leitura: o scanner agora ignora leituras adicionais quando o status do aluno já estiver marcado como 'presente'. |
| 15/06/2026 | Correção do bug de timezone/shifting de data: unificação de datas locais via `getLocalDateString()`, garantindo que faltas reportadas fiquem trancadas e riscadas sem poder ser sobrescritas pelo motorista. |
| 15/06/2026 | Implementação do seletor manual premium de sentido da viagem (Ida/Volta) no painel do motorista, integrado ao fluxo de envio em lote para `logs_embarque`. |
| 16/06/2026 | Implementação do controle operacional real de status "Em Rota" (switch interativo) atualizando a coluna `ativa` na tabela `rotas`. |



