/**
 * CategoriesPage — criação e listagem de categorias.
 * A "finalidade" determina quais tipos de transação podem usar a categoria:
 *   1 = Despesa | 2 = Receita | 3 = Ambas
 */
import { useEffect, useState } from 'react';
import { CategoriesApi } from '../api';
import type { Category } from '../types';
import { Spinner, ErrorBox, SuccessBox, Table } from '../components/shared';
import { Trash2 } from 'lucide-react';

const PURPOSE_LABELS: Record<number, string> = {
  1: 'Despesa',
  2: 'Receita',
  3: 'Ambas',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  const [desc,    setDesc]    = useState('');
  const [purpose, setPurpose] = useState<string>('1');

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else         { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      setCategories(await CategoriesApi.getAll());
    } catch (e: unknown) {
      flash((e as Error).message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await CategoriesApi.create({ description: desc, purpose: Number(purpose) });
      setDesc(''); setPurpose('1');
      flash('Categoria criada com sucesso!');
      load();
    } catch (e: unknown) { flash((e as Error).message, true); }
  };

  //função de exclusão
  const handleDelete = async (id: number, description: string) => {
    if (!confirm(`Excluir a categoria "${description}"?`)) return;
    try {
      await CategoriesApi.remove(id);
      flash('Categoria excluída com sucesso!');
      load();
    } catch (e: unknown) { flash((e as Error).message, true); }
  };

  const columns = [
    { header: '#',          render: (c: Category) => categories.indexOf(c) + 1 },
    { header: 'Descrição',  render: (c: Category) => c.description },
    {
      header: 'Finalidade',
      render: (c: Category) => {
        const bg    = c.purpose === 1 ? '#fee2e2' : c.purpose === 2 ? '#dcfce7' : '#dbeafe';
        const color = c.purpose === 1 ? '#991b1b' : c.purpose === 2 ? '#166534' : '#1e40af';
        return (
          <span style={{ background: bg, color, borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>
            {PURPOSE_LABELS[c.purpose]}
          </span>
        );
      },
    },
    //coluna de ações
    {
      header: 'Ações',
      render: (c: Category) => (
        <button
        onClick={() => handleDelete(c.id, c.description)}
        style={deleteBtnStyle}
        title="Excluir categoria"
      >
        
        <Trash2 size={16} />
      </button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Categorias</h2>

      {error   && <ErrorBox message={error} />}
      {success && <SuccessBox message={success} />}

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input
          placeholder="Descrição" value={desc}
          onChange={e => setDesc(e.target.value)}
          style={inputStyle} maxLength={400} required
        />
        <select value={purpose} onChange={e => setPurpose(e.target.value)} style={inputStyle}>
          <option value="1">Despesa</option>
          <option value="2">Receita</option>
          <option value="3">Ambas</option>
        </select>
        <button type="submit" style={btnStyle}>Adicionar</button>
      </form>

      {loading ? <Spinner /> : (
        <Table columns={columns} rows={categories} keyFn={c => c.id} />
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem', borderRadius: 6,
  border: '1px solid #d1d5db', fontSize: '0.9rem', minWidth: 180,
};

const btnStyle: React.CSSProperties = {
  background: '#2563eb', color: '#fff', border: 'none',
  borderRadius: 6, padding: '0.45rem 0.9rem',
  cursor: 'pointer', fontSize: '0.85rem',
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'transparent', border: 'none',
  cursor: 'pointer', color: '#dc2626',
  padding: '0.2rem 0.4rem', borderRadius: 4,
  display: 'flex', alignItems: 'center',
};
