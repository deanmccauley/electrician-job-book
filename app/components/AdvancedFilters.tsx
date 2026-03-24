'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Calendar, Download } from 'lucide-react';
import ReportGenerator from './ReportGenerator';

export default function AdvancedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  
  const [showFilters, setShowFilters] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // Search term state
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get('search') || '';
  });
  
  // Multi-select states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
    const statusParam = searchParams.get('status');
    return statusParam ? statusParam.split(',') : [];
  });
  
  const [selectedPayments, setSelectedPayments] = useState<string[]>(() => {
    const paymentParam = searchParams.get('payment');
    return paymentParam ? paymentParam.split(',') : [];
  });
  
  // Date filter states
  const [dateFilterType, setDateFilterType] = useState<'all' | 'month' | 'range'>(
    searchParams.get('month') ? 'month' : 
    (searchParams.get('from') || searchParams.get('to')) ? 'range' : 'all'
  );
  
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get('month') || new Date().toISOString().slice(0, 7)
  );
  
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');

  // Status options
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'yellow' },
    { value: 'in_progress', label: 'In Progress', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' }
  ];

  // Payment options
  const paymentOptions = [
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'unpaid', label: 'Unpaid', color: 'red' },
    { value: 'partial', label: 'Partial', color: 'orange' }
  ];

  // Apply filters when they change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (selectedStatuses.length > 0) {
      params.set('status', selectedStatuses.join(','));
    }
    
    if (selectedPayments.length > 0) {
      params.set('payment', selectedPayments.join(','));
    }
    
    if (dateFilterType === 'month' && selectedMonth) {
      params.set('month', selectedMonth);
    } else if (dateFilterType === 'range') {
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
    }
    
    const queryString = params.toString();
    router.push(queryString ? `/jobs?${queryString}` : '/jobs');
  }, [searchTerm, selectedStatuses, selectedPayments, dateFilterType, selectedMonth, dateFrom, dateTo, router]);

  const toggleStatus = (value: string) => {
    setSelectedStatuses(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const togglePayment = (value: string) => {
    setSelectedPayments(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setSelectedPayments([]);
    setDateFilterType('all');
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setDateFrom('');
    setDateTo('');
    router.push('/jobs');
  };

  const hasActiveFilters = searchTerm !== '' || 
                          selectedStatuses.length > 0 || 
                          selectedPayments.length > 0 || 
                          dateFilterType !== 'all';

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        {/* Filter Toggle and Report Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 border rounded-md ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(searchTerm ? 1 : 0) + selectedStatuses.length + selectedPayments.length + (dateFilterType !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Generate Report Button */}
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 space-y-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Clients</label>
              <input
                type="text"
                placeholder="Search by client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex space-x-4 mb-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={dateFilterType === 'all'}
                    onChange={() => setDateFilterType('all')}
                    className="mr-2"
                  />
                  All Jobs
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="month"
                    checked={dateFilterType === 'month'}
                    onChange={() => setDateFilterType('month')}
                    className="mr-2"
                  />
                  Month
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="range"
                    checked={dateFilterType === 'range'}
                    onChange={() => setDateFilterType('range')}
                    className="mr-2"
                  />
                  Custom Range
                </label>
              </div>

              {dateFilterType === 'month' ? (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : dateFilterType === 'range' ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : null}
            </div>

            {/* Status Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Status</label>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(option.value)}
                      onChange={() => toggleStatus(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${option.color}-100 text-${option.color}-800`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Status Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <div className="space-y-2">
                {paymentOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(option.value)}
                      onChange={() => togglePayment(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${option.color}-100 text-${option.color}-800`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Generator Modal */}
      {showReport && (
        <ReportGenerator
          filters={{
            statuses: selectedStatuses,
            payments: selectedPayments,
            month: dateFilterType === 'month' ? selectedMonth : null,
            dateFrom: dateFilterType === 'range' ? dateFrom : null,
            dateTo: dateFilterType === 'range' ? dateTo : null,
          }}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}