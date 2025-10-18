import React, { useEffect, useState } from 'react';
import { ExpenseSummary as SummaryType } from '../types/expense';
import { expenseAPI } from '../services/api';
import './ExpenseSummary.css';

const ExpenseSummary: React.FC = () => {
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summaryData = await expenseAPI.getSummary();
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="expense-summary loading">Loading summary...</div>;
  }

  if (!summary) {
    return <div className="expense-summary">Error loading summary</div>;
  }

  return (
    <div className="expense-summary">
      <h2>Expense Summary</h2>
      
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Total Expenses</div>
          <div className="summary-value">Rs {summary.totalExpenses.toFixed(2)}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">This Month</div>
          <div className="summary-value">Rs {summary.thisMonth.toFixed(2)}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Average Daily</div>
          <div className="summary-value">Rs {summary.averageDaily.toFixed(2)}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Categories</div>
          <div className="summary-value">{summary.categories}</div>
        </div>
      </div>

      {Object.keys(summary.categorySummary).length > 0 && (
        <div className="category-breakdown">
          <h3>Spending by Category</h3>
          {Object.entries(summary.categorySummary).map(([category, amount]) => (
            <div key={category} className="category-item">
              <span className="category-name">{category}</span>
              <span className="category-amount">Rs {amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;