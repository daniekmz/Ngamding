// Inisialisasi Supabase dan simpan ke window object
const supabaseUrl = 'https://kwbrwwzxbepptjyjriyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3YnJ3d3p4YmVwcHRqeWpyaXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Mzg5ODEsImV4cCI6MjA2MzIxNDk4MX0.VlzF9BiQsTeiJZCIAHEuZjN1-tXGHqPz08QuhnX7kcg';

window.supabase = supabase.createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: true }
});