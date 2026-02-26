/**
 * App.tsx — componente raiz.
 * Configura o roteamento com React Router e a navegação principal.
 */

import { BrowserRouter, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import PeoplePage       from './pages/PeoplePage';
import CategoriesPage   from './pages/CategoriesPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage      from './pages/ReportsPage';

const NAV_LINKS = [
  { to: '/pessoas',      label: '👥 Pessoas'     },
  { to: '/categorias',   label: '🏷️ Categorias'  },
  { to: '/transacoes',   label: '💸 Transações'  },
  { to: '/relatorios',   label: '📊 Relatórios'  },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

        {/* Cabeçalho */}
        <header style={{
          background: '#1e293b', color: '#f8fafc',
          padding: '0 2rem', display: 'flex', alignItems: 'center',
          gap: '2rem', height: 58,
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
             Controle de Gastos
          </span>
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to} to={link.to}
                style={({ isActive }) => ({
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  textDecoration: 'none',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 6,
                  background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {/*main */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
          <Routes>
            <Route path="/"            element={<Navigate to="/pessoas" replace />} />
            <Route path="/pessoas"     element={<PeoplePage />} />
            <Route path="/categorias"  element={<CategoriesPage />} />
            <Route path="/transacoes"  element={<TransactionsPage />} />
            <Route path="/relatorios"  element={<ReportsPage />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: 'center', padding: '0.8rem',
          color: '#94a3b8', fontSize: '0.8rem',
          borderTop: '1px solid #e2e8f0',
        }}>
          Controle de Gastos Residenciais — .NET 8 + React + TypeScript
        </footer>

      </div>
    </BrowserRouter>
  );
}
