const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /\.eq\('teacher_id', currentUser\.id\)/g;
const replacement = `.match({ teacher_id: currentUser.id, ...(window.currentSession ? { session: window.currentSession } : {}) })`;
code = code.replace(regex, replacement);

fs.writeFileSync('index.html', code);
console.log("Patched matches");
