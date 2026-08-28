const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace(
`                        // Restore admin session to prevent RLS issues when inserting details
                        if (adminSession) {
                            await supabase.auth.setSession({
                                access_token: adminSession.access_token,
                                refresh_token: adminSession.refresh_token
                            });
                        }

                        // انتظر حتى يُنشئ الـ Trigger الـ profile (3 محاولات)
                        let profile = null;
                        for (let i = 0; i < 3; i++) {
                            const { data } = await supabase.from('profiles').select('id').eq('id', newUserId).single();
                            if (data) { profile = data; break; }
                            await new Promise(r => setTimeout(r, 500)); // انتظر نصف ثانية
                        }`,
`                        // انتظر حتى يُنشئ الـ Trigger الـ profile (3 محاولات)
                        let profile = null;
                        for (let i = 0; i < 3; i++) {
                            const { data } = await supabase.from('profiles').select('id').eq('id', newUserId).single();
                            if (data) { profile = data; break; }
                            await new Promise(r => setTimeout(r, 1000)); // انتظر ثانية
                        }

                        // Restore admin session to prevent RLS issues when inserting details
                        if (adminSession) {
                            await supabase.auth.setSession({
                                access_token: adminSession.access_token,
                                refresh_token: adminSession.refresh_token
                            });
                        }`
);
fs.writeFileSync('index.html', code);
