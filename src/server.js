const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (in real app, this would be a database)
let expenses = [
  {
    id: "1",
    title: "Morning Coffee & Pastry",
    amount: 12.50,
    category: "Food & Dining",
    date: "2024-01-15",
    description: "Coffee and croissant at downtown cafe before work"
  },
  {
    id: "2", 
    title: "Uber to Airport",
    amount: 45.75,
    category: "Transportation",
    date: "2024-01-14",
    description: "Ride to airport for business trip"
  }
];

// Validation helper
const validateExpense = (expense) => {
  const errors = [];
  
  if (!expense.title || expense.title.trim().length === 0) {
    errors.push("Title is required");
  }
  
  if (!expense.amount || isNaN(expense.amount) || expense.amount <= 0) {
    errors.push("Amount must be a positive number");
  }
  
  if (!expense.category || expense.category.trim().length === 0) {
    errors.push("Category is required");
  }
  
  const validCategories = [
    "Food & Dining",
    "Transportation", 
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Travel",
    "Other"
  ];
  
  if (expense.category && !validCategories.includes(expense.category)) {
    errors.push("Invalid category");
  }
  
  if (!expense.date || isNaN(Date.parse(expense.date))) {
    errors.push("Valid date is required");
  }
  
  return errors;
};

// Filter helper
const filterExpenses = (expenses, query) => {
  let filtered = [...expenses];
  
  // Filter by category
  if (query.category) {
    filtered = filtered.filter(expense => 
      expense.category.toLowerCase() === query.category.toLowerCase()
    );
  }
  
  // Filter by search term (title or description)
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    filtered = filtered.filter(expense => 
      expense.title.toLowerCase().includes(searchTerm) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm))
    );
  }
  
  // Filter by date range
  if (query.startDate) {
    filtered = filtered.filter(expense => 
      new Date(expense.date) >= new Date(query.startDate)
    );
  }
  
  if (query.endDate) {
    filtered = filtered.filter(expense => 
      new Date(expense.date) <= new Date(query.endDate)
    );
  }
  
  // Sort expenses
  if (query.sortBy) {
    switch (query.sortBy) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  } else {
    // Default sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  
  return filtered;
};

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Tracker API is running!', 
    version: '1.0.0',
    endpoints: {
      'GET /expenses': 'Get all expenses with optional filters',
      'POST /expenses': 'Create a new expense',
      'GET /expenses/:id': 'Get expense by ID',
      'PUT /expenses/:id': 'Update expense by ID',
      'DELETE /expenses/:id': 'Delete expense by ID',
      'GET /expenses/summary': 'Get expense summary statistics'
    }
  });
});

// Get all expenses with filtering and sorting
app.get('/expenses', (req, res) => {
  try {
    const filteredExpenses = filterExpenses(expenses, req.query);
    
    res.json({
      success: true,
      data: filteredExpenses,
      total: filteredExpenses.length,
      filters: req.query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
});

// Get expense summary
app.get('/expenses/summary', (req, res) => {
  try {
    const filteredExpenses = filterExpenses(expenses, req.query);
    
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categorySummary = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = filteredExpenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    res.json({
      success: true,
      data: {
        totalExpenses: total,
        totalCount: filteredExpenses.length,
        thisMonth: thisMonth,
        averageDaily: filteredExpenses.length > 0 ? total / filteredExpenses.length : 0,
        categorySummary: categorySummary,
        categories: Object.keys(categorySummary).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating summary',
      error: error.message
    });
  }
});

// Get single expense by ID
app.get('/expenses/:id', (req, res) => {
  try {
    const expense = expenses.find(e => e.id === req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
});

// Create new expense
app.post('/expenses', (req, res) => {
  try {
    const expenseData = req.body;
    
    // Validate input
    const validationErrors = validateExpense(expenseData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Create new expense
    const newExpense = {
      id: randomUUID(),
      title: expenseData.title.trim(),
      amount: parseFloat(expenseData.amount),
      category: expenseData.category.trim(),
      date: expenseData.date,
      description: expenseData.description ? expenseData.description.trim() : ''
    };
    
    expenses.push(newExpense);
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: newExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
});

// Update expense by ID
app.put('/expenses/:id', (req, res) => {
  try {
    const expenseId = req.params.id;
    const updateData = req.body;
    
    // Find expense
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Validate input
    const validationErrors = validateExpense(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Update expense
    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      title: updateData.title.trim(),
      amount: parseFloat(updateData.amount),
      category: updateData.category.trim(),
      date: updateData.date,
      description: updateData.description ? updateData.description.trim() : ''
    };
    
    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expenses[expenseIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
});

// Delete expense by ID
app.delete('/expenses/:id', (req, res) => {
  try {
    const expenseId = req.params.id;
    
    // Find expense
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Remove expense
    const deletedExpense = expenses.splice(expenseIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Expense deleted successfully',
      data: deletedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 (Express 5 compatible)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker API Server running on http://localhost:${PORT}`);
  console.log(`📊 Sample data loaded: ${expenses.length} expenses`);
  console.log('\n📋 Available endpoints:');
  console.log(`   GET    http://localhost:${PORT}/expenses`);
  console.log(`   POST   http://localhost:${PORT}/expenses`);
  console.log(`   GET    http://localhost:${PORT}/expenses/:id`);
  console.log(`   PUT    http://localhost:${PORT}/expenses/:id`);
  console.log(`   DELETE http://localhost:${PORT}/expenses/:id`);
  console.log(`   GET    http://localhost:${PORT}/expenses/summary`);
  console.log('\n🔍 Query parameters for filtering:');
  console.log('   ?category=Food & Dining');
  console.log('   ?search=coffee');
  console.log('   ?startDate=2024-01-01&endDate=2024-01-31');
  console.log('   ?sortBy=amount-desc');
});

module.exports = app;