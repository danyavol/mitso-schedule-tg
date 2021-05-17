module.exports = (ctx, next) => {
    if (!ctx.message || !ctx.message.from) return next();

    // danyavol id - 251137781
    if (ctx.message.from.id === 251137781) {
        let command = ctx.message.text;

        switch (command) {
            case '/admin':
                ctx.reply(getAdminCommandList());
                return;
            case '/maintenance_start': 
                process.env.MAINTENANCE = 1;
                ctx.reply(getAdminCommandList());
                return;
            case '/maintenance_stop':
                process.env.MAINTENANCE = 0;
                ctx.reply(getAdminCommandList());
                return;
            case '/sendDaySch_start':
                process.env.SEND_DAY_SCH = 1;
                ctx.reply(getAdminCommandList());
                return;
            case '/sendDaySch_stop':
                process.env.SEND_DAY_SCH = 0;
                ctx.reply(getAdminCommandList());
                return;
        }
    }
    next();

    function getVal(val) {
        if (val == 0) return '❌ Off'
        else if (val == 1) return '✅ On';
        return '??';
    }

    function getAdminCommandList() {
        let str = '🖥 Панель администратора:';

        str += `\n\n/stats - статистика бота`;

        str += `\n\nРежим техобслуживания - ${getVal(process.env.MAINTENANCE)}\n`;
        str += `/maintenance_start - включить техобслуживание\n/maintenance_stop - выключить техобслуживание`;

        str += `\n\nОтправлять расписание на день - ${getVal(process.env.SEND_DAY_SCH)}\n`;
        str += `/sendDaySch_start - включить отправку\n/sendDaySch_stop - выключить отправку`;

        return str;
    }
}