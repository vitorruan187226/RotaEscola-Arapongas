const { createClient } = require('@supabase/supabase-js');
const url = 'https://lzzxivzkwtwifgvexuiy.supabase.co';
const anonKey = 'sb_publishable_Gh5TkPZtml0CvBRaiP_g8w_9nqhz8ED';

const supabase = createClient(url, anonKey);

async function run() {
  try {
    console.log('--- BUSCANDO ESCOLAS ---');
    const { data: escolas, error: errEscolas } = await supabase
      .from('escolas')
      .select('*')
      .order('nome', { ascending: true });
    
    if (errEscolas) {
      console.error('Erro escolas:', errEscolas);
    } else {
      console.log('Escolas found:', escolas.length);
      console.log(escolas);
    }
  } catch (e) {
    console.error('Erro geral:', e);
  }
}

run();
