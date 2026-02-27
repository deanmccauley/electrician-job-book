import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import JobCard from '@/app/components/JobCard';
import ExportButton from '@/app/components/ExportButton';
import AdvancedFilters from '@/app/components/AdvancedFilters';
import { Plus } from 'lucide-react';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    view?: string; 
    filter?: string;
    search?: string;
    status?: string;
    payment?: string;
    month?: string;
    from?: string;
    to?: string;
  }>;
}) {
  // Await the searchParams
  const params = await searchParams;
  
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/');
  }

  // Build query with filters
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id);

  // Handle multi-select status filters
  if (params.status) {
    const statuses = params.status.split(',');
    query = query.in('status', statuses);
  }

  // Handle multi-select payment filters
  if (params.payment) {
    const payments = params.payment.split(',');
    query = query.in('payment_status', payments);
  }

  // Handle month filter
  if (params.month) {
    const [year, month] = params.month.split('-');
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0)
      .toISOString().split('T')[0];
    
    query = query
      .gte('job_date', startDate)
      .lte('job_date', endDate);
  }

  // Handle custom date range
  if (params.from && params.to) {
    query = query
      .gte('job_date', params.from)
      .lte('job_date', params.to);
  }

  // Apply search
  if (params.search) {
    query = query.ilike('client_name', `%${params.search}%`);
  }

  // Apply date filter (legacy)
  if (params.filter === 'today') {
    const today = new Date().toISOString().split('T')[0];
    query = query.eq('job_date', today);
  } else if (params.filter === 'week') {
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);
    query = query
      .gte('job_date', today.toISOString().split('T')[0])
      .lte('job_date', weekLater.toISOString().split('T')[0]);
  }

  // Order by date
  query = query.order('job_date', { ascending: false });

  const { data: jobs } = await query;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <div className="flex space-x-3">
            <Link
              href="/jobs/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Link>
            {jobs && jobs.length > 0 && <ExportButton jobs={jobs} />}
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters />

        {/* Jobs Display */}
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No jobs found</p>
            <Link
              href="/jobs/new"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800"
            >
              Add your first job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}