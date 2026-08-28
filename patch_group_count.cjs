const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex1 = /students\.forEach\(s => \{\s*const lang = s\.language \|\| 'غير محدد';\s*const lvl = s\.level \|\| 'غير محدد';\s*const grp = s\.group_name \|\| 'غير محدد';\s*byLang\[lang\] = \(byLang\[lang\] \|\| 0\) \+ 1;\s*byLevel\[lvl\] = \(byLevel\[lvl\] \|\| 0\) \+ 1;\s*byGroup\[grp\] = \(byGroup\[grp\] \|\| 0\) \+ 1;\s*\}\);/g;

const replacement1 = `students.forEach(s => {
                        const lang = s.language || 'غير محدد';
                        const lvl = s.level || 'غير محدد';
                        const grp = s.group_name || 'غير محدد';
                        const uniqueGrp = lvl + '|||' + grp;
                        
                        byLang[lang] = (byLang[lang] || 0) + 1;
                        byLevel[lvl] = (byLevel[lvl] || 0) + 1;
                        byGroup[uniqueGrp] = (byGroup[uniqueGrp] || 0) + 1;
                    });`;

code = code.replace(regex1, replacement1);


const regex2 = /const groupAtt = \{\};\s*attendance\.forEach\(a => \{\s*const g = a\.group_name \|\| 'غير محدد';\s*if\(!groupAtt\[g\]\) groupAtt\[g\] = \{ total: 0, present: 0 \};\s*groupAtt\[g\]\.total\+\+;\s*if\(a\.status === 'present'\) groupAtt\[g\]\.present\+\+;\s*\}\);/g;

const replacement2 = `const groupAtt = {};
                    attendance.forEach(a => {
                        const l = a.level || '';
                        const g = a.group_name || 'غير محدد';
                        const uniqueG = l ? (l + ' - ' + g) : g;
                        if(!groupAtt[uniqueG]) groupAtt[uniqueG] = { total: 0, present: 0 };
                        groupAtt[uniqueG].total++;
                        if(a.status === 'present') groupAtt[uniqueG].present++;
                    });`;

code = code.replace(regex2, replacement2);

fs.writeFileSync('index.html', code);
console.log("Patched Group Counts");
