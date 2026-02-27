import Link from 'next/link';
import type { Job } from '../types';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
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
    <Link href={`/jobs/${job.id}`}>
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{job.client_name}</h3>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
              {job.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[job.payment_status]}`}>
              {job.payment_status}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
        
        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(job.job_date).toLocaleDateString()}
          </div>
          
          {job.time_spent && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor(job.time_spent / 60)}h {job.time_spent % 60}m
            </div>
          )}
          
          {job.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="truncate max-w-37.5">{job.location}</span>
            </div>
          )}
        </div>
        
        {job.materials && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-gray-700">Materials:</span>{' '}
            <span className="text-gray-600">{job.materials}</span>
          </div>
        )}

        {/* Financial Summary */}
        {(job.labour_cost || job.materials_cost) && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Labour:</span>
              <span>€{job.labour_cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Materials:</span>
              <span>€{job.materials_cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-900 mt-1">
              <span>Total:</span>
              <span>€{job.total_cost?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}