const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace routing logic 'teachersList' with 'userManagement' (or keep 'teachersList' to avoid changing sidebar)
html = html.replace(/renderLayout\(renderTeachersList\(\), 'admin'\);/g, "renderLayout(renderUserManagement(), 'admin');");
html = html.replace(/setTimeout\(\(\) => loadTeachersList\(\), 0\);/g, "setTimeout(() => loadUserManagement(), 0);");

// Now extract what we need to replace
const startMarker = "function renderTeachersList() {";
const endMarker = "function renderGroupsLevelsSection() {";

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const replacement = `
        function renderUserManagement() {
            return \`
                <div class="max-w-6xl mx-auto" dir="rtl">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">إدارة الأساتذة</h2>
                            <p class="text-gray-500 text-sm mt-1">تفعيل وتعطيل وإدارة حسابات الأساتذة</p>
                        </div>
                        <button onclick="loadUserManagement()" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition text-sm">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i> تحديث
                        </button>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-2">بحث (بالاسم أو البريد)</label>
                                <input type="text" id="teacherSearchInput" oninput="filterUserManagement()" placeholder="ابحث..." class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                            </div>
                            <div class="md:w-64">
                                <label class="block text-sm font-medium text-gray-700 mb-2">تصفية حسب الحالة</label>
                                <select id="teacherStatusFilter" onchange="filterUserManagement()" class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                    <option value="all">الكل</option>
                                    <option value="active">نشط</option>
                                    <option value="suspended">معطل</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-right">
                                <thead class="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                                    <tr>
                                        <th class="p-4 font-semibold">الاسم</th>
                                        <th class="p-4 font-semibold">البريد</th>
                                        <th class="p-4 font-semibold">تاريخ التسجيل</th>
                                        <th class="p-4 font-semibold">الحالة</th>
                                        <th class="p-4 font-semibold">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="userManagementTableBody" class="divide-y divide-gray-100">
                                    <tr><td colspan="5" class="text-center p-8 text-gray-500">جاري التحميل...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Password Reset Modal -->
                <div id="resetPasswordModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" dir="rtl">
                        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-gray-800">إعادة تعيين كلمة المرور</h3>
                            <button onclick="closeResetPasswordModal()" class="text-gray-400 hover:text-gray-600">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <div class="p-6">
                            <p class="text-sm text-gray-600 mb-4">للأستاذ: <span id="resetModalTeacherName" class="font-bold"></span> (<span id="resetModalTeacherEmail" dir="ltr"></span>)</p>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                                <div class="flex gap-2">
                                    <input type="text" id="newPasswordInput" class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" dir="ltr">
                                    <button onclick="generateRandomPassword()" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition" title="توليد عشوائي">
                                        <i data-lucide="shuffle" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                            <button onclick="closeResetPasswordModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition text-sm font-medium">إلغاء</button>
                            <button onclick="confirmResetPassword()" id="confirmResetBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2">
                                <i data-lucide="check" class="w-4 h-4"></i> تأكيد
                            </button>
                        </div>
                    </div>
                </div>
            \`;
        }

        let allTeachersData = [];
        let currentResetEmail = '';

        async function loadUserManagement() {
            const tbody = document.getElementById('userManagementTableBody');
            if (!tbody) return;
            
            const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;
            
            try {
                const { data: teachers, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, created_at, account_status')
                    .eq('role', 'teacher')
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                
                allTeachersData = teachers || [];
                filterUserManagement();
                
            } catch (error) {
                console.error("Error loading teachers", error);
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-red-500">حدث خطأ أثناء جلب البيانات</td></tr>';
            }
        }

        function filterUserManagement() {
            const tbody = document.getElementById('userManagementTableBody');
            if (!tbody) return;

            const searchQuery = (document.getElementById('teacherSearchInput')?.value || '').toLowerCase();
            const statusFilter = document.getElementById('teacherStatusFilter')?.value || 'all';

            const filtered = allTeachersData.filter(t => {
                const matchesSearch = (t.full_name || '').toLowerCase().includes(searchQuery) || 
                                      (t.email || '').toLowerCase().includes(searchQuery);
                let matchesStatus = true;
                if (statusFilter === 'active') matchesStatus = t.account_status === 'active';
                if (statusFilter === 'suspended') matchesStatus = t.account_status === 'suspended';
                
                return matchesSearch && matchesStatus;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">لا يوجد أساتذة يطابقون البحث.</td></tr>';
                if (window.lucide) lucide.createIcons();
                return;
            }

            tbody.innerHTML = filtered.map(teacher => {
                const date = new Date(teacher.created_at).toLocaleDateString('ar-EG');
                const isActive = teacher.account_status === 'active';
                
                const statusBadge = isActive 
                    ? '<span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">نشط</span>'
                    : '<span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">معطل</span>';
                
                const actionBtn = isActive
                    ? \`<button onclick="toggleTeacherStatus('\${teacher.id}', 'suspended')" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1"><i data-lucide="ban" class="w-3 h-3"></i> تعطيل</button>\`
                    : \`<button onclick="toggleTeacherStatus('\${teacher.id}', 'active')" class="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1"><i data-lucide="check-circle" class="w-3 h-3"></i> تفعيل</button>\`;

                return \`
                    <tr class="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                        <td class="p-4 font-medium text-gray-800">\${teacher.full_name || '-'}</td>
                        <td class="p-4 text-gray-600" dir="ltr">\${teacher.email || '-'}</td>
                        <td class="p-4 text-gray-600">\${date}</td>
                        <td class="p-4">\${statusBadge}</td>
                        <td class="p-4 flex gap-2">
                            \${actionBtn}
                            <button onclick="openResetPasswordModal('\${teacher.email}', '\${teacher.full_name}')" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1">
                                <i data-lucide="key" class="w-3 h-3"></i> كلمة المرور
                            </button>
                        </td>
                    </tr>
                \`;
            }).join('');
            
            if (window.lucide) lucide.createIcons();
        }

        async function toggleTeacherStatus(userId, newStatus) {
            if (!confirm(newStatus === 'active' ? 'هل أنت متأكد من تفعيل حساب هذا الأستاذ؟' : 'هل أنت متأكد من تعطيل حساب هذا الأستاذ؟ لا يمكنه تسجيل الدخول بعد ذلك.')) return;
            
            const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ account_status: newStatus })
                    .eq('id', userId);
                    
                if (error) throw error;
                
                // Update local array
                const tIndex = allTeachersData.findIndex(t => t.id === userId);
                if (tIndex > -1) {
                    allTeachersData[tIndex].account_status = newStatus;
                    filterUserManagement();
                }
            } catch (err) {
                console.error("Error updating status", err);
                alert("حدث خطأ أثناء تغيير حالة الحساب");
            }
        }

        function openResetPasswordModal(email, name) {
            currentResetEmail = email;
            document.getElementById('resetModalTeacherName').textContent = name || '-';
            document.getElementById('resetModalTeacherEmail').textContent = email || '-';
            document.getElementById('newPasswordInput').value = '';
            document.getElementById('resetPasswordModal').classList.remove('hidden');
        }

        function closeResetPasswordModal() {
            document.getElementById('resetPasswordModal').classList.add('hidden');
            currentResetEmail = '';
        }

        function generateRandomPassword() {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
            let pwd = '';
            for (let i = 0; i < 10; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            document.getElementById('newPasswordInput').value = pwd;
        }

        async function confirmResetPassword() {
            const pwdInput = document.getElementById('newPasswordInput').value;
            if (!pwdInput) {
                alert("الرجاء إدخال كلمة مرور جديدة.");
                return;
            }
            if (!currentResetEmail) return;

            const btn = document.getElementById('confirmResetBtn');
            const originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> جاري...';

            const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;

            try {
                const { data, error } = await supabase.rpc('admin_reset_password', {
                    user_email: currentResetEmail,
                    new_password: pwdInput
                });
                
                if (error) throw error;
                
                alert("تم تغيير كلمة المرور بنجاح.");
                closeResetPasswordModal();
            } catch (err) {
                console.error("Error resetting password", err);
                alert("حدث خطأ أثناء تغيير كلمة المرور: " + (err.message || ''));
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
                if (window.lucide) lucide.createIcons();
            }
        }

        `;

const newHtml = html.substring(0, startIndex) + replacement + html.substring(endIndex);
fs.writeFileSync('index.html', newHtml);

console.log("Patched successfully!");
