const Markup = require('telegraf/markup');
const { findGroup } = require('../../src/database/groupsCollection');
const { saveUser } = require('../../src/database/usersCollection');
const deleteLastMessage = require('../deleteLastMessage');
const mainMenuKeyboard = require('../keyboards/mainMenu');

const Scene = require('telegraf/scenes/base')
const selectGroup = new Scene('selectGroup');
module.exports = selectGroup;


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

/** Поиск группы в БД */
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

/** Сохранение выбранной группы */
selectGroup.action(/selectGroup-/, async (ctx) => {
	deleteLastMessage(ctx);
	const data = ctx.callbackQuery.data;
	let n = data.split('-')[1]; // Номер выбранной группы в массиве foundGroups
	let selectedGroup = ctx.session.foundGroups[n]; // Объект выбранной группы

	if (ctx.session.sceneType === 'mySchedule') {
		let userData = JSON.parse(JSON.stringify(ctx.session.user));
		userData.myGroup = selectedGroup;

		let newUser = await saveUser(userData, true);
		if (newUser instanceof Error) {
			ctx.state.msg = newUser;
		} else {
			ctx.session.user = newUser;
			ctx.state.msg = `💾 Твоя группа *${selectedGroup.group}* успешно сохранена!`;
		}
	} else {
		ctx.state.msg = `Выбранная группа - _${selectedGroup.group}_`;
	}

	// Удаление ненужных переменных
	delete ctx.session.foundGroups;
	delete ctx.session.sceneType;

	ctx.scene.leave();
});

selectGroup.on('message', (ctx) => {
	ctx.replyWithMarkdown('⚠ Неверный номер группы, попробуй еще раз.\n\n _Введи как минимум 3 цифры номера группы_')
	.then(msg => deleteLastMessage(ctx, msg.message_id));
});

selectGroup.leave((ctx) => {
	deleteLastMessage(ctx);
	ctx.replyWithMarkdown(ctx.state.msg || '〽 *Главное меню*', mainMenuKeyboard(ctx));
});