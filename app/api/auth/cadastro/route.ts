import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nomeCompleto, cpf, telefone, senha } = await request.json();
    const cpfLimpo = cpf.replace(/\D/g, '');
    const emailDerivado = `${cpfLimpo}@rotaescola.com`;

    // Instancia o cliente Admin seguro no servidor
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Verifica duplicidade de CPF direto no banco (sem usar RPC)
    const { data: perfilExistente } = await supabaseAdmin
      .from('perfis')
      .select('id')
      .eq('cpf', cpfLimpo)
      .maybeSingle();

    if (perfilExistente) {
      return NextResponse.json({ error: 'Este CPF já está cadastrado no sistema.' }, { status: 400 });
    }

    // 2. Cria o usuário no Auth ignorando limites de e-mail e auto-confirmando
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailDerivado,
      password: senha,
      email_confirm: true,
      user_metadata: {
        full_name: nomeCompleto,
        nome: nomeCompleto,
        cpf: cpfLimpo,
        telefone: telefone,
        role: 'responsavel',
        tipo_usuario: 'responsavel'
      }
    });

    if (authError) {
      console.error('[ERRO CADASTRO DEv]:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, email: emailDerivado });
  } catch (err: any) {
    console.error('[ERRO CADASTRO DEv]:', err);
    return NextResponse.json({ error: 'Erro interno no servidor de cadastro.' }, { status: 500 });
  }
}
