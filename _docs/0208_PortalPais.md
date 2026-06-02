# 0208 — Portal do Responsável (Pais/Guardiões)

> **Quarteirão:** [02XX] Telas e UI — Frontend  
> **Última atualização:** 27/05/2026  

---

## Rota Principal
`/responsavel/` — layout wrapper com header mobile e navegação bottom.

---

## Sub-Rotas

| Arquivo | URL | Responsabilidade |
|---|---|---|
| `app/responsavel/dashboard/page.tsx` | `/responsavel/dashboard` | Hub principal — listagem de filhos + ações |
| `app/responsavel/documentos/page.tsx` | `/responsavel/documentos?alunoId=` | Upload de 3 documentos obrigatórios |
| `app/responsavel/carteirinha/[id]/page.tsx` | `/responsavel/carteirinha/:id` | Carteirinha Digital com QR Code real |
| `app/responsavel/rastreio/[rota_id]/page.tsx` | `/responsavel/rastreio/:rota_id` | Rastreio GPS + Controle de Ausência |

---

## Contratos de Dados (Tabelas do Supabase)

### Tabela `alunos` (referência)
```typescript
{
  id: string;               // uuid, pk
  nome: string;
  escola: string;
  serie: string;
  rota_id: string;
  responsavel_id: string;   // FK → auth.users(id) — RLS
  status_carteirinha: 'Pendente' | 'Em análise' | 'Aprovado'; // NOVO ✅
  foto_url?: string;        // NOVO ✅
}
```

### Tabela `localizacao_veiculo` (NOVA) ✅
```typescript
{
  id: string;               // uuid, pk
  rota_id: string;          // ex: 'Rota 04', 'Rota 22'
  latitude: number;
  longitude: number;
  velocidade_kmh: number;
  atualizado_em: string;    // timestamptz
}
```

### Tabela `carteirinhas` (referência)
```typescript
{
  aluno_id: string;
  qr_code_hash: string;     // valor exibido no QRCodeSVG
}
```

### Tabela `presencas_diarias` (referência)
```typescript
{
  aluno_id: string;
  data_presenca: string;
  compareceu: boolean;
  motivo?: string;
}
```

---

## Políticas RLS Aplicadas

| Tabela | Política | Tipo |
|---|---|---|
| `alunos` | Pais podem ver apenas os dados do próprio filho | SELECT |
| `alunos` | Responsavel pode atualizar status carteirinha do filho | UPDATE ✅ |
| `localizacao_veiculo` | Responsaveis podem ver localizacao do onibus | SELECT ✅ |

---

## Hooks e Lógica de Estado (por Página)

### `dashboard/page.tsx`
- `supabase.auth.getUser()` → extrai primeiro nome do usuário.
- `supabase.from('perfis').select('nome')` → busca nome do perfil (fallback: e-mail).
- `supabase.from('alunos').select(...).eq('responsavel_id', user.id)` → filtra filhos via RLS.
- **Empty State** exibido quando `filhos.length === 0`.
- Botão "Carteirinha" bloqueado se `status_carteirinha !== 'Aprovado'`.

### `documentos/page.tsx`
- Upload para bucket `documentos-alunos` via `supabase.storage`.
- Após todos os 3 documentos enviados: `UPDATE alunos SET status_carteirinha = 'Em análise'`.
- Redireciona para `/responsavel/dashboard` após 3 segundos.

### `carteirinha/[id]/page.tsx`
- Busca dados do aluno via `supabase.from('alunos').select(...)`.
- Busca `qr_code_hash` da tabela `carteirinhas`.
- **QR Code real** gerado com `<QRCodeSVG>` do pacote `qrcode.react`.
- Fallback mock tipado se banco não retornar dados.

### `rastreio/[rota_id]/page.tsx`
- Busca última localização em `localizacao_veiculo` filtrada por `rota_id`.
- Detecta se veículo está fora de turno (atualizado há >2h).
- Coordenadas GPS exibidas dinamicamente no mapa SVG.
- Ausência registrada via `supabase.from('presencas_diarias').upsert(...)`.
- Auto-atualização GPS a cada 30 segundos.

---

## Mocks (Lei 4 — Tipagem Estrita)

Localização: `app/responsavel/dashboard/page.tsx` (const `FILHOS_MOCK`)  
Pacote QR: `qrcode.react` instalado via npm.  
Fallback de localização: `{ latitude: -23.4178, longitude: -51.4269, foraDeTurno: true }`.

---

## Histórico de Alterações

| Data | Autor | Descrição |
|---|---|---|
| 27/05/2026 | AntiGravity | Dashboard dinâmico com Supabase, Empty State, status_carteirinha |
| 27/05/2026 | AntiGravity | Documentos: atualização de status após upload completo |
| 27/05/2026 | AntiGravity | Carteirinha: QR Code real com qrcode.react |
| 27/05/2026 | AntiGravity | Rastreio: localização GPS do banco + overlay fora de turno |
| 27/05/2026 | AntiGravity | Migration SQL: status_carteirinha + tabela localizacao_veiculo |
| 02/06/2026 | AntiGravity | Correção no cadastro de filhos: data_nascimento, exibição de erro real no frontend e ajustes de RLS nas tabelas documentos_aluno e perfis (aluno aprovado sumir) |
