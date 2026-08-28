const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /status: status,\n\s*date: date/;
const replacement = `status: status,
                        date: date,
                        session: window.currentSession || null`;
code = code.replace(regex, replacement);

fs.writeFileSync('index.html', code);
console.log("Patched mark att");
