'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Checking connection...');

  useEffect(() => {
    async function checkConnection() {
      try {
        // A simple query to test the connection
        const { data, error } = await supabase.from('your_table_name').select('count()', { count: 'exact' });
        
        if (error) throw error;
        setStatus('Connected to Supabase successfully!');
      } catch (error) {
        console.error('Error connecting to Supabase:', error);
        setStatus('Failed to connect to Supabase.');
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h2 className="text-lg font-semibold">Supabase Connection Status</h2>
      <p className={status.includes('Failed') ? 'text-red-500' : 'text-green-500'}>
        {status}
      </p>
    </div>
  );
} 