const Composer = require('telegraf/composer')
const teachers = new Composer();
module.exports = teachers;

teachers.hears(/преподаватели/i,async (ctx) => {
	await ctx.reply('🛠 В разработке');
});