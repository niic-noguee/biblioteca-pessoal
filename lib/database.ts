import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Usar arquivo físico ao invés de memória
const dbPath = path.join(process.cwd(), 'biblioteca.db');

// Criar/abrir banco de dados
const db = new Database(dbPath);

// Configurar SQLite
db.pragma('journal_mode = WAL'); // Melhor performance
db.pragma('foreign_keys = ON');  // IMPORTANTE: Ativar chaves estrangeiras

// Criar tabelas SE não existirem
const tableCheck = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='autores'
`).get();

if (!tableCheck) {
  console.log('🔄 Criando tabelas...');
  
  // Criar tabela autores
  db.exec(`
    CREATE TABLE autores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      pais TEXT NOT NULL
    )
  `);
  
  // Criar tabela livros COM CASCADE
  db.exec(`
    CREATE TABLE livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      ano INTEGER NOT NULL,
      autorId INTEGER NOT NULL,
      FOREIGN KEY (autorId) 
        REFERENCES autores(id) 
        ON DELETE CASCADE
    )
  `);
  
  console.log('✅ Tabelas criadas com sucesso!');
} else {
  console.log('✅ Tabelas já existem, usando banco existente.');
}

export default db;