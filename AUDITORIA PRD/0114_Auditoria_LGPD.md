# 🏛️ Auditoria L-09: GDPR-BR — Conformidade LGPD e Proteção de Dados de Menores

Este relatório de auditoria avalia a privacidade de dados do ecossistema RotaEscola Arapongas contra as exigências da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018), que impõe proteção especial ao tratamento de dados de crianças e adolescentes.

---

## 1. Ausência de Criptografia em Colunas Sensíveis (Field-Level Encryption)

- **Exigência do Blueprint (Seção 2.4):** Dados sensíveis de menores (documentos, foto, geolocalização residencial exata) devem possuir criptografia a nível de coluna (Field-Level Encryption - FLE) usando chaves AES-256-GCM gerenciadas externamente.
- **Implementação Real:** **Nenhuma.**
  - Tabelas como `alunos` armazenam o campo `endereco` em texto claro (`TEXT`).
  - A tabela `perfis` armazena o `cpf` e o `telefone` dos responsáveis em texto claro.
  - A geolocalização de pontos residenciais é registrada como floats em texto claro no banco.
  - **Risco:** Qualquer vazamento de backup ou acesso administrativo inadequado ao banco do Supabase exporá a lista completa de endereços residenciais exatos e CPFs da população de Arapongas de forma imediata.

---

## 2. Exposição Pública de Documentos Cadastrais de Menores

- **Exigência do Blueprint (Seção 2.4):** Mitigação de vazamento de dados de identificação (PII) através de controles rígidos de acesso.
- **Implementação Real (Migration `20260615165500_create_storage_buckets.sql`):**
  - Os buckets `documentos-transporte` (onde motoristas salvam fotos) e `documentos-alunos` (onde pais enviam RG/comprovante de matrícula) foram criados como **PÚBLICOS**:
  ```sql
  insert into storage.buckets (id, name, public, ...)
  values ('documentos-alunos', 'documentos-alunos', true, ...);
  ```
  - A política de leitura (`SELECT`) permite acesso universal e irrestrito a qualquer pessoa na internet:
  ```sql
  create policy "Permitir leitura pública de documentos-alunos"
  on storage.objects for select
  to public
  using (bucket_id = 'documentos-alunos');
  ```
- **🚨 Diagnóstico de Risco:** Isso constitui uma **violação grave da LGPD**. Qualquer pessoa que consiga prever ou coletar a URL estática de um anexo (ex: `https://.../storage/v1/object/public/documentos-alunos/documentos/...`) poderá baixar livremente os RGs e comprovantes de endereço das crianças sem qualquer autenticação ou registro de log de auditoria.

---

## 3. Ausência de Fluxo "Right to be Forgotten" (Esquecimento e Anonimização)

- **Exigência do Blueprint:** Fluxo automatizado de exclusão onde os dados de identificação do menor são apagados sob solicitação, mantendo apenas logs de rota anonimizados para fins de estatística urbana.
- **Implementação Real:** **Não existe.**
  - A exclusão de registros de alunos no painel de administração (`/dashboard/admin/alunos`) executa um `DELETE` físico. Mas o histórico de viagens em `logs_embarque` não sofre qualquer processo de desvinculação ou anonimização.
  - Não há Edge Functions ou scripts implementando desidentificação de logs agregados de viagens de ônibus por rota/escola.

---

## 4. Política de Retenção e Arquivamento de Dados (Data Lifecycle)

- **Exigência do Blueprint (Seção 3.4):**
  - Dados Hot (0 a 90 dias): Transacionais.
  - Dados Cold (> 90 dias): Convertidos para formato Apache Parquet e salvos em Cold Storage (S3 Glacier) a baixo custo, com exclusão em lote no Postgres.
- **Implementação Real:** **Não existe.**
  - Toda a telemetria histórica (`localizacao_veiculo`) e os logs de check-in (`logs_embarque`) permanecem permanentemente ativos no banco de dados. Isso pode causar a degradação de performance das consultas da SEMED à medida que o volume de viagens aumenta nos semestres letivos.

---

## 📋 Resumo de Achados (L-09)
- **Status Geral:** 🔴 **CRÍTICO / NÃO CONFORME**
- **Ações Corretivas Urgentes:**
  1. Alterar o parâmetro `public` de `true` para `false` na criação dos buckets e revogar a política de select público.
  2. Implementar no Next.js a geração de links temporários com validade máxima de 5 minutos (`.createSignedUrl()`) para os administradores visualizarem os comprovantes escolares no painel de moderação.
  3. Estudar a integração do módulo de criptografia do PostgreSQL (`pgcrypto` ou `pgsodium`) para encriptar os campos `cpf`, `telefone` e `endereco` na tabela de alunos e perfis.
