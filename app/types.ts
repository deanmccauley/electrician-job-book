export type JobStatus = 'scheduled' | 'in_progress' | 'completed';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface Job {
  id: number;
  client_name: string;
  job_date: string;
  description: string;
  materials?: string;
  status: JobStatus;
  payment_status: PaymentStatus;
  time_spent?: number; // in minutes
  location?: string;
  created_at: string;
  user_id: string;
  photos?: string[];
}

export interface JobFormData {
  client_name: string;
  job_date: string;
  description: string;
  materials: string;
  status: JobStatus;
  payment_status: PaymentStatus;
  time_spent: string;
  location: string;
}