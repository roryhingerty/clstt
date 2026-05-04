import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SUPABASE_URL = 'https://jloomlhshhvqtzxmbbwt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsb29tbGhzaGh2cXR6eG1iYnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDI0MTQsImV4cCI6MjA5MzM3ODQxNH0.kF4AaEVq5XktpQODDfjE1480A0l_Pj4SCp9O8NNmfXY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})