'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
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
        // Filter by specific month
        const [year, month] = filters.month.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0)
          .toISOString().split('T')[0];
        
        query = query
          .gte('job_date', startDate)
          .lte('job_date', endDate);
      } else if (filters.dateFrom && filters.dateTo) {
        // Filter by custom range
        query = query
          .gte('job_date', filters.dateFrom)
          .lte('job_date', filters.dateTo);
      }

      // Order by date
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

  // Calculate summary statistics
  const totalJobs = jobs.length;
  const totalRevenue = jobs.reduce((sum, job) => sum + (job.total_cost || 0), 0);
  const totalLabour = jobs.reduce((sum, job) => sum + (job.labour_cost || 0), 0);
  const totalMaterials = jobs.reduce((sum, job) => sum + (job.materials_cost || 0), 0);
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const unpaidCount = jobs.filter(j => j.payment_status === 'unpaid').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Job Report</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Stats */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold">{totalJobs}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">£{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Labour</p>
              <p className="text-lg font-semibold">£{totalLabour.toFixed(2)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Materials</p>
              <p className="text-lg font-semibold">£{totalMaterials.toFixed(2)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Completed/Unpaid</p>
              <p className="text-lg font-semibold">{completedCount}/{unpaidCount}</p>
            </div>
          </div>
        )}

        {/* View Toggle */}
        {!loading && !error && jobs.length > 0 && (
          <div className="flex justify-center space-x-4 p-2 bg-gray-100">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center px-4 py-2 rounded-md ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <PDFDownloadLink
              document={<JobReportPDF jobs={jobs} filters={filters} />}
              fileName={`job-report-${new Date().toISOString().split('T')[0]}.pdf`}
              className={`flex items-center px-4 py-2 rounded-md ${
                viewMode === 'download'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('download')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </PDFDownloadLink>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
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
            <PDFViewer className="w-full h-full border-0">
              <JobReportPDF jobs={jobs} filters={filters} />
            </PDFViewer>
          )}
        </div>
      </div>
    </div>
  );
}