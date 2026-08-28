const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Add link to teacherLinks
if (!code.includes("showPage('agreements')")) {
    code = code.replace(
        "showPage('messages')",
        "showPage('agreements')\" class=\"flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-green-600 rounded-lg font-medium transition mb-1\"><i data-lucide=\"handshake\" class=\"w-5 h-5\"></i> الاتفاقيات</a>\n                <a href=\"#\" onclick=\"showPage('messages')"
    );
}

// 2. Add routing in showPage
if (!code.includes("pageName === 'agreements'")) {
    code = code.replace(
        "else if (pageName === 'exams') {",
        "else if (pageName === 'agreements') {\n                html = renderLayout(renderAgreementsSection(), 'teacher');\n                setTimeout(() => loadAgreementsTab(), 0);\n            } else if (pageName === 'exams') {"
    );
}

// 3. Define renderAgreementsSection and logic
const newSection = `
        let currentAgreementTab = 'agreements';
        let selectedAgreementId = '';
        let currentAgreementsList = [];
        let currentTraineesList = [];

        function renderAgreementsSection() {
            return \`
                <div class="max-w-6xl mx-auto" dir="rtl">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">إدارة الاتفاقيات</h2>
                            <p class="text-sm text-gray-500 mt-1">إدارة اتفاقيات التكوين مع الجهات الخارجية</p>
                        </div>
                    </div>

                    <div class="flex space-x-reverse space-x-2 border-b border-gray-200 mb-6 overflow-x-auto">
                        <button onclick="switchAgreementTab('agreements')" id="tabBtn_agreements" class="px-4 py-2 border-b-2 font-medium transition text-blue-600 border-blue-600 whitespace-nowrap">الاتفاقيات</button>
                        <button onclick="switchAgreementTab('trainees')" id="tabBtn_trainees" class="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition whitespace-nowrap">المتدربون</button>
                        <button onclick="switchAgreementTab('lessons')" id="tabBtn_lessons" class="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition whitespace-nowrap">الدروس</button>
                        <button onclick="switchAgreementTab('attendance')" id="tabBtn_attendance" class="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition whitespace-nowrap">الحضور</button>
                        <button onclick="switchAgreementTab('grades')" id="tabBtn_grades" class="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition whitespace-nowrap">الدرجات والتقارير</button>
                    </div>

                    <div id="agreementSelectorContainer" class="hidden mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
                        <label class="font-medium text-gray-700 whitespace-nowrap">اختر الاتفاقية:</label>
                        <select id="globalAgreementSelect" onchange="onAgreementChanged()" class="w-full md:flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
                            <option value="">-- اختر الاتفاقية أولاً --</option>
                        </select>
                    </div>

                    <!-- Tab: Agreements -->
                    <div id="tabContent_agreements" class="agreement-tab-content block">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">قائمة الاتفاقيات</h3>
                            <button onclick="openNewAgreementModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"><i data-lucide="plus" class="w-4 h-4"></i> اتفاقية جديدة</button>
                        </div>
                        <div id="agreementsListContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
                    </div>

                    <!-- Tab: Trainees -->
                    <div id="tabContent_trainees" class="agreement-tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">المتدربون</h3>
                            <button onclick="openNewTraineeModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"><i data-lucide="user-plus" class="w-4 h-4"></i> متدرب جديد</button>
                        </div>
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-right text-sm">
                                   <thead class="bg-gray-50 border-b border-gray-100 text-gray-600">
                                     <tr><th class="p-3">#</th><th class="p-3">الاسم واللقب</th><th class="p-3">المستوى</th><th class="p-3">الفوج</th><th class="p-3">تاريخ الميلاد</th><th class="p-3">إجراءات</th></tr>
                                   </thead>
                                   <tbody id="traineesTableBody" class="divide-y divide-gray-100"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Lessons -->
                    <div id="tabContent_lessons" class="agreement-tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">سجل الدروس</h3>
                            <button onclick="openNewAgreementLessonModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"><i data-lucide="plus" class="w-4 h-4"></i> درس جديد</button>
                        </div>
                        <div id="agreementLessonsListContainer" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                    </div>

                    <!-- Tab: Attendance -->
                    <div id="tabContent_attendance" class="agreement-tab-content hidden">
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
                            <div class="flex-1 w-full">
                                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الحضور</label>
                                <input type="date" id="attendanceDateInput" onchange="loadAttendanceTab()" class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <button onclick="saveAttendance()" class="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"><i data-lucide="save" class="w-4 h-4"></i> حفظ الحضور</button>
                        </div>
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-right text-sm">
                                   <thead class="bg-gray-50 border-b border-gray-100 text-gray-600">
                                     <tr><th class="p-3">الاسم واللقب</th><th class="p-3">المستوى</th><th class="p-3">الفوج</th><th class="p-3">الحالة</th><th class="p-3">ملاحظات</th></tr>
                                   </thead>
                                   <tbody id="attendanceTableBody" class="divide-y divide-gray-100"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Tab: Grades & Reports -->
                    <div id="tabContent_grades" class="agreement-tab-content hidden">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <h3 class="text-lg font-bold text-gray-800">الدرجات والتقارير</h3>
                            <div class="flex flex-wrap gap-2">
                                <button onclick="exportWord('trainees')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"><i data-lucide="file-text" class="w-4 h-4"></i> قائمة اسمية (Word)</button>
                                <button onclick="exportWord('attendance')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"><i data-lucide="file-text" class="w-4 h-4"></i> قائمة حضور (Word)</button>
                                <button onclick="exportWord('grades')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"><i data-lucide="file-text" class="w-4 h-4"></i> كشف الدرجات (Word)</button>
                            </div>
                        </div>
                        
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
                            <div class="flex-1 w-full">
                                <label class="block text-sm font-medium text-gray-700 mb-1">اسم الامتحان</label>
                                <input type="text" id="examNameInput" class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="مثال: امتحان نهاية الدورة">
                            </div>
                            <button onclick="saveGrades()" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"><i data-lucide="save" class="w-4 h-4"></i> حفظ الدرجات</button>
                        </div>
                        
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-right text-sm">
                                   <thead class="bg-gray-50 border-b border-gray-100 text-gray-600">
                                     <tr><th class="p-3">الاسم واللقب</th><th class="p-3">المستوى</th><th class="p-3">الفوج</th><th class="p-3">كتابي (20)</th><th class="p-3">شفوي (20)</th><th class="p-3">مشاركة (20)</th><th class="p-3">المعدل</th><th class="p-3">القرار</th></tr>
                                   </thead>
                                   <tbody id="gradesTableBody" class="divide-y divide-gray-100"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modals -->
                <!-- New Agreement Modal -->
                <div id="newAgreementModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 class="font-bold text-gray-800">إضافة اتفاقية جديدة</h3>
                            <button onclick="closeNewAgreementModal()" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="p-4 overflow-y-auto flex-1">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">اسم الجهة (Organization)</label>
                                    <input type="text" id="agr_org_name" class="w-full p-2 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">اسم المسؤول</label>
                                    <input type="text" id="agr_contact_person" class="w-full p-2 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">هاتف المسؤول</label>
                                    <input type="text" id="agr_contact_phone" dir="ltr" class="w-full p-2 border rounded-lg text-right">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                                    <input type="date" id="agr_start_date" class="w-full p-2 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                                    <input type="date" id="agr_end_date" class="w-full p-2 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">إجمالي الساعات</label>
                                    <input type="number" id="agr_total_hours" class="w-full p-2 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">اللغة</label>
                                    <select id="agr_language" class="w-full p-2 border rounded-lg">
                                        <option value="English">الإنجليزية</option>
                                        <option value="French">الفرنسية</option>
                                        <option value="German">الألمانية</option>
                                        <option value="Turkish">التركية</option>
                                        <option value="Spanish">الإسبانية</option>
                                    </select>
                                </div>
                                <div class="col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                                    <textarea id="agr_notes" rows="2" class="w-full p-2 border rounded-lg"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                            <button onclick="closeNewAgreementModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">إلغاء</button>
                            <button onclick="saveAgreement()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">حفظ الاتفاقية</button>
                        </div>
                    </div>
                </div>

                <!-- New Trainee Modal -->
                <div id="newTraineeModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div class="p-4 border-b flex justify-between bg-gray-50">
                            <h3 class="font-bold text-gray-800">إضافة متدرب جديد</h3>
                            <button onclick="closeNewTraineeModal()" class="text-gray-400"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="p-4 overflow-y-auto flex-1">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label class="block text-sm mb-1">الاسم</label><input type="text" id="tr_first_name" class="w-full p-2 border rounded-lg"></div>
                                <div><label class="block text-sm mb-1">اللقب</label><input type="text" id="tr_last_name" class="w-full p-2 border rounded-lg"></div>
                                <div><label class="block text-sm mb-1">تاريخ الميلاد</label><input type="date" id="tr_dob" class="w-full p-2 border rounded-lg"></div>
                                <div><label class="block text-sm mb-1">مكان الميلاد</label><input type="text" id="tr_pob" class="w-full p-2 border rounded-lg"></div>
                                <div><label class="block text-sm mb-1">المستوى</label>
                                     <select id="tr_level" class="w-full p-2 border rounded-lg">
                                        <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option>
                                        <option value="B2">B2</option><option value="C1">C1</option><option value="C2">C2</option>
                                     </select>
                                </div>
                                <div><label class="block text-sm mb-1">الفوج (Group)</label><input type="text" id="tr_group" class="w-full p-2 border rounded-lg"></div>
                                <div><label class="block text-sm mb-1">الهاتف</label><input type="text" id="tr_phone" dir="ltr" class="w-full p-2 border rounded-lg text-right"></div>
                                <div><label class="block text-sm mb-1">البريد الإلكتروني</label><input type="email" id="tr_email" dir="ltr" class="w-full p-2 border rounded-lg text-right"></div>
                            </div>
                        </div>
                        <div class="p-4 border-t flex justify-end gap-2 bg-gray-50">
                            <button onclick="closeNewTraineeModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">إلغاء</button>
                            <button onclick="saveTrainee()" class="bg-blue-600 text-white px-4 py-2 rounded-lg">حفظ المتدرب</button>
                        </div>
                    </div>
                </div>

                <!-- New Agreement Lesson Modal -->
                <div id="newAgreementLessonModal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div class="p-4 border-b flex justify-between bg-gray-50">
                            <h3 class="font-bold text-gray-800">إضافة درس جديد</h3>
                            <button onclick="closeNewAgreementLessonModal()" class="text-gray-400"><i data-lucide="x" class="w-5 h-5"></i></button>
                        </div>
                        <div class="p-4">
                            <div class="mb-4">
                                <label class="block text-sm font-medium mb-1">عنوان الدرس</label>
                                <input type="text" id="al_title" class="w-full p-2 border rounded-lg">
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium mb-1">الوصف / المحتوى</label>
                                <textarea id="al_desc" rows="3" class="w-full p-2 border rounded-lg"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">تاريخ الدرس</label>
                                    <input type="date" id="al_date" class="w-full p-2 border rounded-lg">
                                </div>
                            </div>
                        </div>
                        <div class="p-4 border-t flex justify-end gap-2 bg-gray-50">
                            <button onclick="closeNewAgreementLessonModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">إلغاء</button>
                            <button onclick="saveAgreementLesson()" class="bg-blue-600 text-white px-4 py-2 rounded-lg">حفظ الدرس</button>
                        </div>
                    </div>
                </div>
            \`;
        }

        // --- Logic ---
        function switchAgreementTab(tabId) {
            currentAgreementTab = tabId;
            document.querySelectorAll('.agreement-tab-content').forEach(el => el.classList.add('hidden'));
            const targetContent = document.getElementById('tabContent_' + tabId);
            if(targetContent) targetContent.classList.remove('hidden');

            document.querySelectorAll('[id^="tabBtn_"]').forEach(el => {
                el.className = 'px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition whitespace-nowrap';
            });
            const activeBtn = document.getElementById('tabBtn_' + tabId);
            if(activeBtn) activeBtn.className = 'px-4 py-2 border-b-2 font-medium transition text-blue-600 border-blue-600 whitespace-nowrap';

            if (tabId === 'agreements') {
                document.getElementById('agreementSelectorContainer').classList.add('hidden');
                loadAgreementsTab();
            } else {
                document.getElementById('agreementSelectorContainer').classList.remove('hidden');
                refreshGlobalAgreementSelect();
                onAgreementChanged();
            }
        }

        function refreshGlobalAgreementSelect() {
            const select = document.getElementById('globalAgreementSelect');
            if(!select) return;
            select.innerHTML = '<option value="">-- اختر الاتفاقية أولاً --</option>' + 
                currentAgreementsList.map(a => \`<option value="\${a.id}" \${a.id === selectedAgreementId ? 'selected' : ''}>\${a.organization_name} - \${a.language}</option>\`).join('');
        }

        function onAgreementChanged() {
            selectedAgreementId = document.getElementById('globalAgreementSelect')?.value || '';
            if (!selectedAgreementId) {
                document.getElementById('traineesTableBody').innerHTML = '<tr><td colspan="6" class="text-center p-8 text-gray-500">الرجاء اختيار اتفاقية</td></tr>';
                document.getElementById('agreementLessonsListContainer').innerHTML = '<div class="col-span-2 text-center p-8 text-gray-500">الرجاء اختيار اتفاقية</div>';
                document.getElementById('attendanceTableBody').innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">الرجاء اختيار اتفاقية</td></tr>';
                document.getElementById('gradesTableBody').innerHTML = '<tr><td colspan="8" class="text-center p-8 text-gray-500">الرجاء اختيار اتفاقية</td></tr>';
                return;
            }
            if (currentAgreementTab === 'trainees') loadTraineesTab();
            else if (currentAgreementTab === 'lessons') loadLessonsTab();
            else if (currentAgreementTab === 'attendance') loadAttendanceTab();
            else if (currentAgreementTab === 'grades') loadGradesTab();
        }

        function manageTraineesForAgreement(id) {
            selectedAgreementId = id;
            switchAgreementTab('trainees');
        }

        async function loadAgreementsTab() {
            if(!userProfile) return;
            const container = document.getElementById('agreementsListContainer');
            container.innerHTML = '<div class="col-span-full text-center p-8 text-gray-500">جاري التحميل...</div>';
            try {
                const { data: agreements, error } = await supabaseClient
                    .from('agreements')
                    .select('*')
                    .eq('teacher_id', userProfile.id)
                    .order('created_at', { ascending: false });
                
                if (error && error.code !== '42P01') throw error;
                currentAgreementsList = agreements || [];
                
                if (currentAgreementsList.length === 0) {
                    container.innerHTML = '<div class="col-span-full text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">لا توجد اتفاقيات حالياً. أضف اتفاقية جديدة للبدء.</div>';
                    return;
                }
                
                container.innerHTML = currentAgreementsList.map(a => \`
                    <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div class="flex justify-between items-start mb-3">
                            <h4 class="font-bold text-lg text-gray-800">\${a.organization_name}</h4>
                            <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">\${a.language}</span>
                        </div>
                        <div class="space-y-2 text-sm text-gray-600 mb-4">
                            <p class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4"></i> \${a.contact_person || '-'} (\${a.contact_phone || '-'})</p>
                            <p class="flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4"></i> \${a.start_date} إلى \${a.end_date}</p>
                            <p class="flex items-center gap-2"><i data-lucide="clock" class="w-4 h-4"></i> \${a.total_hours} ساعة</p>
                        </div>
                        <div class="flex gap-2 pt-3 border-t border-gray-50">
                            <button onclick="manageTraineesForAgreement('\${a.id}')" class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition">إدارة المتدربين</button>
                            <button onclick="deleteAgreement('\${a.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition" title="حذف"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                \`).join('');
                if (window.lucide) lucide.createIcons();
            } catch (err) {
                console.error(err);
                container.innerHTML = '<div class="col-span-full text-center p-4 text-red-500">حدث خطأ. قد لا تكون الجداول مهيأة.</div>';
            }
        }

        function openNewAgreementModal() { document.getElementById('newAgreementModal').classList.remove('hidden'); }
        function closeNewAgreementModal() { document.getElementById('newAgreementModal').classList.add('hidden'); }

        async function saveAgreement() {
            const data = {
                teacher_id: userProfile.id,
                organization_name: document.getElementById('agr_org_name').value,
                contact_person: document.getElementById('agr_contact_person').value,
                contact_phone: document.getElementById('agr_contact_phone').value,
                start_date: document.getElementById('agr_start_date').value,
                end_date: document.getElementById('agr_end_date').value,
                total_hours: parseInt(document.getElementById('agr_total_hours').value) || 0,
                language: document.getElementById('agr_language').value,
                notes: document.getElementById('agr_notes').value
            };
            if(!data.organization_name) return alert('اسم الجهة مطلوب');
            
            try {
                await supabaseClient.from('agreements').insert([data]);
                closeNewAgreementModal();
                loadAgreementsTab();
            } catch(e) {
                console.error(e); alert('خطأ في الحفظ');
            }
        }

        async function deleteAgreement(id) {
            if(!confirm('هل أنت متأكد من حذف هذه الاتفاقية وكل بياناتها؟')) return;
            try {
                await supabaseClient.from('agreements').delete().eq('id', id);
                loadAgreementsTab();
            } catch(e) {
                console.error(e);
            }
        }

        function openNewTraineeModal() { document.getElementById('newTraineeModal').classList.remove('hidden'); }
        function closeNewTraineeModal() { document.getElementById('newTraineeModal').classList.add('hidden'); }

        async function loadTraineesTab() {
            const tbody = document.getElementById('traineesTableBody');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center p-8">جاري التحميل...</td></tr>';
            try {
                const { data, error } = await supabaseClient
                    .from('agreement_trainees')
                    .select('*')
                    .eq('agreement_id', selectedAgreementId)
                    .order('level').order('group_name').order('last_name');
                if (error && error.code !== '42P01') throw error;
                currentTraineesList = data || [];
                
                if (currentTraineesList.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center p-8 text-gray-500">لا يوجد متدربون.</td></tr>';
                    return;
                }
                
                tbody.innerHTML = currentTraineesList.map((t, idx) => \`
                    <tr class="hover:bg-gray-50">
                        <td class="p-3">\${idx + 1}</td>
                        <td class="p-3 font-medium">\${t.first_name} \${t.last_name}</td>
                        <td class="p-3"><span class="bg-gray-100 px-2 py-1 rounded text-xs font-bold">\${t.level || '-'}</span></td>
                        <td class="p-3">\${t.group_name || '-'}</td>
                        <td class="p-3 text-gray-500">\${t.birth_date || '-'}</td>
                        <td class="p-3">
                            <button onclick="deleteTrainee('\${t.id}')" class="text-red-500 hover:bg-red-50 p-1 rounded transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </td>
                    </tr>
                \`).join('');
                if(window.lucide) lucide.createIcons();
            } catch(e) {
                console.error(e);
                tbody.innerHTML = '<tr><td colspan="6" class="text-center p-8 text-red-500">خطأ في الجلب</td></tr>';
            }
        }

        async function saveTrainee() {
            const data = {
                agreement_id: selectedAgreementId,
                first_name: document.getElementById('tr_first_name').value,
                last_name: document.getElementById('tr_last_name').value,
                birth_date: document.getElementById('tr_dob').value,
                birth_place: document.getElementById('tr_pob').value,
                level: document.getElementById('tr_level').value,
                group_name: document.getElementById('tr_group').value,
                phone: document.getElementById('tr_phone').value,
                email: document.getElementById('tr_email').value
            };
            if(!data.first_name || !data.last_name || !selectedAgreementId) return alert('البيانات الأساسية مطلوبة');
            try {
                await supabaseClient.from('agreement_trainees').insert([data]);
                closeNewTraineeModal();
                loadTraineesTab();
            } catch(e) {
                console.error(e); alert('خطأ في الحفظ');
            }
        }
        
        async function deleteTrainee(id) {
            if(!confirm('متأكد من الحذف؟')) return;
            try {
                await supabaseClient.from('agreement_trainees').delete().eq('id', id);
                loadTraineesTab();
            } catch(e) {}
        }

        function openNewAgreementLessonModal() { document.getElementById('newAgreementLessonModal').classList.remove('hidden'); }
        function closeNewAgreementLessonModal() { document.getElementById('newAgreementLessonModal').classList.add('hidden'); }

        async function loadLessonsTab() {
            const container = document.getElementById('agreementLessonsListContainer');
            container.innerHTML = '<div class="col-span-full text-center p-8">جاري التحميل...</div>';
            try {
                const { data, error } = await supabaseClient
                    .from('agreement_lessons')
                    .select('*')
                    .eq('agreement_id', selectedAgreementId)
                    .order('lesson_date', { ascending: false });
                if (error && error.code !== '42P01') throw error;
                if (!data || data.length === 0) {
                    container.innerHTML = '<div class="col-span-full text-center p-8 text-gray-500">لا يوجد دروس مسجلة.</div>';
                    return;
                }
                container.innerHTML = data.map(l => \`
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="flex justify-between mb-2">
                            <h4 class="font-bold text-gray-800">\${l.title}</h4>
                            <span class="text-sm text-gray-500">\${l.lesson_date}</span>
                        </div>
                        <p class="text-sm text-gray-600">\${l.description || 'لا يوجد وصف'}</p>
                    </div>
                \`).join('');
            } catch(e) {
                console.error(e);
            }
        }

        async function saveAgreementLesson() {
            const d = new Date(document.getElementById('al_date').value || new Date());
            const data = {
                agreement_id: selectedAgreementId,
                teacher_id: userProfile.id,
                title: document.getElementById('al_title').value,
                description: document.getElementById('al_desc').value,
                lesson_date: document.getElementById('al_date').value,
                month: d.getMonth() + 1,
                year: d.getFullYear()
            };
            if(!data.title || !selectedAgreementId) return alert('البيانات الأساسية مطلوبة');
            try {
                await supabaseClient.from('agreement_lessons').insert([data]);
                closeNewAgreementLessonModal();
                loadLessonsTab();
            } catch(e) {
                console.error(e);
            }
        }

        async function loadAttendanceTab() {
            const tbody = document.getElementById('attendanceTableBody');
            const dateInput = document.getElementById('attendanceDateInput');
            if(!dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
            
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8">جاري التحميل...</td></tr>';
            try {
                const { data: trainees } = await supabaseClient.from('agreement_trainees').select('*').eq('agreement_id', selectedAgreementId).order('level').order('last_name');
                if(!trainees || trainees.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500">لا يوجد متدربون</td></tr>';
                    return;
                }
                currentTraineesList = trainees;
                tbody.innerHTML = trainees.map(t => \`
                    <tr>
                        <td class="p-3 font-medium">\${t.first_name} \${t.last_name}</td>
                        <td class="p-3">\${t.level || '-'}</td>
                        <td class="p-3">\${t.group_name || '-'}</td>
                        <td class="p-3">
                            <div class="flex gap-4">
                                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_\${t.id}" value="present" checked class="text-green-600 focus:ring-green-500"> حاضر</label>
                                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_\${t.id}" value="absent" class="text-red-600 focus:ring-red-500"> غائب</label>
                                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_\${t.id}" value="excused" class="text-orange-600 focus:ring-orange-500"> مبرر</label>
                            </div>
                        </td>
                        <td class="p-3">
                            <input type="text" id="note_\${t.id}" class="w-full p-1 border rounded text-sm" placeholder="ملاحظة...">
                        </td>
                    </tr>
                \`).join('');
            } catch(e) {
                console.error(e);
            }
        }

        async function saveAttendance() {
            const date = document.getElementById('attendanceDateInput').value;
            if(!date || !selectedAgreementId || currentTraineesList.length === 0) return;
            const records = currentTraineesList.map(t => {
                const status = document.querySelector(\`input[name="att_\${t.id}"]:checked\`)?.value || 'present';
                const notes = document.getElementById(\`note_\${t.id}\`)?.value || '';
                return { agreement_id: selectedAgreementId, trainee_id: t.id, attendance_date: date, status, notes };
            });
            try {
                await supabaseClient.from('agreement_attendance').insert(records);
                alert('تم حفظ الحضور بنجاح');
            } catch(e) {
                console.error(e); alert('حدث خطأ');
            }
        }

        async function loadGradesTab() {
            const tbody = document.getElementById('gradesTableBody');
            tbody.innerHTML = '<tr><td colspan="8" class="text-center p-8">جاري التحميل...</td></tr>';
            try {
                const { data: trainees } = await supabaseClient.from('agreement_trainees').select('*').eq('agreement_id', selectedAgreementId).order('level').order('last_name');
                if(!trainees || trainees.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="8" class="text-center p-8 text-gray-500">لا يوجد متدربون</td></tr>';
                    return;
                }
                currentTraineesList = trainees;
                tbody.innerHTML = trainees.map(t => \`
                    <tr data-trainee-id="\${t.id}">
                        <td class="p-3 font-medium">\${t.first_name} \${t.last_name}</td>
                        <td class="p-3">\${t.level || '-'}</td>
                        <td class="p-3">\${t.group_name || '-'}</td>
                        <td class="p-3"><input type="number" step="0.25" min="0" max="20" class="grade-written w-16 p-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-center" oninput="calcAvg('\${t.id}')"></td>
                        <td class="p-3"><input type="number" step="0.25" min="0" max="20" class="grade-oral w-16 p-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-center" oninput="calcAvg('\${t.id}')"></td>
                        <td class="p-3"><input type="number" step="0.25" min="0" max="20" class="grade-part w-16 p-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-center" oninput="calcAvg('\${t.id}')"></td>
                        <td class="p-3 font-bold" id="avg_\${t.id}">-</td>
                        <td class="p-3 font-bold" id="decision_\${t.id}">-</td>
                    </tr>
                \`).join('');
            } catch(e) {
                console.error(e);
            }
        }

        function calcAvg(id) {
            const row = document.querySelector(\`tr[data-trainee-id="\${id}"]\`);
            if(!row) return;
            const w = parseFloat(row.querySelector('.grade-written').value) || 0;
            const o = parseFloat(row.querySelector('.grade-oral').value) || 0;
            const p = parseFloat(row.querySelector('.grade-part').value) || 0;
            const avg = ((w + o + p) / 3).toFixed(2);
            row.querySelector(\`#avg_\${id}\`).innerText = avg;
            const decEl = row.querySelector(\`#decision_\${id}\`);
            if (avg >= 10) {
                decEl.innerText = 'Admis';
                decEl.className = 'p-3 font-bold text-green-600';
            } else {
                decEl.innerText = 'Adjournée';
                decEl.className = 'p-3 font-bold text-red-600';
            }
        }

        async function saveGrades() {
            const examName = document.getElementById('examNameInput').value;
            if(!examName || !selectedAgreementId) return alert('اسم الامتحان مطلوب');
            
            const records = currentTraineesList.map(t => {
                const row = document.querySelector(\`tr[data-trainee-id="\${t.id}"]\`);
                const w = parseFloat(row.querySelector('.grade-written').value) || 0;
                const o = parseFloat(row.querySelector('.grade-oral').value) || 0;
                const p = parseFloat(row.querySelector('.grade-part').value) || 0;
                return {
                    agreement_id: selectedAgreementId,
                    trainee_id: t.id,
                    exam_name: examName,
                    written_score: w,
                    oral_score: o,
                    participation_score: p
                };
            });
            try {
                await supabaseClient.from('agreement_grades').insert(records);
                alert('تم حفظ الدرجات بنجاح');
            } catch(e) { console.error(e); alert('خطأ في الحفظ'); }
        }

        // --- Word Export using docx.js ---
        async function exportWord(type) {
            if(!selectedAgreementId) return alert('الرجاء اختيار اتفاقية أولاً');
            const agreement = currentAgreementsList.find(a => a.id === selectedAgreementId);
            if(!agreement) return;

            const { Document, Packer, Paragraph, Table, TableRow, TableCell, AlignmentType, TextRun, WidthType, BorderStyle } = window.docx;
            if(!Document) return alert('مكتبة docx غير متوفرة');

            let titleText = type === 'trainees' ? "القائمة الاسمية" : type === 'attendance' ? "قائمة الحضور" : "كشف الدرجات";
            let headers = [];
            let rowsData = [];

            if(type === 'trainees') {
                headers = ["الرقم", "الاسم واللقب", "تاريخ الميلاد", "مكان الميلاد", "المستوى", "الفوج"];
                rowsData = currentTraineesList.map((t, i) => [
                    (i+1).toString(), t.first_name + ' ' + t.last_name, t.birth_date || '', t.birth_place || '', t.level || '', t.group_name || ''
                ]);
            } else if (type === 'attendance') {
                const date = document.getElementById('attendanceDateInput')?.value || '';
                titleText += date ? \` (\${date})\` : '';
                headers = ["الرقم", "الاسم واللقب", "الحالة", "الملاحظات"];
                rowsData = currentTraineesList.map((t, i) => {
                    const statusVal = document.querySelector(\`input[name="att_\${t.id}"]:checked\`)?.value;
                    const statusStr = statusVal === 'present' ? 'حاضر' : statusVal === 'absent' ? 'غائب' : statusVal === 'excused' ? 'مبرر' : '';
                    const note = document.getElementById(\`note_\${t.id}\`)?.value || '';
                    return [(i+1).toString(), t.first_name + ' ' + t.last_name, statusStr, note];
                });
            } else if (type === 'grades') {
                const examName = document.getElementById('examNameInput')?.value || '';
                titleText += examName ? \` - \${examName}\` : '';
                headers = ["الرقم", "الاسم واللقب", "كتابي", "شفوي", "مشاركة", "المعدل", "القرار"];
                rowsData = currentTraineesList.map((t, i) => {
                    const row = document.querySelector(\`tr[data-trainee-id="\${t.id}"]\`);
                    const w = row?.querySelector('.grade-written')?.value || '0';
                    const o = row?.querySelector('.grade-oral')?.value || '0';
                    const p = row?.querySelector('.grade-part')?.value || '0';
                    const avg = row?.querySelector(\`#avg_\${t.id}\`)?.innerText || '0';
                    const dec = row?.querySelector(\`#decision_\${t.id}\`)?.innerText || '';
                    return [(i+1).toString(), t.first_name + ' ' + t.last_name, w, o, p, avg, dec];
                });
            }

            const headerRow = new TableRow({
                children: headers.map(h => new TableCell({
                    children: [new Paragraph({ text: h, alignment: AlignmentType.CENTER, bold: true })],
                    shading: { fill: "F3F4F6" },
                    margins: { top: 100, bottom: 100, right: 100, left: 100 }
                }))
            });

            const dataRows = rowsData.map(rowData => new TableRow({
                children: rowData.map(cellText => new TableCell({
                    children: [new Paragraph({ text: cellText, alignment: AlignmentType.CENTER })],
                    margins: { top: 100, bottom: 100, right: 100, left: 100 }
                }))
            }));

            const doc = new Document({
                sections: [{
                    properties: { dir: "rtl" },
                    children: [
                        new Paragraph({ text: "مركز التعليم المكثف للغات", alignment: AlignmentType.CENTER, style: "Heading1" }),
                        new Paragraph({ text: titleText, alignment: AlignmentType.CENTER, style: "Heading2", spacing: { after: 400 } }),
                        new Paragraph({ text: \`الجهة: \${agreement.organization_name}\`, alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: \`اللغة: \${agreement.language}\`, alignment: AlignmentType.RIGHT, spacing: { after: 400 } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [headerRow, ...dataRows]
                        })
                    ]
                }]
            });

            try {
                const blob = await window.docx.Packer.toBlob(doc);
                window.saveAs(blob, \`\${titleText}_\${agreement.organization_name}_\${new Date().toISOString().split('T')[0]}.docx\`);
            } catch(e) {
                console.error("Docx Error:", e);
                alert("حدث خطأ أثناء تصدير الملف.");
            }
        }

`;

if (!code.includes("function renderAgreementsSection()")) {
    code = code.replace("function renderTeacherDashboard() {", newSection + "        function renderTeacherDashboard() {");
}

fs.writeFileSync('index.html', code);
