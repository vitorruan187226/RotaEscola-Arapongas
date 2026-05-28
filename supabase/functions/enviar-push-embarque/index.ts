// ══════════════════════════════════════════════════════════════════════════════
// Edge Function: enviar-push-embarque
// Disparada via Database Webhook sempre que houver INSERT na tabela logs_embarque.
//
// Fluxo:
// 1. Recebe payload do webhook com novo registro de embarque
// 2. Busca nome do aluno e responsavel_id na tabela alunos
// 3. Busca fcm_token do responsável na tabela perfis
// 4. Envia push notification via Firebase Cloud Messaging (FCM)
//
// Se FCM_SERVER_KEY não estiver configurada, faz fallback para log simulado.
// ══════════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface LogEmbarquePayload {
  type: 'INSERT';
  table: 'logs_embarque';
  record: {
    id: string;
    aluno_id: string;
    motorista_id: string | null;
    rota_id: string;
    tipo_movimento: 'Ida' | 'Volta';
    criado_em: string;
  };
}

serve(async (req: Request) => {
  try {
    // 1. Parse do payload do webhook
    const payload: LogEmbarquePayload = await req.json();
    const { aluno_id, tipo_movimento, rota_id } = payload.record;

    console.log(`[PUSH] Novo embarque detectado: aluno=${aluno_id}, tipo=${tipo_movimento}, rota=${rota_id}`);

    // 2. Conectar ao Supabase com service role (para ler dados cross-RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Buscar dados do aluno (nome e responsavel_id)
    const { data: aluno, error: alunoError } = await supabase
      .from('alunos')
      .select('nome, responsavel_id')
      .eq('id', aluno_id)
      .single();

    if (alunoError || !aluno) {
      console.error('[PUSH] Erro ao buscar aluno:', alunoError?.message);
      return new Response(JSON.stringify({ error: 'Aluno não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!aluno.responsavel_id) {
      console.warn('[PUSH] Aluno sem responsável vinculado. Push não enviado.');
      return new Response(JSON.stringify({ warn: 'Sem responsável vinculado' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Buscar fcm_token do responsável na tabela perfis
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('fcm_token, nome')
      .eq('id', aluno.responsavel_id)
      .single();

    if (perfilError || !perfil) {
      console.warn('[PUSH] Perfil do responsável não encontrado:', perfilError?.message);
      return new Response(JSON.stringify({ warn: 'Perfil não encontrado' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Montar mensagem conforme tipo de movimento
    const nomeAluno = aluno.nome || 'seu filho(a)';
    let titulo: string;
    let corpo: string;

    if (tipo_movimento === 'Ida') {
      titulo = '🚌 Embarque Registrado — Ida';
      corpo = `Seu filho(a) ${nomeAluno} acabou de embarcar a caminho da escola.`;
    } else {
      titulo = '🏠 Embarque Registrado — Volta';
      corpo = `Seu filho(a) ${nomeAluno} acabou de embarcar voltando da escola.`;
    }

    console.log(`[PUSH] Mensagem: "${corpo}" → Responsável: ${perfil.nome || aluno.responsavel_id}`);

    // 6. Enviar push via FCM
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

    if (!fcmServerKey) {
      // ─── FALLBACK DE TESTE ───
      // Se a chave FCM não estiver configurada, loga a simulação
      console.log('[FCM SIMULADO] Envio de push para o pai...');
      console.log(`[FCM SIMULADO] Token: ${perfil.fcm_token || 'NÃO REGISTRADO'}`);
      console.log(`[FCM SIMULADO] Título: ${titulo}`);
      console.log(`[FCM SIMULADO] Corpo: ${corpo}`);
      console.log(`[FCM SIMULADO] Rota: ${rota_id}`);

      return new Response(JSON.stringify({
        success: true,
        mode: 'simulado',
        message: corpo,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!perfil.fcm_token) {
      console.warn('[PUSH] Responsável sem fcm_token registrado. Push não enviado.');
      return new Response(JSON.stringify({ warn: 'fcm_token ausente' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ─── ENVIO REAL VIA FCM ───
    const fcmPayload = {
      to: perfil.fcm_token,
      notification: {
        title: titulo,
        body: corpo,
        icon: '/icon-192x192.png',
        click_action: '/responsavel/dashboard',
      },
      data: {
        tipo_movimento,
        aluno_id,
        rota_id,
        timestamp: new Date().toISOString(),
      },
    };

    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    const fcmResult = await fcmResponse.json();
    console.log('[PUSH] FCM Response:', JSON.stringify(fcmResult));

    return new Response(JSON.stringify({
      success: true,
      mode: 'real',
      fcm_result: fcmResult,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[PUSH] Erro inesperado:', err);
    return new Response(JSON.stringify({ error: 'Erro interno na Edge Function' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
