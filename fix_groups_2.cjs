const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const startStr = '        window.loadTeacherGroups = async function(teacherId) {';
const endStr = '                            } catch (err) {';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find boundaries", startIdx, endIdx);
    process.exit(1);
}

const newBody = `        window.loadTeacherGroups = async function(teacherId) {
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
            
            const supabase = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;
            
            try {
                // 1. Fetch normal students
                const { data: students, error: studentsError } = await supabase
                    .from('students')
                    .select('*')
                    .eq('teacher_id', teacherId)
                    .order('created_at', { ascending: false });
                
                if (studentsError) throw studentsError;

                // 2. Fetch agreements for this teacher
                const { data: agreements, error: agrError } = await supabase
                    .from('agreements')
                    .select('*')
                    .eq('teacher_id', teacherId);
                
                if (agrError) throw agrError;

                let trainees = [];
                if (agreements && agreements.length > 0) {
                    const agrIds = agreements.map(a => a.id);
                    // 3. Fetch trainees for these agreements
                    const { data: trData, error: trError } = await supabase
                        .from('agreement_trainees')
                        .select('*, agreements:agreement_id(organization_name)')
                        .in('agreement_id', agrIds)
                        .order('created_at', { ascending: false });
                    
                    if (trError) throw trError;
                    if (trData) trainees = trData;
                }

                if ((!students || students.length === 0) && (!trainees || trainees.length === 0)) {
                    container.innerHTML = \`
                        <div class="col-span-full text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 text-lg">
                            لا توجد أفواج مسجلة لهذا الأستاذ
                        </div>
                    \`;
                    return;
                }
                
                // Group normal students
                window.currentTeacherGroups = {};
                (students || []).forEach(s => {
                    const level = s.level || 'مستوى غير محدد';
                    const group = s.group_name || 'فوج غير محدد';
                    const key = \`\${level}-\${group}\`;
                    
                    if (!window.currentTeacherGroups[key]) {
                        window.currentTeacherGroups[key] = { type: 'normal', level, group, students: [] };
                    }
                    window.currentTeacherGroups[key].students.push(s);
                });

                // Group agreement trainees separately
                (trainees || []).forEach(t => {
                    const level = t.level || 'مستوى غير محدد';
                    const group = t.group_name || 'فوج غير محدد';
                    const orgName = t.agreements?.organization_name || 'اتفاقية';
                    const key = \`agr-\${t.agreement_id}-\${level}-\${group}\`;
                    
                    if (!window.currentTeacherGroups[key]) {
                        window.currentTeacherGroups[key] = { type: 'agreement', orgName, level, group, students: [] };
                    }
                    window.currentTeacherGroups[key].students.push({
                        first_name: t.first_name,
                        last_name: t.last_name,
                        birth_date: t.birth_date,
                        location: t.birth_place || '-',
                        isAgreement: true,
                        organization_name: orgName
                    });
                });
                
                const keys = Object.keys(window.currentTeacherGroups).sort();
                let html = '';
                
                keys.forEach((key, index) => {
                    const g = window.currentTeacherGroups[key];
                    const detailsId = \`group-details-\${index}\`;
                    const isAgr = g.type === 'agreement';
                    const iconColor = isAgr ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50';
                    const btnColor = isAgr ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700';
                    const badgeColor = isAgr ? 'bg-emerald-500' : 'bg-blue-500';
                    const titleStr = isAgr ? \`\${g.level} - \${g.group}\` : \`\${g.level} - \${g.group}\`;
                    
                    html += \`
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col overflow-hidden">
                            <div class="p-6 flex-1 flex flex-col items-center text-center">
                                <div class="w-14 h-14 \${iconColor} rounded-full flex items-center justify-center mb-4">
                                    <i data-lucide="\${isAgr ? 'briefcase' : 'layers'}" class="w-7 h-7"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800 mb-1">\${titleStr}</h3>
                                \${isAgr ? \`<span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full mt-1 mb-2">متدربي \${g.orgName}</span>\` : ''}
                                
                                <div class="\${isAgr ? 'mt-2' : 'mt-auto'} inline-flex items-center justify-center gap-2 \${btnColor} text-white text-sm font-bold px-4 py-2 rounded-full w-full cursor-pointer transition shadow-sm" onclick="toggleGroupDetails('\${detailsId}')">
                                    <span class="\${badgeColor} px-2 py-0.5 rounded-full text-xs">\${g.students.length} \${isAgr ? 'متدرب' : 'طالب'}</span>
                                    <span>عرض القائمة</span>
                                    <i data-lucide="chevron-down" class="w-4 h-4 mr-auto"></i>
                                </div>
                            </div>
                            
                            <div id="\${detailsId}" class="hidden border-t border-gray-100 bg-gray-50 p-4 relative">
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-bold text-gray-700">قائمة \${isAgr ? 'المتدربين' : 'الطلاب'}</h4>
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
                                                    <td class="py-2.5 text-gray-500">\${st.location || '-'}</td>
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
`;

content = content.substring(0, startIdx) + newBody + content.substring(endIdx);
fs.writeFileSync('index.html', content);
console.log('done');
