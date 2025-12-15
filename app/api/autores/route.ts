import { NextResponse } from 'next/server';
import db from '@/lib/database';

// Interface para o tipo Autor
interface AutorDB {
  id: number;
  nome: string;
  pais: string;
}

// GET - Listar todos os autores
export async function GET() {
  try {
    const autores = db.prepare('SELECT * FROM autores ORDER BY nome').all() as AutorDB[];
    return NextResponse.json(autores);
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
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
    
    // Verificar se autor já existe
    const autorExistente = db
      .prepare('SELECT * FROM autores WHERE nome = ? AND pais = ?')
      .get(nome, pais) as AutorDB | undefined;
    
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

// DELETE - Excluir autor (VERSÃO SIMPLES E FUNCIONAL)
export async function DELETE(request: Request) {
  try {
    // Pegar o ID da URL
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
    
    // 1. Primeiro, verificar se o autor existe
    const autor = db
      .prepare('SELECT * FROM autores WHERE id = ?')
      .get(autorId) as AutorDB | undefined;
    
    if (!autor) {
      console.log('❌ Autor não encontrado, ID:', autorId);
      return NextResponse.json(
        { error: 'Autor não encontrado' },
        { status: 404 }
      );
    }
    
    console.log('✅ Autor encontrado:', autor);
    
    // 2. Contar quantos livros este autor tem
    const contagemStmt = db.prepare('SELECT COUNT(*) as total FROM livros WHERE autorId = ?');
    const contagem = contagemStmt.get(autorId) as { total: number };
    
    console.log(`📚 Autor tem ${contagem.total} livro(s)`);
    
    // 3. EXCLUIR LIVROS DO AUTOR primeiro (para evitar erro de chave estrangeira)
    if (contagem.total > 0) {
      console.log('🗑️  Excluindo livros do autor...');
      const deleteLivrosStmt = db.prepare('DELETE FROM livros WHERE autorId = ?');
      const livrosExcluidos = deleteLivrosStmt.run(autorId);
      console.log(`✅ ${livrosExcluidos.changes} livro(s) excluído(s)`);
    }
    
    // 4. Agora excluir o autor
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
    
    // 5. Retornar sucesso
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