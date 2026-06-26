const { createClient } = require('@supabase/supabase-js');
const url = 'https://lzzxivzkwtwifgvexuiy.supabase.co';
const anonKey = 'sb_publishable_Gh5TkPZtml0CvBRaiP_g8w_9nqhz8ED';

const supabase = createClient(url, anonKey);

async function run() {
  try {
    console.log('--- BUSCANDO ULTIMOS 5 ALUNOS ---');
    const { data: alunos, error: errAlunos } = await supabase
      .from('alunos')
      .select('id, nome, escola, turno, rota_id')
      .limit(5);
    if (errAlunos) console.error('Erro alunos:', errAlunos);
    else console.log(alunos);

    console.log('--- BUSCANDO ULTIMOS 5 LOGS DE EMBARQUE ---');
    const { data: logs, error: errLogs } = await supabase
      .from('logs_embarque')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(5);
    if (errLogs) console.error('Erro logs:', errLogs);
    else console.log(logs);

    console.log('--- BUSCANDO ULTIMOS 5 REGISTROS DE PRESENCA DIARIA ---');
    const { data: presencas, error: errPresencas } = await supabase
      .from('presencas_diarias')
      .select('*')
      .order('data_presenca', { ascending: false })
      .limit(5);
    if (errPresencas) console.error('Erro presencas:', errPresencas);
    else console.log(presencas);

    console.log('--- BUSCANDO METRICAS RPC ---');
    const { data: metrics, error: errMetrics } = await supabase
      .rpc('get_dashboard_metrics');
    if (errMetrics) console.error('Erro rpc:', errMetrics);
    else console.log(JSON.stringify(metrics, null, 2));

  } catch (e) {
    console.error('Erro geral:', e);
  }
}

run();
