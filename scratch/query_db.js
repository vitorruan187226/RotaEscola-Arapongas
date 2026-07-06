const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: alunos } = await supabase.from('alunos').select('*').limit(1);
  const { data: escolas } = await supabase.from('escolas').select('*').limit(1);
  console.log('Alunos columns:', alunos && alunos[0] ? Object.keys(alunos[0]) : 'no data');
  console.log('Escolas columns:', escolas && escolas[0] ? Object.keys(escolas[0]) : 'no data');
}
run();
