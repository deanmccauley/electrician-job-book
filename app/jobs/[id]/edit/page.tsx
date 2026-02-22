import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import JobForm from '@/app/components/JobForm';

export default async function EditJobPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await the params
  const { id } = await params;
  
  console.log('📝 EditJobPage loading for ID:', id);
  
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/');
  }

  // Fetch the job to edit
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (jobError || !job) {
    console.log('⚠️ Job not found, redirecting to jobs list');
    redirect('/jobs');
  }

  // Format the job data for the form
  const initialData = {
    client_name: job.client_name,
    job_date: job.job_date,
    description: job.description,
    materials: job.materials || '',
    status: job.status,
    payment_status: job.payment_status,
    time_spent: job.time_spent?.toString() || '',
    location: job.location || '',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/jobs/${id}`} className="text-blue-600 hover:text-blue-800">
            ← Back to Job Details
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>
          <JobForm initialData={initialData} jobId={parseInt(id)} />
        </div>
      </div>
    </div>
  );
}