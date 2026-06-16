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
    console.log('Logging in as driver Carlos...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '33333333333@rotaescola.com',
      password: 'motoristasenha'
    });

    if (authError) {
      console.error('Authentication failed:', authError.message);
      
      console.log('Trying alternative email carlos@rotaescola.com with password motoristasenha...');
      const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
        email: 'carlos@rotaescola.com',
        password: 'motoristasenha'
      });
      
      if (authError2) {
        console.error('Alternative authentication failed:', authError2.message);
        return;
      }
    }

    console.log('Login successful! Fetching data...');

    // Query logged in user profile
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Logged in user ID:', user?.id);

    const { data: allPerfis } = await supabase
      .from('perfis')
      .select('*');
    console.log('All Perfis:', JSON.stringify(allPerfis, null, 2));

    const { data: driverPerfil } = await supabase
      .from('motoristas_perfil')
      .select('*')
      .eq('perfil_id', user?.id)
      .maybeSingle();
    console.log('Driver Perfil:', JSON.stringify(driverPerfil, null, 2));

    const { data: rotas } = await supabase
      .from('rotas')
      .select('*');
    console.log('All Rotas:', JSON.stringify(rotas, null, 2));

    // Query Alunos
    const { data: alunos, error: errAlunos } = await supabase
      .from('alunos')
      .select('id, nome, escola, turno, rota_id');

    if (errAlunos) {
      console.error('Error fetching alunos:', errAlunos.message);
    } else {
      console.log(`Found ${alunos.length} Alunos:`);
      console.log(JSON.stringify(alunos, null, 2));
    }

    // Query Presencas Diarias
    const { data: presencas, error: errPresencas } = await supabase
      .from('presencas_diarias')
      .select('*')
      .order('created_at', { ascending: false });

    if (errPresencas) {
      console.error('Error fetching presencas:', errPresencas.message);
    } else {
      console.log(`Found ${presencas.length} Presencas:`);
      console.log(JSON.stringify(presencas, null, 2));
    }
  }

  run();
} catch (err) {
  console.error('Execution error:', err);
}
