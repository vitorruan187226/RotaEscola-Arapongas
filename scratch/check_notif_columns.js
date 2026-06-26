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

    console.log('Testing insert with custom notification fields...');
    const testCustom = {
      destinatario_id: '22222222-2222-2222-2222-222222222222',
      remetente_id: '99999999-9999-9999-9999-999999999999',
      tipo: 'embarque',
      titulo: 'Teste Custom',
      canal: 'app',
      mensagem: 'Mensagem custom',
      lida: false
    };

    const { data, error } = await supabase
      .from('notificacoes')
      .insert(testCustom)
      .select('*');

    if (error) {
      console.log('Insert failed with error:', error.message, 'Code:', error.code);
    } else {
      console.log('Insert succeeded! The custom columns exist.');
      console.log('Returned row:', data[0]);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
