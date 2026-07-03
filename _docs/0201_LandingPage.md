# [0201] Landing Page (`app/page.tsx`)

## 1. Propósito
A Landing Page atua como o ponto de entrada principal do sistema RotaEscola Arapongas, apresentando as funcionalidades para Pais, Motoristas e Secretaria de Educação. Foi refatorada para aderir ao princípio de Modularidade Extrema, removendo a estrutura monolítica e adotando componentes focados.

## 2. Rota
- **Path:** `/`
- **Acesso:** Público

## 3. Componentes Modulares (Extraídos para `components/landing/`)
A página principal (`app/page.tsx`) não contém mais regras complexas de interface. Ela compõe a página importando os seguintes átomos:

1. **`HeaderSection.tsx`**: Barra de navegação com links âncora, botão de acesso e menu mobile (com `useState` isolado).
2. **`HeroSection.tsx`**: Área de destaque inicial com estatísticas dinâmicas e mockups de tela.
3. **`BeneficiosSection.tsx`**: Lista dos três pilares do sistema (Secretaria, Pais, Motoristas).
4. **`RecursosSection.tsx`**: Grade de cards exibindo funcionalidades exclusivas.
5. **`CtaBannerSection.tsx`**: Chamada para ação com destaque para o recadastro anual.
6. **`SuporteSection.tsx`**: Contatos da SEMED (Telefone, E-mail, Presencial).
7. **`FooterSection.tsx`**: Rodapé com links importantes e selos.

## 4. Contratos de Dados (Tipagem) e Hooks
- Atualmente, a Landing Page é estática e não consome dados do backend/Supabase.
- Todos os dados exibidos vêm de constantes (`NAV_LINKS`, `STATS`, `PILARES`, `RECURSOS`) que foram encapsuladas dentro dos seus respectivos componentes modulares.

## 5. Arquitetura e CSS
- O CSS base (`lp-root`, `lp-header`, etc.) permanece injetado via uma tag `<style>` no final do componente em `app/page.tsx` para manter a performance de carregamento rápido sem criar CSS Modules extras para uma página de puramente apresentação estática.
- A página compila com sucesso sob a tipagem rigorosa do Next.js.
