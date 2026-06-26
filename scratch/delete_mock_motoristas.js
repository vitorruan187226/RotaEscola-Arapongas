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

  console.log('Login successful! Deleting mock motoristas...');

  const idsToDelete = [
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333334',
    '33333333-3333-3333-3333-333333333335',
    '33333333-3333-3333-3333-333333333336'
  ];

  const { data: delData, error: delErr } = await supabase
    .from('perfis')
    .delete()
    .in('id', idsToDelete)
    .select();

  if (delErr) {
    console.error('Error deleting mock motoristas:', delErr);
  } else {
    console.log('Deleted mock motoristas:', delData);
  }
}

run();
