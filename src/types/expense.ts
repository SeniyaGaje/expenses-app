export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalCount: number;
  thisMonth: number;
  averageDaily: number;
  categorySummary: Record<string, number>;
  categories: number;
}

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Other"
] as const;