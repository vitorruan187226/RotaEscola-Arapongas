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

    console.log('Login successful! Querying escolas...');
    const { data: escolas, error: errEscolas } = await supabase
      .from('escolas')
      .select('*')
      .order('nome', { ascending: true });

    if (errEscolas) {
      console.error('Error fetching escolas:', errEscolas);
    } else {
      console.log(`Found ${escolas.length} escolas:`);
      console.log(escolas);
    }
  }

  run();
} catch (err) {
  console.error('Execution error:', err);
}
