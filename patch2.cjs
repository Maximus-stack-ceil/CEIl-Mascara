const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                            <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <i data-lucide="users" class="w-7 h-7"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 font-medium">عدد الأساتذة</p>
                                <h3 id="admin-teachers-count" class="text-2xl font-bold text-gray-900 mt-1">...</h3>
                            </div>
                        </div>`;

const replacement = `<div onclick="showPage('teachersList')" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
                            <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <i data-lucide="users" class="w-7 h-7"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 font-medium">عدد الأساتذة</p>
                                <h3 id="admin-teachers-count" class="text-2xl font-bold text-gray-900 mt-1">...</h3>
                            </div>
                        </div>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('index.html', code);
    console.log("Patched clickable card");
} else {
    console.log("Card target not found");
}
