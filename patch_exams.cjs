const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /decision: decision,\n\s*exam_date: examDate/;
const replacement = `decision: decision,
                            exam_date: examDate,
                            session: window.currentSession || null`;
code = code.replace(regex, replacement);

fs.writeFileSync('index.html', code);
console.log("Patched exams");
