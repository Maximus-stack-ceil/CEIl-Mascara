const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const queryReplaceRegex = /let studentsQuery = supabase\.from\('students'\)\.select\('\*'\);/;
code = code.replace(queryReplaceRegex, "let studentsQuery = supabase.from('students').select('*, profiles:teacher_id(full_name)');");

const oldLogicRegex = /let tableHTML = \`<table class="w-full text-sm text-right">[\s\S]*?document\.getElementById\('studentsTableContainer'\)\.innerHTML = tableHTML;/;
const newLogic = `const teachersMap = {};
                    students.forEach(s => {
                        const tId = s.teacher_id || 'unknown';
                        const tName = s.profiles?.full_name || 'أستاذ غير محدد';
                        const lvl = s.level || 'غير محدد';
                        const grp = s.group_name || 'غير محدد';
                        
                        if (!teachersMap[tId]) {
                            teachersMap[tId] = { name: tName, levels: {} };
                        }
                        if (!teachersMap[tId].levels[lvl]) {
                            teachersMap[tId].levels[lvl] = { groups: {} };
                        }
                        if (!teachersMap[tId].levels[lvl].groups[grp]) {
                            teachersMap[tId].levels[lvl].groups[grp] = [];
                        }
                        teachersMap[tId].levels[lvl].groups[grp].push(s);
                    });

                    let reportHTML = \`<div class="space-y-6">\`;
                    Object.values(teachersMap).forEach(teacher => {
                        let levelsHTML = '';
                        Object.entries(teacher.levels).forEach(([lvlName, lvlObj]) => {
                            let groupsHTML = '';
                            Object.entries(lvlObj.groups).forEach(([grpName, studentsArr]) => {
                                groupsHTML += \`
                                    <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2 hover:bg-gray-100 transition">
                                        <span class="text-gray-700 font-medium">\${grpName}</span>
                                        <span class="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">\${studentsArr.length} طالب(ة)</span>
                                    </div>
                                \`;
                            });
                            levelsHTML += \`
                                <div class="mb-5 last:mb-0">
                                    <h4 class="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                                        مستوى \${lvlName}
                                    </h4>
                                    <div class="pr-4 border-r-2 border-gray-100">
                                        \${groupsHTML}
                                    </div>
                                </div>
                            \`;
                        });
                        
                        let totalGroups = 0;
                        let totalStds = 0;
                        Object.values(teacher.levels).forEach(l => {
                            Object.values(l.groups).forEach(g => {
                                totalGroups++;
                                totalStds += g.length;
                            });
                        });

                        reportHTML += \`
                            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div class="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-white border border-gray-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                                            <i data-lucide="user" class="w-5 h-5"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-gray-900">\${teacher.name}</h3>
                                            <p class="text-xs text-gray-500">\${Object.keys(teacher.levels).length} مستويات • \${totalGroups} أفواج</p>
                                        </div>
                                    </div>
                                    <div class="bg-blue-600 text-white py-1.5 px-4 rounded-full text-sm font-bold shadow-sm">
                                        إجمالي: \${totalStds} طالب
                                    </div>
                                </div>
                                <div class="p-5">
                                    \${levelsHTML}
                                </div>
                            </div>
                        \`;
                    });
                    reportHTML += \`</div>\`;
                    document.getElementById('studentsTableContainer').innerHTML = reportHTML;`;

code = code.replace(oldLogicRegex, newLogic);
fs.writeFileSync('index.html', code);
console.log("Patched Individual Teacher Report");
