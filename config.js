// Supabase configuration
const supabaseUrl = 'https://vdpicmptzgbluxqkudcr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcGljbXB0emdibHV4cWt1ZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNzAzMzIsImV4cCI6MjA1NTk0NjMzMn0.tUEDM8SVWzKkBg-zL5Gaju1slBQ3wi7MK7zFk4e_I28';

// Initialize Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);