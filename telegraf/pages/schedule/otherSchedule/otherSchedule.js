const Composer = require('telegraf/composer')
const otherSchedule = new Composer();
module.exports = otherSchedule;

otherSchedule.hears(/другие группы/i,async (ctx) => {
	await ctx.reply('🛠 В разработке');
});