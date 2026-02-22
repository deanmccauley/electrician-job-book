'use client';

import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Job } from '../types';

interface ExportButtonProps {
  jobs: Job[];
}

export default function ExportButton({ jobs }: ExportButtonProps) {
  const exportToExcel = () => {
    // Format the data for export
    const exportData = jobs.map(job => ({
      'Client Name': job.client_name,
      'Date': new Date(job.job_date).toLocaleDateString(),
      'Description': job.description,
      'Materials': job.materials || '',
      'Status': job.status,
      'Payment Status': job.payment_status,
      'Time Spent (minutes)': job.time_spent || '',
      'Location': job.location || '',
      'Created': new Date(job.created_at).toLocaleDateString(),
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
    
    // Generate filename with current date
    const fileName = `jobs_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
    >
      <Download className="w-4 h-4 mr-2" />
      Export to Excel
    </button>
  );
}