import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Listar todos os livros
export async function GET() {
  try {
    const { data: livros, error } = await supabase
      .from('livros')
      .select('*')
      .order('titulo');
    
    if (error) throw error;
    
    const livrosComAutores = await Promise.all(
      livros.map(async (livro) => {
        const { data: autor } = await supabase
          .from('autores')
          .select('*')
          .eq('id', livro.autor_id)
          .single();
        
        return {
          id: livro.id,
          titulo: livro.titulo,
          ano: livro.ano,
          autorId: livro.autor_id,
          autorNome: autor?.nome || 'Desconhecido',
          autorPais: autor?.pais || 'Desconhecido'
        };
      })
    );
    
    return NextResponse.json(livrosComAutores);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar livros' },
      { status: 500 }
    );
  }
}

// Criar novo livro
export async function POST(request: Request) {
  try {
    const { titulo, ano, autorId } = await request.json();
    
    if (!titulo || !ano || !autorId) {
      return NextResponse.json(
        { error: 'Título, ano e autor são obrigatórios' },
        { status: 400 }
      );
    }
    
    const { data: novoLivro, error } = await supabase
      .from('livros')
      .insert([{ 
        titulo, 
        ano: parseInt(ano), 
        autor_id: parseInt(autorId) 
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    const { data: autor } = await supabase
      .from('autores')
      .select('*')
      .eq('id', parseInt(autorId))
      .single();
    
    return NextResponse.json({
      id: novoLivro.id,
      titulo: novoLivro.titulo,
      ano: novoLivro.ano,
      autorId: novoLivro.autor_id,
      autorNome: autor?.nome || 'Desconhecido',
      autorPais: autor?.pais || 'Desconhecido'
    });
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar livro' },
      { status: 500 }
    );
  }
}

// Excluir livro
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