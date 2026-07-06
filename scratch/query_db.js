const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  try {
    const { data, error } = await supabase.from('rotas').select('id, nome, ativa, motorista_id');
    if (error) console.error('Erro rotas:', error);
    else console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Erro geral:', e);
  }
}

run();
