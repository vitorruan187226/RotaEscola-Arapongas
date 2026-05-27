# Design System — RotaEscola Arapongas (0101)

## Propósito
Centralizar os tokens de design, paleta de cores, tipografia e componentes base do sistema RotaEscola Arapongas. Este documento é a fonte da verdade para qualquer nova tela ou componente.

---

## Paleta de Cores — GovTech Premium

| Token Tailwind | Valor HEX | Uso |
|---|---|---|
| `primary` / `navy` | `#0F172A` | Azul Marinho Profundo — cor institucional, navbars, textos de destaque |
| `primary-950` | `#0F172A` | Tom mais escuro para gradientes |
| `secondary` / `ice` | `#F8FAFC` | Cinza Gelo — backgrounds, fundos de cards |
| `secondary-200` | `#E2E8F0` | Bordas e divisores |
| `secondary-500` | `#64748B` | Textos secundários, labels |
| `accent` / `bus-yellow` | `#FBBF24` | Amarelo Ônibus Escolar — ações primárias, bordas de destaque |
| `accent-600` | `#D97706` | Amarelo hover / texto sobre fundo claro |

### CSS Custom Properties (para compatibilidade)
```css
--primary-navy:    #0F172A
--secondary-white: #FFFFFF
--accent-yellow:   #FBBF24
--background-gray: #F8FAFC
--text-dark:       #1E293B
--text-light:      #64748B
--border-color:    #E2E8F0
--radius:          12px
```

---

## Tipografia

| Propriedade | Valor |
|---|---|
| **Fonte** | Inter (via `next/font/google`) |
| **Variável CSS** | `--font-inter` |
| **Subsets** | `latin` |
| **Pesos carregados** | 300, 400, 500, 600, 700, 800 |
| **Estratégia de display** | `swap` (evita FOUC) |
| **Aplicação** | `font-family: var(--font-inter), system-ui, sans-serif` |

### Escala de Tamanhos (Mobile-First)
- `h1`: `clamp(1.8rem, 4vw, 2.8rem)` — `font-weight: 800`
- `h2`: `clamp(1.6rem, 3vw, 2.2rem)` — `font-weight: 800`
- `h3`: `1.2rem` — `font-weight: 700`
- `body`: `1rem` / `line-height: 1.7`
- `small`: `0.82rem`

---

## Componentes Base (globals.css @layer components)

### Botões
| Classe | Cor de Fundo | Uso |
|---|---|---|
| `.btn-primary` | `--primary-navy` (azul) | Ações secundárias institucionais |
| `.btn-yellow` | `--accent-yellow` (amarelo) | **CTA principal** — máximo destaque |
| `.btn-secondary` | rgba branco semi-transparente | Navbar sobre fundo navy |
| `.btn-outline` | Transparente + borda navy | Alternativa ao btn-primary |
| `.btn-white-outline` | Transparente + borda branca | CTAs sobre fundo navy |

### Cards
| Classe | Descrição |
|---|---|
| `.card-premium` | Card branco com sombra sutil e hover animado (`translateY(-2px)`) |

### Badges e Status
| Classe | Cor | Uso |
|---|---|---|
| `.badge-yellow` | Amarelo suave | Tags de destaque |
| `.badge-type.own` | Verde suave | Frota própria |
| `.badge-type.partner` | Azul suave | Frota terceirizada |
| `.status-pill.ativo` | Verde | Veículo ativo |
| `.status-pill.manutenção` | Vermelho suave | Em manutenção |

### Navbar
- Classe: `.navbar`
- Background: `--primary-navy`
- Borda inferior: 4px `--accent-yellow`
- Suporte a **safe-area PWA** via `padding-top: calc(16px + var(--safe-area-top))`

### Layout de Dashboard
- `.dashboard-container` — full-height, flex column
- `.dashboard-grid` — max-width 1200px, centralizado
- `.summary-cards` — grid auto-fit, min 260px

---

## shadcn/ui

- **Template**: `next`
- **CSS Variables**: `yes`
- **Pasta de componentes**: `components/ui/`
- **Caminho de import**: `@/components/ui/...`

### Componentes Instalados
| Componente | Status |
|---|---|
| `Button` | ✅ Instalado |

---

## Animações Globais

| Classe utilitária | Keyframe | Uso |
|---|---|---|
| `.animate-fade-in` | `fadeIn` (opacity 0→1, 0.4s) | Elementos que aparecem |
| `.animate-slide-up` | `slideUp` (opacity + translateY, 0.5s) | Hero content, seções |
| `.glass` | — | Glassmorphism: backdrop-filter blur 12px |

---

## PWA / Mobile-First

- **Viewport**: `viewportFit: 'cover'` + `themeColor: '#0F172A'`
- **Safe areas**: `env(safe-area-inset-*)` aplicado no `body`, `navbar`, e `footer`
- **Dynamic viewport**: `min-height: 100dvh` (suporte a chrome mobile)
- **Font size**: `-webkit-text-size-adjust: 100%` (evita zoom automático em inputs)

---

## Arquivos Relacionados

| Arquivo | Responsabilidade |
|---|---|
| `tailwind.config.ts` | Tokens de cor, fontFamily, sombras, animações |
| `postcss.config.mjs` | Compilação Tailwind + autoprefixer |
| `app/globals.css` | Diretivas Tailwind + classes de componentes CSS |
| `app/layout.tsx` | Fonte Inter via next/font + Metadata + Viewport |
| `components/ui/` | Componentes shadcn/ui |
