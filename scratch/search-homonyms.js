const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        walk(filepath, callback);
      }
    } else if (stat.isFile()) {
      if (['.js', '.ts', '.tsx', '.json', '.sql'].includes(path.extname(file))) {
        callback(filepath);
      }
    }
  });
};

console.log('Iniciando varredura no código para busca de consultas vulneráveis a homônimos (filtros por nome)...');

let matches = 0;

walk(path.join(__dirname, '..'), (filepath) => {
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Padrões de busca por filtros de banco baseados em nome ou comparações textuais suspeitas
  const pattern1 = /\.eq\(['"]nome['"]/i;
  const pattern2 = /\.eq\(['"]nome_motorista['"]/i;
  const pattern3 = /\.eq\(['"]motorista_nome['"]/i;
  const pattern4 = /from\(['"]perfis['"]\).*nome/i;

  if (pattern1.test(content) || pattern2.test(content) || pattern3.test(content) || pattern4.test(content)) {
    // Ignorar arquivos de mock ou o próprio script de busca
    if (filepath.includes('search-homonyms') || filepath.includes('fix-driver-db') || filepath.includes('node_modules')) {
      return;
    }
    
    console.log(`\nArquivo suspeito encontrado: ${path.relative(path.join(__dirname, '..'), filepath)}`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (pattern1.test(line) || pattern2.test(line) || pattern3.test(line) || pattern4.test(line)) {
        console.log(`  Linha ${idx + 1}: ${line.trim()}`);
        matches++;
      }
    });
  }
});

console.log(`\nVarredura concluída. Total de ocorrências suspeitas de filtro por nome: ${matches}`);
