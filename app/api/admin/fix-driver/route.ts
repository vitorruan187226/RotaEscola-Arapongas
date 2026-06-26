import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A variavel de ambiente SUPABASE_SERVICE_ROLE_KEY nao esta configurada no servidor. Adicione-a nas configuracoes da Vercel.' 
        },
        { status: 500 }
      );
    }

    // Inicializa o cliente Supabase Admin para bypassar as politicas de RLS e atualizar os vinculos
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const idVitorRuan = '601a88d7-b090-4325-814f-9054872a5bc3';
    const idAntigoMotorista = '57e54de9-7e83-4f4b-a4ea-e5f9838a8488';

    console.log('[API Fix Driver] Iniciando correcao de vinculos para Vitor Ruan:', idVitorRuan);

    // 1. Atualizar o tipo_usuario de Vitor Ruan para 'Motorista' na tabela public.perfis
    const { error: errPerfil } = await supabaseAdmin
      .from('perfis')
      .update({ tipo_usuario: 'Motorista' })
      .eq('id', idVitorRuan);

    if (errPerfil) {
      console.error('[API Fix Driver] Erro ao atualizar perfil:', errPerfil.message);
      throw new Error(`Erro ao atualizar tipo de usuario no perfil: ${errPerfil.message}`);
    }

    // 2. Atualizar o perfil_id na tabela public.motoristas_perfil do ID antigo para o ID de Vitor Ruan
    const { error: errMotoristaPerfil } = await supabaseAdmin
      .from('motoristas_perfil')
      .update({ perfil_id: idVitorRuan })
      .eq('perfil_id', idAntigoMotorista);

    if (errMotoristaPerfil) {
      console.error('[API Fix Driver] Erro ao atualizar motoristas_perfil:', errMotoristaPerfil.message);
      throw new Error(`Erro ao transferir veiculo em motoristas_perfil: ${errMotoristaPerfil.message}`);
    }

    // 3. Atualizar o motorista_id na tabela public.veiculos do ID antigo para o ID de Vitor Ruan
    const { error: errVeiculo } = await supabaseAdmin
      .from('veiculos')
      .update({ motorista_id: idVitorRuan })
      .eq('motorista_id', idAntigoMotorista);

    if (errVeiculo) {
      console.error('[API Fix Driver] Erro ao atualizar veiculos:', errVeiculo.message);
      throw new Error(`Erro ao transferir motorista em veiculos: ${errVeiculo.message}`);
    }

    // 4. Atualizar o motorista_id na tabela public.rotas do ID antigo para o ID de Vitor Ruan
    const { error: errRota } = await supabaseAdmin
      .from('rotas')
      .update({ motorista_id: idVitorRuan })
      .eq('motorista_id', idAntigoMotorista);

    if (errRota) {
      console.error('[API Fix Driver] Erro ao atualizar rotas:', errRota.message);
      throw new Error(`Erro ao transferir rota em rotas: ${errRota.message}`);
    }

    console.log('[API Fix Driver] Correcao concluida com sucesso para o ID:', idVitorRuan);

    return NextResponse.json({
      success: true,
      message: 'Os vinculos de veiculo, rota e o tipo de usuario do motorista Vitor Ruan foram corrigidos com sucesso no banco de dados!'
    });

  } catch (err: any) {
    console.error('[API Fix Driver] Excecao na correcao:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
