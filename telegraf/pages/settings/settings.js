const Markup = require('telegraf/markup');
const { saveUser } = require('../../../src/database/usersCollection');
const deleteLastMessage = require('../../deleteLastMessage');

const Composer = require('telegraf/composer')
const settings = new Composer();

settings.hears(/настройки/i,async (ctx) => {
	let keyboard = createKeyboard(ctx);

	await ctx.replyWithMarkdown(
		`*⚙ Настройки*\n\n_${keyboard.length ? 'Выбери, что ты хочешь изменить' : 'Сперва добавь группу или лицевой счет, чтобы можно было что-то настраивать 😌'}_`,
		Markup.inlineKeyboard(keyboard).extra()
	).then(msg => deleteLastMessage(ctx, msg.message_id));
});

settings.action(/settings-/, async (ctx) => {
	const data = ctx.callbackQuery.data;
	let alertText = 'Изменения применены';

	// Обработка нажатой inline кнопки
	switch (data) {
		case 'settings-scheduleChangeNotif':
			if (ctx.session.user.notifications.scheduleChange) {
				ctx.session.user.notifications.scheduleChange = false;
				alertText = 'Бот больше не будет уведомлять об изменении расписания';
			} else {
				ctx.session.user.notifications.scheduleChange = true;
				alertText = 'Бот будет уведомлять об изменении расписания';
			}
			break;
		case 'settings-balanceChangeNotif':
			if (ctx.session.user.notifications.balanceChange) {
				ctx.session.user.notifications.balanceChange = false;
				alertText = 'Бот больше не будет уведомлять об изменении баланса';
			} else {
				ctx.session.user.notifications.balanceChange = true;
				alertText = 'Бот будет уведомлять об изменении баланса';
			}
			break;
		case 'settings-dayScheduleNotif':
			if (ctx.session.user.notifications.daySchedule) {
				ctx.session.user.notifications.daySchedule = false;
				alertText = '💔 Бот больше не будет присылать расписание на день';
			} else {
				ctx.session.user.notifications.daySchedule = true;
				alertText = 'Бот будет присылать расписание на день';
			}
			break;
		case 'settings-changeMyGroup':
			if (ctx.session.lastMessageId) ctx.deleteMessage(ctx.session.lastMessageId);
			delete ctx.session.lastMessageId;
			return ctx.scene.enter('selectGroup');
		case 'settings-changeBalance':
			if (ctx.session.lastMessageId) ctx.deleteMessage(ctx.session.lastMessageId);
			delete ctx.session.lastMessageId;
			return ctx.scene.enter('addBalance');
	}

	saveUser(ctx.session.user);


	try {
		// Изменение клавиатуры
		await ctx.editMessageReplyMarkup({
			inline_keyboard: createKeyboard(ctx)
		});
	} catch (e) {
		// Произойдет ошибка, если новая клавиатура идентична старой
		// console.log(e);
	} finally {
		// Вывод алерта с подробностями об изменении
		await ctx.answerCbQuery(alertText, true);
	}
});

function createKeyboard(ctx) {
	let keyboard = [];

	// Уведомления
	let notif = ctx.session.user.notifications;
	if (notif) {
		if (notif.scheduleChange != null)
			keyboard.push( [Markup.callbackButton(`${notif.scheduleChange ? '🔔' : '🔕'} Уведомлять об изменении расписания`, 'settings-scheduleChangeNotif')] );
		if (notif.balanceChange != null)
			keyboard.push( [Markup.callbackButton(`${notif.balanceChange ? '🔔' : '🔕'} Уведомлять об изменении баланса`, 'settings-balanceChangeNotif')] );
		if (notif.daySchedule != null)
			keyboard.push( [Markup.callbackButton(`${notif.daySchedule ? '🔔' : '🔕'} Присылать расписание на день`, 'settings-dayScheduleNotif')] );
	}

	// Изменить мою группу
	let user = ctx.session.user;
	if (user.myGroup.group)
		keyboard.push( [Markup.callbackButton(`📝 Изменить мою группу`, 'settings-changeMyGroup')] );

	// Изменить номер лицевого счета
	if (user.balance && user.balance.number)
		keyboard.push( [Markup.callbackButton(`📝 Изменить номер лицевого счета`, 'settings-changeBalance')] );

	return keyboard;
}

module.exports = settings;