/**
 * Camada de acesso à API do backend.
 * Centraliza todas as chamadas HTTP, facilitando manutenção e testes.
 * O Vite faz proxy de /api/* para http://localhost:5000 em desenvolvimento.
 */

import type {
  Person, Category, Transaction,
  PersonTotalsReport, CategoryTotalsReport,
} from '../types';

const BASE = '/api';

/** Wrapper genérico que lança um erro legível quando a resposta não é 2xx. */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    // Tenta extrair mensagem de erro do corpo JSON (campo "error")
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Erro ${res.status}: ${res.statusText}`);
  }

  // 204 No Content não tem corpo
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

//  Pessoas 

export const PeopleApi = {
  getAll: () => request<Person[]>('/people'),
  create: (data: { name: string; age: number }) =>
    request<Person>('/people', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; age: number }) =>
    request<Person>(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    request<void>(`/people/${id}`, { method: 'DELETE' }),
};

// Categorias 

export const CategoriesApi = {
  getAll: () => request<Category[]>('/categories'),
  create: (data: { description: string; purpose: number }) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// Transações 

export const TransactionsApi = {
  getAll: () => request<Transaction[]>('/transactions'),
  create: (data: {
    description: string;
    amount: number;
    type: number;
    categoryId: number;
    personId: number;
  }) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
};

// Relatórios

export const ReportsApi = {
  byPerson:   () => request<PersonTotalsReport>('/reports/by-person'),
  byCategory: () => request<CategoryTotalsReport>('/reports/by-category'),
};
