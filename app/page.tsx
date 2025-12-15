'use client';

import { useState, useEffect } from 'react';

interface Autor {
  id: number;
  nome: string;
  pais: string;
}

interface Livro {
  id: number;
  titulo: string;
  ano: number;
  autorId: number;
  autorNome: string;
  autorPais: string;
}

export default function Home() {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [novoAutor, setNovoAutor] = useState({ nome: '', pais: '' });
  const [novoLivro, setNovoLivro] = useState({ titulo: '', ano: '', autorId: '' });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [autoresRes, livrosRes] = await Promise.all([
        fetch('/api/autores'),
        fetch('/api/livros')
      ]);
      
      const autoresData = await autoresRes.json();
      const livrosData = await livrosRes.json();
      
      setAutores(autoresData);
      setLivros(livrosData);
    } catch (error) {
      setErro('Erro ao carregar dados');
    }
  };

  const adicionarAutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    
    try {
      const response = await fetch('/api/autores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAutor)
      });
      
      if (response.ok) {
        setMensagem('Autor adicionado com sucesso!');
        setNovoAutor({ nome: '', pais: '' });
        carregarDados();
      } else {
        const error = await response.json();
        setErro(error.error || 'Erro ao adicionar autor');
      }
    } catch (error) {
      setErro('Erro de conexão');
    }
  };

  const adicionarLivro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    
    try {
      const response = await fetch('/api/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoLivro)
      });
      
      if (response.ok) {
        setMensagem('Livro adicionado com sucesso!');
        setNovoLivro({ titulo: '', ano: '', autorId: '' });
        carregarDados();
      } else {
        const error = await response.json();
        setErro(error.error || 'Erro ao adicionar livro');
      }
    } catch (error) {
      setErro('Erro de conexão');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>📚 Biblioteca Pessoal</h1>
        <p>Sistema simples com Next.js e SQLite</p>
      </header>

      {mensagem && <div className="success">{mensagem}</div>}
      {erro && <div className="error">{erro}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Formulário Autor */}
        <section className="section">
          <h2>➕ Adicionar Autor</h2>
          <form onSubmit={adicionarAutor}>
            <div className="form-group">
              <label>Nome do Autor:</label>
              <input
                type="text"
                value={novoAutor.nome}
                onChange={(e) => setNovoAutor({...novoAutor, nome: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>País:</label>
              <input
                type="text"
                value={novoAutor.pais}
                onChange={(e) => setNovoAutor({...novoAutor, pais: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="button button-success">
              Adicionar Autor
            </button>
          </form>
        </section>

        {/* Formulário Livro */}
        <section className="section">
          <h2>📖 Adicionar Livro</h2>
          <form onSubmit={adicionarLivro}>
            <div className="form-group">
              <label>Título do Livro:</label>
              <input
                type="text"
                value={novoLivro.titulo}
                onChange={(e) => setNovoLivro({...novoLivro, titulo: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Ano de Publicação:</label>
              <input
                type="number"
                value={novoLivro.ano}
                onChange={(e) => setNovoLivro({...novoLivro, ano: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Autor:</label>
              <select
                value={novoLivro.autorId}
                onChange={(e) => setNovoLivro({...novoLivro, autorId: e.target.value})}
                required
              >
                <option value="">Selecione um autor</option>
                {autores.map((autor) => (
                  <option key={autor.id} value={autor.id}>
                    {autor.nome}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="button">
              Adicionar Livro
            </button>
          </form>
        </section>
      </div>

      {/* Lista de Livros */}
      <section className="section">
        <h2>📚 Livros Cadastrados ({livros.length})</h2>
        <div className="data-grid">
          {livros.map((livro) => (
            <div key={livro.id} className="data-card">
              <h3>{livro.titulo}</h3>
              <p><strong>Autor:</strong> {livro.autorNome}</p>
              <p><strong>Ano:</strong> {livro.ano}</p>
              <p><strong>País do Autor:</strong> {livro.autorPais}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lista de Autores */}
      <section className="section">
        <h2>✍️ Autores Cadastrados ({autores.length})</h2>
        <div className="data-grid">
          {autores.map((autor) => (
            <div key={autor.id} className="data-card">
              <h3>{autor.nome}</h3>
              <p><strong>País:</strong> {autor.pais}</p>
              <p><strong>Livros:</strong> {livros.filter(l => l.autorId === autor.id).length}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}