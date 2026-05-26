# Tela de Teste de Quadrados (0203)

## Propósito
Uma tela de testes interativa contendo um grid de painéis ("quadrados") coloridos e responsivos. Usada para testar o Client-Side Hydration, hooks do React (`useState`, `useEffect`), animações em CSS puro e a consistência visual do layout do aplicativo.

## Rota
- `/test`

## Componentes Utilizados
- **Client Component Page:** `app/test/page.tsx`
- **Root Layout:** `app/layout.tsx`

## Lógica de Estado (Hooks)
- `useState` para rastrear:
  - Número de cliques em cada quadrado.
  - Índice do quadrado atualmente focado/selecionado.
  - Estado de animação global.

## Estilo e Paleta de Cores (Vanilla CSS)
- **Grid responsivo** com glassmorphism.
- **Cores Tailored HSL:**
  - Vermelho Violeta (Escarlate Cósmico): `hsl(340, 85%, 55%)`
  - Azul Elétrico (Neon): `hsl(200, 95%, 55%)`
  - Verde Esmeralda (Cibernética): `hsl(150, 85%, 50%)`
  - Âmbar Brilhante: `hsl(45, 95%, 50%)`
