import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../../utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { status, global, rotaId } = await req.json();

    if (typeof status !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'O parâmetro status deve ser booleano.' },
        { status: 400 }
      );
    }

    // 1. Pega a sessão atual do motorista pelo cookie
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Sessão inválida. Faça login novamente.' },
        { status: 401 }
      );
    }

    // 2. Cria cliente administrativo com Service Role Key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor incompleta.' },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let query = adminSupabase.from('rotas').update({ ativa: status });

    if (global) {
      // Se global for true, desativa todas as rotas deste motorista
      query = query.eq('motorista_id', user.id);
    } else {
      // Se global for false, altera apenas a rota específica vinculada ao motorista
      if (!rotaId) {
        return NextResponse.json(
          { success: false, error: 'O parâmetro rotaId é obrigatório quando global for false.' },
          { status: 400 }
        );
      }
      query = query.eq('id', rotaId).eq('motorista_id', user.id);
    }

    const { error: dbError } = await query;

    if (dbError) {
      console.error('[Status Rota] Erro no update do banco:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar banco de dados.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro interno no servidor.';
    console.error('[Status Rota] Erro inesperado:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
