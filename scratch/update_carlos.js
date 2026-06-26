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

    console.log('Admin logged in! Updating Carlos profile to lowercase "motorista"...');
    const { data: updateData, error: updateError } = await supabase
      .from('perfis')
      .update({ tipo_usuario: 'motorista' })
      .eq('id', '33333333-3333-3333-3333-333333333333')
      .select();

    if (updateError) {
      console.error('Update failed:', updateError);
    } else {
      console.log('Update succeeded!', updateData);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
