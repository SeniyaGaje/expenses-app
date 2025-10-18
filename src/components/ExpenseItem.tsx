import React, { useState } from 'react';
import { Expense, EXPENSE_CATEGORIES } from '../types/expense';
import { useExpenses } from '../hooks/useExpenses';
import './ExpenseItem.css';

interface ExpenseItemProps {
  expense: Expense;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const { updateExpense, deleteExpense, loading } = useExpenses();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: expense.title,
    amount: expense.amount.toString(),
    category: expense.category,
    date: expense.date,
    description: expense.description || ''
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateExpense(expense.id, {
        title: editData.title,
        amount: parseFloat(editData.amount),
        category: editData.category,
        date: editData.date,
        description: editData.description
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expense.id);
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isEditing) {
    return (
      <div className="expense-item editing">
        <form onSubmit={handleEdit} className="edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            className="edit-input"
            required
          />
          <input
            type="number"
            value={editData.amount}
            onChange={(e) => setEditData({...editData, amount: e.target.value})}
            step="0.01"
            min="0"
            className="edit-input"
            required
          />
          <select
            value={editData.category}
            onChange={(e) => setEditData({...editData, category: e.target.value})}
            className="edit-input"
            required
          >
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="date"
            value={editData.date}
            onChange={(e) => setEditData({...editData, date: e.target.value})}
            className="edit-input"
            required
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({...editData, description: e.target.value})}
            className="edit-input"
            rows={2}
          />
          <div className="edit-actions">
            <button type="submit" disabled={loading}>Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="expense-item">
      <div className="expense-main">
        <div className="expense-title">{expense.title}</div>
        <div className="expense-amount">Rs {expense.amount.toFixed(2)}</div>
      </div>
      
      <div className="expense-details">
        <span className="expense-category">({expense.category})</span>
        <span className="expense-date">{formatDate(expense.date)}</span>
      </div>
      
      {expense.description && (
        <div className="expense-description">{expense.description}</div>
      )}
      
      <div className="expense-actions">
        <button 
          onClick={() => setIsEditing(true)} 
          disabled={loading}
          className="edit-btn"
        >
          Edit
        </button>
        <button 
          onClick={handleDelete} 
          disabled={loading}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;