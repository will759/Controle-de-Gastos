/**
 * ReportsPage — exibe dois relatórios:
 *   1. Totais por pessoa (receitas, despesas, saldo) + total geral.
 *   2. Totais por categoria (receitas, despesas, saldo) + total geral.
 */

import { useEffect, useState } from 'react';
import { ReportsApi } from '../api';
import type { PersonTotalsReport, CategoryTotalsReport } from '../types';
import { Spinner, ErrorBox, formatCurrency, BalanceBadge } from '../components/shared';

export default function ReportsPage() {
  const [personReport,   setPersonReport]   = useState<PersonTotalsReport | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryTotalsReport | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [pr, cr] = await Promise.all([
          ReportsApi.byPerson(),
          ReportsApi.byCategory(),
        ]);
        setPersonReport(pr);
        setCategoryReport(cr);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <ErrorBox message={error} />;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Relatórios</h2>

      {/* ── Totais por Pessoa ──────────────────────────────────────── */}
      <Section title="Totais por Pessoa">
        <ReportTable
          headers={['Pessoa', 'Receitas', 'Despesas', 'Saldo']}
          rows={personReport!.items.map(i => [
            i.personName,
            formatCurrency(i.totalIncome),
            formatCurrency(i.totalExpense),
            <BalanceBadge value={i.balance} />,
          ])}
          global={personReport!.global}
        />
      </Section>

      {/* ── Totais por Categoria ───────────────────────────────────── */}
      <Section title="Totais por Categoria">
        <ReportTable
          headers={['Categoria', 'Receitas', 'Despesas', 'Saldo']}
          rows={categoryReport!.items.map(i => [
            i.categoryDescription,
            formatCurrency(i.totalIncome),
            formatCurrency(i.totalExpense),
            <BalanceBadge value={i.balance} />,
          ])}
          global={categoryReport!.global}
        />
      </Section>
    </div>
  );
}

// ── Componentes auxiliares da página ─────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h3 style={{
        fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: 1, color: '#475569', marginBottom: '0.75rem',
        borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/** Tabela de relatório com linha de totais gerais no rodapé. */
function ReportTable({
  headers, rows, global,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  global: { totalIncome: number; totalExpense: number; balance: number };
}) {
  const thStyle: React.CSSProperties = {
    padding: '0.6rem 1rem', background: '#f1f5f9',
    borderBottom: '2px solid #e2e8f0', fontWeight: 600, textAlign: 'right',
  };
  const tdStyle: React.CSSProperties = {
    padding: '0.6rem 1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right',
  };
  const tfStyle: React.CSSProperties = {
    padding: '0.6rem 1rem', borderTop: '2px solid #334155',
    background: '#1e293b', color: '#f8fafc', fontWeight: 700, textAlign: 'right',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ ...thStyle, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ ...tdStyle, textAlign: 'center', color: '#6b7280' }}>
                Sem dados.
              </td>
            </tr>
          ) : rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ ...tdStyle, textAlign: ci === 0 ? 'left' : 'right' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* Linha de totais gerais */}
        <tfoot>
          <tr>
            <td style={{ ...tfStyle, textAlign: 'left' }}>TOTAL GERAL</td>
            <td style={tfStyle}>{formatCurrency(global.totalIncome)}</td>
            <td style={tfStyle}>{formatCurrency(global.totalExpense)}</td>
            <td style={tfStyle}>
              <span style={{ color: global.balance >= 0 ? '#86efac' : '#fca5a5' }}>
                {formatCurrency(global.balance)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
