import { NextResponse } from 'next/server';
import db from '@/lib/database';

// Listar todos os autores
export async function GET() {
  try {
    const autores = db.prepare('SELECT * FROM autores ORDER BY nome').all();
    return NextResponse.json(autores);
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar autores' },
      { status: 500 }
    );
  }
}

// Criar novo autor
export async function POST(request: Request) {
  try {
    const { nome, pais } = await request.json();
    
    if (!nome || !pais) {
      return NextResponse.json(
        { error: 'Nome e país são obrigatórios' },
        { status: 400 }
      );
    }
    
    const autorExistente = db
      .prepare('SELECT * FROM autores WHERE nome = ? AND pais = ?')
      .get(nome, pais);
    
    if (autorExistente) {
      return NextResponse.json(
        { error: 'Este autor já está cadastrado' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare('INSERT INTO autores (nome, pais) VALUES (?, ?)');
    const result = stmt.run(nome, pais);
    
    return NextResponse.json({
      id: result.lastInsertRowid,
      nome,
      pais,
      message: 'Autor cadastrado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar autor:', error);
    return NextResponse.json(
      { error: 'Erro ao criar autor' },
      { status: 500 }
    );
  }
}

// Excluir autor 
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    console.log('🔄 Recebida requisição DELETE para autor ID:', id);
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'ID do autor é obrigatório e deve ser um número' },
        { status: 400 }
      );
    }
    
    const autorId = parseInt(id);
    
    const autor = db.prepare('SELECT * FROM autores WHERE id = ?').get(autorId);
    
    if (!autor) {
      console.log('❌ Autor não encontrado, ID:', autorId);
      return NextResponse.json(
        { error: 'Autor não encontrado' },
        { status: 404 }
      );
    }
    
    console.log('✅ Autor encontrado:', autor);
    
    const contagemStmt = db.prepare('SELECT COUNT(*) as total FROM livros WHERE autorId = ?');
    const contagem = contagemStmt.get(autorId) as { total: number };
    
    console.log(`📚 Autor tem ${contagem.total} livro(s)`);
    
    if (contagem.total > 0) {
      console.log('🗑️  Excluindo livros do autor...');
      const deleteLivrosStmt = db.prepare('DELETE FROM livros WHERE autorId = ?');
      const livrosExcluidos = deleteLivrosStmt.run(autorId);
      console.log(`✅ ${livrosExcluidos.changes} livro(s) excluído(s)`);
    }
    
    console.log('🗑️  Excluindo autor...');
    const deleteAutorStmt = db.prepare('DELETE FROM autores WHERE id = ?');
    const resultado = deleteAutorStmt.run(autorId);
    
    if (resultado.changes === 0) {
      console.log('❌ Nenhum autor foi excluído');
      return NextResponse.json(
        { error: 'Não foi possível excluir o autor' },
        { status: 500 }
      );
    }
    
    console.log('✅ Autor excluído com sucesso!');
    
    return NextResponse.json({
      success: true,
      message: `Autor "${autor.nome}" excluído com sucesso!`,
      detalhes: {
        autorExcluido: autor.nome,
        livrosRemovidos: contagem.total,
        autorId: autorId
      }
    });
    
  } catch (error: any) {
    console.error('❌ ERRO CRÍTICO ao excluir autor:', error);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Erro interno ao excluir autor',
        detalhes: error.message 
      },
      { status: 500 }
    );
  }
}