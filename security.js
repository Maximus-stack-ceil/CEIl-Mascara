// ============================================================
// دوال الأمان والتحقق من المدخلات (Frontend Security Helpers)
// ============================================================

const SecurityHelper = {
    sanitizeText: (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])).trim();
    },
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },
    isValidGrade: (grade) => {
        const num = parseFloat(grade);
        return !isNaN(num) && num >= 0 && num <= 20;
    }
};

function getFriendlyErrorMessage(err) {
    if (!err) return "حدث خطأ غير متوقع في النظام.";
    switch(err.code) {
        case '23505': return "هذه البيانات مسجلة مسبقاً في النظام (تكرار غير مسموح).";
        case '42501': return "عذراً، ليس لديك الصلاحية الكافية لإتمام هذا الإجراء.";
        case '23503': return "لا يمكن حذف هذا السجل لارتباطه ببيانات أخرى.";
        case 'PGRST301': return "لم يتم العثور على البيانات المطلوبة.";
    }
    if (err.message && (err.message.includes("Invalid login") || err.message.includes("Invalid email"))) {
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }
    if (err.message && err.message.includes("Password should be at least")) {
        return "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
    }
    console.error("System Error ID:", err.code || err.message);
    return "حدث خطأ في النظام. يرجى المحاولة لاحقاً أو الاتصال بالإدارة.";
}
