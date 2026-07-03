import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// ══════════════════════════════════════════════════════════════════════════════
// Middleware de Autenticação e Autorização por Papel (Role)
// Canteiro: F2 (02_MIDDLEWARE.md) — Onda 1
//
// Correções aplicadas:
//   L-07: Cookie sb-mock-login bloqueado em produção (NODE_ENV guard)
//   L-07: Mapa de roles expandido para cobrir semed_admin
//   L-07: Validação cruzada rota×role (impede escalação horizontal)
// ══════════════════════════════════════════════════════════════════════════════

// Mapa canônico: prefixo de rota → roles permitidas (CONTRATOS.md §2)
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  '/dashboard/admin': ['admin', 'semed_admin'],
  '/dashboard/secretaria': ['admin', 'semed_admin', 'secretaria'],
  '/dashboard/motorista': ['motorista'],
  '/responsavel': ['responsavel'],
};

/**
 * Resolve a role do usuário a partir dos metadados do JWT.
 * Normaliza para lowercase para comparação consistente.
 */
function resolveRoleFromMetadata(user: { user_metadata?: Record<string, unknown> }): string | null {
  const raw = user.user_metadata?.role ?? user.user_metadata?.tipo_usuario;
  if (typeof raw === 'string' && raw.length > 0) {
    return raw.toLowerCase();
  }
  return null;
}

/**
 * Dado uma role, retorna o pathname de destino do dashboard correspondente.
 */
function getDashboardForRole(role: string): string {
  switch (role) {
    case 'admin':
    case 'semed_admin':
      return '/dashboard/admin';
    case 'secretaria':
      return '/dashboard/secretaria';
    case 'motorista':
      return '/dashboard/motorista';
    case 'responsavel':
    default:
      return '/responsavel/dashboard';
  }
}

/**
 * Verifica se a role do usuário tem permissão para acessar o pathname solicitado.
 * Impede escalação horizontal (ex: responsável acessando /dashboard/admin).
 */
function isRoleAllowedForPath(role: string, pathname: string): boolean {
  for (const [prefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname.startsWith(prefix)) {
      return allowedRoles.includes(role);
    }
  }
  // Rota não mapeada explicitamente → permitir (rotas públicas ou genéricas)
  return true;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Valida a sessão do usuário
  const { data: { user } } = await supabase.auth.getUser();

  // ─── MOCK COOKIE: APENAS EM DESENVOLVIMENTO ────────────────────────────────
  // L-07 Fix: envelopa em NODE_ENV para neutralizar bypass em produção
  let isMockCookie: string | undefined;
  if (process.env.NODE_ENV === 'development') {
    isMockCookie = request.cookies.get('sb-mock-login')?.value;
  }

  // Verifica se é rota protegida
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/responsavel') ||
    request.nextUrl.pathname.startsWith('/motorista');

  // Se o usuário não está autenticado e tenta acessar rota protegida → /login
  if (!user && !isMockCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ─── VALIDAÇÃO CRUZADA ROTA×ROLE ───────────────────────────────────────────
  // L-07 Fix: impede que um responsável acesse /dashboard/admin manualmente
  if (user && isProtectedRoute) {
    let role = resolveRoleFromMetadata(user);

    // Fallback: consultar tabela perfis se metadata não contém a role
    if (!role) {
      try {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('tipo_usuario')
          .eq('id', user.id)
          .maybeSingle();
        if (perfil?.tipo_usuario) {
          role = (perfil.tipo_usuario as string).toLowerCase();
        }
      } catch (err) {
        console.error('[Middleware] Erro ao buscar perfil:', err);
      }
    }

    // Se temos a role, verificar se ela é permitida para o pathname atual
    if (role && !isRoleAllowedForPath(role, request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = getDashboardForRole(role);
      return NextResponse.redirect(url);
    }
  }

  // ─── REDIRECIONAMENTO PÓS-LOGIN ───────────────────────────────────────────
  // Se já está logado e tenta acessar /login → redireciona para o dashboard correto
  if ((user || isMockCookie) && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();

    let role = isMockCookie ?? null;
    if (user) {
      role = resolveRoleFromMetadata(user);

      // Fallback de banco (apenas se metadata não contiver a role)
      if (!role) {
        try {
          const { data: perfil } = await supabase
            .from('perfis')
            .select('tipo_usuario')
            .eq('id', user.id)
            .maybeSingle();
          if (perfil?.tipo_usuario) {
            role = (perfil.tipo_usuario as string).toLowerCase();
          }
        } catch (err) {
          console.error('[Middleware] Erro ao buscar perfil:', err);
        }
      }
    }

    url.pathname = getDashboardForRole(role ?? 'responsavel');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/responsavel/:path*',
    '/motorista/:path*',
    '/login',
  ],
};
