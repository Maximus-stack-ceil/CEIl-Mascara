const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const navLink = `<a href="#" onclick="showPage('settings')" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg font-medium transition mb-1"><i data-lucide="settings" class="w-5 h-5"></i> إعدادات المركز</a>`;
code = code.replace(/<a href="#" onclick="showPage\('reports'\)".*?<\/a>/, match => match + '\\n                ' + navLink);

const showPageRegex = /\} else if \(pageName === 'reports'\) \{[\s\S]*?\} else if \(pageName === 'teacherDashboard'\) \{/;
code = code.replace(showPageRegex, match => `} else if (pageName === 'settings') {
                html = renderLayout(renderCenterSettings(), 'admin');
                setTimeout(() => loadCenterSettings(), 0);
            ` + match);

fs.writeFileSync('index.html', code);
console.log("Patched nav");
