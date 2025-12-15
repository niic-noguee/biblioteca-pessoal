import { NextResponse } from 'next/server';
import db from '@/lib/database';

// GET - Listar todos os livros
export async function GET() {
  try {
    const livros = db.prepare(`
      SELECT l.*, a.nome as autorNome, a.pais as autorPais 
      FROM livros l
      JOIN autores a ON l.autorId = a.id
      ORDER BY l.titulo
    `).all();
    
    return NextResponse.json(livros);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar livros' },
      { status: 500 }
    );
  }
}

// POST - Criar novo livro
export async function POST(request: Request) {
  try {
    const { titulo, ano, autorId } = await request.json();
    
    if (!titulo || !ano || !autorId) {
      return NextResponse.json(
        { error: 'Título, ano e autor são obrigatórios' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare('INSERT INTO livros (titulo, ano, autorId) VALUES (?, ?, ?)');
    const result = stmt.run(titulo, parseInt(ano), parseInt(autorId));
    
    return NextResponse.json({
      id: result.lastInsertRowid,
      titulo,
      ano: parseInt(ano),
      autorId: parseInt(autorId)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar livro' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir livro
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do livro é obrigatório' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare('DELETE FROM livros WHERE id = ?');
    const result = stmt.run(parseInt(id));
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Livro não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Livro excluído com sucesso' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir livro' },
      { status: 500 }
    );
  }
}

// Exportar todas as funções
export { GET, POST, DELETE };