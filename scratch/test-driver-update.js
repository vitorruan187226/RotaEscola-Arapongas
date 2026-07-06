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
    console.log('Logging in as driver Carlos (33333333333)...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '33333333333@rotaescola.com',
      password: 'motoristasenha'
    });

    if (authError) {
      console.error('Auth failed:', authError.message);
      return;
    }

    console.log('Logged in successfully. Fetching logs_embarque...');
    const { data, error } = await supabase
      .from('logs_embarque')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Fetch failed with error:', error);
    } else {
      console.log('Fetch response data:', data);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
