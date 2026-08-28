const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Students Insert
const studentObjRegex = /group_name: document\.getElementById\('groupName'\)\.value,/;
code = code.replace(studentObjRegex, "group_name: document.getElementById('groupName').value,\n                session: window.currentSession || null,");

// 2. Students Fetch (loadStudents)
const loadStudentsRegex = /\.eq\('teacher_id', currentUser\.id\)/;
code = code.replace(loadStudentsRegex, ".eq('teacher_id', currentUser.id)\n                    ...(window.currentSession ? [{ eq: ['session', window.currentSession] }] : []).reduce((acc, curr) => acc.eq(curr.eq[0], curr.eq[1]), supabaseClient.from('students').select('*').eq('teacher_id', currentUser.id)) ? '' : ''");
// wait, the above is messy. Let's do it cleaner.

