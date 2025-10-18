import React from 'react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseItem from './ExpenseItem';
import './ExpenseList.css';

const ExpenseList: React.FC = () => {
  const { expenses, loading } = useExpenses();

  if (loading && expenses.length === 0) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expense-list-container">
      <h2>Your Expenses</h2>
      <div className="expense-count">
        Showing {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
      </div>
      
      <div className="expense-list">
        {expenses.length === 0 ? (
          <div className="no-expenses">No expenses found. Add your first expense!</div>
        ) : (
          expenses.map(expense => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;