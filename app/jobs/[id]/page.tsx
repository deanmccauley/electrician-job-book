import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import JobDetails from '@/app/components/JobDetails';

export default async function JobPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await the params
  const { id } = await params;
  
  console.log('📋 JobPage loading for ID:', id);
  
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log('👤 JobPage user:', user?.email || 'No user', 'Error:', userError?.message || 'None');

  if (userError || !user) {
    console.log('⚠️ No user in JobPage, redirecting to home');
    redirect('/');
  }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  console.log('📊 Job query result:', job ? 'Found' : 'Not found', 'Error:', jobError?.message || 'None');

  if (jobError || !job) {
    console.log('⚠️ Job not found, redirecting to jobs list');
    redirect('/jobs');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800">
            ← Back to Jobs
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <JobDetails job={job} />
        </div>
      </div>
    </div>
  );
}