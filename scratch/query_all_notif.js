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

  const supabase = createClient(supabaseUrl, supabaseKey);

  async function run() {
    console.log('Logging in...');
    await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    console.log('Querying ALL notifications (including read)...');
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .is('aluno_id', null)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Failed:', error.message);
    } else {
      console.log('Notifications in DB:', data.length);
      console.log(data);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
