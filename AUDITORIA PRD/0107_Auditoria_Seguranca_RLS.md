# 🛡️ Auditoria L-02: FORTRESS — Segurança, RLS e Vulnerabilidades

Este relatório de auditoria avalia o estado das políticas de Row-Level Security (RLS) e a segurança de dados sensíveis na plataforma RotaEscola Arapongas.

---

## 1. Políticas de RLS da Tabela Alunos

O Blueprint exige três regras estritas:
1. Pais só visualizam seus respectivos filhos.
2. Motoristas visualizam alunos vinculados à sua rota.
3. SEMED possui controle total irrestrito.

### Análise da Implementação Real (Migration `20260602163000_fix_alunos_rls_policies.sql`)

A política `Usuarios leem alunos de acordo com seu papel` está estruturada assim:
```sql
USING (
  ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
  ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
  ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Motorista', 'motorista')) OR
  ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Motorista', 'motorista')) OR
  (auth.uid() = responsavel_id)
);
```

### 🚨 Falha Crítica Identificada (Vazamento de Dados):
- **O que o Blueprint exige:** O motorista deve visualizar **apenas** os alunos vinculados à sua rota (`assigned_driver_id` ou `rota_id` gerenciado pelo motorista).
- **O que está implementado:** Qualquer usuário autenticado cujo JWT possua `role: 'Motorista'` ou `tipo_usuario: 'Motorista'` tem **acesso total de leitura para todos os alunos cadastrados no banco**, independente da rota ou escola.
- **Risco:** Um motorista mal-intencionado pode extrair via API do Supabase a lista completa de crianças de Arapongas, contendo nomes, escolas, séries e localizações residenciais, violando as regras de minimização da LGPD.

---

## 2. Endpoint de Cadastro de Motoristas Sem Autenticação

- **Local:** `app/api/admin/motoristas/route.ts`
- **Blueprint / Boas Práticas:** A criação de contas com a role de motorista deve ser restrita apenas aos administradores autenticados da SEMED.
- **Código Real:**
```typescript
export async function POST(req: NextRequest) {
  try {
    const { nome, cpf, telefone, placa, modelo, capacidade, cnh, cnhCategoria } = await req.json();
    ...
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, ...);
    ...
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({ ... });
```
- **🚨 Diagnóstico de Vulnerabilidade:** **A rota está 100% aberta para a internet.** Não existe nenhuma chamada a `supabase.auth.getUser()` ou validação de sessão usando cookies antes de instanciar o cliente `supabaseAdmin` (que roda com `service_role_key`). Qualquer atacante que envie um payload POST para `/api/admin/motoristas` criará uma conta com privilégios de motorista em Arapongas.

---

## 3. RLS Inseguro na Tabela Perfis

- **Local:** `perfis`
- **Estado Real (Migration `20260602190000_fix_documentos_and_perfis_rls.sql`):**
```sql
CREATE POLICY "Qualquer autenticado le perfis"
  ON public.perfis
  FOR SELECT
  TO authenticated
  USING (true);
```
- **🚨 Diagnóstico de Vulnerabilidade:** **Qualquer usuário autenticado (incluindo responsáveis cadastrados de forma anônima) pode ler as informações de todos os outros usuários cadastrados no banco.** Isso expõe nomes, telefones e CPFs (PII) de pais, motoristas e funcionários municipais em Arapongas. A recomendação corretiva proposta no relatório de segurança `0105_Analise_Seguranca.md` **não foi executada**.

---

## 4. Documentos Cadastrais de Menores em Bucket Público

- **Local:** Storage do Supabase (Bucket `documentos-alunos`)
- **Código Real:** `app/responsavel/dashboard/page.tsx`, `app/responsavel/documentos/page.tsx`
- **Trecho de código:**
```typescript
const publicUrl = supabase.storage
  .from("documentos-alunos")
  .getPublicUrl(`documentos/${fileName}`).data.publicUrl;
```
- **🚨 Diagnóstico de Vulnerabilidade:** A chamada `.getPublicUrl()` gera uma URL estática e permanente acessível por qualquer pessoa na internet sem controle de acesso. Os documentos sensíveis dos menores (comprovantes de residência, certidões e RGs) estão expostos de forma pública, o que contraria as exigências da LGPD sobre a proteção de dados pessoais sensíveis de crianças e adolescentes.

---

## 5. Exposição Pública da RPC `get_email_by_cpf`

- **Local:** Migration `20260528170000_fluxo_cadastro.sql`
- **Código Real:** `app/api/auth/login/route.ts` (Linha 78)
- **Função SQL:**
```sql
create or replace function public.get_email_by_cpf(cpf_to_find text)
returns text
security definer
language plpgsql
as $$
begin
  return (
    select email from public.perfis where cpf = cpf_to_find limit 1
  );
end;
$$;
```
- **🚨 Diagnóstico de Vulnerabilidade:** A função é `SECURITY DEFINER` e não tem restrição de acesso por role no Postgres. Ela pode ser invocada remotamente pela API pública do Supabase sem autenticação. Isso permite a um atacante varrer (harvesting) CPFs e descobrir se eles estão cadastrados no sistema e seus respectivos e-mails.

---

## 6. Avaliação de RLS em Veículos e Rotas

- **Local:** `public.veiculos` e `public.rotas`
- **Diagnóstico:** A DDL em `20260601183000_remediacao_infra_banco.sql` corrigiu a exposição inicial ativando RLS e criando políticas de select para usuários autenticados e políticas de escrita apenas para administradores baseadas no `tipo_usuario` da tabela `perfis`.

---

## 📋 Resumo de Achados (L-02)
- **Status Geral:** 🔴 **CRÍTICO / NÃO CONFORME**
- **Ações Corretivas Urgentes:**
  1. Restringir a API Route de motoristas para aceitar apenas sessões ativas com a role de Admin.
  2. Substituir a política de `perfis` SELECT para que usuários vejam apenas seus próprios registros ou de usuários relacionados.
  3. Alterar o bucket `documentos-alunos` para privado e usar `.createSignedUrl()` no Next.js.
  4. Substituir a RPC `get_email_by_cpf` por uma consulta direta no backend do Next.js usando o cliente administrativo `service_role` protegido pelo servidor.
