const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace("let gradesQuery = supabase.from('student_grades').select('*, profiles:teacher_id(full_name)');", 
`let gradesQuery = supabase.from('student_grades').select('*, profiles:teacher_id(full_name)');
                if (window.currentSession) {
                    studentsQuery = studentsQuery.eq('session', window.currentSession);
                    attendanceQuery = attendanceQuery.eq('session', window.currentSession);
                    gradesQuery = gradesQuery.eq('session', window.currentSession);
                }`);

fs.writeFileSync('index.html', code);
console.log("Patched reports session 2");
