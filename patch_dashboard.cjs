const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /<h2 class="text-2xl font-bold text-gray-800 mb-6">بوابة الأستاذ<\/h2>/;
const replacement = `<div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">بوابة الأستاذ</h2>
                        <div id="teacherSessionBadge" class="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hidden">
                            <!-- Session will be injected here -->
                        </div>
                    </div>`;

code = code.replace(regex, replacement);

const loadDashDataRegex = /async function loadTeacherDashboardData\(\) \{[\s\S]*?if \(!currentUser\) return;/;
const dashLogic = `async function loadTeacherDashboardData() {
            if (!currentUser) return;
            const sessionBadge = document.getElementById('teacherSessionBadge');
            if (window.currentSession && sessionBadge) {
                sessionBadge.innerHTML = '<i data-lucide="calendar" class="w-4 h-4 inline-block mr-1"></i> الدورة الحالية: ' + window.currentSession;
                sessionBadge.classList.remove('hidden');
                if (window.lucide) lucide.createIcons();
            }`;
code = code.replace(loadDashDataRegex, dashLogic);

fs.writeFileSync('index.html', code);
console.log("Patched dashboard");
