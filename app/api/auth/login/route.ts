import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../../utils/supabase/server';


export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { cpf, senha } = await req.json();

    if (!cpf || !senha) {
      return NextResponse.json(
        { success: false, error: 'CPF e Senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanCpf = cpf ? cpf.toString().replace(/\D/g, '') : '';
    console.log('[API Login] CPF recebido no payload:', cpf);
    console.log('[API Login] CPF tratado (somente numeros):', cleanCpf);

    // 1. Verificação de Usuários Mocks (Desenvolvimento)
    if (
      (cleanCpf === '22222222222' && senha === 'responsavelsenha') ||
      (cleanCpf === '33333333333' && senha === 'motoristasenha') ||
      (cleanCpf === '99999999999' && senha === 'adminisenha') ||
      (cleanCpf === '11111111111' && senha === 'secretariasenha')
    ) {
      console.log('[API Login] Login mock detectado para CPF:', cleanCpf);
      
      const roleMap: Record<string, string> = {
        '22222222222': 'Responsável',
        '33333333333': 'Motorista',
        '99999999999': 'Admin',
        '11111111111': 'Secretaria'
      };
      const cookieMap: Record<string, string> = {
        '22222222222': 'responsavel',
        '33333333333': 'motorista',
        '99999999999': 'admin',
        '11111111111': 'secretaria'
      };

      const tipoUsuario = roleMap[cleanCpf];
      const cookieVal = cookieMap[cleanCpf];

      // Efetua login real no Supabase para obter a sessão e os cookies de RLS
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const email = `${cleanCpf}@rotaescola.com`;

      console.log('[API Login] Efetuando signInWithPassword para usuário mock:', email);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (authError) {
        console.error('[API Login] Erro ao autenticar no Supabase para login mock:', authError.message);
      } else {
        console.log('[API Login] Autenticado no Supabase com sucesso para login mock');
      }

      const response = NextResponse.json({ success: true, tipoUsuario, isMock: true });
      response.cookies.set('sb-mock-login', cookieVal, { path: '/' });
      return response;
    }

    // 2. Login Real via Supabase Auth no Servidor (Seguro)
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Resolve o e-mail atrelado ao CPF via RPC para evitar vazamento (Email Enumeration) no cliente
    let email = `${cleanCpf}@rotaescola.com`; // Fallback padrão
    try {
      const { data: dbEmail, error: rpcError } = await supabase
        .rpc('get_email_by_cpf', { cpf_to_find: cleanCpf });
      
      if (!rpcError && dbEmail) {
        email = dbEmail;
        console.log('[API Login] RPC executada. E-mail real encontrado para o CPF:', email);
      } else {
        console.log('[API Login] Nao foi possivel encontrar e-mail real via RPC. Usando fallback derivado:', email);
      }
    } catch (err) {
      console.error('Erro ao resolver e-mail por CPF no servidor:', err);
    }

    console.log('[API Login] Executando signInWithPassword para e-mail:', email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });


    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: 'Usuário ou senha inválidos.' },
        { status: 401 }
      );
    }

    // Busca o perfil para redirecionamento correto
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('tipo_usuario')
      .eq('id', authData.user.id)
      .maybeSingle();

    let tipoUsuario = 'Responsável';
    if (!perfilError && perfil?.tipo_usuario) {
      tipoUsuario = perfil.tipo_usuario;
    }

    return NextResponse.json({
      success: true,
      tipoUsuario,
    });

  } catch (error: any) {
    console.error('Erro interno na API de login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
