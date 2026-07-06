const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('logs_embarque')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(5);
  
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

run();
