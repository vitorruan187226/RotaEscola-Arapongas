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
    // Logar como Admin para obter permissão de escrita
    await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    console.log('Atualizando o número da CNH do motorista Silvio Vicente Barbosa no banco de dados...');
    
    const { error } = await supabase
      .from('motoristas_perfil')
      .update({
        cnh: '12345678900' // Define um número de CNH válido para exibição
      })
      .eq('perfil_id', idDriver);

    if (error) {
      console.error('Erro ao atualizar CNH:', error.message);
    } else {
      console.log('Sucesso: CNH do motorista atualizada para "12345678900".');
    }

  } catch (e) {
    console.error(e);
  }
}

run();
