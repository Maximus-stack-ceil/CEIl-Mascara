const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetRegex = /function renderGroupsLevelsSection\(\) \{[\s\S]*?function renderAdminDashboard\(\)/;

const replacement = `function renderGroupsLevelsSection() {
            setTimeout(() => loadGroupsLevels(), 0);
            return \`
                <div class="max-w-6xl mx-auto" dir="rtl">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">الأفواج والمستويات</h2>
                            <p class="text-gray-500 text-sm mt-1">اختر أستاذاً لعرض أفواجه والطلاب المسجلين بها</p>
                        </div>
                        <div class="w-full md:w-72 relative">
                            <select id="teacherSelect" onchange="loadTeacherGroups(this.value)" class="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-gray-700 appearance-none">
                                <option value="">جاري تحميل الأساتذة...</option>
                            </select>
                            <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                                <i data-lucide="chevron-down" class="w-4 h-4"></i>
                            </div>
                        </div>
                    </div>

                    <div id="groupsCardsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="col-span-full text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                            الرجاء اختيار أستاذ من القائمة أعلاه لعرض الأفواج
                        </div>
                    </div>
                </div>
            \`;
        }

        async function loadGroupsLevels() {
            const supabase = window.supabaseClient || window.supabase;
            const select = document.getElementById('teacherSelect');
            if (!select) return;
            
            try {
                const { data: teachers, error } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .eq('role', 'teacher')
                    .order('full_name');
                    
                if (error) throw error;
                
                select.innerHTML = '<option value="">اختر الأستاذ...</option>' + 
                    teachers.map(t => \`<option value="\${t.id}">\${t.full_name || 'بدون اسم'}</option>\`).join('');
                    
            } catch (err) {
                console.error("Error loading teachers:", err);
                select.innerHTML = '<option value="">خطأ في تحميل الأساتذة</option>';
            }
        }

        window.currentTeacherGroups = {};

        window.loadTeacherGroups = async function(teacherId) {
            const container = document.getElementById('groupsCardsContainer');
            if (!container) return;
            
            if (!teacherId) {
                container.innerHTML = \`
                    <div class="col-span-full text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 text-lg">
                        الرجاء اختيار أستاذ من القائمة أعلاه لعرض الأفواج
                    </div>
                \`;
                return;
            }
            
            container.innerHTML = '<div class="col-span-full text-center p-12 text-gray-500"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-3"></i> جاري تحميل الأفواج...</div>';
            if (window.lucide) lucide.createIcons();
            
            const supabase = window.supabaseClient || window.supabase;
            
            try {
                const { data: students, error } = await supabase
                    .from('students')
                    .select('*')
                    .eq('teacher_id', teacherId);
                    
                if (error) throw error;
                
                if (!students || students.length === 0) {
                    container.innerHTML = \`
                        <div class="col-span-full text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 text-lg">
                            لا توجد أفواج مسجلة لهذا الأستاذ
                        </div>
                    \`;
                    return;
                }
                
                // Group students by level and group_name
                window.currentTeacherGroups = {};
                students.forEach(s => {
                    const level = s.level || 'مستوى غير محدد';
                    const group = s.group_name || 'فوج غير محدد';
                    const key = \`\${level}-\${group}\`;
                    
                    if (!window.currentTeacherGroups[key]) {
                        window.currentTeacherGroups[key] = { level, group, students: [] };
                    }
                    window.currentTeacherGroups[key].students.push(s);
                });
                
                const keys = Object.keys(window.currentTeacherGroups).sort();
                let html = '';
                
                keys.forEach((key, index) => {
                    const g = window.currentTeacherGroups[key];
                    const detailsId = \`group-details-\${index}\`;
                    
                    html += \`
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col overflow-hidden">
                            <div class="p-6 flex-1 flex flex-col items-center text-center">
                                <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <i data-lucide="layers" class="w-7 h-7"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800 mb-1">\${g.level} - \${g.group}</h3>
                                
                                <div class="mt-4 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full w-full cursor-pointer transition shadow-sm" onclick="toggleGroupDetails('\${detailsId}')">
                                    <span class="bg-blue-500 px-2 py-0.5 rounded-full text-xs">\${g.students.length} طلاب</span>
                                    <span>عرض قائمة الطلاب</span>
                                    <i data-lucide="chevron-down" class="w-4 h-4 mr-auto"></i>
                                </div>
                            </div>
                            
                            <div id="\${detailsId}" class="hidden border-t border-gray-100 bg-gray-50 p-4 relative">
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-bold text-gray-700">قائمة الطلاب</h4>
                                    <button onclick="toggleGroupDetails('\${detailsId}')" class="text-gray-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm border border-gray-200 transition">
                                        <i data-lucide="x" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                <div class="overflow-x-auto custom-scrollbar">
                                    <table class="w-full text-sm text-right whitespace-nowrap">
                                        <thead class="text-gray-500 border-b border-gray-200">
                                            <tr>
                                                <th class="pb-2 pr-2 font-medium">#</th>
                                                <th class="pb-2 font-medium">الاسم</th>
                                                <th class="pb-2 font-medium">اللقب</th>
                                                <th class="pb-2 font-medium">تاريخ الميلاد</th>
                                                <th class="pb-2 font-medium">المكان</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200/50">
                                            \${g.students.map((st, i) => \`
                                                <tr class="hover:bg-white transition-colors">
                                                    <td class="py-2.5 pr-2 text-gray-400">\${i + 1}</td>
                                                    <td class="py-2.5 font-medium text-gray-800">\${st.first_name || '-'}</td>
                                                    <td class="py-2.5 font-medium text-gray-800">\${st.last_name || '-'}</td>
                                                    <td class="py-2.5 text-gray-500" dir="ltr" style="text-align: right">\${st.birth_date ? new Date(st.birth_date).toLocaleDateString('en-GB') : '-'}</td>
                                                    <td class="py-2.5 text-gray-500">\${st.birth_place || '-'}</td>
                                                </tr>
                                            \`).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    \`;
                });
                
                container.innerHTML = html;
                if (window.lucide) lucide.createIcons();
                
            } catch (err) {
                console.error("Error loading groups:", err);
                container.innerHTML = \`
                    <div class="col-span-full text-center p-12 bg-white rounded-xl shadow-sm border border-red-100 text-red-500">
                        حدث خطأ أثناء تحميل البيانات: \${err.message}
                    </div>
                \`;
            }
        }

        window.toggleGroupDetails = function(detailsId) {
            const detailsDiv = document.getElementById(detailsId);
            if (detailsDiv) {
                detailsDiv.classList.toggle('hidden');
            }
        }

        function renderAdminDashboard()`;

if(targetRegex.test(code)) {
    code = code.replace(targetRegex, replacement);
    fs.writeFileSync('index.html', code);
    console.log("Patched renderGroupsLevelsSection successfully");
} else {
    console.log("Regex not matched");
}
