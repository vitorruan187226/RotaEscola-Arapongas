# 🛡️ Auditoria L-08: SHIELD — API Routes e Segurança de Endpoints

Este relatório de auditoria lista e avalia a robustez e segurança de todas as rotas de API do backend (`app/api/`) contra acessos não autorizados e enumeração de dados.

---

## 1. Inventário Geral de Rotas de API e Status de Segurança

Abaixo está o mapeamento detalhado de cada endpoint HTTP implementado no Next.js:

| Endpoint | Método | Valida Sessão? | Valida Papel? | Usa Service Role? | Status / Risco |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `/api/admin/motoristas` | `POST` | ❌ NÃO | ❌ NÃO | ✅ SIM | **🚨 CRÍTICO.** Qualquer usuário na internet pode enviar um POST com dados de motorista/placa e criar uma credencial funcional com papel de motorista no Supabase Auth e perfis. |
| `/api/admin/fix-driver` | `GET` | ❌ NÃO | ❌ NÃO | ✅ SIM | **🚨 CRÍTICO.** Rota de depuração deixada aberta. Acessar o endpoint via navegador dispara queries automáticas de reatribuição de perfis e motoristas sem validação. |
| `/api/debug-db` | `GET` | ❌ NÃO | ❌ NÃO | ✅ SIM | **🚨 CRÍTICO / VAZAMENTO.** Retorna uma resposta JSON contendo dados de alunos reais (id, nome, rota_id, turno) e registros de presença diária sem qualquer restrição de login. |
| `/api/auth/login` | `POST` | ❌ NÃO | ❌ NÃO | ❌ NÃO | **⚠️ ALTO.** Não requer login prévio (autenticação). Porém, executa internamente a RPC `get_email_by_cpf` que está exposta a chamadas públicas. |
| `/api/auth/cadastro` | `POST` | ❌ NÃO | ❌ NÃO | ✅ SIM | **🟢 CONFORME.** Cadastro público de pais. Contudo, não possui captchas ou rate limiting contra bots. |
| `/api/motorista/status-rota` | `POST` | ✅ SIM | ❌ NÃO | ✅ SIM | **⚠️ ALTO.** Valida a sessão (`supabase.auth.getUser()`), mas **não valida a role**. Um usuário com conta de "Pai" autenticado pode fazer um POST nessa API e forçar a alteração de status de ativação de qualquer rota de motorista. |
| `/api/motorista/trocar-senha` | `POST` | ✅ SIM | ✅ SIM | ✅ SIM | **🟢 CONFORME.** Valida a sessão e verifica explicitamente se o usuário pertence à role `Motorista` antes de prosseguir. |

---

## 2. Destaque Crítico: Exposição do Endpoint `debug-db`

O arquivo [app/api/debug-db/route.ts](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/app/api/debug-db/route.ts) executa a seguinte rotina sem validar o chamador:
```typescript
// Fetch presencas_diarias
const { data: presencas, error: errPresencas } = await supabaseAdmin
  .from('presencas_diarias')
  .select('*')
  .order('criado_em', { ascending: false })
  .limit(10);

// Fetch alunos
const { data: alunos, error: errAlunos } = await supabaseAdmin
  .from('alunos')
  .select('id, nome, rota_id, turno')
  .limit(20);

return NextResponse.json({ presencas, errPresencas, alunos, errAlunos });
```

### 🚨 Diagnóstico de Vazamento:
- Este arquivo expõe diretamente dados identificáveis de crianças da rede municipal de Arapongas e o histórico de suas ausências escolares.
- **Ação imediata recomendada:** Excluir permanentemente o arquivo `app/api/debug-db/route.ts` do repositório antes de realizar qualquer deploy em staging ou produção.

---

## 3. Ausência de Rate Limiting (Mitigação de Bruteforce)

- **Exigência do Blueprint (Seção 3.2):** Rate Limiting baseado em Token Bucket via Redis. Máximo de 5 req/min para rotas de autenticação/cadastro e 60 req/min para rotas operacionais do motorista.
- **Implementação Real:** **Nenhuma.** O backend não possui rate limiter por IP ou limite de requisições por CPF. Um atacante pode disparar milhares de tentativas de login por segundo no endpoint `/api/auth/login` para quebrar senhas de motoristas ou pais por força bruta sem sofrer bloqueio.

---

## 📋 Resumo de Achados (L-08)
- **Status Geral:** 🔴 **CRÍTICO / NÃO CONFORME**
- **Ações Corretivas Urgentes:**
  1. **Deletar** `app/api/debug-db/route.ts` e `app/api/admin/fix-driver/route.ts`.
  2. Implementar validação de sessão e papel de Administrador (`Admin`) no endpoint `/api/admin/motoristas`.
  3. Adicionar validação de papel no endpoint `/api/motorista/status-rota` para garantir que apenas motoristas logados editem a ativação de suas próprias rotas.
  4. Configurar um rate limiter simples baseado em IP no Next.js Middleware ou via Upstash/Redis nas rotas de login/cadastro.
