import { Expense, ExpenseSummary } from '../types/expense';

const API_BASE_URL = 'http://localhost:4001';

export const expenseAPI = {
  // Get all expenses with optional filters
  getExpenses: async (filters?: {
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
  }): Promise<Expense[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);

    const response = await fetch(`${API_BASE_URL}/expenses?${queryParams}`);
    const data = await response.json();
    
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Get expense summary
  getSummary: async (filters?: {
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseSummary> => {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const response = await fetch(`${API_BASE_URL}/expenses/summary?${queryParams}`);
    const data = await response.json();
    
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Create new expense
  createExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Update expense
  updateExpense: async (id: string, expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
  },
};