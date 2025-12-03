import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'intern' | 'business';
          created_at: string;
          updated_at: string;
          // Intern specific
          points?: number;
          level?: number;
          // Business specific
          business_name?: string;
          industry?: string;
          location?: string;
          website?: string;
          description?: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          description: string;
          category: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          points: number;
          duration: string | null;
          deadline: string | null;
          status: 'open' | 'in-progress' | 'completed' | 'under-review';
          skills: string[];
          posted_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at' | 'posted_date'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      applications: {
        Row: {
          id: string;
          task_id: string;
          intern_id: string;
          application_text: string | null;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['applications']['Insert']>;
      };
      submissions: {
        Row: {
          id: string;
          task_id: string;
          intern_id: string;
          description: string;
          attachment_url: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rating: number | null;
          feedback: string | null;
          submitted_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['submissions']['Row'], 'id' | 'created_at' | 'updated_at' | 'submitted_date'>;
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>;
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['badges']['Insert']>;
      };
      intern_badges: {
        Row: {
          id: string;
          intern_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['intern_badges']['Row'], 'id' | 'unlocked_at'>;
        Update: Partial<Database['public']['Tables']['intern_badges']['Insert']>;
      };
    };
  };
}

