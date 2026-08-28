const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regexCertButton = /<button onclick="generateWordCertificates\(\)"[^>]*>[\s\S]*?<\/button>/;
const newCertButton = `<button onclick="generateWordCertificates()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition">
                            <i data-lucide="file-text" class="w-5 h-5"></i> 📄 تصدير قائمة الناجحين
                        </button>`;

code = code.replace(regexCertButton, newCertButton);

const oldGenFunctionRegex = /async function generateWordCertificates\(\) \{[\s\S]*?window\.saveAs\(blob, `شهادات_\$\{level\}_\$\{group\}_\$\{new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\}\.docx`\);\n        }/;
const newGenFunction = `async function generateWordCertificates() {
            if (!window.certStudentsList || window.certStudentsList.length === 0) return;
            
            const level = document.getElementById('certLevel').value;
            const group = document.getElementById('certGroup').value;
            const language = window.certTeacherLanguage || "اللغة الأجنبية";
            
            const tableRows = [
                new docx.TableRow({
                    children: ["الاسم الكامل","تاريخ الميلاد","مكان الميلاد","اللغة","المستوى","المعدل"].map(h =>
                        new docx.TableCell({ 
                            children: [new docx.Paragraph({ text: h, alignment: docx.AlignmentType.CENTER, rightToLeft: true, bold: true })],
                            shading: { fill: "f3f4f6" },
                            margins: { top: 100, bottom: 100, left: 100, right: 100 }
                        })
                    )
                }),
                ...window.certStudentsList.map(item => {
                    const student = item.students || {};
                    const fullName = (student.first_name || "") + " " + (student.last_name || "");
                    const birthDate = student.birth_date ? new Date(student.birth_date).toLocaleDateString('ar-DZ') : "-";
                    const location = student.location || "-";
                    const itemLevel = item.level || level;
                    const moyen = item.moyen != null ? item.moyen.toString() : "-";
                    
                    return new docx.TableRow({
                        children: [
                            fullName,
                            birthDate,
                            location,
                            language,
                            itemLevel,
                            moyen
                        ].map(text => new docx.TableCell({ 
                            children: [new docx.Paragraph({ text, alignment: docx.AlignmentType.CENTER, rightToLeft: true })],
                            margins: { top: 100, bottom: 100, left: 100, right: 100 }
                        }))
                    });
                })
            ];

            const doc = new docx.Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
                        }
                    },
                    children: [
                        new docx.Paragraph({ 
                            text: "قائمة الناجحين", 
                            alignment: docx.AlignmentType.CENTER, 
                            bold: true, 
                            size: 32,
                            rightToLeft: true,
                            spacing: { after: 200 }
                        }),
                        new docx.Paragraph({ 
                            text: new Date().toLocaleDateString('ar-DZ'), 
                            alignment: docx.AlignmentType.CENTER,
                            rightToLeft: true,
                            spacing: { after: 400 }
                        }),
                        new docx.Table({
                            rows: tableRows,
                            width: { size: 100, type: docx.WidthType.PERCENTAGE }
                        })
                    ]
                }]
            });

            const blob = await docx.Packer.toBlob(doc);
            window.saveAs(blob, \`قائمة_الناجحين_\${level}_\${group}.docx\`);
        }`;

code = code.replace(oldGenFunctionRegex, newGenFunction);

fs.writeFileSync('index.html', code);
console.log("Patched list generation");
