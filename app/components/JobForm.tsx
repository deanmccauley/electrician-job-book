'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase';
import type { JobFormData, JobStatus, PaymentStatus } from '../types';

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  jobId?: number;
}

export default function JobForm({ initialData = {}, jobId }: JobFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    client_name: initialData.client_name || '',
    job_date: initialData.job_date || new Date().toISOString().split('T')[0],
    description: initialData.description || '',
    materials: initialData.materials || '',
    status: initialData.status || 'scheduled',
    payment_status: initialData.payment_status || 'unpaid',
    time_spent: initialData.time_spent || '',
    location: initialData.location || '',
    labour_cost: initialData.labour_cost || '',
    materials_cost: initialData.materials_cost || '',
    vat_rate: initialData.vat_rate || '13.5',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('User data:', userData);
      
      if (userError || !userData.user) {
        console.error('User error:', userError);
        router.push('/');
        return;
      }

      const jobData = {
        client_name: formData.client_name,
        job_date: formData.job_date,
        description: formData.description,
        materials: formData.materials || null,
        status: formData.status,
        payment_status: formData.payment_status,
        time_spent: formData.time_spent ? parseInt(formData.time_spent) : null,
        location: formData.location || null,
        labour_cost: formData.labour_cost ? parseFloat(formData.labour_cost) : null,
        materials_cost: formData.materials_cost ? parseFloat(formData.materials_cost) : null,
        vat_rate: formData.vat_rate ? parseFloat(formData.vat_rate) : null,
        user_id: userData.user.id,
      };

      console.log('Attempting to save job:', jobData);

      let error;
      if (jobId) {
        // Update existing job
        console.log('Updating job with ID:', jobId);
        const { error: updateError } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', jobId);
        error = updateError;
      } else {
        // Create new job
        console.log('Creating new job');
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([jobData]);
        error = insertError;
      }

      if (error) {
        console.error('Database error:', error);
        alert('Failed to save job: ' + error.message);
      } else {
        console.log('Job saved successfully!');
        if (jobId) {
          router.push(`/jobs/${jobId}`);
        } else {
          router.push('/jobs');
        }
        router.refresh();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Name *</label>
          <input
            type="text"
            name="client_name"
            required
            value={formData.client_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input
            type="date"
            name="job_date"
            required
            value={formData.job_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Job Description *</label>
          <textarea
            name="description"
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Materials Needed</label>
          <textarea
            name="materials"
            rows={3}
            value={formData.materials}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Status</label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Spent (minutes)</label>
            <input
              type="number"
              name="time_spent"
              value={formData.time_spent}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location/Address</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Financial Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Labour Cost (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="labour_cost"
              value={formData.labour_cost}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Materials Cost (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="materials_cost"
              value={formData.materials_cost}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">VAT Rate (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              name="vat_rate"
              value={formData.vat_rate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="20.0"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : jobId ? 'Update Job' : 'Save Job'}
        </button>
      </div>
    </form>
  );
}