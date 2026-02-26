/**
 * TransactionsPage — criação e listagem de transações.
 *
 * Regras de negócio exibidas no formulário:
 *   1. Ao selecionar uma pessoa menor de 18 anos, o tipo é travado em "Despesa".
 *   2. O select de categorias filtra automaticamente conforme o tipo selecionado:
 *      - Tipo Despesa → mostra categorias com finalidade Despesa ou Ambas.
 *      - Tipo Receita → mostra categorias com finalidade Receita ou Ambas.
 *   3. O valor deve ser positivo.
 */

import { useEffect, useState } from 'react';
import { TransactionsApi, PeopleApi, CategoriesApi } from '../api';
import type { Transaction, Person, Category } from '../types';
import { Spinner, ErrorBox, SuccessBox, Table, formatCurrency } from '../components/shared';

const TYPE_LABELS: Record<number, string> = { 1: 'Despesa', 2: 'Receita' };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [people,       setPeople]       = useState<Person[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  // Campos do formulário
  const [desc,       setDesc]       = useState('');
  const [amount,     setAmount]     = useState('');
  const [txType,     setTxType]     = useState<string>('1');
  const [categoryId, setCategoryId] = useState<string>('');
  const [personId,   setPersonId]   = useState<string>('');

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else         { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [txs, ps, cats] = await Promise.all([
        TransactionsApi.getAll(),
        PeopleApi.getAll(),
        CategoriesApi.getAll(),
      ]);
      setTransactions(txs);
      setPeople(ps);
      setCategories(cats);
    } catch (e: unknown) {
      flash((e as Error).message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Verifica se a pessoa selecionada é menor de 18 anos
  const selectedPerson = people.find(p => p.id === Number(personId));
  const isMinor = selectedPerson ? selectedPerson.age < 18 : false;

  // Se menor de idade, força tipo Despesa
  const effectiveType = isMinor ? '1' : txType;

  // Filtra categorias compatíveis com o tipo selecionado
  // Regra: mostra categorias com finalidade = tipo ou finalidade = Ambas (3)
  const compatibleCategories = categories.filter(c =>
    c.purpose === 3 || c.purpose === Number(effectiveType)
  );

  // Reset categoryId se a categoria atual não for mais compatível
  const isCategoryValid = compatibleCategories.some(c => c.id === Number(categoryId));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCategoryValid) {
      flash('Selecione uma categoria compatível com o tipo de transação.', true);
      return;
    }
    try {
      await TransactionsApi.create({
        description: desc,
        amount: Number(amount),
        type: Number(effectiveType),
        categoryId: Number(categoryId),
        personId: Number(personId),
      });
      setDesc(''); setAmount(''); setCategoryId(''); setPersonId(''); setTxType('1');
      flash('Transação registrada com sucesso!');
      loadAll();
    } catch (e: unknown) { flash((e as Error).message, true); }
  };

  const columns = [
    { header: '#',         render: (t: Transaction) => transactions.indexOf(t) + 1 },
    { header: 'Descrição', render: (t: Transaction) => t.description },
    {
      header: 'Valor',
      render: (t: Transaction) => formatCurrency(t.amount),
      align: 'right' as const,
    },
    {
      header: 'Tipo',
      render: (t: Transaction) => {
        const isExpense = t.type === 1;
        return (
          <span style={{
            background: isExpense ? '#fee2e2' : '#dcfce7',
            color: isExpense ? '#991b1b' : '#166534',
            borderRadius: 4, padding: '2px 8px', fontWeight: 600,
          }}>
            {TYPE_LABELS[t.type]}
          </span>
        );
      },
    },
    { header: 'Categoria', render: (t: Transaction) => t.categoryDescription },
    { header: 'Pessoa',    render: (t: Transaction) => t.personName },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Transações</h2>

      {error   && <ErrorBox message={error} />}
      {success && <SuccessBox message={success} />}

      <form onSubmit={handleCreate} style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
        <input
          placeholder="Descrição" value={desc}
          onChange={e => setDesc(e.target.value)}
          style={inputStyle} maxLength={400} required
        />
        <input
          type="number" placeholder="Valor (R$)" value={amount}
          onChange={e => setAmount(e.target.value)}
          style={inputStyle} min="0.01" step="0.01" required
        />

        {/*dispara a regra de menor de idade */}
        <select value={personId} onChange={e => { setPersonId(e.target.value); setCategoryId(''); }} style={inputStyle} required>
          <option value="">Selecione a pessoa</option>
          {people.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.age} anos)
            </option>
          ))}
        </select>

        {/*travado em Despesa para menores de idade */}
        <select value={effectiveType} onChange={e => { if (!isMinor) { setTxType(e.target.value); setCategoryId(''); } }} style={inputStyle} disabled={isMinor}>
          <option value="1">Despesa</option>
          <option value="2">Receita</option>
        </select>

        {/* Aviso visual para menor de idade */}
        {isMinor && (
          <div style={{ gridColumn: '1 / -1', fontSize: '0.82rem', color: '#92400e', background: '#fef3c7', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
            ⚠️ Pessoa menor de 18 anos — apenas despesas são permitidas.
          </div>
        )}

        {/* Somente categorias compatíveis com o tipo escolhido */}
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle} required>
          <option value="">Selecione a categoria</option>
          {compatibleCategories.map(c => (
            <option key={c.id} value={c.id}>{c.description}</option>
          ))}
        </select>

        <button type="submit" style={{ ...btnStyle, gridColumn: '1 / -1', justifySelf: 'start' }}>
          Registrar Transação
        </button>
      </form>

      {loading ? <Spinner /> : (
        <Table columns={columns} rows={transactions} keyFn={t => t.id} />
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem', borderRadius: 6,
  border: '1px solid #d1d5db', fontSize: '0.9rem',
};

const btnStyle: React.CSSProperties = {
  background: '#2563eb', color: '#fff', border: 'none',
  borderRadius: 6, padding: '0.5rem 1.2rem',
  cursor: 'pointer', fontSize: '0.9rem',
};
