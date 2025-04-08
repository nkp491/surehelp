'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to fetch a simple query
        const { data, error } = await supabase
          .from('your_table_name')
          .select('*')
          .limit(1);

        if (error) throw error;
        setStatus('connected');
      } catch (e) {
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Unknown error occurred');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Supabase Connection Test</h1>
      {status === 'loading' && <p>Testing connection...</p>}
      {status === 'connected' && (
        <p className="text-green-600">Successfully connected to Supabase!</p>
      )}
      {status === 'error' && (
        <div className="text-red-600">
          <p>Failed to connect to Supabase</p>
          {error && <p className="text-sm mt-2">Error: {error}</p>}
        </div>
      )}
    </div>
  );
} 