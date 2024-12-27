import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://udcdedrjlnloabmhilmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkY2RlZHJqbG5sb2FibWhpbG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMjIzNjAsImV4cCI6MjA0ODg5ODM2MH0.15g1bh7OAT9GPqje6Ld96zwzJ9GiHUHFl3bnctRflEo';

export const supabase = createClient(supabaseUrl, supabaseKey);