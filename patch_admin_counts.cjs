const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/const \{ count: studentsCount, error: studentsError \} = await supabase\s*\.from\('students'\)\.select\('\*', \{ count: 'exact' \}\);/,
`const { count: studentsCount, error: studentsError } = await supabase
                    .from('students').select('*', { count: 'exact' })
                    .match(window.currentSession ? { session: window.currentSession } : {});`);

code = code.replace(/const \{ count: lessonsCount, error: lessonsError \} = await supabase\s*\.from\('lessons'\)\.select\('\*', \{ count: 'exact' \}\);/,
`const { count: lessonsCount, error: lessonsError } = await supabase
                    .from('lessons').select('*', { count: 'exact' })
                    .match(window.currentSession ? { session: window.currentSession } : {});`);

fs.writeFileSync('index.html', code);
console.log("Patched admin counts");
