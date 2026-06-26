const { createClient } = require('@supabase/supabase-js');
const url = 'https://lzzxivzkwtwifgvexuiy.supabase.co';
const anonKey = 'sb_publishable_Gh5TkPZtml0CvBRaiP_g8w_9nqhz8ED';

const supabase = createClient(url, anonKey);

async function run() {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome, cpf, tipo_usuario')
    .eq('tipo_usuario', 'Motorista');

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Motoristas no banco:', data);
  }
}

run();
