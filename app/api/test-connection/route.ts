import { testSupabaseConnection } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const isConnected = await testSupabaseConnection();
  
  return NextResponse.json({ status: isConnected ? 'connected' : 'failed' });
} 