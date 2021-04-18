
module.exports.isWrongFakulty = function (fakulty, groupName) {
    const ur_fak = [ /\sП$/i, /ПРТО/i, /АиН/i, /МП/i ]; // Префикс групп юридического факультета
    const ek_fak = [ /ИСИТ/i, /МН/i, /\sМ$/i, /ЛОМК/i, /МЭ/i, /ЛГ/i, /УИ/i, ]; // Префикс групп экономического факультета

    let isWrong = false;

    if (fakulty == 'YUridicheskij') {
        ek_fak.forEach(regExp => regExp.test(groupName) ? isWrong = true : null)
    } else if (fakulty == 'ME`OiM') {
        ur_fak.forEach(regExp => regExp.test(groupName) ? isWrong = true : null);
    }

    return isWrong;
}

module.exports.isWrongCourse = function (course, groupName) {
    let k = course.split(' ')[0];
    
    if (k == 2 && /^20/.test(groupName)) return true;
    
    return false;
}