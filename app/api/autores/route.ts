import { NextResponse } from 'next/server';
import db from '@/lib/database';

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