const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Update showPage call
const showPageRegex = /\} else if \(pageName === 'reports'\) \{\s*html = renderLayout\(renderReportsSection\(\), 'admin'\);\s*setTimeout\(\(\) => loadReportsData\(\), 0\);/;
const showPageReplacement = `} else if (pageName === 'reports') {
                html = renderLayout(renderReportsSection(), 'admin');
                setTimeout(() => {
                    initReportsFilters();
                    loadReportsData();
                }, 0);`;
code = code.replace(showPageRegex, showPageReplacement);

// Update renderReportsSection to include the filters
const renderReportsRegex = /<!-- Loader -->/;
const filterHTML = `
                    <!-- Filters -->
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
                        <div class="flex-1 min-w-[200px]">
                            <label class="block text-sm font-medium text-gray-700 mb-1">الأستاذ</label>
                            <select id="reportsTeacherFilter" onchange="loadReportsLevelsFilter()" class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="">جميع الأساتذة (تقرير عام)</option>
                            </select>
                        </div>
                        <div class="flex-1 min-w-[200px]">
                            <label class="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                            <select id="reportsLevelFilter" onchange="loadReportsGroupsFilter()" class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled>
                                <option value="">جميع المستويات</option>
                            </select>
                        </div>
                        <div class="flex-1 min-w-[200px]">
                            <label class="block text-sm font-medium text-gray-700 mb-1">الفوج</label>
                            <select id="reportsGroupFilter" onchange="loadReportsData()" class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled>
                                <option value="">جميع الأفواج</option>
                            </select>
                        </div>
                    </div>

                    <!-- Loader -->`;
code = code.replace(renderReportsRegex, filterHTML);

// Add the filter functions before loadReportsData
const loadReportsDataRegex = /async function loadReportsData\(\) \{/;
const filterFunctions = `
        async function initReportsFilters() {
            const teacherSelect = document.getElementById('reportsTeacherFilter');
            if (!teacherSelect) return;
            try {
                const supabase = window.supabaseClient || supabaseClient;
                const { data: teachers, error } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .eq('role', 'teacher')
                    .order('full_name');
                if (error) throw error;
                if (teachers) {
                    teacherSelect.innerHTML = '<option value="">جميع الأساتذة (تقرير عام)</option>' +
                        teachers.map(t => \`<option value="\${t.id}">\${t.full_name}</option>\`).join('');
                }
            } catch (err) {
                console.error("Error loading teachers for reports filter", err);
            }
        }

        async function loadReportsLevelsFilter() {
            const teacherId = document.getElementById('reportsTeacherFilter').value;
            const levelSelect = document.getElementById('reportsLevelFilter');
            const groupSelect = document.getElementById('reportsGroupFilter');
            
            levelSelect.innerHTML = '<option value="">جميع المستويات</option>';
            groupSelect.innerHTML = '<option value="">جميع الأفواج</option>';
            groupSelect.disabled = true;
            
            if (!teacherId) {
                levelSelect.disabled = true;
                loadReportsData();
                return;
            }
            
            levelSelect.disabled = false;
            levelSelect.innerHTML = '<option value="">جاري التحميل...</option>';
            
            try {
                const supabase = window.supabaseClient || supabaseClient;
                const { data: students, error } = await supabase
                    .from('students')
                    .select('level')
                    .eq('teacher_id', teacherId);
                
                if (error) throw error;
                
                if (students) {
                    const levels = [...new Set(students.map(s => s.level).filter(Boolean))];
                    levelSelect.innerHTML = '<option value="">جميع المستويات</option>' +
                        levels.map(l => \`<option value="\${l}">\${l}</option>\`).join('');
                } else {
                    levelSelect.innerHTML = '<option value="">جميع المستويات</option>';
                }
            } catch (err) {
                console.error("Error loading levels for reports filter", err);
                levelSelect.innerHTML = '<option value="">جميع المستويات</option>';
            }
            
            loadReportsData();
        }

        async function loadReportsGroupsFilter() {
            const teacherId = document.getElementById('reportsTeacherFilter').value;
            const level = document.getElementById('reportsLevelFilter').value;
            const groupSelect = document.getElementById('reportsGroupFilter');
            
            groupSelect.innerHTML = '<option value="">جميع الأفواج</option>';
            
            if (!teacherId || !level) {
                groupSelect.disabled = true;
                loadReportsData();
                return;
            }
            
            groupSelect.disabled = false;
            groupSelect.innerHTML = '<option value="">جاري التحميل...</option>';
            
            try {
                const supabase = window.supabaseClient || supabaseClient;
                const { data: students, error } = await supabase
                    .from('students')
                    .select('group_name')
                    .eq('teacher_id', teacherId)
                    .eq('level', level);
                
                if (error) throw error;
                
                if (students) {
                    const groups = [...new Set(students.map(s => s.group_name).filter(Boolean))];
                    groupSelect.innerHTML = '<option value="">جميع الأفواج</option>' +
                        groups.map(g => \`<option value="\${g}">\${g}</option>\`).join('');
                } else {
                    groupSelect.innerHTML = '<option value="">جميع الأفواج</option>';
                }
            } catch (err) {
                console.error("Error loading groups for reports filter", err);
                groupSelect.innerHTML = '<option value="">جميع الأفواج</option>';
            }
            
            loadReportsData();
        }

        async function loadReportsData() {`;
code = code.replace(loadReportsDataRegex, filterFunctions);

// Update loadReportsData to use filters
const loadReportsDataQueriesRegex = /const \{ data: students \} = await supabase\.from\('students'\)\.select\('\*'\);\s*if \(students\) \{/;
code = code.replace(loadReportsDataQueriesRegex, `
                const teacherFilter = document.getElementById('reportsTeacherFilter')?.value;
                const levelFilter = document.getElementById('reportsLevelFilter')?.value;
                const groupFilter = document.getElementById('reportsGroupFilter')?.value;

                let studentsQuery = supabase.from('students').select('*');
                let attendanceQuery = supabase.from('attendance').select('*');
                let gradesQuery = supabase.from('student_grades').select('*, profiles:teacher_id(full_name)');
                
                if (teacherFilter) {
                    studentsQuery = studentsQuery.eq('teacher_id', teacherFilter);
                    attendanceQuery = attendanceQuery.eq('teacher_id', teacherFilter);
                    gradesQuery = gradesQuery.eq('teacher_id', teacherFilter);
                }
                if (levelFilter) {
                    studentsQuery = studentsQuery.eq('level', levelFilter);
                    attendanceQuery = attendanceQuery.eq('level', levelFilter);
                    gradesQuery = gradesQuery.eq('level', levelFilter);
                }
                if (groupFilter) {
                    studentsQuery = studentsQuery.eq('group_name', groupFilter);
                    attendanceQuery = attendanceQuery.eq('group_name', groupFilter);
                    gradesQuery = gradesQuery.eq('group_name', groupFilter);
                }
                
                const [
                    { data: students },
                    { data: attendance },
                    { data: grades }
                ] = await Promise.all([
                    studentsQuery,
                    attendanceQuery,
                    gradesQuery
                ]);

                if (students) {`);

const attendanceQueryRegex = /const \{ data: attendance \} = await supabase\.from\('attendance'\)\.select\('\*'\);/;
code = code.replace(attendanceQueryRegex, '');

const resultsQueryRegex = /const \{ data: grades \} = await supabase\.from\('student_grades'\)\.select\('\*, profiles:teacher_id\(full_name\)'\);/;
code = code.replace(resultsQueryRegex, '');

fs.writeFileSync('index.html', code);
console.log("Patched Reports Filters");
