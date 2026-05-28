import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { nomeCompleto, cpf, telefone, senha } = await req.json();

    if (!nomeCompleto || !cpf || !telefone || !senha) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const emailDerivado = `${cpfLimpo}@rotaescola.com`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error('[API Cadastro] Erro: SUPABASE_SERVICE_ROLE_KEY não está configurada no ambiente do servidor.');
      return NextResponse.json(
        { success: false, error: 'Erro de configuração do servidor: SUPABASE_SERVICE_ROLE_KEY ausente.' },
        { status: 500 }
      );
    }

    // Cria o cliente admin com a service role key do ambiente do servidor
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Consulta direta na tabela de perfis para verificar duplicidade de CPF
    console.log('[API Cadastro] Verificando duplicidade de CPF na tabela perfis:', cpfLimpo);
    const { data: perfilExistente, error: queryError } = await supabaseAdmin
      .from('perfis')
      .select('id')
      .eq('cpf', cpfLimpo)
      .maybeSingle();

    if (queryError) {
      console.error('[API Cadastro] Erro ao consultar duplicidade de CPF:', queryError);
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar CPF no banco de dados.' },
        { status: 500 }
      );
    }

    if (perfilExistente) {
      console.log('[API Cadastro] CPF já cadastrado na tabela de perfis:', cpfLimpo);
      return NextResponse.json(
        { success: false, error: 'Este CPF já está cadastrado no sistema municipal.' },
        { status: 400 }
      );
    }

    // 2. Cria o usuário via Admin Auth (Ignorando limites de e-mail do Supabase e auto-confirmando)
    console.log('[API Cadastro] Criando usuário no Supabase Auth via Admin client:', emailDerivado);
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: emailDerivado,
      password: senha,
      email_confirm: true, // Auto-confirma instantaneamente no Auth
      user_metadata: {
        full_name: nomeCompleto,
        cpf: cpfLimpo,
        telefone: telefone,
        role: 'responsavel'
      }
    });

    if (createError || !authData?.user) {
      console.error('[API Cadastro] Erro ao criar usuário no Auth:', createError);
      return NextResponse.json(
        { success: false, error: createError?.message || 'Erro ao registrar usuário no sistema.' },
        { status: 500 }
      );
    }

    console.log('[API Cadastro] Usuário registrado com sucesso via Admin Auth. ID:', authData.user.id);
    return NextResponse.json({
      success: true,
      userId: authData.user.id
    });

  } catch (error: any) {
    console.error('Erro interno na API de cadastro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor de cadastro.' },
      { status: 500 }
    );
  }
}
