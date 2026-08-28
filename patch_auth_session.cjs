const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /userProfile = data;\s*\}/;
const replacement = `userProfile = data;
                } else {
                    userProfile = { role: 'teacher', full_name: currentUser.email.split('@')[0] || 'مستخدم' };
                }
                
                try {
                    const { data: settingsData } = await supabaseClient.from('center_settings').select('current_session').single();
                    if (settingsData && settingsData.current_session) {
                        window.currentSession = settingsData.current_session;
                    }
                } catch(e) { console.error('Error fetching session', e); }`;

code = code.replace(/userProfile = data;\s*\} else \{\s*\/\/ Fallback for demo purposes if profile doesn't exist\s*userProfile = \{ role: 'teacher', full_name: currentUser\.email\.split\('@'\)\[0\] \|\| 'مستخدم' \};\s*\}/, replacement);
fs.writeFileSync('index.html', code);
console.log("Patched auth session");
