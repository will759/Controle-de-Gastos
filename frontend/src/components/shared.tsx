/** Componentes utilitários reutilizados em múltiplas páginas. */

import React from 'react';

//Spinner de carregamento 
export function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
      Carregando…
    </div>
  );
}

//Caixa de erro
export function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      background: '#fee2e2', border: '1px solid #fca5a5',
      borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', marginBottom: '1rem',
    }}>
      {message}
    </div>
  );
}

//Caixa de sucesso
export function SuccessBox({ message }: { message: string }) {
  return (
    <div style={{
      background: '#dcfce7', border: '1px solid #86efac',
      borderRadius: 8, padding: '0.75rem 1rem', color: '#166534', marginBottom: '1rem',
    }}>
      {message}
    </div>
  );
}

//Tabela
interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyFn: (row: T) => string | number;
  /** Linha adicional exibida ao final (ex.: totais gerais). */
  footer?: React.ReactNode;
}

export function Table<T>({ columns, rows, keyFn, footer }: TableProps<T>) {
  const thStyle: React.CSSProperties = {
    padding: '0.6rem 1rem', background: '#f1f5f9',
    borderBottom: '2px solid #e2e8f0', fontWeight: 600,
    whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '0.6rem 1rem', borderBottom: '1px solid #e2e8f0',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ ...thStyle, textAlign: col.align ?? 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={keyFn(row)}>
              {columns.map((col, i) => (
                <td key={i} style={{ ...tdStyle, textAlign: col.align ?? 'left' }}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ ...tdStyle, color: '#6b7280', textAlign: 'center' }}>
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}

// Moeda
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

//Badge de saldo positivo/negativo
export function BalanceBadge({ value }: { value: number }) {
  const color = value >= 0 ? '#166534' : '#991b1b';
  const bg    = value >= 0 ? '#dcfce7' : '#fee2e2';
  return (
    <span style={{ background: bg, color, borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>
      {formatCurrency(value)}
    </span>
  );
}
