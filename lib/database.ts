import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'biblioteca.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL'); 
db.pragma('foreign_keys = ON');  

const tableCheck = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='autores'
`).get();

if (!tableCheck) {
  console.log('🔄 Criando tabelas...');
  
  db.exec(`
    CREATE TABLE autores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      pais TEXT NOT NULL
    )
  `);
  
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