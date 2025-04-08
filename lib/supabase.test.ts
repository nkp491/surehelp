import { supabase } from './supabase';

describe('Supabase Client', () => {
  test('should have valid URL', () => {
    expect(supabase.supabaseUrl).toBeTruthy();
    expect(supabase.supabaseUrl).toMatch(/^https?:\/\//);
  });

  test('should have valid anon key', () => {
    expect(supabase.supabaseKey).toBeTruthy();
    expect(supabase.supabaseKey).toMatch(/^eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/);
  });

  test('can connect to database', async () => {
    const { data, error } = await supabase.from('your_table_name').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
}); 