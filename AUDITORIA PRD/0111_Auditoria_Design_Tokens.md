# 🎨 Auditoria L-06: PIXEL — Design Tokens e Consistência UI/UX

Este relatório de auditoria avalia a conformidade visual, uso de fontes, modularização de código e consistência dos Design Tokens do front-end contra as diretrizes de design da Seção 2.3 do Blueprint.

---

## 1. Divergência de Paleta de Cores e Identidade Visual

O Blueprint define a paleta sob a chave `colors`:
- `brand.primary: #1E3A8A` (Azul Royal)
- `brand.secondary: #F59E0B` (Amarelo Queimado)

A implementação real no arquivo [tailwind.config.ts](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/tailwind.config.ts) utiliza:
- `primary.DEFAULT: #0F172A` (Azul Marinho Profundo / Slate 900)
- `accent.DEFAULT: #FBBF24` (Amarelo Ônibus Escolar / Amber 400)
- Aliases: `navy: '#0F172A'`, `ice: '#F8FAFC'`, `'bus-yellow': '#FBBF24'`

### Avaliação de Design:
- **Intencionalidade:** A divergência é **altamente benéfica e intencional**. O marinho profundo (`#0F172A`) confere uma identidade muito mais institucional, sóbria e corporativa para o sistema da prefeitura (SEMED), enquanto o amarelo-ônibus (`#FBBF24`) cria uma associação cognitiva imediata com a frota escolar real, gerando um contraste de acessibilidade e legibilidade superior ao azul do Blueprint.

---

## 2. Touch Targets (Área Mínima de Toque)

- **Exigência do Blueprint:** `touch_target_min: 48px` para evitar toques acidentais e melhorar a usabilidade mobile (principalmente para os motoristas no trânsito).
- **Implementação Real:**
  - **A propriedade `touch_target_min` não está declarada no Tailwind config.**
  - **Botões no Painel do Motorista:** Botões importantes como o de login ou submissão usam classes como `py-3` (~40px de altura total) ou `py-2` (~32px de altura), o que resulta em áreas de toque inferiores a 48px de altura, violando a especificação do Blueprint e as diretrizes de acessibilidade mobile do W3C.
  - A largura expandida (`w-full`) mitiga parcialmente a dificuldade de toque horizontal, mas a altura vertical permanece abaixo do ideal.

---

## 3. Breakpoints Responsivos e Visual Mobile

- **Blueprint:** Breakpoints `mobile: 320px`, `tablet: 768px`, `desktop: 1024px`.
- **Implementação Real:** O Tailwind config não sobrescreve os breakpoints padrão do Tailwind (que começam em `sm: 640px`).
- **Impacto:** Como o desenvolvimento adota a estratégia **mobile-first**, qualquer layout sem prefixo de responsividade atende a telas de 320px a 640px de largura. Os componentes e grids na Landing Page e no Painel do Motorista respondem de forma adequada, porém em tablets (como iPads com 768px), o breakpoint `sm: 640px` é ativado precocemente, o que pode espremer layouts em colunas antes de atingir o tamanho `md: 768px`.

---

## 4. Estrutura e Modularização de Arquivos Monolíticos

- **Arquivo `app/page.tsx` (Landing Page):**
  - **Tamanho do arquivo:** 47KB.
  - **🚨 Diagnóstico:** Contém todas as seções (Header, Hero, Benefícios, Frota, Estatísticas, Testemunhos, Perguntas Frequentes, Footer) em um único arquivo monolítico. Isso dificulta a manutenção e aumenta a complexidade de compilação da rota `/`.
  - **Recomendação:** Extrair as seções para sub-componentes independentes organizados sob a pasta `components/landing/`.

- **Arquivo `app/dashboard/motorista/page.tsx`:**
  - **Tamanho do arquivo:** 119KB (cerca de 2500 linhas de código!).
  - **🚨 Diagnóstico:** Contém a interface do motorista, modais de SOS, modais mecânicos, checklist de presenças, upload de foto e integração do scanner de QR Code em um único arquivo de página. Isso viola diretamente o princípio de modularidade extrema.
  - **Recomendação:** Extrair modais (`SOSModal`, `MecanicoModal`, `OcorrenciaModal`), a lista de alunos (`PassageirosChecklist`) e o scanner (`QrCodeReader`) para pastas e arquivos separados em `components/motorista/`.

---

## 5. Tipografia e Fontes

- **Layout Root (`app/layout.tsx`):**
  - A fonte `Inter` é carregada via `next/font/google` com o subset `latin`, pesos de 300 a 800 e injetada via variável CSS (`--font-inter`).
  - **Avaliação:** **100% Conforme.** A fonte carrega de forma otimizada no ciclo SSR eliminando o FOUC (Flash of Unstyled Content) e atende perfeitamente ao requisito NFR-03 de performance de rede.

---

## 📋 Resumo de Achados (L-06)
- **Status Geral:** 🟡 **CONFORME COM RESSALVAS**
- **Recomendações:**
  1. Refatorar os arquivos `app/page.tsx` e `app/dashboard/motorista/page.tsx` dividindo-os em arquivos menores.
  2. Ajustar os botões de ação e chips do motorista para possuir no mínimo `h-12` (48px) de altura para atender à diretriz de touch target.
