/**
 * PeoplePage — gerencia o cadastro de pessoas.
 * Operações disponíveis: criar, editar (inline), excluir e listar.
 * Ao excluir, o backend apaga em cascata todas as transações da pessoa.
 */

import { useEffect, useState } from 'react';
import { PeopleApi } from '../api';
import type { Person } from '../types';
import { Spinner, ErrorBox, SuccessBox, Table } from '../components/shared';
import { Trash2, Pencil } from 'lucide-react';

export default function PeoplePage() {
  const [people,   setPeople]   = useState<Person[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const [newName, setNewName] = useState('');
  const [newAge,  setNewAge]  = useState('');

  const [editId,   setEditId]   = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge,  setEditAge]  = useState('');

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else         { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      setPeople(await PeopleApi.getAll());
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
      await PeopleApi.create({ name: newName, age: Number(newAge) });
      setNewName(''); setNewAge('');
      flash('Pessoa cadastrada com sucesso!');
      load();
    } catch (e: unknown) { flash((e as Error).message, true); }
  };

  const startEdit = (p: Person) => {
    setEditId(p.id); setEditName(p.name); setEditAge(String(p.age));
  };

  const handleUpdate = async (id: number) => {
    try {
      await PeopleApi.update(id, { name: editName, age: Number(editAge) });
      setEditId(null);
      flash('Pessoa atualizada!');
      load();
    } catch (e: unknown) { flash((e as Error).message, true); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Excluir "${name}" e todas as suas transações?`)) return;
    try {
      await PeopleApi.remove(id);
      flash(`"${name}" excluída junto com suas transações.`);
      load();
    } catch (e: unknown) { flash((e as Error).message, true); }
  };

  const columns = [
    { header: '#', render: (p: Person) => people.indexOf(p) + 1 },
    {
      header: 'Nome',
      render: (p: Person) =>
        editId === p.id
          ? <input value={editName} onChange={e => setEditName(e.target.value)}
              style={inputStyle} maxLength={200} />
          : p.name,
    },
    {
      header: 'Idade',
      render: (p: Person) =>
        editId === p.id
          ? <input type="number" value={editAge} onChange={e => setEditAge(e.target.value)}
              style={{ ...inputStyle, width: 70 }} min={0} />
          : p.age,
    },
    {
      header: 'Ações',
      render: (p: Person) =>
        editId === p.id
          ? <>
              <Btn onClick={() => handleUpdate(p.id)} color="#2563eb">Salvar</Btn>
              <Btn onClick={() => setEditId(null)} color="#6b7280">Cancelar</Btn>
            </>
          : <>
              <button onClick={() => startEdit(p)} style={iconBtnStyle('#059669')} title="Editar">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(p.id, p.name)} style={iconBtnStyle('#dc2626')} title="Excluir">
                <Trash2 size={16} />
              </button>
            </>,
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Pessoas</h2>

      {error   && <ErrorBox message={error} />}
      {success && <SuccessBox message={success} />}

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input
          placeholder="Nome" value={newName}
          onChange={e => setNewName(e.target.value)}
          style={inputStyle} maxLength={200} required
        />
        <input
          type="number" placeholder="Idade" value={newAge}
          onChange={e => setNewAge(e.target.value)}
          style={{ ...inputStyle, width: 100 }} min={0} required
        />
        <button type="submit" style={btnStyle('#2563eb')}>Adicionar</button>
      </form>

      {loading ? <Spinner /> : (
        <Table columns={columns} rows={people} keyFn={p => p.id} />
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem', borderRadius: 6,
  border: '1px solid #d1d5db', fontSize: '0.9rem', minWidth: 180,
};

const btnStyle = (color: string): React.CSSProperties => ({
  background: color, color: '#fff', border: 'none',
  borderRadius: 6, padding: '0.45rem 0.9rem',
  cursor: 'pointer', fontSize: '0.85rem',
});

const iconBtnStyle = (color: string): React.CSSProperties => ({
  background: 'transparent', border: 'none',
  cursor: 'pointer', color,
  padding: '0.2rem 0.4rem', borderRadius: 4,
  display: 'inline-flex', alignItems: 'center',
  marginRight: 4,
});

function Btn({ onClick, color, children }: {
  onClick: () => void; color: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{ ...btnStyle(color), marginRight: 4 }}>{children}</button>
  );
}