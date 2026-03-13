'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/app/utils/supabase';
import ExportButton from './ExportButton';

interface ClientHeaderProps {
  jobs: any[] | null;
}

export default function ClientHeader({ jobs }: ClientHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
      
      {/* Mobile-friendly action bar */}
      <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-2">
        {/* New Job button - always visible */}
        <Link
          href="/jobs/new"
          className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">New Job</span>
          <span className="xs:hidden">New</span>
        </Link>

        {/* Export button - hidden on mobile, visible on desktop */}
        <div className="hidden sm:block">
          {jobs && jobs.length > 0 && <ExportButton jobs={jobs} />}
        </div>

        {/* Dropdown menu for Settings and Logout */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Menu"
          >
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Menu</span>
          </button>
          
          {showMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              
              {/* Dropdown panel */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                {/* Export - only visible on mobile */}
                <div className="sm:hidden border-b border-gray-100 pb-1 mb-1">
                  {jobs && jobs.length > 0 && (
                    <div className="px-4 py-2">
                      <ExportButton jobs={jobs} />
                    </div>
                  )}
                </div>
                
                {/* Settings link */}
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                
                {/* Logout button */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}