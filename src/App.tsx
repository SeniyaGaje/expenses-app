import React, { useEffect } from 'react';
import './App.css';
import { ExpenseProvider, useExpenseContext } from './context/ExpenseContext';
import { useExpenses } from './hooks/useExpenses';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import SearchAndFilter from './components/SearchAndFilter';

const AppContent: React.FC = () => {
  const { fetchExpenses } = useExpenses();
  const { state } = useExpenseContext();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Personal Expense Tracker</h1>
      </header>
      
      <div className="app-content">
        <div className="sidebar">
          <ExpenseForm />
          <ExpenseSummary />
        </div>
        
        <div className="main-content">
          <SearchAndFilter onFilterChange={fetchExpenses} />
          {state.error && (
            <div className="error-message">
              {state.error}
            </div>
          )}
          <ExpenseList />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
};

export default App;