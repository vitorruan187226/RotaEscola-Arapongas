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

  // Se o usuário tentar acessar qualquer rota de /dashboard sem estar autenticado, vai para /login
  if (!user && !isMockCookie && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se já estiver logado e tentar ir para o login, redireciona para a home ou dashboard
  if ((user || isMockCookie) && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    if (isMockCookie === 'admin') {
      url.pathname = '/dashboard/admin';
    } else if (isMockCookie === 'secretaria') {
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
    '/login',
  ],
};
