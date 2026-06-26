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
    await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    console.log('Querying policies for carteirinhas...');
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'carteirinhas');

    if (error) {
      // If direct select fails, let's query via RPC or check pg_catalog
      console.log('Direct select from pg_policies failed. Trying RPC execute_sql...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('execute_sql', {
        sql_query: "SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'carteirinhas'"
      });
      if (rpcError) {
        console.error('RPC execute_sql failed:', rpcError.message);
      } else {
        console.log('Policies from RPC:', rpcData);
      }
    } else {
      console.log('Policies from select:', policies);
    }
  }

  run();
} catch (err) {
  console.error(err);
}
