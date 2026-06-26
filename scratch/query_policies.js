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
    await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    console.log('Querying pg_policies...');
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: "SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'notificacoes'"
    });

    if (error) {
      console.error('Error executing query:', error.message);
      // Let's try direct select from pg_policies if execute_sql is not available
      const { data: directData, error: directErr } = await supabase
        .from('pg_policies')
        .select('*');
      if (directErr) {
        console.error('Direct pg_policies failed:', directErr.message);
      } else {
        console.log('pg_policies:', directData);
      }
    } else {
      console.log('Policies:', data);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
