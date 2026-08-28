const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `                    const { error: upsertError } = await supabaseClient
                        .from('attendance')
                        .upsert([attendancePayload], { onConflict: 'student_id,date' });
                        
                    if (upsertError) throw upsertError;`;

const replacement = `                    // 1. Check if record exists
                    const { data: existingRecords, error: fetchError } = await supabaseClient
                        .from('attendance')
                        .select('id')
                        .eq('student_id', student.id || studentId)
                        .eq('date', date);
                        
                    if (fetchError) throw fetchError;
                    
                    if (existingRecords && existingRecords.length > 0) {
                        // 2. Update existing
                        const { error: updateError } = await supabaseClient
                            .from('attendance')
                            .update(attendancePayload)
                            .eq('id', existingRecords[0].id);
                        if (updateError) throw updateError;
                    } else {
                        // 3. Insert new
                        const { error: insertError } = await supabaseClient
                            .from('attendance')
                            .insert([attendancePayload]);
                        if (insertError) throw insertError;
                    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('index.html', code);
    console.log("Patched successfully");
} else {
    console.log("Target not found!");
}
