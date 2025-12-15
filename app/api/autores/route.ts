import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Listar todos os autores
export async function GET() {
  try {
    const { data: autores, error } = await supabase
      .from('autores')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    
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
    
    const { data: autorExistente, error: checkError } = await supabase
      .from('autores')
      .select('*')
      .eq('nome', nome)
      .eq('pais', pais)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (autorExistente) {
      return NextResponse.json(
        { error: 'Este autor já está cadastrado' },
        { status: 400 }
      );
    }
    
    const { data: novoAutor, error: insertError } = await supabase
      .from('autores')
      .insert([{ nome, pais }])
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    return NextResponse.json({
      ...novoAutor,
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
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'ID do autor é obrigatório e deve ser um número' },
        { status: 400 }
      );
    }
    
    const autorId = parseInt(id);
    
    const { data: autor, error: fetchError } = await supabase
      .from('autores')
      .select('*')
      .eq('id', autorId)
      .single();
    
    if (fetchError || !autor) {
      return NextResponse.json(
        { error: 'Autor não encontrado' },
        { status: 404 }
      );
    }
    
    // Excluir autor (os livros serão excluídos automaticamente)
    const { error: deleteError } = await supabase
      .from('autores')
      .delete()
      .eq('id', autorId);
    
    if (deleteError) throw deleteError;
    
    return NextResponse.json({
      success: true,
      message: `Autor "${autor.nome}" excluído com sucesso!`,
      autorExcluido: autor.nome
    });
    
  } catch (error) {
    console.error('Erro ao excluir autor:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir autor' },
      { status: 500 }
    );
  }
}