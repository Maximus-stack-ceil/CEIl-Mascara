const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /let studentsQuery = supabase\.from\('students'\)\.select\('\*, profiles:teacher_id\\(full_name\\)'\);/;
const replacement = `let studentsQuery = supabase.from('students').select('*, profiles:teacher_id(full_name)');
                if (window.currentSession) {
                    studentsQuery = studentsQuery.eq('session', window.currentSession);
                    attendanceQuery = attendanceQuery.eq('session', window.currentSession);
                    gradesQuery = gradesQuery.eq('session', window.currentSession);
                }`;

code = code.replace(regex, replacement);
fs.writeFileSync('index.html', code);
console.log("Patched reports session");
