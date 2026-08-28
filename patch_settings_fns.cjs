const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const fns = `
        function renderCenterSettings() {
            return \\\`
                <div class="max-w-4xl mx-auto" dir="rtl">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">إعدادات المركز</h2>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">الدورة الحالية</label>
                            <input type="text" id="currentSessionInput" placeholder="مثال: 2025/2026" class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-2">
                            <p class="text-xs text-gray-500 flex items-center gap-1"><i data-lucide="info" class="w-4 h-4"></i> سيتم تطبيق هذه الدورة على كل الأساتذة (الطلاب، الغيابات، والامتحانات).</p>
                        </div>
                        <button onclick="saveCenterSettings()" id="saveSettingsBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i> حفظ الإعدادات
                        </button>
                    </div>
                </div>
            \\\`;
        }

        async function loadCenterSettings() {
            try {
                const supabase = window.supabaseClient || window.supabase;
                const { data, error } = await supabase.from('center_settings').select('current_session').single();
                if (data && data.current_session) {
                    document.getElementById('currentSessionInput').value = data.current_session;
                }
                if (window.lucide) lucide.createIcons();
            } catch (err) {
                console.error("Error loading center settings", err);
            }
        }

        async function saveCenterSettings() {
            if (!confirm('هل أنت متأكد من تغيير الدورة الحالية؟ سيتم تطبيقها على كل الأساتذة وتسجيل بياناتهم فيها.')) return;
            
            const btn = document.getElementById('saveSettingsBtn');
            const originalBtnHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> جاري الحفظ...';
            
            const sessionVal = document.getElementById('currentSessionInput').value;
            
            try {
                const supabase = window.supabaseClient || window.supabase;
                // Upsert logic, assuming id=1 or just single row
                // We'll just try updating first, if fails insert, or just use single if it's guaranteed one row
                const { error } = await supabase.from('center_settings').update({ current_session: sessionVal }).eq('id', 1);
                
                // fallback to try insert if error or just insert
                if (error) {
                     const { error: insertErr } = await supabase.from('center_settings').insert([{ id: 1, current_session: sessionVal }]);
                     if (insertErr) throw insertErr;
                }
                
                window.currentSession = sessionVal;
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
`;

code = code.replace(/function renderLogin\(\) \{/, match => fns + '\\n' + match);
fs.writeFileSync('index.html', code);
console.log("Patched settings fns");
