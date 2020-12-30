const Markup = require('telegraf/markup');
const { findGroup } = require('../../../src/database/groupsCollection')
const deleteLastMessage = require('../../deleteLastMessage');
const mainMenuKeyboard = require('../../keyboards/mainMenu');

/** Объявление сцены добавления группы */
const Scene = require('telegraf/scenes/base')

const selectGroup = new Scene('selectGroup');
/** End Объявление сцены добавления группы */

selectGroup.enter((ctx) => {
	deleteLastMessage(ctx);
	ctx.reply(
		'💬 Введи номер группы',
		Markup.keyboard([
			['↩ На главную'],
		]).resize().extra());
});

selectGroup.hears(/(главн|меню)/i, (ctx) => {
	ctx.scene.leave();
});

selectGroup.hears(/.{3,}/, async (ctx) => {
	ctx.session.foundGroups = await findGroup(ctx.message.text);
	let groups = ctx.session.foundGroups;

	let keyboard = [];
	let row = 0;
	for (let i = 0; i < groups.length; i++) {
		if (i && i % 3 === 0) row++;
		if (!keyboard[row]) keyboard[row] = [];
		keyboard[row].push( Markup.callbackButton(groups[i].group, `selectGroup-${i}`) )
	}
	if (keyboard.length)
		await ctx.replyWithMarkdown('🔎 Выбери группу\n\n_Если нужной группы здесь нет, перепроверь введенные данные и попробуй еще раз._',
			Markup.inlineKeyboard(keyboard).extra())
		.then(msg => deleteLastMessage(ctx, msg.message_id));
	else
		await ctx.replyWithMarkdown('⚠ Не удалось найти группу с таким номером, попробуй еще раз.')
		.then(msg => deleteLastMessage(ctx, msg.message_id));
});

selectGroup.action(/selectGroup-/, async (ctx) => {
	deleteLastMessage(ctx);
	const data = ctx.callbackQuery.data;
	let n = data.split('-')[1];
	ctx.session.selectedGroup = ctx.session.foundGroups[n];
	delete ctx.session.foundGroups;


	// Продолжить код тут

	ctx.state.msg = `Группа ${ctx.session.selectedGroup.group} сохранена`;
	ctx.scene.leave();
});

selectGroup.on('message', (ctx) => {
	ctx.replyWithMarkdown('⚠ Неверный номер группы, попробуй еще раз.\n\n _Введи как минимум 3 цифры номера группы_')
	.then(msg => deleteLastMessage(ctx, msg.message_id));
})

selectGroup.leave((ctx) => {
	deleteLastMessage(ctx);
	ctx.replyWithMarkdown(ctx.state.msg || '〽 *Главное меню*', mainMenuKeyboard(ctx));
})

module.exports = selectGroup;