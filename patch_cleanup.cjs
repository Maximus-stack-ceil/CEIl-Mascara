const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const strToReplace = `                window.currentSession = sessionVal;
                alert('تم حفظ الإعدادات بنجاح!');
            } catch (err) {
                console.error("Error saving center settings", err);
                alert('حدث خطأ أثناء الحفظ');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalBtnHtml;
                if (window.lucide) lucide.createIcons();
            }
        }
function renderLogin() {`;
code = code.replace(strToReplace, "function renderLogin() {");
fs.writeFileSync('index.html', code);
