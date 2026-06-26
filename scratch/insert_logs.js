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

  const students = [
    { id: 'a73e2840-7288-4682-9642-17cb25e36104', nome: 'Thiago' },
    { id: 'a73e2840-7288-4682-9642-17cb25e36102', nome: 'Felipe' },
    { id: 'cad0b8cc-5610-4f99-bb0b-45f78889905b', nome: 'carlos' },
    { id: '865060a4-cf04-4c01-8378-945d7416e8dd', nome: 'Sophia' },
    { id: '19e9c524-e54b-4048-8b6b-578273b46caf', nome: 'teste' }
  ];

  async function run() {
    console.log('Logging in as motorista...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '33333333333@rotaescola.com',
      password: 'motoristasenha'
    });

    if (authError) {
      console.error('Auth failed:', authError.message);
      return;
    }

    const motoristaId = authData.user.id;
    const rotaId = '849ca070-78b5-4119-8c4e-422bff003bb1'; // RT-66 Regiao Centro
    const today = new Date().toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}).split('/').reverse().join('-');
    console.log('Inserting logs for date:', today);

    // Clean up today's logs first
    const { error: deleteErr } = await supabase
      .from('logs_embarque')
      .delete()
      .eq('data_registro', today);
    if (deleteErr) console.warn('Warning deleting today\'s logs:', deleteErr);

    const logsToInsert = [
      {
        aluno_id: students[0].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'PRESENTE',
        data_registro: today,
        turno: 'Vespertino'
      },
      {
        aluno_id: students[1].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'PRESENTE',
        data_registro: today,
        turno: 'Vespertino'
      },
      {
        aluno_id: students[2].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'PRESENTE',
        data_registro: today,
        turno: 'Vespertino'
      },
      {
        aluno_id: students[3].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'AUSENTE',
        data_registro: today,
        turno: 'Vespertino'
      },
      {
        aluno_id: students[4].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'AUSENTE',
        data_registro: today,
        turno: 'Vespertino'
      }
    ];

    // Also insert some historical logs so we have assiduity
    const historicalLogs = [];
    const dates = ['2026-06-16', '2026-06-15', '2026-06-12', '2026-06-11'];
    
    // Thiago: 4 check-ins
    dates.forEach(d => {
      historicalLogs.push({
        aluno_id: students[0].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'PRESENTE',
        data_registro: d,
        turno: 'Vespertino'
      });
    });

    // Felipe: 3 check-ins
    dates.slice(0, 3).forEach(d => {
      historicalLogs.push({
        aluno_id: students[1].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'PRESENTE',
        data_registro: d,
        turno: 'Vespertino'
      });
    });

    // carlos: 2 check-ins
    dates.slice(0, 2).forEach(d => {
      historicalLogs.push({
        aluno_id: students[2].id,
        motorista_id: motoristaId,
        rota_id: rotaId,
        tipo_movimento: 'IDA',
        status: 'PRESENTE',
        data_registro: d,
        turno: 'Vespertino'
      });
    });

    const allLogs = [...logsToInsert, ...historicalLogs];
    
    console.log(`Inserting ${allLogs.length} logs...`);
    const { data, error } = await supabase
      .from('logs_embarque')
      .insert(allLogs)
      .select();

    if (error) {
      console.error('Insert failed:', error);
    } else {
      console.log('Successfully inserted logs!');
    }
  }

  run();
} catch (err) {
  console.error(err);
}
