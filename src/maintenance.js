module.exports = (ctx, next) => {
    if (!ctx.message || !ctx.message.from) return next();

    // danyavol id - 251137781
    if (ctx.message.from.id === 251137781) {
        let command = ctx.message.text;

        switch (command) {
            case '/stopmsg': 
                process.env.MAINTENANCE = true;
                return ctx.reply('Maintenance mod on');
            case '/startmsg': 
                process.env.MAINTENANCE = false;
                return ctx.reply('Maintenance mod off');
        }
    }
    next();
}