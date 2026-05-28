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

    const cleanCpf = cpf.replace(/\D/g, '');

    // 1. Verificação de Usuários Mocks (Desenvolvimento)
    if (cleanCpf === '22222222222' && senha === 'responsavelsenha') {
      const response = NextResponse.json({ success: true, tipoUsuario: 'Responsável', isMock: true });
      response.cookies.set('sb-mock-login', 'responsavel', { path: '/' });
      return response;
    }
    if (cleanCpf === '33333333333' && senha === 'motoristasenha') {
      const response = NextResponse.json({ success: true, tipoUsuario: 'Motorista', isMock: true });
      response.cookies.set('sb-mock-login', 'motorista', { path: '/' });
      return response;
    }
    if (cleanCpf === '99999999999' && senha === 'adminisenha') {
      const response = NextResponse.json({ success: true, tipoUsuario: 'Admin', isMock: true });
      response.cookies.set('sb-mock-login', 'admin', { path: '/' });
      return response;
    }
    if (cleanCpf === '11111111111' && senha === 'secretariasenha') {
      const response = NextResponse.json({ success: true, tipoUsuario: 'Secretaria', isMock: true });
      response.cookies.set('sb-mock-login', 'secretaria', { path: '/' });
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
      }
    } catch (err) {
      console.error('Erro ao resolver e-mail por CPF no servidor:', err);
    }

    // Efetua a autenticação
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
