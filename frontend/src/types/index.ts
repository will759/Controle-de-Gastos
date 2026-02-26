// Espelho dos DTOs do backend — mantém consistência de tipos entre front e back.

export interface Person {
  id: number;
  name: string;
  age: number;
}

/** purpose: 1=Despesa | 2=Receita | 3=Ambas */
export interface Category {
  id: number;
  description: string;
  purpose: 1 | 2 | 3;
}

/** type: 1=Despesa | 2=Receita */
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 1 | 2;
  categoryId: number;
  categoryDescription: string;
  personId: number;
  personName: string;
}

export interface PersonTotals {
  personId: number;
  personName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryTotals {
  categoryId: number;
  categoryDescription: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface GlobalTotals {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface PersonTotalsReport {
  items: PersonTotals[];
  global: GlobalTotals;
}

export interface CategoryTotalsReport {
  items: CategoryTotals[];
  global: GlobalTotals;
}
