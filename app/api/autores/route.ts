import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET - Listar todos os autores
export async function GET() {
  try {
    const autores = db.prepare('SELECT * FROM autores ORDER BY nome').all();
    return NextResponse.json(autores);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar autores' },
      { status: 500 }
    );
  }
}

// POST - Criar novo autor
export async function POST(request: Request) {
  try {
    const { nome, pais } = await request.json();
    
    if (!nome || !pais) {
      return NextResponse.json(
        { error: 'Nome e país são obrigatórios' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare('INSERT INTO autores (nome, pais) VALUES (?, ?)');
    const result = stmt.run(nome, pais);
    
    return NextResponse.json({
      id: result.lastInsertRowid,
      nome,
      pais
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar autor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir autor
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do autor é obrigatório' },
        { status: 400 }
      );
    }
    
    // Primeiro, excluir os livros do autor (cascata)
    const deleteLivrosStmt = db.prepare('DELETE FROM livros WHERE autorId = ?');
    deleteLivrosStmt.run(parseInt(id));
    
    // Depois, excluir o autor
    const deleteAutorStmt = db.prepare('DELETE FROM autores WHERE id = ?');
    const result = deleteAutorStmt.run(parseInt(id));
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Autor não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Autor e seus livros excluídos com sucesso' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir autor' },
      { status: 500 }
    );
  }
}

// Exportar todas as funções
export { GET, POST, DELETE };