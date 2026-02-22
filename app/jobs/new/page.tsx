import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { redirect } from 'next/navigation';
import JobForm from '@/app/components/JobForm';

export default async function NewJobPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Job</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <JobForm />
        </div>
      </div>
    </div>
  );
}