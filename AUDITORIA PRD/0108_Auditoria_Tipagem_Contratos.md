# 📇 Auditoria L-03: TYPE CONTRACT — Tipagem TypeScript vs. Schema do Banco

Este relatório de auditoria analisa a consistência e a robustez dos contratos de dados (TypeScript types) usados no frontend da aplicação contra as colunas reais do banco PostgreSQL.

---

## 1. Mismatch de Tipos em `types/index.ts` vs. Banco de Dados

O arquivo central de tipagem [types/index.ts](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/types/index.ts) define as seguintes estruturas, que possuem divergências com o banco real:

### A. Interface `Aluno` vs. Tabela `alunos`
```typescript
export interface Aluno {
  id: string;
  nome: string;
  documento: string; // 🚨 Inconsistência
  escola: string;    // 🚨 Inconsistência
  serie: string;
  rotaId?: string;   // 🚨 camelCase vs snake_case
}
```
* **Divergências:**
  - **`documento`:** Não existe essa coluna na tabela `public.alunos` do banco de dados real. O hash do documento ou o link do documento é armazenado na tabela separada `public.documentos_aluno`.
  - **`escola`:** No banco real, a tabela de alunos armazena `escola` (como TEXT) e `escola_id` (como UUID references public.escolas).
  - **`rotaId`:** O banco de dados físico usa `rota_id` (snake_case). O Next.js tenta consultar camelCase ou mapear manualmente no fetch.

### B. Interface `Veiculo` vs. Tabela `veiculos`
```typescript
export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  capacidade: number;
  motoristaId?: string; // 🚨 camelCase vs snake_case
}
```
* **Divergência:**
  - O banco de dados real usa `motorista_id` (snake_case) em `public.veiculos`.

### C. Interface `Rota` vs. Tabela `rotas`
```typescript
export interface Rota {
  id: string;
  nome: string;
  turno: 'Matutino' | 'Vespertino' | 'Noturno'; // 🚨 Inconsistência de valores
  veiculoId?: string;                           // 🚨 camelCase vs snake_case
}
```
* **Divergência:**
  - **`turno`:** O enum do front-end define `'Matutino' | 'Vespertino' | 'Noturno'`. Mas nas migrations (`20260528155000` e outras) o campo check constraint de turno da rota é `check (turno in ('manha', 'tarde', 'noite', 'Manhã', 'Tarde', 'Noite'))`. Essa inconsistência de strings causa erros de filtros no frontend.

---

## 2. Acoplamento Fraco e o Uso de Type Casting (`as any`)

Embora o repositório cumpra a **LEI 4** ao não abusar de comentários `@ts-ignore` (zero ocorrências encontradas no código do app), foi identificado um uso excessivo e perigoso de `as any` ou type casting para `any` nos endpoints e páginas que consomem dados do Supabase.

### Ocorrências de Risco:
1. **`app/responsavel/dashboard/page.tsx` (Linha 240):**
   ```typescript
   const mapeados: Filho[] = (alunosDB as any[]).map((a: any) => { ... })
   ```
   * O fetch da query do Supabase não possui tipagem genérica associada, resultando no tipo `any[]`. As colunas são remapeadas manualmente sem garantia de compilação.
2. **`app/dashboard/admin/escolas/detalhes/page.tsx` (Linha 1135 e 1460):**
   * O campo `periodo` (ou `turno`) é forçado como `as any`, ocultando possíveis incompatibilidades entre strings como `manha` (minúscula) e `Manhã` (com acento).
3. **`app/dashboard/admin/frota/page.tsx` (Linha 175):**
   ```typescript
   tipo: (v.tipo as any) ?? 'Próprio',
   ```

---

## 3. Ausência de database.types.ts Autogerado

O Blueprint define que o ecossistema deve respeitar a tipagem gerada e integrada do Supabase (`database.types.ts`).

- **Situação Atual:** **O arquivo `database.types.ts` não existe no projeto.**
- **Consequência:** As chamadas ao cliente Supabase (ex: `supabase.from('alunos').select('*')`) retornam a tipagem implícita `PostgrestResponse<any>`, obrigando o desenvolvedor a usar `as any` para acessar propriedades no frontend. Isso anula a segurança do TypeScript e facilita o surgimento de bugs silenciosos de digitação de colunas.

---

## 📋 Resumo de Achados (L-03)
- **Status Geral:** 🔴 **CRÍTICO / NÃO CONFORME**
- **Recomendações:**
  1. Instalar o Supabase CLI localmente e rodar o comando de geração de tipos para criar o arquivo `types/database.types.ts`:
     ```bash
     npx supabase gen types typescript --project-id lzzxivzkwtwifgvexuiy > types/database.types.ts
     ```
  2. Tipar o cliente do Supabase com os tipos autogerados no frontend (`createClient<Database>()`).
  3. Eliminar todos os type casts `as any` e usar interfaces estruturadas de mapeamento de dados.
