import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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

  // Permite simular login de teste mesmo sem sessão ativa no Supabase
  const isMockCookie = request.cookies.get('sb-mock-login')?.value;

  // Verifica se é rota protegida (dashboard, portal do responsável ou motorista)
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/responsavel') ||
    request.nextUrl.pathname.startsWith('/motorista');

  // Se o usuário tentar acessar qualquer rota protegida sem estar autenticado, vai para /login
  if (!user && !isMockCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se já estiver logado e tentar ir para o login, redireciona para a home ou dashboard
  if ((user || isMockCookie) && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    
    let role = isMockCookie;
    if (user) {
      // 1. Tenta obter dos metadados do JWT (mais rápido)
      const metadataRole = user.user_metadata?.tipo_usuario || user.user_metadata?.role;
      if (metadataRole) {
        role = metadataRole.toLowerCase();
      } else {
        // 2. Se não estiver nos metadados, consulta a tabela perfis
        try {
          const { data: perfil } = await supabase
            .from('perfis')
            .select('tipo_usuario')
            .eq('id', user.id)
            .maybeSingle();
          if (perfil?.tipo_usuario) {
            role = perfil.tipo_usuario.toLowerCase();
          }
        } catch (err) {
          console.error('[Middleware] Erro ao buscar perfil:', err);
        }
      }
    }

    if (role === 'admin') {
      url.pathname = '/dashboard/admin';
    } else if (role === 'motorista') {
      url.pathname = '/dashboard/motorista';
    } else if (role === 'secretaria') {
      url.pathname = '/dashboard/secretaria';
    } else {
      url.pathname = '/responsavel/dashboard';
    }
    
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
