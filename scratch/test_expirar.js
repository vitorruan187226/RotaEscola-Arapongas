const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  const dotenvContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  const env = {};
  dotenvContent.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  async function run() {
    console.log('Logging in as Admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    if (authError) {
      console.error('Admin Auth failed:', authError.message);
      return;
    }

    console.log('Admin logged in! Finding student "carlos"...');
    const { data: Alunos, error: alunosError } = await supabase
      .from('alunos')
      .select('id, nome')
      .ilike('nome', '%carlos%')
      .limit(1);

    if (alunosError) {
      console.error('Failed to query student:', alunosError);
      return;
    }

    if (!Alunos || Alunos.length === 0) {
      console.log('Student carlos not found!');
      return;
    }

    const carlos = Alunos[0];
    console.log(`Found student: ${carlos.nome} (${carlos.id})`);

    console.log('Querying carteirinha...');
    const { data: cards, error: cardsError } = await supabase
      .from('carteirinhas')
      .select('*')
      .eq('aluno_id', carlos.id);

    if (cardsError) {
      console.error('Query carteirinhas failed:', cardsError);
    } else {
      console.log('Carteirinhas found:', cards);
    }

    console.log('Testing update on carteirinhas...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    if (cards && cards.length > 0) {
      const card = cards[0];
      console.log(`Attempting to update card ${card.id} to expired...`);
      const { data: res, error: updateError } = await supabase
        .from('carteirinhas')
        .update({ 
          data_vencimento: yesterday,
          notificado_expiracao: false
        })
        .eq('id', card.id)
        .select();

      if (updateError) {
        console.error('UPDATE ERROR:', updateError);
      } else {
        console.log('UPDATE SUCCESS:', res);
      }
    } else {
      console.log('No card found. Attempting to insert...');
      const hashSecure = `rotaescola_arapongas_${carlos.id}_secure_${Date.now().toString().slice(-4)}`;
      const { data: res, error: insertError } = await supabase
        .from('carteirinhas')
        .insert({
          aluno_id: carlos.id,
          qr_code_hash: hashSecure,
          data_vencimento: yesterday,
          notificado_expiracao: false,
          status: 'Ativa'
        })
        .select();

      if (insertError) {
        console.error('INSERT ERROR:', insertError);
      } else {
        console.log('INSERT SUCCESS:', res);
      }
    }
  }

  run();
} catch (err) {
  console.error(err);
}
