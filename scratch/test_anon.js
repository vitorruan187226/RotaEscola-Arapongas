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

  // Create client without logging in (Anonymous)
  const supabase = createClient(supabaseUrl, supabaseKey);

  async function run() {
    console.log('Running INSERT as ANONYMOUS user...');
    
    // Carlos ID
    const carlosId = 'cad0b8cc-5610-4f99-bb0b-45f78889905b';
    const hashSecure = `rotaescola_arapongas_${carlosId}_secure_${Date.now().toString().slice(-4)}`;

    console.log('Inserting into carteirinhas...');
    const { data, error } = await supabase
      .from('carteirinhas')
      .insert({
        aluno_id: carlosId,
        qr_code_hash: hashSecure,
        data_vencimento: new Date().toISOString(),
        notificado_expiracao: false,
        status: 'Ativa'
      })
      .select();

    if (error) {
      console.error('ANONYMOUS INSERT ERROR:', error);
    } else {
      console.log('ANONYMOUS INSERT SUCCESS:', data);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
