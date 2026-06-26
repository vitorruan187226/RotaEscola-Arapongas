const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  const dotenvContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  const env = {};
  dotenvContent.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  async function run() {
    console.log('Logging in as Admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    if (authError) {
      console.error('Admin Auth failed:', authError.message);
      return;
    }

    console.log('Admin logged in successfully!');
    console.log('Admin user ID:', authData.user.id);

    // Fetch all logs_embarque
    const { data: logs, error: errLogs } = await supabase
      .from('logs_embarque')
      .select('*')
      .limit(10);
    if (errLogs) console.error('Error logs:', errLogs);
    else console.log('Logs:', logs);

    // Fetch all rotas
    const { data: rotas, error: errRotas } = await supabase
      .from('rotas')
      .select('*');
    if (errRotas) console.error('Error rotas:', errRotas);
    else console.log('Rotas:', rotas);

    // Fetch all perfis
    const { data: perfis, error: errPerfis } = await supabase
      .from('perfis')
      .select('*');
    if (errPerfis) console.error('Error perfis:', errPerfis);
    else console.log('Perfis count:', perfis.length);

    console.log('Inserting logs...');
    const motoristaId = '33333333-3333-3333-3333-333333333333'; // Carlos
    const rotaId = '849ca070-78b5-4119-8c4e-422bff003bb1'; // RT-66 Regiao Centro
    const today = new Date().toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}).split('/').reverse().join('-');
    console.log('Today:', today);

    // Fetch some students
    const { data: students } = await supabase.from('alunos').select('id, nome').limit(5);
    console.log('Fetched students for log:', students);

    if (students && students.length > 0) {
      const logsToInsert = students.map((s, idx) => ({
        aluno_id: s.id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: idx < 3 ? 'PRESENTE' : 'AUSENTE',
        data_registro: today,
        turno: 'Vespertino'
      }));

      // Add historical logs for assiduity
      const historicalLogs = [];
      const historicalDates = ['2026-06-16', '2026-06-15', '2026-06-12', '2026-06-11'];
      historicalDates.forEach(d => {
        // student 0 has 4 history
        historicalLogs.push({
          aluno_id: students[0].id,
          motorista_id: motoristaId,
          rota_id: rotaId,
          tipo_movimento: 'IDA',
          status: 'PRESENTE',
          data_registro: d,
          turno: 'Vespertino'
        });
        if (students[1]) {
          // student 1 has 2 history
          if (d === '2026-06-16' || d === '2026-06-15') {
            historicalLogs.push({
              aluno_id: students[1].id,
              motorista_id: motoristaId,
              rota_id: rotaId,
              tipo_movimento: 'IDA',
              status: 'PRESENTE',
              data_registro: d,
              turno: 'Vespertino'
            });
          }
        }
      });

      const { data: insData, error: insErr } = await supabase
        .from('logs_embarque')
        .insert([...logsToInsert, ...historicalLogs])
        .select();

      if (insErr) {
        console.error('Logs insert failed:', insErr);
      } else {
        console.log('Logs insert succeeded!', insData);
      }
    }
  }

  run();
} catch (err) {
  console.error(err);
}
