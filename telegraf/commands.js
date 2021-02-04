/*
 /start, /help and /settings commands
 */
const Composer = require('telegraf/composer');
const Markup = require('telegraf/markup');
const mainMenuKeyboard = require('./keyboards/mainMenu')
const bot = new Composer()

bot.start((ctx) => {
	ctx.replyWithMarkdown('〽 *Главное меню*\nДля навигации используй клавиши внизу экрана ⤵', mainMenuKeyboard(ctx))
});

bot.help((ctx) => {
	ctx.replyWithMarkdown('ℹ Этот бот предназначен для студентов университета МИТСО.\n\n' +
		'Управление ботом происходит через удобную клавиатуру внизу экрана. Чтобы открыть ее, просто напиши команду /start\n\n' +
		'*Что бот умеет*❔\n' +
		'🔹 показывать расписания занятий\n🔹 уведомлять об изменении расписания\n🔹 присылать расписание на день\n' +
		'🔸 показывать баланс лицевого счета\n🔸 уведомлять об изменении баланса\n' +
		'🔹 расписание преподавателей\n🔹 информация о преподавателе\n'+
		'\n_Бот находится в разработке, некоторые функции могут быть недоступны._');
});

bot.command('stats', require('../src/statistic/index'));

bot.hears(/(меню|главн)/i, (ctx) => {
	ctx.replyWithMarkdown('〽 *Главное меню*', mainMenuKeyboard(ctx));
})

module.exports = bot
