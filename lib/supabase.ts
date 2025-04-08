import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testSupabaseConnection() {
  try {
    // Test authentication by getting the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Simple query to test database connection
    const { data, error } = await supabase
      .from('notes_history')
      .select('*')
      .limit(1);

    if (sessionError || error) {
      console.error('🔴 SUPABASE CONNECTION ERROR:', sessionError || error);
      return false;
    }

    console.log('🟢 SUPABASE CONNECTION SUCCESSFUL!');
    console.log('📝 Session:', session);
    console.log('📊 Data:', data);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
} 