import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Listar todos os livros com informações do autor
export async function GET() {
  try {
    const { data: livros, error } = await supabase
      .from('livros')
      .select(`
        *,
        autores:nome,
        autores:pais
      `)
      .order('titulo');
    
    // Formatar dados para manter compatibilidade com frontend
    const livrosFormatados = livros?.map(livro => ({
      id: livro.id,
      titulo: livro.titulo,
      ano: livro.ano,
      autorId: livro.autor_id,
      autorNome: livro.autores?.nome,
      autorPais: livro.autores?.pais
    })) || [];
    
    return NextResponse.json(livrosFormatados);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
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
    
    // Inserir novo livro
    const { data: novoLivro, error } = await supabase
      .from('livros')
      .insert([{ 
        titulo, 
        ano: parseInt(ano), 
        autor_id: parseInt(autorId) 
      }])
      .select(`
        *,
        autores:nome,
        autores:pais
      `)
      .single();
    
    if (error) throw error;
    
    // Formatar resposta
    const livroFormatado = {
      id: novoLivro.id,
      titulo: novoLivro.titulo,
      ano: novoLivro.ano,
      autorId: novoLivro.autor_id,
      autorNome: novoLivro.autores?.nome,
      autorPais: novoLivro.autores?.pais
    };
    
    return NextResponse.json(livroFormatado);
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar livro' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir livro
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'ID do livro é obrigatório e deve ser um número' },
        { status: 400 }
      );
    }
    
    const livroId = parseInt(id);
    
    // Excluir livro
    const { error } = await supabase
      .from('livros')
      .delete()
      .eq('id', livroId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Livro excluído com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro ao excluir livro:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir livro' },
      { status: 500 }
    );
  }
}