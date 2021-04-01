module.exports = (ctx, next) => {
    if (!ctx.message || !ctx.message.from) return next();

    // danyavol id - 251137781
    if (ctx.message.from.id === 251137781) {
        let command = ctx.message.text;

        switch (command) {
            case '/stopmsg': 
                ctx.reply(`Maintenance mod: ${process.env.MAINTENANCE}  =>  1`);
                process.env.MAINTENANCE = 1;
                return;
            case '/startmsg': 
                ctx.reply(`Maintenance mod: ${process.env.MAINTENANCE}  =>  0`);
                process.env.MAINTENANCE = 0;
                return;
        }
    }
    next();
}