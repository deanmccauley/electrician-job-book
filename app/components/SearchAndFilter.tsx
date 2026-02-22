'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';

export default function SearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [payment, setPayment] = useState(searchParams.get('payment') || 'all');
  const [dateFilter, setDateFilter] = useState(searchParams.get('filter') || 'all');
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    if (payment && payment !== 'all') params.set('payment', payment);
    if (dateFilter && dateFilter !== 'all') params.set('filter', dateFilter);
    
    router.push(`/jobs?${params.toString()}`);
  }, [search, status, payment, dateFilter, router]);

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setPayment('all');
    setDateFilter('all');
    router.push('/jobs');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 border rounded-md ${
            showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters (expandable) */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      )}

      {/* Active filters indicator */}
      {(search || status !== 'all' || payment !== 'all' || dateFilter !== 'all') && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Search: {search}
              </span>
            )}
            {status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Status: {status.replace('_', ' ')}
              </span>
            )}
            {payment !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Payment: {payment}
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Date: {dateFilter}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}