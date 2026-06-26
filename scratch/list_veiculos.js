const { createClient } = require('@supabase/supabase-js');
const url = 'https://lzzxivzkwtwifgvexuiy.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6enhpdnprd3R3aWZndmV4dWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjAyMDQsImV4cCI6MjA5NTM5NjIwNH0.kzc-ymnJMgbbL341apUF7p-zVG49yMDMIGH4J6ZTum8';

const supabase = createClient(url, anonKey);

async function run() {
  const { data: sessionData, error: sessionErr } = await supabase.auth.signInWithPassword({
    email: '99999999999@rotaescola.com',
    password: 'adminisenha'
  });

  if (sessionErr) {
    console.error('Error signing in:', sessionErr);
    return;
  }

  const { data: veiculos, error: errVeiculos } = await supabase
    .from('veiculos')
    .select('*');
  console.log('Veículos:', veiculos || errVeiculos);
}

run();
