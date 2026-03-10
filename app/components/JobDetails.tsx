'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Job } from '../types';
import { createClient } from '@/app/utils/supabase';
import { Calendar, Clock, MapPin, CreditCard, Edit, Trash2, FileText } from 'lucide-react';
import PhotoUpload from './PhotoUpload';
import InvoiceModal from './InvoiceModal';

interface JobDetailsProps {
  job: Job;
}

export default function JobDetails({ job }: JobDetailsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setDeleting(true);
    const { error } = await supabase.from('jobs').delete().eq('id', job.id);
    setDeleting(false);
    
    if (!error) {
      router.push('/jobs');
      router.refresh();
    }
  };

  const handleOpenInvoiceModal = async () => {
    setLoadingInvoice(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Fetch business details
      const { data: business } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      
      if (business) {
        setBusinessDetails(business);
        
        // Get next invoice number by calling a server-side function
        // Using a fetch to a server endpoint would be cleaner, but for now we'll
        // simulate a unique invoice number
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const number = `INV-${timestamp.toString().slice(-4)}${random}`;
        setInvoiceNumber(number);
        
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error('Error preparing invoice:', error);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  const paymentColors: Record<string, string> = {
    unpaid: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-orange-100 text-orange-800',
  };

  // Calculate VAT amounts
  const subtotal = (job.labour_cost || 0) + (job.materials_cost || 0);
  const vatRate = job.vat_rate || 13.5;
  const vatAmount = subtotal * (vatRate / 100);
  const totalWithVat = subtotal + vatAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job.client_name}</h1>
          <p className="text-gray-500">Job #{job.id}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleOpenInvoiceModal}
            disabled={loadingInvoice}
            className="p-2 text-gray-600 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors disabled:opacity-50"
            title="Generate Invoice"
          >
            <FileText className="w-5 h-5" />
          </button>
          <Link
            href={`/jobs/${job.id}/edit`}
            className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
            title="Edit Job"
          >
            <Edit className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 disabled:opacity-50 transition-colors"
            title="Delete Job"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex space-x-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status]}`}>
          {job.status.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentColors[job.payment_status]}`}>
          {job.payment_status}
        </span>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center text-gray-700">
          <Calendar className="w-5 h-5 mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{new Date(job.job_date).toLocaleDateString()}</p>
          </div>
        </div>

        {job.time_spent && (
          <div className="flex items-center text-gray-700">
            <Clock className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Time Spent</p>
              <p className="font-medium">
                {Math.floor(job.time_spent / 60)}h {job.time_spent % 60}m
              </p>
            </div>
          </div>
        )}

        {job.location && (
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{job.location}</p>
            </div>
          </div>
        )}

        <div className="flex items-center text-gray-700">
          <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className="font-medium capitalize">{job.payment_status}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
      </div>

      {/* Materials */}
      {job.materials && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Materials Needed</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.materials}</p>
        </div>
      )}

      {/* Financial Details with VAT Breakdown */}
      {(job.labour_cost || job.materials_cost) && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Financial Summary</h2>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Labour Cost:</span>
              <span className="font-medium">€{job.labour_cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Materials Cost:</span>
              <span className="font-medium">€{job.materials_cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-medium">Subtotal:</span>
              <span className="font-medium">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT ({vatRate}%):</span>
              <span className="font-medium">€{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total with VAT:</span>
              <span className="text-blue-600">€{totalWithVat.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Photos Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Photos</h2>
        <PhotoUpload jobId={job.id} />
      </div>

      {/* Created Date */}
      <div className="text-sm text-gray-500 border-t pt-4">
        Created: {new Date(job.created_at).toLocaleString()}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && businessDetails && (
        <InvoiceModal
          job={job}
          businessDetails={businessDetails}
          invoiceNumber={invoiceNumber}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}