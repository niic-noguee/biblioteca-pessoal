import Database from 'better-sqlite3';

// Banco em memória (simples para demo)
const db = new Database(':memory:');

// Criar tabelas
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

// Inserir alguns dados de exemplo
const insertAutor = db.prepare('INSERT INTO autores (nome, pais) VALUES (?, ?)');
const insertLivro = db.prepare('INSERT INTO livros (titulo, ano, autorId) VALUES (?, ?, ?)');

try {
  // Inserir autores
  const autor1 = insertAutor.run('Machado de Assis', 'Brasil');
  const autor2 = insertAutor.run('Clarice Lispector', 'Brasil');
  const autor3 = insertAutor.run('George Orwell', 'Inglaterra');
  
  // Inserir livros
  insertLivro.run('Dom Casmurro', 1899, autor1.lastInsertRowid);
  insertLivro.run('Memórias Póstumas', 1881, autor1.lastInsertRowid);
  insertLivro.run('A Hora da Estrela', 1977, autor2.lastInsertRowid);
  insertLivro.run('1984', 1949, autor3.lastInsertRowid);
} catch (error) {
  // Dados já podem existir
}

export default db;