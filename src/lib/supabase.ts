import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://udcdedrjlnloabmhilmb.supabase.co';
const supabaseKey = 'your-supabase-key';

export const supabase = createClient(supabaseUrl, supabaseKey);