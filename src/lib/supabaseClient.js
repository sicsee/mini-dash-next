
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zdrkzxijspubpkxpnadk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkcmt6eGlqc3B1YnBreHBuYWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzU2MjYsImV4cCI6MjA2MTExMTYyNn0.KqxBOoCxGYsciAI-dnt0Lm_yl7FCfeBJ83lK5dgHZp4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);