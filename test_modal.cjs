const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf8');
if(code.includes('resetPasswordModal') && code.includes('id="confirmResetBtn"')){
    console.log("Modal exists");
} else {
    console.log("Modal missing");
}
