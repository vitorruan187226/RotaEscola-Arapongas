# 🏛️ Auditoria L-01: SCHEMA DELTA — Gaps de Estrutura do PostgreSQL

Este relatório de auditoria mapeia as divergências estruturais entre o schema relacional exigido pelo **Blueprint Técnico** e o schema real implementado via migrations físicas no Supabase do projeto.

---

## 1. Matriz de Equivalência e Divergência de Nomes (Tabelas e Colunas)

O Blueprint define o banco com tabelas e tipos em **inglês**, utilizando relações diretas, enquanto o banco real foi desenvolvido em **português**. A tabela abaixo detalha esse mapeamento:

| Tabela Blueprint (Ideal) | Tabela Banco Real (Supabase) | Status / Divergências de Colunas |
| :--- | :--- | :--- |
| `public.profiles` | `public.perfis` | **Equivalente.**<br>- `full_name` no Blueprint vs. `nome` no banco real.<br>- `role` (ENUM) vs. `tipo_usuario` (TEXT + CHECK).<br>- `phone_number` vs. `telefone`.<br>- `is_active` vs. `ativo` (não presente diretamente na tabela `perfis`, mas o controle está em `motoristas_perfil.ativo`). |
| `public.students` | `public.alunos` | **Equivalente.**<br>- `profile_id` (vinculado ao pai) vs. `responsavel_id`.<br>- `school_name` vs. `escola` (TEXT) e `escola_id` (UUID references escolas).<br>- `school_grade` vs. `serie`.<br>- `residential_address` vs. `endereco`.<br>- `document_hash` no Blueprint vs. `documento` e `foto_url` no banco.<br>- `status` (ENUM) vs. `status_carteirinha` (TEXT + CHECK) + coluna `ativo` (BOOLEAN). |
| `public.trip_telemetry` | `public.localizacao_veiculo` | **Parcialmente Divergente.**<br>- O banco real usa `localizacao_veiculo` para telemetria em tempo real (veículo ativo) e registra o histórico simplificado em `logs_embarque`. Não existe a tabela unificada `trip_telemetry` com todas as coordenadas agregadas por segundo. |
| N/A | `public.carteirinhas` | Tabela auxiliar presente no banco real para associar `aluno_id` ao `qr_code_hash`. |
| N/A | `public.documentos_aluno` | Tabela auxiliar no banco real para upload de PDFs. O Blueprint exigia `document_hash` direto em `students`. |
| N/A | `public.motoristas_perfil` | Tabela auxiliar no banco real para detalhes de CNH, placa e veículo do motorista. |

---

## 2. UUID-OSSP vs. gen_random_uuid (pgcrypto)

- **Blueprint:** Exige `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` para habilitar `uuid_generate_v4()`.
- **Banco Real:** Utiliza a função nativa `gen_random_uuid()` (que pertence à extensão padrão `pgcrypto`, habilitada por padrão no Supabase).
- **Impacto Arquitetural:** **Zero conflito.** Ambas geram UUIDs RFC 4122 versão 4 perfeitamente compatíveis no ecossistema PostgreSQL. O uso de `gen_random_uuid()` no banco real é mais limpo, pois dispensa a inicialização explícita da extensão `uuid-ossp`.

---

## 3. Coordenadas Geográficas: POINT vs. Latitude/Longitude Individuais

- **Blueprint (`trip_telemetry`):** Exige `coordinates POINT NOT NULL` (armazena `(X=Longitude, Y=Latitude)` nativo do Postgres).
- **Banco Real (`localizacao_veiculo`):** Utiliza `latitude DOUBLE PRECISION` e `longitude DOUBLE PRECISION` em colunas separadas.
- **Análise de Performance e Usabilidade:**
  - **Uso do POINT (Recomendado pelo Blueprint):** Armazenamento em um único campo vetorial de 16 bytes. Facilita o uso de funções de distância e queries espaciais. É mais leve em termos de I/O.
  - **Uso de Latitude/Longitude separadas (Implementado no Banco Real):** Ocupa 16 bytes no total (8 bytes para cada `DOUBLE PRECISION`). O mapeamento com bibliotecas Javascript como Leaflet ou Google Maps no front-end é direto (sem necessidade de parsear string do tipo `(x,y)`).
  - **Veredicto:** A abordagem real simplifica o consumo de API no Next.js (basta retornar floats). Porém, se a SEMED de Arapongas expandir o sistema para usar geofencing avançado (como cercas geográficas poligonais via PostGIS), o uso de dados espaciais unificados (ou extensão `postgis`) será necessário.

---

## 4. ENUMs Tipados vs. Check Constraints no Postgres

- **Blueprint:** Define os tipos ENUM `user_role`, `student_status` e `attendance_status`.
- **Banco Real:** Usa colunas do tipo `TEXT` acopladas a `CHECK CONSTRAINTS` (ex: `check (tipo_usuario in ('Admin', 'Secretaria', 'Motorista', 'Responsável'))`).

### Comparativo Arquitetural

| Dimensão | PostgreSQL ENUM (Blueprint) | TEXT + CHECK Constraint (Real) |
| :--- | :--- | :--- |
| **Integridade de Dados** | Excelente. O banco rejeita qualquer string inválida em tempo de compilação/inserção. | Boa. A check constraint impede inserções de dados inválidos de forma similar. |
| **Facilidade de Alteração** | **Difícil.** Adicionar um novo valor exige comandos como `ALTER TYPE ... ADD VALUE`, que podem bloquear a tabela em concorrência pesada. | **Fácil.** Basta rodar `ALTER TABLE ... DROP CONSTRAINT` e criar uma nova com a lista atualizada de itens. |
| **Integração ORM/Next.js** | Mapeamento nativo como tipos de união (union types) string. | Mapeado apenas como `string` genérica nos tipos gerados, exigindo type casts adicionais no TypeScript. |

---

## 5. Estratégia de Indexação e Gaps

O Blueprint exige os seguintes índices de performance:
1. `idx_students_driver` em `public.students(assigned_driver_id) WHERE status = 'APPROVED_ACTIVE'`
2. `idx_telemetry_driver_time` em `public.trip_telemetry(driver_id, recorded_at DESC)`

Nas migrations reais do banco de dados, os índices implementados são:
- `idx_carteirinhas_hash` em `carteirinhas(qr_code_hash)` (Migration `20260528150000`).
- `idx_logs_embarque_aluno` em `logs_embarque(aluno_id, criado_em desc)` (Migration `20260528150000`).
- `idx_perfis_cpf` em `perfis(cpf)` (Migration `20260528170000`).

### 🚨 Gaps de Indexação Identificados:
1. **Ausência de índice parcial para alunos por motorista:** A tabela `alunos` (equivalente a `students`) **não possui** índice no campo `rota_id` ou `responsavel_id`. Para grandes volumes de dados (ex: Arapongas operando centenas de vans concorrentemente), as queries de busca por motorista ou responsável causarão Seq Scans degradando o banco.
2. **Ausência de índice composto de telemetria:** A tabela `localizacao_veiculo` (equivalente a `trip_telemetry`) **não possui** índices no campo `rota_id` ou `atualizado_em`.

---

## 6. Mapeamento de logs_embarque and localizacao_veiculo vs. trip_telemetry

O Blueprint unifica o histórico de rota e telemetria na tabela `trip_telemetry`. O banco real separa essa lógica:
1. `localizacao_veiculo`: Guarda apenas a **última posição conhecida** do ônibus/van por rota (tabela leve, otimizada para updates rápidos).
2. `logs_embarque`: Guarda os eventos pontuais de check-in e check-out (IDA/VOLTA) dos alunos na carteirinha digital.

**Avaliação Arquitetural:** A separação feita nas migrations reais é **altamente recomendável** e superior à proposta original do Blueprint para a carga transacional. Se escrevêssemos cada ping de telemetria (a cada 5 segundos por veículo) na mesma tabela transacional onde guardamos o histórico, o inchaço de banco inviabilizaria o uso após poucos meses em Arapongas. 

---

## 📋 Resumo de Achados (L-01)
- **Status Geral:** ⚠️ **DIVERGENTE** (Mas aceitável arquiteturalmente).
- **Recomendação Crítica:** Criar índices na tabela `alunos(responsavel_id)` e `alunos(rota_id)` para acelerar as consultas do Portal dos Pais e do Painel do Motorista.
