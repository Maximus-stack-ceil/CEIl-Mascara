const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const certCode = `
        function renderCertificatesSection() {
            return \`
                <div class="max-w-6xl mx-auto" dir="rtl">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">توليد الشهادات</h2>
                    <p class="text-gray-500 mb-8">اختر الأستاذ، المستوى والفوج لعرض الطلاب الناجحين وتوليد شهاداتهم.</p>
                    
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">الأستاذ</label>
                                <select id="certTeacher" onchange="loadCertLevelsGroups()" class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="">جاري التحميل...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">المستوى</label>
                                <select id="certLevel" onchange="loadCertLevelsGroups()" class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="">اختر المستوى...</option>
                                    <option value="A1">A1</option>
                                    <option value="A2">A2</option>
                                    <option value="B1.1">B1.1</option>
                                    <option value="B1.2">B1.2</option>
                                    <option value="B2.1">B2.1</option>
                                    <option value="B2.2">B2.2</option>
                                    <option value="C1.1">C1.1</option>
                                    <option value="C1.2">C1.2</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">الفوج</label>
                                <select id="certGroup" onchange="loadCertificatesStudents()" class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled>
                                    <option value="">اختر الفوج...</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div id="certActionsContainer" class="hidden flex gap-4 mb-4">
                        <button onclick="generateWordCertificates()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition">
                            <i data-lucide="file-text" class="w-5 h-5"></i> 📄 توليد الشهادات (.docx)
                        </button>
                        <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition">
                            <i data-lucide="printer" class="w-5 h-5"></i> 🖨️ طباعة
                        </button>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm text-right">
                                <thead class="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                    <tr>
                                        <th class="px-6 py-4">الاسم</th>
                                        <th class="px-6 py-4">اللقب</th>
                                        <th class="px-6 py-4">المستوى</th>
                                        <th class="px-6 py-4">Moyen</th>
                                        <th class="px-6 py-4">Décision</th>
                                    </tr>
                                </thead>
                                <tbody id="certStudentsTableBody" class="divide-y divide-gray-100">
                                    <tr><td colspan="5" class="text-center p-8 text-gray-500">الرجاء اختيار الأستاذ، المستوى، والفوج.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            \`;
        }

        window.certStudentsList = [];
        window.certTeacherLanguage = '';

        async function loadCertificatesData() {
            const supabase = window.supabaseClient || window.supabase;
            const select = document.getElementById('certTeacher');
            if (!select) return;
            
            try {
                const { data: teachers, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .eq('role', 'teacher')
                    .order('full_name');
                    
                if (error) throw error;
                
                select.innerHTML = '<option value="">اختر الأستاذ...</option>' + 
                    teachers.map(t => \`<option value="\${t.id}" data-email="\${t.email || ''}">\${t.full_name || 'بدون اسم'}</option>\`).join('');
                    
            } catch (err) {
                console.error("Error loading teachers:", err);
                select.innerHTML = '<option value="">خطأ في تحميل الأساتذة</option>';
            }
            if (window.lucide) lucide.createIcons();
        }

        async function loadCertLevelsGroups() {
            const teacherId = document.getElementById('certTeacher').value;
            const level = document.getElementById('certLevel').value;
            const groupSelect = document.getElementById('certGroup');
            
            // Try to find teacher language
            window.certTeacherLanguage = '';
            if (teacherId) {
                try {
                    const supabase = window.supabaseClient || window.supabase;
                    const selectEl = document.getElementById('certTeacher');
                    const email = selectEl.options[selectEl.selectedIndex].getAttribute('data-email');
                    
                    if (email) {
                        const { data } = await supabase.from('teacher_requests').select('language').eq('email', email).limit(1);
                        if (data && data.length > 0) window.certTeacherLanguage = data[0].language;
                    }
                } catch(e) {}
            }
            
            if (!teacherId || !level) {
                groupSelect.innerHTML = '<option value="">اختر الفوج...</option>';
                groupSelect.disabled = true;
                return;
            }
            
            const supabase = window.supabaseClient || window.supabase;
            groupSelect.disabled = true;
            groupSelect.innerHTML = '<option value="">جاري التحميل...</option>';
            
            try {
                const { data: groups, error } = await supabase
                    .from('students')
                    .select('group_name')
                    .eq('teacher_id', teacherId)
                    .eq('level', level);
                    
                if (error) throw error;
                
                const uniqueGroups = [...new Set(groups.map(g => g.group_name))].filter(Boolean).sort();
                
                if (uniqueGroups.length > 0) {
                    groupSelect.innerHTML = '<option value="">اختر الفوج...</option>' + 
                        uniqueGroups.map(g => \`<option value="\${g}">\${g}</option>\`).join('');
                    groupSelect.disabled = false;
                } else {
                    groupSelect.innerHTML = '<option value="">لا توجد أفواج</option>';
                }
            } catch (err) {
                console.error("Error loading groups:", err);
                groupSelect.innerHTML = '<option value="">خطأ</option>';
            }
        }

        async function loadCertificatesStudents() {
            const teacherId = document.getElementById('certTeacher').value;
            const level = document.getElementById('certLevel').value;
            const group = document.getElementById('certGroup').value;
            const tbody = document.getElementById('certStudentsTableBody');
            const actionsContainer = document.getElementById('certActionsContainer');
            
            if (!teacherId || !level || !group) return;
            
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2"></i> جاري التحميل...</td></tr>';
            actionsContainer.classList.add('hidden');
            if (window.lucide) lucide.createIcons();
            
            const supabase = window.supabaseClient || window.supabase;
            
            try {
                const { data, error } = await supabase
                    .from('student_grades')
                    .select('*, students(first_name, last_name, birth_date, birth_place)')
                    .eq('teacher_id', teacherId)
                    .eq('level', level)
                    .eq('group_name', group)
                    .eq('decision', 'admis')
                    .gte('moyen', 10);
                    
                if (error) throw error;
                
                window.certStudentsList = data || [];
                
                if (window.certStudentsList.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center p-8 text-gray-500 text-lg">لا يوجد طلاب ناجحين في هذا الفوج</td></tr>';
                    return;
                }
                
                tbody.innerHTML = window.certStudentsList.map(item => {
                    const student = item.students || {};
                    return \`
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-medium text-gray-800">\${student.first_name || '-'}</td>
                            <td class="px-6 py-4 font-medium text-gray-800">\${student.last_name || '-'}</td>
                            <td class="px-6 py-4 text-gray-600">\${item.level || '-'}</td>
                            <td class="px-6 py-4 text-gray-600 font-bold">\${item.moyen || '-'}</td>
                            <td class="px-6 py-4"><span class="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold">\${item.decision || '-'}</span></td>
                        </tr>
                    \`;
                }).join('');
                
                actionsContainer.classList.remove('hidden');
                
            } catch (err) {
                console.error("Error loading students:", err);
                tbody.innerHTML = \`<tr><td colspan="5" class="text-center p-8 text-red-500">حدث خطأ أثناء تحميل البيانات: \${err.message}</td></tr>\`;
            }
        }

        async function generateWordCertificates() {
            if (!window.certStudentsList || window.certStudentsList.length === 0) return;
            
            const docChildren = [];
            const level = document.getElementById('certLevel').value;
            const language = window.certTeacherLanguage || "اللغة الأجنبية";
            
            window.certStudentsList.forEach((item, index) => {
                const student = item.students || {};
                
                if (index > 0) {
                    docChildren.push(new docx.Paragraph({
                        children: [new docx.PageBreak()]
                    }));
                }

                docChildren.push(
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "[شعار المركز]                      [شعار الجامعة]", bold: true, size: 28, rightToLeft: true })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "الجمهورية الجزائرية الديمقراطية الشعبية", bold: true, size: 24, rightToLeft: true })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "République Algérienne Démocratique et Populaire", bold: true, size: 24 })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "وزارة التعليم العالي و البحث العلمي", bold: true, size: 24, rightToLeft: true })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "Ministère de l'Enseignement Supérieur et de la Recherche Scientifique", bold: true, size: 24 })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "جامعة مصطفى اسطمبولي- معسكر", bold: true, size: 24, rightToLeft: true })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "Université Mustapha Stambouli- Mascara", bold: true, size: 24 })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "مركز التعليم المكثف للغات", bold: true, size: 24, rightToLeft: true })]
                    }),
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "Centre d'Enseignement Intensif des Langues", bold: true, size: 24 })]
                    }),
                    
                    new docx.Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
                    
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "رقم: ......../إن/م ت م ل/ج م س م/2026", bold: true, size: 28, rightToLeft: true })]
                    }),
                    
                    new docx.Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
                    
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.RIGHT,
                        spacing: { line: 400 },
                        children: [
                            new docx.TextRun({ text: "تشهد مسؤولة مركز التعليم المكثف للغات أن السيد (ة):", size: 32, rightToLeft: true }),
                            new docx.TextRun({ break: 1 }),
                            new docx.TextRun({ text: "الاسم و اللقب: " + (student.first_name || "") + " " + (student.last_name || ""), size: 32, bold: true, rightToLeft: true }),
                            new docx.TextRun({ break: 1 }),
                            new docx.TextRun({ text: "المولود(ة) في: " + (student.birth_date ? new Date(student.birth_date).toLocaleDateString('en-GB') : "-") + " بـ: " + (student.birth_place || "-"), size: 32, rightToLeft: true }),
                            new docx.TextRun({ break: 1 }),
                            new docx.TextRun({ text: "أكمل (ت) تكوين مستوى " + level + " في اللغة " + language, size: 32, rightToLeft: true }),
                            new docx.TextRun({ break: 1 }),
                            new docx.TextRun({ text: "خلال دورة أكتوبر (12/10/2025 إلى غاية 24/01/2026) في مركز التعليم المكثف للغات", size: 32, rightToLeft: true }),
                            new docx.TextRun({ break: 1 }),
                            new docx.TextRun({ text: "جامعة مصطفى اسطمبولي- معسكر", size: 32, rightToLeft: true }),
                            new docx.TextRun({ break: 1 }),
                            new docx.TextRun({ text: "تنبيه: لا تمنح إلا نسخة واحدة من هذه الشهادة", size: 24, italic: true, rightToLeft: true }),
                        ]
                    }),
                    
                    new docx.Paragraph({ text: "", spacing: { before: 800, after: 800 } }),
                    
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [new docx.TextRun({ text: "أكتوبر (12/10/2025 إلى غاية 24/01/2026)", size: 28, rightToLeft: true })]
                    })
                );
            });

            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: docChildren
                }]
            });

            const group = document.getElementById('certGroup').value;
            const blob = await docx.Packer.toBlob(doc);
            window.saveAs(blob, \`شهادات_\${level}_\${group}_\${new Date().toISOString().split('T')[0]}.docx\`);
        }
`;

const targetInsert = `        function renderAdminDashboard() {`;
if(code.includes(targetInsert)) {
    code = code.replace(targetInsert, certCode + '\n' + targetInsert);
    fs.writeFileSync('index.html', code);
    console.log("Patched Certs");
} else {
    console.log("Insert target not found");
}
