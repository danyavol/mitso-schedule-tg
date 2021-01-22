const Markup = require('telegraf/markup');
const search = require('../../src/mitsoSearch/index');
const deleteLastMessage = require('../deleteLastMessage');
const mainMenuKeyboard = require('../keyboards/mainMenu');

const Scene = require('telegraf/scenes/base')
const mitsoSearch = new Scene('mitsoSearch');

module.exports = mitsoSearch;

mitsoSearch.enter(ctx => {
	deleteLastMessage(ctx);
	ctx.replyWithMarkdown('💬 *Введи поисковой запрос*\n\n_Поиск производится на сайте МИТСО.\nТы можешь использовать это для поиска информации о преподавателе._',
		Markup.keyboard(['↩ На главную']).resize().extra());
});

mitsoSearch.hears(/(главн|меню)/i, (ctx) => {
	ctx.scene.leave();
});

mitsoSearch.on('text', async (ctx) => {
	let msgId = await ctx.reply('⏳ Загрузка...').then(msg => msg.message_id);
	let links = await search(ctx.message.text);

	ctx.deleteMessage(msgId);

	if (links) {
		let msg = '';
		for (let link of links) msg += `\n\n[${link.title}](${link.url})`;
		ctx.replyWithMarkdown(`🔎 *Результаты поиска:*${msg ? msg : '\n\n_Ничего не найдено_'}`, {disable_web_page_preview: true});
	} else {
		ctx.replyWithMarkdown('⚠ Не удалось получить доступ к сайту МИТСО');
	}
});

mitsoSearch.leave(ctx => {
	ctx.replyWithMarkdown('〽 *Главное меню*', mainMenuKeyboard(ctx));
});