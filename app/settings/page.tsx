import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { redirect } from 'next/navigation';
import BusinessSettingsForm from '@/app/components/BusinessSettingsForm';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch user metadata
  const { data: metadata } = await supabase
    .from('users')
    .select('business_name, business_address, business_phone, business_vat, business_logo_url, invoice_legal_text')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Business Settings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <BusinessSettingsForm initialData={metadata} />
        </div>
      </div>
    </div>
  );
}