import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './env';

export const supabaseReady = SUPABASE_URL.startsWith('https://');

export const supabase = supabaseReady
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;
