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
                ctx.reply(`Maintenance mod: ${getMaintenVal(process.env.MAINTENANCE)}  =>  On`);
                process.env.MAINTENANCE = 1;
                return;
            case '/maintenance_stop': 
                ctx.reply(`Maintenance mod: ${getMaintenVal(process.env.MAINTENANCE)}  =>  Off`);
                process.env.MAINTENANCE = 0;
                return;
        }
    }
    next();

    function getMaintenVal(val) {
        if (val == 0) return 'Off'
        else return 'On';
    }

    function getAdminCommandList() {
        let str = '🖥 Панель администратора:\n\n';
        str += `Режим техобслуживания - ${getMaintenVal(process.env.MAINTENANCE)}\n\n`;
        str += `/maintenance_start - включить техобслуживание\n/maintenance_stop - выключить техобслуживание`;
        return str;
    }
}