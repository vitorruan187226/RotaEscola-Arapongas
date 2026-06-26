const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const idDriver = '57e54de9-7e83-4f4b-a4ea-e5f9838a8488'; // Silvio Vicente Barbosa

async function run() {
  try {
    // Logar como Admin para ler os dados sem restrições de RLS
    await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    // 1. Consultar a tabela motoristas_perfil
    const { data: mPerfil, error: errMP } = await supabase
      .from('motoristas_perfil')
      .select('*')
      .eq('perfil_id', idDriver)
      .maybeSingle();

    if (errMP) console.error('Erro ao buscar motoristas_perfil:', errMP);
    else console.log('Registro em motoristas_perfil:', mPerfil);

    // 2. Consultar a tabela veiculos
    const { data: veiculos, error: errV } = await supabase
      .from('veiculos')
      .select('*')
      .eq('motorista_id', idDriver);

    if (errV) console.error('Erro ao buscar veiculos:', errV);
    else console.log('Veículos vinculados na tabela veiculos:', veiculos);

    // 3. Consultar a tabela rotas
    const { data: rotas, error: errR } = await supabase
      .from('rotas')
      .select('*')
      .eq('motorista_id', idDriver);

    if (errR) console.error('Erro ao buscar rotas:', errR);
    else console.log('Rotas vinculadas na tabela rotas:', rotas);

  } catch (e) {
    console.error(e);
  }
}

run();
