# Tabela de Documentos do Aluno - public.documentos_aluno (0408)

## Propósito
Esta tabela armazena a referência aos arquivos e documentos anexados pelo responsável do aluno durante a solicitação de transporte escolar, associando-os com o respectivo estudante e registrando informações cruciais para a auditoria da SEMED.

## Estrutura da Tabela

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | uuid | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Identificador único do documento |
| `aluno_id` | uuid | FOREIGN KEY `public.alunos(id)` ON DELETE CASCADE, NOT NULL | Aluno ao qual o documento pertence |
| `tipo_documento` | text | NOT NULL | Tipo do anexo (ex: `Comprovante_Residencia`, `Documento_Aluno`, `Documento_Responsavel`, `Declaracao_Matricula`) |
| `url_arquivo` | text | NOT NULL | Caminho/URL do arquivo no Supabase Storage |
| `url_documento` | text | NULL | URL pública direta (para fins de redundância/compatibilidade retroativa) |
| `data_upload` | timestamp with time zone | DEFAULT `now()` | Data e hora em que o documento foi enviado |

## Políticas RLS (Row Level Security)

A tabela `public.documentos_aluno` possui o Row Level Security ativo. As políticas configuradas garantem:

1. **Leitura (SELECT)**:
   - Administradores (SEMED) têm acesso de leitura total.
   - Responsáveis (Pais) têm acesso de leitura restrito aos documentos associados aos seus filhos.
   
2. **Inserção (INSERT) / Atualização (UPDATE)**:
   - Responsáveis podem inserir ou atualizar os documentos de seus próprios filhos (vinculados ao seu `responsavel_id`).
   
3. **Exclusão (DELETE)**:
   - Restrito a administradores ou excluído automaticamente via CASCADE quando o aluno correspondente for deletado.

## Bucket no Supabase Storage

Os arquivos físicos são armazenados no bucket **`documentos-transporte`** do Supabase Storage. As políticas de acesso deste bucket estão alinhadas com as permissões da tabela `documentos_aluno`.

## Histórico de Modificações
| Data | Alteração |
|---|---|
| 11/06/2026 | Criação da tabela, RLS, buckets de armazenamento de transporte escolar e documentação inicial |
