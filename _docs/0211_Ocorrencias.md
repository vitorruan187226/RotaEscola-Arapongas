# Ocorrências Disciplinares (0211)

## Propósito
Módulo de registro e gestão de ocorrências disciplinares no transporte escolar. O motorista registra incidentes envolvendo alunos diretamente no painel mobile; a secretaria visualiza, filtra e encaminha as ocorrências ao responsável do aluno.

## Rotas
- `/dashboard/admin/ocorrencias` — Painel da secretaria (lista, filtro e ação)

## Fluxo Completo
```
Motorista (painel mobile)
  → clica "Prestar Ocorrência" (ShieldAlert laranja no menu inferior)
  → Modal Estágio 1: escaneia carteirinha do aluno infrator (QR Code)
  → Modal Estágio 2: digita descrição do ocorrido
  → clica "Enviar Ocorrência"
  → INSERT em public.ocorrencias { status: 'pendente' }

Secretaria (painel admin /dashboard/admin/ocorrencias)
  → vê a ocorrência listada com badge "Pendente"
  → clica "Enviar ao Pai"
  → INSERT em public.notificacoes (destinatario_id = responsavel_id do aluno)
  → UPDATE public.ocorrencias SET status = 'enviada_ao_pai'
  → badge muda para "Enviada ao Pai" (verde)
```

## Tabela: `public.ocorrencias`

### Contrato de Dados (DDL)
```sql
CREATE TABLE public.ocorrencias (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id     UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  motorista_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  descricao    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pendente'
               CHECK (status IN ('pendente', 'enviada_ao_pai')),
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tipagem TypeScript
```ts
interface OcorrenciaRow {
  id: string;
  descricao: string;
  status: 'pendente' | 'enviada_ao_pai';
  criado_em: string;
  aluno: {
    id: string;
    nome: string;
    escola: string;
    foto_url: string | null;
    responsavel_id: string | null;
  } | null;
  motorista: {
    nome: string;
  } | null;
}
```

### Políticas de RLS
| Política | Quem | Operação | Condição |
|---|---|---|---|
| `motorista_insert_ocorrencias` | authenticated | INSERT | `motorista_id = auth.uid()` |
| `motorista_select_ocorrencias` | authenticated | SELECT | `motorista_id = auth.uid()` |
| `admin_select_all_ocorrencias` | authenticated | SELECT | `perfis.tipo_usuario IN ('Admin','Secretaria')` |
| `admin_update_ocorrencias` | authenticated | UPDATE | `perfis.tipo_usuario IN ('Admin','Secretaria')` |
| `responsavel_select_ocorrencias_filho` | authenticated | SELECT | `alunos.responsavel_id = auth.uid()` |

## Arquitetura de Pastas
```
app/dashboard/admin/ocorrencias/
└── page.tsx         ← Página admin da secretaria (use client)

supabase/migrations/
└── 20260603180000_create_ocorrencias.sql
```

## Componentes da Página Admin (`page.tsx`)
- **Cabeçalho** com contador de pendências e botão de refresh
- **Banner mock** — aviso amigável quando a tabela não existe no banco (fallback para `OCORRENCIAS_MOCK`)
- **Filtros** — pílulas "Todas / Pendentes / Enviadas ao Pai"
- **Cards de Ocorrência** com:
  - Badge de status (laranja = Pendente, verde = Enviada ao Pai)
  - Timestamp relativo ("25min atrás")
  - Info do aluno (avatar + nome + escola)
  - Chip do motorista responsável
  - Bloco de descrição com fundo âmbar
  - Botão **"Enviar ao Pai"** (laranja, gradiente) ou status de enviada (verde)
- **Toast de confirmação** (slide-in direita)

## Badge na Sidebar Admin
O item "Ocorrências" na sidebar mostra badge vermelho com a contagem de registros com `status = 'pendente'`, com polling de 20 segundos (igual ao padrão do restante do layout admin).

## Histórico de Alterações
| Data | Alteração |
|---|---|
| 03/06/2026 | Criação inicial. Tabela `ocorrencias`, migração SQL, página admin, fluxo motorista → secretaria → pai. |
