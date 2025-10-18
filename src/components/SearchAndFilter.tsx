import React, { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../types/expense';
import './SearchAndFilter.css';

interface SearchAndFilterProps {
  onFilterChange: (filters: any) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'date-desc'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      startDate: '',
      endDate: '',
      sortBy: 'date-desc'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="search-filter-container">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search expenses..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="date-input"
          placeholder="Start Date"
        />
        <span className="date-separator">to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="date-input"
          placeholder="End Date"
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="filter-select"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Amount (High to Low)</option>
          <option value="amount-asc">Amount (Low to High)</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>

      <button onClick={clearFilters} className="clear-filters-btn">
        Clear Filters
      </button>
    </div>
  );
};

export default SearchAndFilter;