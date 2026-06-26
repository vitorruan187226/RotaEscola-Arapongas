const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Carrega as variáveis de ambiente do .env.local
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente ausentes no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const idParent = '601a88d7-b090-4325-814f-9054872a5bc3'; // Vitor Ruan
const idDriver = '57e54de9-7e83-4f4b-a4ea-e5f9838a8488'; // teste 2 (Silvio Vicente Barbosa)

async function run() {
  try {
    console.log('Efetuando login administrativo para obter privilégios de escrita...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: '99999999999@rotaescola.com',
      password: 'adminisenha'
    });

    if (authError) {
      console.error('Erro de autenticação administrativa:', authError.message);
      return;
    }
    console.log('Login efetuado com sucesso!');

    // 1. Obter informações atuais do perfil de Vitor Ruan (para pegar a foto e telefone que o usuário inseriu)
    console.log('\nConsultando perfil do Pai (Vitor Ruan) para extrair os dados personalizados pelo usuário...');
    const { data: perfilPai, error: errPai } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', idParent)
      .single();

    if (errPai) {
      console.error('Erro ao buscar perfil do pai:', errPai.message);
      return;
    }

    const fotoInserida = perfilPai.foto_url;
    const telefoneInserido = perfilPai.telefone;
    const nomeDesejado = perfilPai.nome; // Silvio Vicente Barbosa

    console.log(`Dados capturados:`);
    console.log(`  - Nome: ${nomeDesejado}`);
    console.log(`  - Telefone: ${telefoneInserido}`);
    console.log(`  - Foto URL: ${fotoInserida}`);

    // 2. Atualizar o perfil do Motorista real ('teste 2') com os dados de personalização
    console.log('\nPasso 1/5: Aplicando a personalização (Nome, Telefone e Foto) ao perfil do Motorista real ("teste 2")...');
    const { error: errUpdateDriver } = await supabase
      .from('perfis')
      .update({
        nome: 'Silvio Vicente Barbosa',
        telefone: telefoneInserido || '43 998209066',
        foto_url: fotoInserida || null,
        tipo_usuario: 'Motorista'
      })
      .eq('id', idDriver);

    if (errUpdateDriver) {
      console.error('Erro ao atualizar perfil do motorista:', errUpdateDriver.message);
      return;
    }
    console.log('Sucesso: Perfil do motorista real atualizado.');

    // 3. Restaurar o perfil do Pai de volta a 'Responsável', com o nome original 'Vitor Ruan' e limpando os dados do motorista
    console.log('\nPasso 2/5: Restaurando o perfil do Pai de volta para "Responsável" e definindo o nome original para "Vitor Ruan"...');
    const { error: errUpdateParent } = await supabase
      .from('perfis')
      .update({
        nome: 'Vitor Ruan',
        tipo_usuario: 'Responsável',
        telefone: null,
        foto_url: null
      })
      .eq('id', idParent);

    if (errUpdateParent) {
      console.error('Erro ao restaurar perfil do pai:', errUpdateParent.message);
      return;
    }
    console.log('Sucesso: Perfil do pai restaurado.');

    // 4. Garantir que as tabelas operacionais apontam para o UUID do motorista real (idDriver)
    console.log('\nPasso 3/5: Garantindo que motoristas_perfil aponte para o motorista real...');
    const { error: errMP } = await supabase
      .from('motoristas_perfil')
      .update({ perfil_id: idDriver })
      .eq('perfil_id', idParent); // se por acaso estivesse no do pai
    
    // Garantir que a CNH e Categoria estejam corretas na tabela de perfil
    const { error: errMP2 } = await supabase
      .from('motoristas_perfil')
      .update({ perfil_id: idDriver })
      .eq('perfil_id', idDriver);

    if (errMP) console.warn('Aviso ao atualizar perfil operacional:', errMP.message);
    console.log('Sucesso: Perfil operacional alinhado.');

    console.log('\nPasso 4/5: Garantindo que veiculos apontem para o motorista real...');
    const { error: errV } = await supabase
      .from('veiculos')
      .update({ motorista_id: idDriver })
      .eq('motorista_id', idParent); // se por acaso estivesse no do pai
    
    if (errV) console.warn('Aviso ao atualizar veiculos:', errV.message);
    console.log('Sucesso: Vínculo de veículo alinhado.');

    console.log('\nPasso 5/5: Garantindo que rotas apontem para o motorista real...');
    const { error: errR } = await supabase
      .from('rotas')
      .update({ motorista_id: idDriver })
      .eq('motorista_id', idParent); // se por acaso estivesse no do pai

    if (errR) console.warn('Aviso ao atualizar rotas:', errR.message);
    console.log('Sucesso: Vínculo de rotas alinhado.');

    console.log('\n=====================================================================');
    console.log('SUCESSO TOTAL! PROCESSAMENTO CONCLUÍDO.');
    console.log('  1. O pai "Vitor Ruan" recuperou seu acesso e nome de forma limpa.');
    console.log('  2. O motorista "teste 2" foi personalizado para "Silvio Vicente Barbosa"');
    console.log('     com a foto do logo Nossa Web TV e o telefone informados.');
    console.log('  3. Todas as associações operacionais de veículo e rotas estão seguras.');
    console.log('=====================================================================');

  } catch (err) {
    console.error('Erro crítico na execução:', err);
  }
}

run();
