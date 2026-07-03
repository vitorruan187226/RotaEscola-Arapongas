# CONTRATOS — Remediação PRD RotaEscola

> As **costuras** entre frentes paralelas: quem produz, quem consome, a assinatura.
> Regra: mudou um contrato → atualize aqui **e** avise os consumidores da mesma onda.

## Registro
| Contrato | Produtor | Consumidores | Assinatura |
|---|---|---|---|
| Migration `fix_rls_alunos` | F1 | F4 | ver §1 |
| Migration `fix_rls_perfis` | F1 | F4 | ver §1 |
| Migration `create_indexes` | F1 | F4 | ver §1 |
| Migration `fix_storage_buckets` | F1 | F4, F5 | ver §1 |
| `middleware.ts` (roles) | F2 | F3, F4 | ver §2 |
| `types/database.types.ts` | F4 | F5, F6, F7 | ver §3 |
| `useGPSBroadcast()` | F5 | F6 | ver §4 |
| `useGPSListener()` | F5 | — | ver §4 |

## Padrão: arquivo de tipos canônicos
F4 **escreve** `types/database.types.ts` (gerado via Supabase CLI). Todas as demais frentes só **importam** — nunca editam manualmente.

---

## §1 · Contratos de Banco (F1 produz)

### RLS de alunos (nova política)
```sql
-- Motorista vê APENAS alunos da sua rota
CREATE POLICY "motorista_ve_seus_alunos" ON public.alunos
FOR SELECT TO authenticated
USING (
  -- Admin vê tudo
  (auth.jwt()->'user_metadata'->>'role') IN ('Admin','admin','Secretaria','secretaria')
  OR
  -- Motorista vê apenas alunos vinculados à rota que ele gerencia
  (
    (auth.jwt()->'user_metadata'->>'role') IN ('Motorista','motorista')
    AND rota_id IN (
      SELECT r.id FROM rotas r
      JOIN veiculos v ON v.rota_id = r.id
      WHERE v.motorista_id = auth.uid()
    )
  )
  OR
  -- Pai vê apenas seus filhos
  auth.uid() = responsavel_id
);
```

### RLS de perfis (nova política)
```sql
-- Cada autenticado vê APENAS seu próprio perfil
CREATE POLICY "usuario_ve_seu_perfil" ON public.perfis
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR (auth.jwt()->'user_metadata'->>'role') IN ('Admin','admin','Secretaria','secretaria')
);
```

### Índices
```sql
CREATE INDEX IF NOT EXISTS idx_alunos_responsavel ON alunos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_alunos_rota ON alunos(rota_id);
CREATE INDEX IF NOT EXISTS idx_localizacao_rota_tempo ON localizacao_veiculo(rota_id, atualizado_em DESC);
```

### Storage (buckets privados)
```sql
UPDATE storage.buckets SET public = false WHERE id IN ('documentos-alunos','documentos-transporte');
-- Revogar política de SELECT público
DROP POLICY IF EXISTS "Permitir leitura pública de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de documentos-alunos" ON storage.objects;
-- Nova política: apenas autenticados leem, e apenas seus próprios documentos
```

---

## §2 · Contrato de Middleware (F2 produz)

```typescript
// Mapa de roles canônico (F2 define, F3 e F4 consomem)
type UserRole = 'admin' | 'semed_admin' | 'secretaria' | 'motorista' | 'responsavel';

// Mapa de prefixo de rota → roles permitidas
const ROUTE_ROLE_MAP: Record<string, UserRole[]> = {
  '/dashboard/admin': ['admin', 'semed_admin'],
  '/dashboard/secretaria': ['admin', 'semed_admin', 'secretaria'],
  '/dashboard/motorista': ['motorista'],
  '/responsavel': ['responsavel'],
};
```

---

## §3 · Contrato de Tipagem (F4 produz)

```bash
# Comando canônico de geração (F4 executa 1×; todas as frentes importam)
npx supabase gen types typescript --project-id <PROJECT_ID> > types/database.types.ts
```

```typescript
// Padrão de consumo para todas as frentes
import { Database } from '@/types/database.types';
type Aluno = Database['public']['Tables']['alunos']['Row'];
type Perfil = Database['public']['Tables']['perfis']['Row'];
```

---

## §4 · Contrato de GPS Realtime (F5 produz)

```typescript
// Hook do motorista (emite coordenadas)
export function useGPSBroadcast(rotaId: string): {
  isTracking: boolean;
  lastPosition: { lat: number; lng: number; speed: number; bearing: number } | null;
  startTracking: () => void;
  stopTracking: () => void;
};

// Hook do responsável (escuta coordenadas)
export function useGPSListener(rotaId: string): {
  position: { lat: number; lng: number; speed: number; bearing: number } | null;
  isLive: boolean;
};

// Canal Realtime (nome padronizado)
const CHANNEL_NAME = `gps:${rotaId}`;
const EVENT_NAME = 'position_update';
```
