import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Verificar se estamos na Vercel (ambiente de produção)
const isVercel = process.env.NODE_ENV === 'production';

let db: Database.Database;

if (isVercel) {
  // Na Vercel, usar banco em memória (não temos sistema de arquivos persistente)
  console.log('🚀 Ambiente Vercel detectado - usando SQLite em memória');
  db = new Database(':memory:');
  
  // Criar tabelas
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
      autorId INTEGER NOT NULL
    )
  `);
  
  // Inserir alguns dados de exemplo para demonstração
  const insertAutor = db.prepare('INSERT INTO autores (nome, pais) VALUES (?, ?)');
  const insertLivro = db.prepare('INSERT INTO livros (titulo, ano, autorId) VALUES (?, ?, ?)');
  
  try {
    const autor1 = insertAutor.run('Machado de Assis', 'Brasil');
    const autor2 = insertAutor.run('Clarice Lispector', 'Brasil');
    
    insertLivro.run('Dom Casmurro', 1899, autor1.lastInsertRowid);
    insertLivro.run('A Hora da Estrela', 1977, autor2.lastInsertRowid);
  } catch (error) {
    console.log('Dados de exemplo já inseridos');
  }
  
} else {
  // Desenvolvimento local - usar arquivo físico
  const dbPath = path.join(process.cwd(), 'biblioteca.db');
  
  if (fs.existsSync(dbPath)) {
    db = new Database(dbPath);
    console.log('✅ Banco de dados local carregado:', dbPath);
  } else {
    db = new Database(dbPath);
    console.log('📁 Novo banco de dados local criado:', dbPath);
    
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
        autorId INTEGER NOT NULL
      )
    `);
  }
}

export default db;