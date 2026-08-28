const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ejdxaxluftigjihibzlw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZHhheGx1ZnRpZ2ppaGliemx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzczNTYsImV4cCI6MjEwMTYxMzM1Nn0.Tlrcg-Wae16-xSgtB-XbUGp6YUpZn_h9ZRF8lVEvnI4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
async function test() {
    const { data, error } = await supabase.from('center_settings').select('*').limit(1);
    console.log("Data:", data, "Error:", error);
}
test();
