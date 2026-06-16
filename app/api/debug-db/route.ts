import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY is not defined in process.env' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Fetch presencas_diarias
    const { data: presencas, error: errPresencas } = await supabaseAdmin
      .from('presencas_diarias')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(10);

    // Fetch alunos
    const { data: alunos, error: errAlunos } = await supabaseAdmin
      .from('alunos')
      .select('id, nome, rota_id, turno')
      .limit(20);

    return NextResponse.json({
      presencas,
      errPresencas,
      alunos,
      errAlunos
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
