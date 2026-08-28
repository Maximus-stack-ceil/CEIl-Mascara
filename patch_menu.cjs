const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetMenu = `<a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg font-medium transition mb-1"><i data-lucide="award" class="w-5 h-5"></i> الشهادات</a>`;
const replacementMenu = `<a href="#" onclick="showPage('certificates')" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg font-medium transition mb-1"><i data-lucide="award" class="w-5 h-5"></i> الشهادات</a>`;

if (code.includes(targetMenu)) {
    code = code.replace(targetMenu, replacementMenu);
    fs.writeFileSync('index.html', code);
    console.log("Patched menu");
} else {
    console.log("Menu target not found");
}

const targetShowPage = `} else if (pageName === 'teacherDashboard') {`;
const replacementShowPage = `} else if (pageName === 'certificates') {
                html = renderLayout(renderCertificatesSection(), 'admin');
                setTimeout(() => loadCertificatesData(), 0);
            } else if (pageName === 'teacherDashboard') {`;

if (code.includes(targetShowPage)) {
    code = code.replace(targetShowPage, replacementShowPage);
    fs.writeFileSync('index.html', code);
    console.log("Patched showPage");
} else {
    console.log("showPage target not found");
}
