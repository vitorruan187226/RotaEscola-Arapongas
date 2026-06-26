const { createClient } = require('@supabase/supabase-js');
const url = 'https://lzzxivzkwtwifgvexuiy.supabase.co';
const anonKey = 'sb_publishable_Gh5TkPZtml0CvBRaiP_g8w_9nqhz8ED';

const supabase = createClient(url, anonKey);

async function run() {
  try {
    console.log('Efetuando login mock de motorista...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '33333333333@rotaescola.com',
      password: 'motoristasenha'
    });

    if (authError) {
      console.error('Erro no login:', authError.message);
      return;
    }

    console.log('Login efetuado com sucesso. Token obtido.');

    console.log('--- BUSCANDO PERFIS ---');
    const { data: perfis, error: errPerfis } = await supabase
      .from('perfis')
      .select('*');
    
    if (errPerfis) console.error('Erro perfis:', errPerfis);
    else console.log('Perfis no banco:', perfis);

    console.log('--- BUSCANDO MOTORISTAS PERFIL ---');
    const { data: mperfis, error: errMperfis } = await supabase
      .from('motoristas_perfil')
      .select('*');
    
    if (errMperfis) console.error('Erro motoristas_perfil:', errMperfis);
    else console.log('Motoristas Perfil no banco:', mperfis);

    console.log('--- BUSCANDO VEICULOS ---');
    const { data: veiculos, error: errVeiculos } = await supabase
      .from('veiculos')
      .select('*');
    
    if (errVeiculos) console.error('Erro veiculos:', errVeiculos);
    else console.log('Veiculos no banco:', veiculos);

  } catch (e) {
    console.error('Erro geral:', e);
  }
}

run();
