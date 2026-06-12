# 🏛️ Auditoria de Segurança e Prevenção de Vazamento de Dados (0105)

> **Data de Emissão:** 12/06/2026  
> **Status da Auditoria:** ⚠️ Crítico (Vulnerabilidades Identificadas)  
> **Foco:** Proteção de Dados Sensíveis dos Estudantes (RG, CPF, Endereço, Documentos)  

---

## 🛑 1. Resumo dos Riscos Encontrados

Realizamos uma análise profunda na arquitetura de segurança (Políticas de RLS no Supabase, rotas de API do Next.js e armazenamento de arquivos no Supabase Storage). Foram identificadas **4 vulnerabilidades graves** que podem resultar em vazamento de dados pessoais identificáveis (PII - CPF, telefone, documentos anexos):

1. **Endpoint de Criação de Motoristas sem Autenticação (`/api/admin/motoristas`)**: Qualquer usuário anônimo na internet pode fazer requisições POST para criar contas e perfis de motoristas.
2. **Políticas de RLS Inseguras na Tabela `public.perfis`**: Qualquer usuário autenticado (incluindo contas de responsáveis comuns) pode ler e modificar CPFs, telefones e nomes de todos os outros usuários do sistema.
3. **Exposição Pública de Documentos Sensíveis no Supabase Storage**: Os arquivos contendo dados pessoais (comprovante de residência, RG e certidão escolar) são salvos em um bucket público e disponibilizados via URL estática.
4. **Função RPC `get_email_by_cpf` Exposta**: Qualquer pessoa pode consultar CPFs na API pública do Supabase para coletar e enumerar e-mails.

---

## 🔍 2. Detalhamento e Remediações

---

### Vulnerabilidade A: Criação de Motoristas Sem Autenticação (Privilege Escalation)
* **Local:** `app/api/admin/motoristas/route.ts`
* **Vulnerabilidade:** A rota recebe um payload POST e usa a chave mestre `SUPABASE_SERVICE_ROLE_KEY` para criar usuários no banco sem verificar se quem está fazendo a chamada é um usuário logado com papel de administrador (`Admin`).
* **Impacto:** Um atacante pode criar contas com a role de motorista, burlar restrições de rotas e acessar dados protegidos pelo RLS.
* **Solução:** Adicionar validação de sessão usando cookies e o cliente Supabase Server para garantir que apenas administradores autenticados executem a ação.

---

### Vulnerabilidade B: RLS Inseguro em `public.perfis` (Exposição de CPFs e Telefones)
* **Local:** Políticas de RLS da tabela `public.perfis` no Supabase
* **Vulnerabilidade:** A política `Acesso total para usuários autenticados` (criada na migração `20260528160000`) concede permissão de **leitura e escrita irrestrita** (`FOR ALL USING (true)`) para qualquer pessoa logada.
* **Impacto:** Um pai logado pode executar uma query no frontend para consultar o CPF e telefone de todos os pais e administradores cadastrados, ou alterar seus próprios privilégios para se autopromover a `Admin`.
* **Solução:** Revogar essa política e definir regras estritas onde o usuário só edita e vê seu próprio perfil, o administrador vê todos, e pais/motoristas só se visualizam se estiverem conectados na mesma rota escolar.

---

### Vulnerabilidade C: Documentos Pessoais em Bucket Público (Vazamento de PII)
* **Local:** `app/responsavel/dashboard/page.tsx` e `app/dashboard/admin/escolas/detalhes/page.tsx`
* **Vulnerabilidade:** Os documentos como RG e comprovante de endereço são enviados ao bucket `documentos-transporte` e expostos via `.getPublicUrl()`, gerando links permanentes acessíveis sem login.
* **Impacto:** Caso alguém obtenha a URL de um documento, poderá acessar o arquivo de forma pública, ferindo as diretrizes da LGPD (Lei Geral de Proteção de Dados).
* **Solução:** Configurar o bucket como **Privado** e utilizar links temporários assinados (`.createSignedUrl()`) válidos por poucos minutos para visualização dos arquivos no painel da SEMED e do responsável.

---

## 🛠️ 3. SQL de Correção (Executar no Supabase)

Copie e cole o script abaixo no **SQL Editor** do Supabase para corrigir instantaneamente as políticas de RLS e remover a RPC vulnerável:

```sql
-- ══════════════════════════════════════════════════════════════════════════════
-- CORREÇÃO DE SEGURANÇA: TABELA PUBLIC.PERFIS E REMOÇÃO DE RPC EXPOSTA
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Remover a política insegura que permite escrita/leitura total a qualquer logado
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.perfis;
DROP POLICY IF EXISTS "Qualquer autenticado le perfis" ON public.perfis;

-- 2. Criar política estrita de Leitura (SELECT) para a tabela de Perfis
CREATE POLICY "Leitura de perfis de acordo com o papel"
  ON public.perfis
  FOR SELECT
  TO authenticated
  USING (
    -- O próprio usuário pode ler seu perfil
    (auth.uid() = id) OR
    -- Administradores da SEMED podem ver todos os perfis
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin')) OR
    -- Responsáveis podem ver o perfil do motorista designado para a rota do seu filho
    (
      EXISTS (
        SELECT 1 FROM public.alunos a
        JOIN public.rotas r ON a.rota_id = r.id
        WHERE a.responsavel_id = auth.uid() AND r.motorista_id = perfis.id
      )
    ) OR
    -- Motoristas podem ver o perfil dos responsáveis dos alunos de sua rota
    (
      EXISTS (
        SELECT 1 FROM public.alunos a
        JOIN public.rotas r ON a.rota_id = r.id
        WHERE r.motorista_id = auth.uid() AND a.responsavel_id = perfis.id
      )
    )
  );

-- 3. Criar política estrita de Atualização (UPDATE) para a tabela de Perfis
CREATE POLICY "Usuarios atualizam apenas seu proprio perfil"
  ON public.perfis
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = id) OR
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin'))
  )
  WITH CHECK (
    (auth.uid() = id) OR
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'tipo_usuario') IN ('Admin', 'admin'))
  );

-- 4. Excluir a RPC get_email_by_cpf pública (Prevenção de User Harvesting)
DROP FUNCTION IF EXISTS public.get_email_by_cpf(text);
```

---

## 🚀 4. Plano de Ação para Código e Storage

1. **Correção da Rota de Cadastro de Motorista**: Alterar o arquivo [route.ts](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/api/admin/motoristas/route.ts) para validar a sessão do remetente e garantir que apenas administradores autenticados executem a ação.
2. **Login Seguro (Bypass de RPC)**: Ajustar a rota [login/route.ts](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/api/auth/login/route.ts) para consultar o e-mail real do CPF usando o cliente admin direto no servidor Next.js, permitindo excluir a função pública `get_email_by_cpf`.
3. **Storage de Documentos Privado**: Alterar o bucket `documentos-transporte` no painel do Supabase para **Privado** e modificar o carregamento de anexos na tela de auditoria para requisitar uma URL assinada (`createSignedUrl`).
