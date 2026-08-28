const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Students Insert
code = code.replace(/group_name: document\.getElementById\('groupName'\)\.value,/, "group_name: document.getElementById('groupName').value,\n                session: window.currentSession || null,");

// Lessons Insert
code = code.replace(/group_name: document\.getElementById\('lessonGroup'\)\.value,/, "group_name: document.getElementById('lessonGroup').value,\n                session: window.currentSession || null,");

// Attendance Save (Wait, attendance uses an array of upserts)
code = code.replace(/teacher_id: currentUser\.id,\n\s*student_id: studentId,/, "teacher_id: currentUser.id,\n                    student_id: studentId,\n                    session: window.currentSession || null,");

// Exams Save 
code = code.replace(/teacher_id: currentUser\.id,\n\s*student_id: studentId,/, "teacher_id: currentUser.id,\n                    student_id: studentId,\n                    session: window.currentSession || null,");
// Need to make sure the regex replaces correctly.
fs.writeFileSync('index.html', code);
