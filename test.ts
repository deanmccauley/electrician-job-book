import { Job } from './app/types';

const test: Job = {
  id: 1,
  client_name: "Test Client",
  job_date: "2024-01-01",
  description: "Test job description",
  status: "scheduled",
  payment_status: "unpaid",
  created_at: new Date().toISOString(),
  user_id: "test-user-id"
};

console.log("Test passed!", test);