import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '../../../../utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { novaSenha } = await req.json();

    if (!novaSenha || novaSenha.length < 8) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 8 caracteres.' },
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

    // 2. Verifica se é realmente um motorista com primeiro acesso pendente
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('tipo_usuario, senha_alterada')
      .eq('id', user.id)
      .maybeSingle();

    if (perfilError || !perfil) {
      return NextResponse.json(
        { success: false, error: 'Perfil não encontrado.' },
        { status: 404 }
      );
    }

    if (perfil.tipo_usuario !== 'Motorista') {
      return NextResponse.json(
        { success: false, error: 'Esta rota é exclusiva para motoristas.' },
        { status: 403 }
      );
    }

    if (perfil.senha_alterada) {
      return NextResponse.json(
        { success: false, error: 'Senha já foi alterada anteriormente.' },
        { status: 400 }
      );
    }

    // 3. Usa o Service Role Key para alterar a senha sem deslogar o usuário
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor incompleta. Contate o administrador.' },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: updateAuthError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      { password: novaSenha }
    );

    if (updateAuthError) {
      console.error('[Trocar Senha] Erro ao atualizar senha:', updateAuthError.message);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar senha. Tente novamente.' },
        { status: 500 }
      );
    }

    // 4. Marca o perfil como senha já alterada
    const { error: updatePerfilError } = await adminSupabase
      .from('perfis')
      .update({ senha_alterada: true })
      .eq('id', user.id);

    if (updatePerfilError) {
      console.error('[Trocar Senha] Erro ao marcar perfil:', updatePerfilError.message);
      // Não bloqueia: a senha já foi alterada com sucesso
    }

    console.log('[Trocar Senha] Senha atualizada com sucesso para user:', user.id);

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro interno no servidor.';
    console.error('[Trocar Senha] Erro inesperado:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
