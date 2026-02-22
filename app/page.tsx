import { createServerSupabaseClient } from '@/app/utils/supabase-server';
import { redirect } from 'next/navigation';
import LoginForm from '@/app/components/LoginForm';

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/jobs');
  }

  return <LoginForm />;
}