import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  role: 'patient' | 'doctor' | 'admin';
  full_name: string;
  phone: string;
  avatar_url: string;
  created_at: string;
};

export type Doctor = {
  id: string;
  user_id: string | null;
  full_name: string;
  specialty: string;
  department: string;
  bio: string;
  location: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  experience_years: number;
  consultation_fee: number;
  whatsapp: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
};

export type Schedule = {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
};

export type ScheduleException = {
  id: string;
  doctor_id: string;
  exception_date: string;
  reason: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  notes: string;
  created_at: string;
  doctor?: Doctor;
  patient?: Profile;
};

export type MedicalRecord = {
  id: string;
  appointment_id: string | null;
  doctor_id: string;
  patient_id: string;
  diagnosis: string;
  treatment_plan: string;
  notes: string;
  is_sent_to_patient: boolean;
  created_at: string;
  doctor?: Doctor;
};
