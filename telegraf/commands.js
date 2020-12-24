/*
 /start, /help and /settings commands
 */
const Composer = require('telegraf/composer');
const Markup = require('telegraf/markup');
const mainMenuKeyboard = require('./keyboards/mainMenu')
const bot = new Composer()

bot.start((ctx) => {
	ctx.reply('Ты открыл главное меню. Для навигации используй клавиши внизу экрана', mainMenuKeyboard(ctx, false))
});

bot.help((ctx) => {
	ctx.replyWithMarkdown('Это *бот*');
});

module.exports = bot
