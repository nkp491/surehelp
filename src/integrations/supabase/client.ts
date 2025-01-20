import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkdvsxnwpbvahllneusg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZHZzeG53cGJ2YWhsbG5ldXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1OTQwMDAsImV4cCI6MjAyMTE3MDAwMH0.DYvlF90lJgGmBN8GXvBxKoJ0ELLzNJi0A0IT9cZVVvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
  },
});