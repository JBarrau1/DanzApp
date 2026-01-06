// Supabase Client Configuration
// Initializes and exports the Supabase client for database operations

import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const SUPABASE_URL = 'https://jtvhspccjysfhmkdtclx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0dmhzcGNjanlzZmhta2R0Y2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTI1MTMsImV4cCI6MjA4MzI4ODUxM30.AA3WNTj5Y5Ygs-vXMZ9aDVkvKXQYlcJte2ENg_iBF-o';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper function to check connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('elencos').select('count');
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};
