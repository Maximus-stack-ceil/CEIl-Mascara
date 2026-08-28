const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/const supabase = window\.supabaseClient \|\| window\.supabase;/g, "const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;");
code = code.replace(/const supabase = window\.supabaseClient \|\| supabaseClient;/g, "const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;");

fs.writeFileSync('index.html', code);
