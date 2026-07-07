const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenvContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
dotenvContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('get_dashboard_metrics');
  console.log('Metrics:', data ? data.mais_assiduos : error);
}
test();
