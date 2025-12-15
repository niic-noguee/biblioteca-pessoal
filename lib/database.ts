import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Usar arquivo físico ao invés de memória
const dbPath = path.join(process.cwd(), 'biblioteca.db');

// Verificar se o arquivo já existe para não sobrescrever dados
let db: Database.Database;

try {
  // Se o arquivo existe, usar ele
  if (fs.existsSync(dbPath)) {
    db = new Database(dbPath);
    console.log('✅ Banco de dados carregado do arquivo:', dbPath);
  } else {
    // Se não existe, criar novo
    db = new Database(dbPath);
    console.log('📁 Novo banco de dados criado em:', dbPath);
    
    // Criar tabelas (vazias, sem dados de exemplo)
    db.exec(`
      CREATE TABLE IF NOT EXISTS autores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        pais TEXT NOT NULL
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        ano INTEGER NOT NULL,
        autorId INTEGER NOT NULL,
        FOREIGN KEY (autorId) REFERENCES autores(id)
      )
    `);
    
    console.log('✅ Tabelas criadas com sucesso!');
  }
} catch (error) {
  console.error('❌ Erro ao conectar ao banco de dados:', error);
  // Fallback para memória se der erro
  db = new Database(':memory:');
  console.log('⚠️  Usando banco em memória como fallback');
}

export default db;