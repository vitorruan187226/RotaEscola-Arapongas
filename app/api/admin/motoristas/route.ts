import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { nome, cpf, telefone, placa, modelo, capacidade, cnh, cnhCategoria } = await req.json();

    const cleanCpf = cpf ? cpf.toString().replace(/\D/g, '') : '';
    
    if (!nome || !cleanCpf) {
      return NextResponse.json(
        { success: false, error: 'Nome e CPF são campos obrigatórios.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A variavel de ambiente SUPABASE_SERVICE_ROLE_KEY nao esta configurada no servidor. Adicione-a no .env.local ou na Vercel.' 
        },
        { status: 500 }
      );
    }

    // Inicializa o cliente Supabase com privilégios administrativos de Service Role (Bypass RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const email = `${cleanCpf}@rotaescola.com`;
    const password = cleanCpf; // A senha padrão será o próprio CPF somente números

    console.log('[API Motoristas Admin] Tentando cadastrar motorista no Auth:', email);

    // 1. Criar o usuário no Supabase Auth (GoTrue)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, role: 'Motorista', tipo_usuario: 'Motorista' }
    });

    if (authError) {
      console.error('[API Motoristas Admin] Erro no Auth:', authError.message);
      return NextResponse.json(
        { success: false, error: `Falha ao criar credencial de autenticacao: ${authError.message}` },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    console.log('[API Motoristas Admin] Credencial criada com ID:', userId);

    // 2. Realizar Upsert na tabela public.perfis (com tipo_usuario = 'Motorista' e CPF correto)
    const { error: perfilError } = await supabaseAdmin
      .from('perfis')
      .upsert({
        id: userId,
        nome,
        tipo_usuario: 'Motorista',
        cpf: cleanCpf,
        telefone: telefone || null
      });

    if (perfilError) {
      console.error('[API Motoristas Admin] Erro ao cadastrar perfil público:', perfilError.message);
      // Nao quebra o fluxo caso o perfil ja tenha sido gerado pelo trigger, apenas reporta
    }

    // 3. Cadastrar veículo associado se placa for informada, na tabela public.motoristas_perfil
    const { error: driverError } = await supabaseAdmin
      .from('motoristas_perfil')
      .upsert({
        perfil_id: userId,
        placa_veiculo: placa ? placa.toUpperCase() : '',
        modelo_veiculo: modelo || '',
        capacidade_van: capacidade ? Number(capacidade) : 0,
        cnh: cnh || null,
        cnh_categoria: cnhCategoria || null,
        ativo: true
      });

    if (driverError) {
      console.error('[API Motoristas Admin] Erro ao cadastrar motoristas_perfil:', driverError.message);
    }

    return NextResponse.json({
      success: true,
      userId,
      message: `Motorista ${nome} registrado com sucesso! Credenciais geradas: Login (CPF): ${cleanCpf} / Senha padrão: O próprio CPF.`
    });

  } catch (err: any) {
    console.error('[API Motoristas Admin] Excecao interna:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
