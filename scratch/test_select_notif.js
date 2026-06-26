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
    console.log('Logging in as admin...');
    const loginRes = await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    if (loginRes.error) {
      console.error('Login failed:', loginRes.error.message);
      return;
    }
    console.log('Logged in successfully!');

    console.log('Selecting notifications...');
    const { data, error } = await supabase
      .from('notificacoes')
      .select('id, titulo, mensagem, lida, criado_em')
      .is('aluno_id', null);

    if (error) {
      console.error('Select failed:', error.message, 'Code:', error.code);
    } else {
      console.log('Select succeeded! Count of rows:', data.length);
      console.log('Rows:', data);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
