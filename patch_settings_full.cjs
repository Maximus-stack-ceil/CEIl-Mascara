const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /function renderCenterSettings\(\) \{[\s\S]*?async function saveCenterSettings\(\) \{[\s\S]*?\}\s*\n/m;

const replacement = `function renderCenterSettings() {
            return \\\`
                <div class="max-w-4xl mx-auto" dir="rtl">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">إعدادات المركز</h2>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-6">
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">اسم المركز (عربي)</label>
                                <input type="text" id="centerNameArInput" placeholder="مركز التعليم المكثف للغات" class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">اسم المركز (فرنسي)</label>
                                <input type="text" id="centerNameFrInput" placeholder="CEIL" class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">اسم الجامعة (عربي)</label>
                                <input type="text" id="univNameArInput" placeholder="جامعة..." class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">اسم الجامعة (فرنسي)</label>
                                <input type="text" id="univNameFrInput" placeholder="Université..." class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">رابط شعار المركز</label>
                                <input type="url" id="centerLogoInput" placeholder="https://..." class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">رابط شعار الجامعة</label>
                                <input type="url" id="univLogoInput" placeholder="https://..." class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                        </div>

                        <hr class="border-gray-100 my-4">

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">الدورة الحالية</label>
                            <input type="text" id="currentSessionInput" placeholder="مثال: 2025/2026" class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-2">
                            <p class="text-xs text-gray-500 flex items-center gap-1"><i data-lucide="info" class="w-4 h-4"></i> سيتم تطبيق هذه الدورة على كل الأساتذة (الطلاب، الغيابات، والامتحانات).</p>
                        </div>
                        
                        <hr class="border-gray-100 my-4">

                        <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div>
                                <h4 class="font-bold text-gray-800">تفعيل النظام</h4>
                                <p class="text-sm text-gray-500">تفعيل عمل النظام وإمكانية التسجيل وإدخال النقاط للأساتذة.</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="systemActiveToggle" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <button onclick="saveCenterSettings()" id="saveSettingsBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2 mt-4">
                            <i data-lucide="save" class="w-4 h-4"></i> حفظ الإعدادات
                        </button>
                    </div>
                </div>
            \\\`;
        }

        async function loadCenterSettings() {
            try {
                const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;
                const { data, error } = await supabase.from('center_settings').select('*').limit(1).single();
                if (data) {
                    if (data.current_session) document.getElementById('currentSessionInput').value = data.current_session;
                    if (data.center_name_ar) document.getElementById('centerNameArInput').value = data.center_name_ar;
                    if (data.center_name_fr) document.getElementById('centerNameFrInput').value = data.center_name_fr;
                    if (data.university_name_ar) document.getElementById('univNameArInput').value = data.university_name_ar;
                    if (data.university_name_fr) document.getElementById('univNameFrInput').value = data.university_name_fr;
                    if (data.center_logo_url) document.getElementById('centerLogoInput').value = data.center_logo_url;
                    if (data.university_logo_url) document.getElementById('univLogoInput').value = data.university_logo_url;
                }
                
                // Load active state from localStorage as it might not be in the DB
                const isActive = localStorage.getItem('system_is_active') !== 'false';
                document.getElementById('systemActiveToggle').checked = isActive;

                if (window.lucide) lucide.createIcons();
            } catch (err) {
                console.error("Error loading center settings", err);
            }
        }

        async function saveCenterSettings() {
            if (!confirm('هل أنت متأكد من حفظ وتغيير إعدادات المركز؟')) return;
            
            const btn = document.getElementById('saveSettingsBtn');
            const originalBtnHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> جاري الحفظ...';
            
            const sessionVal = document.getElementById('currentSessionInput').value;
            const payload = {
                current_session: sessionVal,
                center_name_ar: document.getElementById('centerNameArInput').value,
                center_name_fr: document.getElementById('centerNameFrInput').value,
                university_name_ar: document.getElementById('univNameArInput').value,
                university_name_fr: document.getElementById('univNameFrInput').value,
                center_logo_url: document.getElementById('centerLogoInput').value,
                university_logo_url: document.getElementById('univLogoInput').value
            };

            const isActive = document.getElementById('systemActiveToggle').checked;
            localStorage.setItem('system_is_active', isActive);
            
            try {
                const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;
                // Get the ID of the first row to update
                const { data: existingData } = await supabase.from('center_settings').select('id').limit(1).single();
                
                let err = null;
                if (existingData && existingData.id) {
                    const { error } = await supabase.from('center_settings').update(payload).eq('id', existingData.id);
                    err = error;
                } else {
                    const { error } = await supabase.from('center_settings').insert([payload]);
                    err = error;
                }
                
                if (err) throw err;
                
                window.currentSession = sessionVal;
                
                // Also update UI titles if needed
                if (payload.center_name_ar) {
                    const brandTitles = document.querySelectorAll('.brand-title');
                    brandTitles.forEach(el => el.textContent = payload.center_name_ar);
                }

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

code = code.replace(regex, replacement);

fs.writeFileSync('index.html', code);
console.log("Patched full settings!");
