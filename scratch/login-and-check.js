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

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing URL or Key in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  async function run() {
    console.log('Logging in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    if (authError) {
      console.error('Authentication failed:', authError.message);
      return;
    }

    console.log('Login successful! Fetching data...');

    // Query logged in user profile
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Logged in user ID:', user?.id);

    // Query Alunos
    const { data: alunos, error: errAlunos } = await supabase
      .from('alunos')
      .select('id, nome, escola, turno, rota_id');

    if (errAlunos) {
      console.error('Error fetching alunos:', errAlunos.message);
      return;
    }
    console.log('--- ALUNOS NO BANCO ---');
    alunos.forEach(a => {
      console.log(`Aluno ID: ${a.id}, Nome: ${a.nome}`);
    });

    // Query all logs_embarque
    const { data: logs, error: errLogs } = await supabase
      .from('logs_embarque')
      .select('*');

    if (errLogs) {
      console.error('Error fetching logs_embarque:', errLogs.message);
      return;
    }

    // Query Presencas Diarias
    const { data: presencas, error: errPresencas } = await supabase
      .from('presencas_diarias')
      .select('*');

    if (errPresencas) {
      console.error('Error fetching presencas:', errPresencas.message);
      return;
    }

    console.log(`Logs count: ${logs.length}, Presencas count: ${presencas.length}`);

    // Aggregate in JS
    const absenceDatesByStudent = {}; // studentId -> Set of dates
    
    logs.forEach(l => {
      if (l.status === 'AUSENTE') {
        const studentId = l.aluno_id;
        const date = l.data_registro; // date is a string YYYY-MM-DD
        if (!absenceDatesByStudent[studentId]) {
          absenceDatesByStudent[studentId] = new Set();
        }
        absenceDatesByStudent[studentId].add(date);
      }
    });

    presencas.forEach(p => {
      if (p.compareceu === false) {
        const studentId = p.aluno_id;
        const date = p.data_presenca; // date is a string YYYY-MM-DD
        if (!absenceDatesByStudent[studentId]) {
          absenceDatesByStudent[studentId] = new Set();
        }
        absenceDatesByStudent[studentId].add(date);
      }
    });

    const ranking = Object.entries(absenceDatesByStudent).map(([studentId, datesSet]) => {
      const student = alunos.find(a => a.id === studentId);
      return {
        id: studentId,
        nome: student ? student.nome : 'Unknown',
        escola: student ? student.escola : 'Unknown',
        total_faltas: datesSet.size,
        dates: Array.from(datesSet)
      };
    }).sort((a, b) => b.total_faltas - a.total_faltas);

    console.log('--- JS ABSENCE RANKING ---');
    console.log(JSON.stringify(ranking, null, 2));



  }

  run();
} catch (err) {
  console.error('Execution error:', err);
}

