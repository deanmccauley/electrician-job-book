'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Job } from '../types';
import { createClient } from '@/app/utils/supabase';
import { Calendar, Clock, MapPin, CreditCard, Edit, Trash2 } from 'lucide-react';
import PhotoUpload from './PhotoUpload';

interface JobDetailsProps {
  job: Job;
}

export default function JobDetails({ job }: JobDetailsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job.client_name}</h1>
          <p className="text-gray-500">Job #{job.id}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/jobs/${job.id}/edit`}
            className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
          >
            <Edit className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 disabled:opacity-50"
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

      {/* Financial Details */}
      {(job.labour_cost || job.materials_cost) && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Financial Summary</h2>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Labour Cost:</span>
              <span className="font-medium">£{job.labour_cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Materials Cost:</span>
              <span className="font-medium">£{job.materials_cost?.toFixed(2) || '0.00'}</span>
            </div>
            {job.vat_rate && (
              <div className="flex justify-between">
                <span className="text-gray-600">VAT Rate:</span>
                <span className="font-medium">{job.vat_rate}%</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-blue-600">£{job.total_cost?.toFixed(2) || '0.00'}</span>
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
    </div>
  );
}