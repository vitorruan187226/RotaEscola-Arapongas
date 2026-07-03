# 🚪 Auditoria L-07: GATEKEEPER — Middleware, Controle de Acesso e Roles

Este relatório de auditoria avalia o arquivo [middleware.ts](file:///c:/Users/NOSSA%20WEBTV/Documents/GitHub/RotaEscola-Arapongas/middleware.ts) e o fluxo geral de autenticação e autorização por papéis (Roles) do sistema.

---

## 1. Vulnerabilidade Crítica: Bypass de Autenticação via Mock Cookie em Produção

O middleware possui a seguinte lógica para capturar cookies de simulação:
```typescript
// Permite simular login de teste mesmo sem sessão ativa no Supabase
const isMockCookie = request.cookies.get('sb-mock-login')?.value;
...
// Se o usuário tentar acessar qualquer rota protegida sem estar autenticado, vai para /login
if (!user && !isMockCookie && isProtectedRoute) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
```

### 🚨 Diagnóstico de Risco:
- **A vulnerabilidade:** O código aceita o cookie `sb-mock-login` de forma irrestrita, permitindo contornar a autenticação de segurança do Supabase.
- **Impacto em Produção:** Qualquer usuário pode injetar manualmente o cookie `sb-mock-login=admin` no console de desenvolvedor do navegador. Ao fazer isso, o middleware considerará a requisição válida e permitirá o acesso livre a rotas altamente protegidas como `/dashboard/admin`, `/responsavel/dashboard` e `/dashboard/motorista`.
- **Mitigação:** Essa lógica de bypass deve ser envelopada estritamente em uma validação de ambiente de desenvolvimento (`process.env.NODE_ENV === 'development'`), sendo completamente bloqueada/removida no build de produção.

---

## 2. Mismatch Crítico de Papéis (Roles) — Blueprint vs. Código

- **Definição de Roles no Blueprint (Seção 3.4):**
  - O banco utiliza ENUMs em caixa alta: `'PAI'`, `'MOTORISTA'`, `'SEMED_ADMIN'`.
- **Implementação Real no Middleware:**
  - O middleware verifica as strings em minúsculo (`admin`, `motorista`, `secretaria`):
  ```typescript
  if (role === 'admin') {
    url.pathname = '/dashboard/admin';
  } else if (role === 'motorista') {
    url.pathname = '/dashboard/motorista';
  } else if (role === 'secretaria') {
    url.pathname = '/dashboard/secretaria';
  } else {
    url.pathname = '/responsavel/dashboard'; // Fallback geral
  }
  ```

### 🚨 Bugs de Redirecionamento Identificados:
1. **Papel `SEMED_ADMIN`:** Se o usuário cadastrado no Supabase Auth possuir a metadata oficial `'SEMED_ADMIN'` (conforme Blueprint), o middleware aplicará o `.toLowerCase()` gerando `'semed_admin'`. Como não há uma condicional para esse valor específico, o usuário será redirecionado incorretamente para o Portal dos Pais (`/responsavel/dashboard`), quebrando o fluxo administrativo da SEMED.
2. **Papel `Secretaria`:** Essa role existe no middleware e redireciona para `/dashboard/secretaria`. No entanto, ela **não está mapeada no Blueprint**, evidenciando um descompasso arquitetural.

---

## 3. Verificação de Roles em Rotas Protegidas

O matcher do middleware está configurado para:
```typescript
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/responsavel/:path*',
    '/motorista/:path*',
    '/login',
  ],
};
```

### 🚨 Brecha de Segurança em Rotas Interperfil:
- Se um usuário comum logar no sistema com a role de `'Responsável'` (Pai), a sessão do Supabase será válida (`user` !== null).
- Ao acessar diretamente no navegador o caminho `/dashboard/admin`, o middleware permitirá a requisição porque o matcher apenas valida se `user` existe (`!user && !isMockCookie`). O middleware **não valida se a role do usuário bate com o prefixo da rota acessada**.
- **Mitigação:** Adicionar validação de prefixo de rota contra metadados de papel no middleware para impedir que um pai acesse páginas do painel administrativo da SEMED ou do motorista.

---

## 4. Latência de Queries no Middleware (NFR-01)

- O middleware tenta ler a role dos metadados do JWT (Geração rápida, em memória). Caso não encontre, executa um SELECT no banco remoto:
```typescript
const { data: perfil } = await supabase
  .from('perfis')
  .select('tipo_usuario')
  .eq('id', user.id)
  .maybeSingle();
```
- **Avaliação de Impacto:** Esse fallback executa um I/O no banco que adiciona cerca de **100ms a 300ms** no tempo de resposta da requisição. Para garantir o cumprimento da latência $P_{95} \le 150\text{ms}$ (NFR-01), deve-se forçar a injeção da role nos metadados do usuário durante a criação ou login, removendo a necessidade de SELECTs síncronos no middleware.

---

## 📋 Resumo de Achados (L-07)
- **Status Geral:** 🔴 **CRÍTICO / NÃO CONFORME**
- **Ações Corretivas Urgentes:**
  1. Adicionar `if (process.env.NODE_ENV !== 'development')` ao redor da verificação de `isMockCookie` para neutralizar o bypass em produção.
  2. Ajustar os condicionais de papel no middleware para cobrir `'semed_admin'`, `'semed_admin'`, `'admin'`, `'motorista'` e `'responsavel'`.
  3. Adicionar validação cruzada de rota no middleware: impedir que usuários com papel diferente de `Admin` ou `Secretaria` acessem subrotas de `/dashboard/admin`.
