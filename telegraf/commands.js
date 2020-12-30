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
	ctx.replyWithMarkdown('Это *бот*');
});

bot.hears(/(меню|главн)/i, (ctx) => {
	ctx.replyWithMarkdown('〽 *Главное меню*', mainMenuKeyboard(ctx));
})

module.exports = bot
