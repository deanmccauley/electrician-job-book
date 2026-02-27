'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      title="Logout"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </button>
  );
}