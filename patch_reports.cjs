const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regexCertMenu = /<a href="#" onclick="showPage\('certificates'\)"[^>]*>[\s\S]*?<\/a>/;
if(code.match(regexCertMenu)) {
    const reportsMenu = `<a href="#" onclick="showPage('reports')" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg font-medium transition mb-1"><i data-lucide="pie-chart" class="w-5 h-5"></i> التقارير والإحصائيات</a>`;
    code = code.replace(regexCertMenu, match => match + '\n                ' + reportsMenu);
}

const showPageRegex = /} else if \(pageName === 'certificates'\) \{([\s\S]*?)\} else if \(pageName === 'teacherDashboard'\) \{/;
if(code.match(showPageRegex)) {
    code = code.replace(showPageRegex, (match, p1) => {
        return `} else if (pageName === 'certificates') {${p1}} else if (pageName === 'reports') {
                html = renderLayout(renderReportsSection(), 'admin');
                setTimeout(() => loadReportsData(), 0);
            } else if (pageName === 'teacherDashboard') {`;
    });
}

const functionInjectRegex = /function renderAdminDashboard\(\) \{/;
const reportsFunction = `
        let currentReportTab = 'students';

        function switchReportTab(tab) {
            currentReportTab = tab;
            document.querySelectorAll('.report-tab-btn').forEach(btn => {
                btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
                btn.classList.add('text-gray-500');
            });
            const activeBtn = document.getElementById(\`tab-btn-\${tab}\`);
            if(activeBtn) {
                activeBtn.classList.remove('text-gray-500');
                activeBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
            }

            document.querySelectorAll('.report-tab-content').forEach(c => {
                c.classList.add('hidden');
                c.classList.remove('block');
            });
            const tabContent = document.getElementById(\`tab-\${tab}\`);
            if(tabContent) {
                tabContent.classList.remove('hidden');
                tabContent.classList.add('block');
            }
        }

        async function loadReportsData() {
            const loader = document.getElementById('reportsLoader');
            const content = document.getElementById('reportsContent');
            if (!loader || !content) return;
            
            loader.classList.remove('hidden');
            loader.classList.add('flex');
            content.classList.add('hidden');
            
            try {
                const supabase = window.supabaseClient || window.supabase;
                
                // 1. Students Report
                const { data: students } = await supabase.from('students').select('*');
                if (students) {
                    const totalStudents = students.length;
                    const byLang = {};
                    const byLevel = {};
                    const byGroup = {};
                    
                    students.forEach(s => {
                        const lang = s.language || 'غير محدد';
                        const lvl = s.level || 'غير محدد';
                        const grp = s.group_name || 'غير محدد';
                        
                        byLang[lang] = (byLang[lang] || 0) + 1;
                        byLevel[lvl] = (byLevel[lvl] || 0) + 1;
                        byGroup[grp] = (byGroup[grp] || 0) + 1;
                    });
                    
                    document.getElementById('studentsStatsCards').innerHTML = \`
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">إجمالي الطلاب</p>
                            <h3 class="text-3xl font-bold text-blue-600">\${totalStudents}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">عدد اللغات</p>
                            <h3 class="text-3xl font-bold text-indigo-600">\${Object.keys(byLang).length}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">عدد المستويات</p>
                            <h3 class="text-3xl font-bold text-green-600">\${Object.keys(byLevel).length}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">عدد الأفواج</p>
                            <h3 class="text-3xl font-bold text-purple-600">\${Object.keys(byGroup).length}</h3>
                        </div>
                    \`;
                    
                    let tableHTML = \`<table class="w-full text-sm text-right"><thead class="bg-gray-50 text-gray-600 border-b"><tr><th class="px-4 py-3">المستوى</th><th class="px-4 py-3">الفوج</th><th class="px-4 py-3">العدد</th></tr></thead><tbody class="divide-y divide-gray-100">\`;
                    const levelGroupCount = {};
                    students.forEach(s => {
                        const key = (s.level||'-') + '|||' + (s.group_name||'-');
                        levelGroupCount[key] = (levelGroupCount[key] || 0) + 1;
                    });
                    Object.entries(levelGroupCount).forEach(([key, count]) => {
                        const [l, g] = key.split('|||');
                        tableHTML += \`<tr><td class="px-4 py-3 font-medium">\${l}</td><td class="px-4 py-3 text-gray-600">\${g}</td><td class="px-4 py-3 text-blue-600 font-bold">\${count}</td></tr>\`;
                    });
                    tableHTML += \`</tbody></table>\`;
                    document.getElementById('studentsTableContainer').innerHTML = tableHTML;
                    
                    if (totalStudents > 0) {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
                        let conicStr = [];
                        let currentDeg = 0;
                        let legendHTML = '<div class="mt-4 w-full flex flex-wrap gap-3 justify-center">';
                        let i = 0;
                        Object.entries(byLang).forEach(([lang, count]) => {
                            const pct = (count / totalStudents) * 100;
                            const deg = (pct / 100) * 360;
                            const color = colors[i % colors.length];
                            conicStr.push(\`\${color} \${currentDeg}deg \${currentDeg + deg}deg\`);
                            currentDeg += deg;
                            legendHTML += \`<div class="flex items-center gap-1 text-xs"><span class="w-3 h-3 rounded-full block" style="background:\${color}"></span>\${lang} (\${count})</div>\`;
                            i++;
                        });
                        legendHTML += '</div>';
                        document.getElementById('studentsChartContainer').innerHTML = \`
                            <div class="w-40 h-40 rounded-full" style="background: conic-gradient(\${conicStr.join(', ')})"></div>
                            \${legendHTML}
                        \`;
                    } else {
                        document.getElementById('studentsChartContainer').innerHTML = '<p class="text-gray-400">لا توجد بيانات</p>';
                    }
                }

                // 2. Attendance Report
                const { data: attendance } = await supabase.from('attendance').select('*');
                if (attendance) {
                    const totalRecords = attendance.length;
                    const present = attendance.filter(a => a.status === 'present').length;
                    const absent = attendance.filter(a => a.status === 'absent').length;
                    const withdrawn = attendance.filter(a => a.status === 'withdrawn').length;
                    
                    document.getElementById('attendanceStatsCards').innerHTML = \`
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">إجمالي السجلات</p>
                            <h3 class="text-3xl font-bold text-gray-800">\${totalRecords}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">حاضر</p>
                            <h3 class="text-3xl font-bold text-green-600">\${present}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">غائب</p>
                            <h3 class="text-3xl font-bold text-red-600">\${absent}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">متخلي</p>
                            <h3 class="text-3xl font-bold text-orange-500">\${withdrawn}</h3>
                        </div>
                    \`;
                    
                    const groupAtt = {};
                    attendance.forEach(a => {
                        const g = a.group_name || 'غير محدد';
                        if(!groupAtt[g]) groupAtt[g] = { total: 0, present: 0 };
                        groupAtt[g].total++;
                        if(a.status === 'present') groupAtt[g].present++;
                    });
                    
                    let barsHTML = '';
                    Object.entries(groupAtt).forEach(([g, stats]) => {
                        const pct = Math.round((stats.present / stats.total) * 100) || 0;
                        barsHTML += \`
                            <div class="flex flex-col items-center flex-1 min-w-[40px] group">
                                <span class="text-xs text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition">\${pct}%</span>
                                <div class="w-full max-w-[40px] bg-blue-100 rounded-t-sm relative h-48 flex items-end">
                                    <div class="w-full bg-blue-500 rounded-t-sm transition-all duration-500" style="height: \${pct}%"></div>
                                </div>
                                <span class="text-xs text-gray-600 mt-2 truncate max-w-full" title="\${g}">\${g}</span>
                            </div>
                        \`;
                    });
                    document.getElementById('attendanceChartContainer').innerHTML = barsHTML || '<p class="text-gray-400 w-full text-center">لا توجد بيانات</p>';
                }

                // 3. Results Report
                const { data: grades } = await supabase.from('student_grades').select('*, profiles:teacher_id(full_name)');
                if (grades) {
                    const totalExams = grades.length;
                    const passed = grades.filter(g => g.decision === 'admis' && g.moyen >= 10).length;
                    const failed = grades.filter(g => g.decision === 'ajournée' || g.moyen < 10).length;
                    
                    document.getElementById('resultsStatsCards').innerHTML = \`
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">إجمالي الامتحانات المسجلة</p>
                            <h3 class="text-3xl font-bold text-gray-800">\${totalExams}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">الناجحين</p>
                            <h3 class="text-3xl font-bold text-green-600">\${passed}</h3>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p class="text-sm text-gray-500 font-medium mb-1">الراسبين</p>
                            <h3 class="text-3xl font-bold text-red-600">\${failed}</h3>
                        </div>
                    \`;
                    
                    const teacherStats = {};
                    grades.forEach(g => {
                        const tName = g.profiles?.full_name || 'غير محدد';
                        if(!teacherStats[tName]) teacherStats[tName] = { total: 0, passed: 0 };
                        teacherStats[tName].total++;
                        if(g.decision === 'admis' && g.moyen >= 10) teacherStats[tName].passed++;
                    });
                    
                    let rTableHTML = \`<table class="w-full text-sm text-right"><thead class="bg-gray-50 text-gray-600 border-b"><tr><th class="px-4 py-3">الأستاذ</th><th class="px-4 py-3">الامتحانات</th><th class="px-4 py-3">نسبة النجاح</th></tr></thead><tbody class="divide-y divide-gray-100">\`;
                    Object.entries(teacherStats).forEach(([t, s]) => {
                        const pct = Math.round((s.passed / s.total) * 100) || 0;
                        rTableHTML += \`<tr><td class="px-4 py-3 font-medium">\${t}</td><td class="px-4 py-3 text-gray-600">\${s.total}</td><td class="px-4 py-3 text-green-600 font-bold">\${pct}%</td></tr>\`;
                    });
                    rTableHTML += \`</tbody></table>\`;
                    document.getElementById('resultsTableContainer').innerHTML = rTableHTML;
                    
                    if (totalExams > 0) {
                        const passPct = (passed / totalExams) * 100;
                        const failPct = (failed / totalExams) * 100;
                        const passDeg = (passPct / 100) * 360;
                        document.getElementById('resultsChartContainer').innerHTML = \`
                            <div class="w-40 h-40 rounded-full" style="background: conic-gradient(#10b981 0deg \${passDeg}deg, #ef4444 \${passDeg}deg 360deg)"></div>
                            <div class="mt-4 flex gap-4">
                                <div class="flex items-center gap-1 text-sm"><span class="w-3 h-3 rounded-full bg-green-500 block"></span>ناجح (\${Math.round(passPct)}%)</div>
                                <div class="flex items-center gap-1 text-sm"><span class="w-3 h-3 rounded-full bg-red-500 block"></span>راسب (\${Math.round(failPct)}%)</div>
                            </div>
                        \`;
                    } else {
                        document.getElementById('resultsChartContainer').innerHTML = '<p class="text-gray-400">لا توجد بيانات</p>';
                    }
                }
                
            } catch (err) {
                console.error("Error loading reports", err);
            } finally {
                loader.classList.add('hidden');
                loader.classList.remove('flex');
                content.classList.remove('hidden');
                if (window.lucide) lucide.createIcons();
            }
        }

        function renderReportsSection() {
            return \`
                <div class="max-w-7xl mx-auto" dir="rtl">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-1">التقارير والإحصائيات</h2>
                            <p class="text-gray-500 text-sm">نظرة شاملة على أداء المركز والطلاب</p>
                        </div>
                        <button onclick="loadReportsData()" class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition">
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i> تحديث
                        </button>
                    </div>

                    <!-- Tabs -->
                    <div class="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-2 pt-2 overflow-x-auto">
                        <button onclick="switchReportTab('students')" id="tab-btn-students" class="report-tab-btn px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600 transition-colors whitespace-nowrap">تقرير الطلاب</button>
                        <button onclick="switchReportTab('attendance')" id="tab-btn-attendance" class="report-tab-btn px-6 py-3 font-medium text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap">تقرير الغيابات</button>
                        <button onclick="switchReportTab('results')" id="tab-btn-results" class="report-tab-btn px-6 py-3 font-medium text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap">تقرير النتائج</button>
                    </div>

                    <!-- Loader -->
                    <div id="reportsLoader" class="hidden flex-col items-center justify-center py-20">
                        <i data-lucide="loader-2" class="w-10 h-10 text-blue-600 animate-spin mb-4"></i>
                        <p class="text-gray-500">جاري جلب وتحليل البيانات...</p>
                    </div>

                    <!-- Content -->
                    <div id="reportsContent">
                        <!-- Students Tab -->
                        <div id="tab-students" class="report-tab-content block">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" id="studentsStatsCards"></div>
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
                                    <h3 class="font-bold text-gray-800 mb-4">توزيع الطلاب حسب الفوج والمستوى</h3>
                                    <div id="studentsTableContainer"></div>
                                </div>
                                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 class="font-bold text-gray-800 mb-4">نسبة الطلاب حسب اللغة</h3>
                                    <div id="studentsChartContainer" class="flex flex-col items-center justify-center"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Attendance Tab -->
                        <div id="tab-attendance" class="report-tab-content hidden">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" id="attendanceStatsCards"></div>
                            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <h3 class="font-bold text-gray-800 mb-4">نسبة الحضور حسب الفوج</h3>
                                <div id="attendanceChartContainer" class="w-full h-64 flex items-end gap-2 overflow-x-auto pb-2 border-b border-gray-100"></div>
                            </div>
                        </div>

                        <!-- Results Tab -->
                        <div id="tab-results" class="report-tab-content hidden">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" id="resultsStatsCards"></div>
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
                                    <h3 class="font-bold text-gray-800 mb-4">نسبة النجاح لكل أستاذ</h3>
                                    <div id="resultsTableContainer"></div>
                                </div>
                                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 class="font-bold text-gray-800 mb-4">النتائج العامة</h3>
                                    <div id="resultsChartContainer" class="flex flex-col items-center justify-center"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        }
`;

if(code.match(functionInjectRegex)) {
    code = code.replace(functionInjectRegex, reportsFunction + '\n' + functionInjectRegex.source.replace(/\\/g, ''));
}

fs.writeFileSync('index.html', code);
console.log("Patched Reports");
