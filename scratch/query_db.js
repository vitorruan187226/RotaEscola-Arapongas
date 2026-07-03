const { createClient } = require('@supabase/supabase-js');
const url = 'https://lzzxivzkwtwifgvexuiy.supabase.co';
const anonKey = 'sb_publishable_Gh5TkPZtml0CvBRaiP_g8w_9nqhz8ED';

const supabase = createClient(url, anonKey);

async function run() {
  try {
    console.log('--- BUSCANDO TODOS OS ALUNOS ---');
    const { data: alunos, error: errAlunos } = await supabase
      .from('alunos')
      .select('id, nome, escola');
    if (errAlunos) console.error('Erro alunos:', errAlunos);
    console.log(`Total de alunos: ${alunos?.length}`);

    console.log('--- BUSCANDO TODOS OS LOGS DE EMBARQUE ---');
    const { data: logs, error: errLogs } = await supabase
      .from('logs_embarque')
      .select('*');
    if (errLogs) console.error('Erro logs:', errLogs);
    console.log(`Total de logs de embarque: ${logs?.length}`);
    console.log('Logs de ausentes:', logs?.filter(l => l.status === 'AUSENTE'));
    console.log('Logs de presentes:', logs?.filter(l => l.status === 'PRESENTE').slice(0, 5));

    console.log('--- BUSCANDO TODOS OS REGISTROS DE PRESENCA DIARIA ---');
    const { data: presencas, error: errPresencas } = await supabase
      .from('presencas_diarias')
      .select('*');
    if (errPresencas) console.error('Erro presencas:', errPresencas);
    console.log(`Total de presencas: ${presencas?.length}`);
    console.log('Faltas (compareceu=false):', presencas?.filter(p => !p.compareceu));

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

