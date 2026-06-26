const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Carrega as variáveis de ambiente do .env.local
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Arquivo .env.local não encontrado em:', envPath);
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const equalIdx = line.indexOf('=');
  if (equalIdx > 0) {
    const key = line.substring(0, equalIdx).trim();
    const value = line.substring(equalIdx + 1).trim().replace(/^['"]|['"]$/g, ''); // Remove aspas extras
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes no .env.local');
  process.exit(1);
}

// 2. Inicializa o cliente com o Service Role (bypass RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const targetDriverId = '601a88d7-b090-4325-814f-9054872a5bc3'; // UUID de Vitor Ruan / Silvio Vicente Barbosa
const oldDriverId = '57e54de9-7e83-4f4b-a4ea-e5f9838a8488';    // UUID antigo/temporário

async function runFix() {
  console.log(`Iniciando a correção do banco de dados...`);
  console.log(`Motorista de destino (Novo UUID): ${targetDriverId}`);
  console.log(`Motorista de origem (UUID antigo): ${oldDriverId}`);

  try {
    // Passo 1: Atualiza tipo_usuario para 'Motorista' na tabela perfis
    console.log('\nPasso 1/4: Atualizando tipo_usuario para "Motorista" na tabela perfis...');
    const { data: perfilAntes, error: errPerfilAntes } = await supabase
      .from('perfis')
      .select('id, nome, tipo_usuario')
      .eq('id', targetDriverId)
      .single();

    if (errPerfilAntes) {
      console.error('Aviso: Não foi possível carregar o perfil do motorista de destino:', errPerfilAntes.message);
    } else {
      console.log(`Perfil atual encontrado: ${perfilAntes.nome} (${perfilAntes.tipo_usuario})`);
    }

    const { error: errUpdatePerfil } = await supabase
      .from('perfis')
      .update({ tipo_usuario: 'Motorista' })
      .eq('id', targetDriverId);

    if (errUpdatePerfil) {
      console.error('Erro ao atualizar tipo_usuario:', errUpdatePerfil.message);
      throw errUpdatePerfil;
    }
    console.log('Sucesso: tipo_usuario atualizado para "Motorista".');

    // Passo 2: Atualiza o perfil_id na tabela motoristas_perfil
    console.log('\nPasso 2/4: Atualizando perfil_id na tabela motoristas_perfil...');
    const { data: motoristasPerfilAntes, error: errMPAntes } = await supabase
      .from('motoristas_perfil')
      .select('*')
      .eq('perfil_id', oldDriverId);

    if (errMPAntes) {
      console.error('Erro ao buscar motoristas_perfil:', errMPAntes.message);
    } else {
      console.log(`Registros de perfil operacional encontrados para o ID antigo:`, motoristasPerfilAntes);
    }

    const { error: errUpdateMP } = await supabase
      .from('motoristas_perfil')
      .update({ perfil_id: targetDriverId })
      .eq('perfil_id', oldDriverId);

    if (errUpdateMP) {
      console.error('Erro ao atualizar motoristas_perfil:', errUpdateMP.message);
      throw errUpdateMP;
    }
    console.log('Sucesso: perfil_id atualizado em motoristas_perfil.');

    // Passo 3: Atualiza o motorista_id na tabela veiculos
    console.log('\nPasso 3/4: Atualizando motorista_id na tabela veiculos...');
    const { error: errUpdateVeiculo } = await supabase
      .from('veiculos')
      .update({ motorista_id: targetDriverId })
      .eq('motorista_id', oldDriverId);

    if (errUpdateVeiculo) {
      console.error('Erro ao atualizar veiculos:', errUpdateVeiculo.message);
      throw errUpdateVeiculo;
    }
    console.log('Sucesso: motorista_id atualizado em veiculos.');

    // Passo 4: Atualiza o motorista_id na tabela rotas
    console.log('\nPasso 4/4: Atualizando motorista_id na tabela rotas...');
    const { error: errUpdateRota } = await supabase
      .from('rotas')
      .update({ motorista_id: targetDriverId })
      .eq('motorista_id', oldDriverId);

    if (errUpdateRota) {
      console.error('Erro ao atualizar rotas:', errUpdateRota.message);
      throw errUpdateRota;
    }
    console.log('Sucesso: motorista_id atualizado em rotas.');

    console.log('\n=============================================');
    console.log('CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('O motorista agora está vinculado ao veículo e rota.');
    console.log('=============================================');

  } catch (err) {
    console.error('Falha crítica na execução da correção:', err);
  }
}

runFix();
