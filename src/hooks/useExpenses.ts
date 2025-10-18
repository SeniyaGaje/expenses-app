import { useCallback, useState } from 'react';
import { Expense } from '../types/expense';
import { expenseAPI } from '../services/api';
import { useExpenseContext } from '../context/ExpenseContext';

export const useExpenses = () => {
  const { state, dispatch } = useExpenseContext();
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async (filters?: any) => {
    setLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const expenses = await expenseAPI.getExpenses(filters);
      dispatch({ type: 'SET_EXPENSES', payload: expenses });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      setLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    setLoading(true);
    try {
      const newExpense = await expenseAPI.createExpense(expenseData);
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      return newExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id: string, expenseData: Omit<Expense, 'id'>) => {
    setLoading(true);
    try {
      const updatedExpense = await expenseAPI.updateExpense(id, expenseData);
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
      return updatedExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setLoading(true);
    try {
      await expenseAPI.deleteExpense(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    expenses: state.expenses,
    loading: state.loading || loading,
    error: state.error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};