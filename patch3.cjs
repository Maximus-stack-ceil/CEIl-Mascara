const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const renderAndLoadCode = `
        function renderTeachersList() {
            return \`
                <div class="max-w-6xl mx-auto">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">قائمة الأساتذة</h2>
                            <p class="text-gray-500 text-sm mt-1">إدارة وعرض بيانات الأساتذة المسجلين في المركز</p>
                        </div>
                        <button onclick="loadTeachersList()" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition text-sm">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i> تحديث
                        </button>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-right">
                                <thead class="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                    <tr>
                                        <th class="p-4 font-semibold">الاسم الكامل</th>
                                        <th class="p-4 font-semibold">البريد الإلكتروني</th>
                                        <th class="p-4 font-semibold">رقم الهاتف</th>
                                        <th class="p-4 font-semibold">اللغة / التخصص</th>
                                        <th class="p-4 font-semibold">ملاحظات (الرقم السري)</th>
                                        <th class="p-4 font-semibold">تاريخ الانضمام</th>
                                    </tr>
                                </thead>
                                <tbody id="teachersListTableBody" class="divide-y divide-gray-100">
                                    <tr><td colspan="6" class="text-center p-8 text-gray-500">جاري التحميل...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            \`;
        }

        async function loadTeachersList() {
            const tbody = document.getElementById('teachersListTableBody');
            if (!tbody) return;
            
            const supabase = window.supabaseClient || supabaseClient;
            
            try {
                const { data: teachers, error } = await supabase
                    .from('profiles')
                    .select('*, teacher_requests!inner(phone, birth_date, birth_place, certificate, language, levels_and_groups, admin_notes)')
                    .eq('role', 'teacher')
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                
                if (!teachers || teachers.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center p-8 text-gray-500">لا يوجد أساتذة مسجلين حالياً.</td></tr>';
                    return;
                }
                
                tbody.innerHTML = teachers.map(teacher => {
                    const reqInfo = teacher.teacher_requests && teacher.teacher_requests.length > 0 
                        ? teacher.teacher_requests[0] 
                        : (Array.isArray(teacher.teacher_requests) ? {} : teacher.teacher_requests || {});
                        
                    const phone = reqInfo.phone || '-';
                    const language = reqInfo.language || '-';
                    const adminNotes = reqInfo.admin_notes || '-';
                    const date = new Date(teacher.created_at).toLocaleDateString('ar-EG');
                    const email = teacher.email || '-';
                    
                    return \`
                        <tr class="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                            <td class="p-4 font-medium text-gray-800">\${teacher.full_name || '-'}</td>
                            <td class="p-4 text-gray-600">\${email}</td>
                            <td class="p-4 text-gray-600" dir="ltr" style="text-align: right">\${phone}</td>
                            <td class="p-4 text-gray-600">\${language}</td>
                            <td class="p-4 text-gray-600">\${adminNotes}</td>
                            <td class="p-4 text-gray-500 text-sm">\${date}</td>
                        </tr>
                    \`;
                }).join('');
                
                if (window.lucide) lucide.createIcons();
                
            } catch (err) {
                console.error("Error loading teachers list:", err);
                tbody.innerHTML = \`<tr><td colspan="6" class="text-center p-8 text-red-500">حدث خطأ أثناء تحميل البيانات: \${err.message}</td></tr>\`;
            }
        }
`;

const insertTarget = `        function renderAdminDashboard() {`;
if(code.includes(insertTarget)) {
    code = code.replace(insertTarget, renderAndLoadCode + '\n' + insertTarget);
    fs.writeFileSync('index.html', code);
    console.log("Patched renderTeachersList correctly");
} else {
    console.log("Target not found");
}
