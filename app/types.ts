export type JobStatus = 'scheduled' | 'in_progress' | 'completed';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface Photo {
  id: number;
  job_id: number;
  url: string;
  created_at: string;
  user_id: string;
}

export interface Job {
  id: number;
  client_name: string;
  job_date: string;
  description: string;
  materials?: string;
  status: JobStatus;
  payment_status: PaymentStatus;
  time_spent?: number;
  location?: string;
  labour_cost?: number;
  materials_cost?: number;
  vat_rate?: number;
  total_cost?: number;
  created_at: string;
  user_id: string;
  photos?: Photo[];
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
  labour_cost: string;
  materials_cost: string;
  vat_rate: string;
}