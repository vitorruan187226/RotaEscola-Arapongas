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

const idDriver = '57e54de9-7e83-4f4b-a4ea-e5f9838a8488'; // Silvio Vicente Barbosa (teste 2)

async function run() {
  try {
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    // Como o admin está logado, podemos ler a tabela perfis
    const { data: perfil, error } = await supabase
      .from('perfis')
      .select('id, nome, cpf, tipo_usuario')
      .eq('id', idDriver)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil do motorista:', error.message);
      return;
    }

    console.log('\n=============================================');
    console.log('DADOS DE LOGIN DO MOTORISTA ENCONTRADOS:');
    console.log(`  - Nome: ${perfil.nome}`);
    console.log(`  - CPF: ${perfil.cpf || 'Não cadastrado no perfil'}`);
    console.log(`  - Email: ${perfil.email || 'Não cadastrado no perfil'}`);
    console.log(`  - Tipo de Usuário: ${perfil.tipo_usuario}`);
    console.log('=============================================');

  } catch (e) {
    console.error(e);
  }
}

run();
