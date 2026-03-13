'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase';
import { PDFViewer } from '@react-pdf/renderer';
import JobReportPDF from './JobReportPDF';
import { X, Loader2, Eye, Download } from 'lucide-react';

interface ReportGeneratorProps {
  filters: {
    statuses: string[];
    payments: string[];
    month: string | null;
    dateFrom: string | null;
    dateTo: string | null;
  };
  onClose: () => void;
}

export default function ReportGenerator({ filters, onClose }: ReportGeneratorProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'download'>('preview');
  const supabase = createClient();

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError('Not authenticated');
        return;
      }

      let query = supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userData.user.id);

      // Apply status filters (multi-select)
      if (filters.statuses.length > 0) {
        query = query.in('status', filters.statuses);
      }

      // Apply payment filters (multi-select)
      if (filters.payments.length > 0) {
        query = query.in('payment_status', filters.payments);
      }

      // Apply date filters
      if (filters.month) {
        const [year, month] = filters.month.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0)
          .toISOString().split('T')[0];
        
        query = query
          .gte('job_date', startDate)
          .lte('job_date', endDate);
      } else if (filters.dateFrom && filters.dateTo) {
        query = query
          .gte('job_date', filters.dateFrom)
          .lte('job_date', filters.dateTo);
      }

      query = query.order('job_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalJobs = jobs.length;
  const totalRevenue = jobs.reduce((sum, job) => sum + (job.total_with_vat || ((job.labour_cost || 0) + (job.materials_cost || 0)) * (1 + (job.vat_rate || 13.5)/100) || 0), 0);
  const totalLabour = jobs.reduce((sum, job) => sum + (job.labour_cost || 0), 0);
  const totalMaterials = jobs.reduce((sum, job) => sum + (job.materials_cost || 0), 0);
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const unpaidCount = jobs.filter(j => j.payment_status === 'unpaid').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Job Report</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Summary Stats */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-4 p-2 sm:p-4 bg-gray-50 border-b">
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Total Jobs</p>
              <p className="text-base sm:text-2xl font-bold truncate">{totalJobs}</p>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Total Revenue</p>
              <p className="text-sm sm:text-2xl font-bold text-green-600 truncate">
                €{totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Labour</p>
              <p className="text-xs sm:text-lg font-semibold truncate">
                €{totalLabour.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Materials</p>
              <p className="text-xs sm:text-lg font-semibold truncate">
                €{totalMaterials.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-gray-500 truncate">Completed/Unpaid</p>
              <p className="text-sm sm:text-lg font-semibold truncate">
                {completedCount}/{unpaidCount}
              </p>
            </div>
          </div>
        )}

        {/* View Toggle */}
        {!loading && !error && jobs.length > 0 && (
          <div className="flex justify-center space-x-2 sm:space-x-4 p-2 bg-gray-100">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Preview</span>
              <span className="xs:hidden">View</span>
            </button>
            <button
              onClick={() => setViewMode('download')}
              className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base ${
                viewMode === 'download'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Download</span>
              <span className="xs:hidden">DL</span>
            </button>
          </div>
        )}

{/* Content - Simplified scrolling */}
<div className="flex-1 p-2 sm:p-4 bg-gray-100 overflow-hidden">
  {loading && (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )}

  {error && (
    <div className="h-full flex items-center justify-center text-red-600">
      Error: {error}
    </div>
  )}

  {!loading && !error && jobs.length === 0 && (
    <div className="h-full flex items-center justify-center text-gray-500">
      No jobs match the selected filters
    </div>
  )}

  {!loading && !error && jobs.length > 0 && viewMode === 'preview' && (
    <div className="h-full w-full">
      <PDFViewer 
        className="w-full h-full border-0 rounded-lg"
        showToolbar={true}
      >
        <JobReportPDF jobs={jobs} filters={filters} />
      </PDFViewer>
    </div>
  )}

  {!loading && !error && jobs.length > 0 && viewMode === 'download' && (
    <div className="h-full flex items-center justify-center">
      <p className="text-gray-500">Click download button above to save PDF</p>
    </div>
  )}
</div>
      </div>
    </div>
  );
}