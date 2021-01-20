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
				alertText = '🔇 Бот больше не будет уведомлять об изменении расписания';
			} else {
				ctx.session.user.notifications.scheduleChange = true;
				alertText = '🔊 Бот будет присылать сообщение, если изменится расписание (добавится новая пара, изменится кабинет, появится новая неделя и т.д.).\n\nПроверка производится каждые 15 минут';
			}
			break;
		case 'settings-balanceChangeNotif':
			if (ctx.session.user.notifications.balanceChange) {
				ctx.session.user.notifications.balanceChange = false;
				alertText = '🔇 Бот больше не будет уведомлять об изменении баланса';
			} else {
				ctx.session.user.notifications.balanceChange = true;
				alertText = '🔊 Бот будет присылать сообщение, если баланс лицевого счета изменился.\n\nПроверка производится каждый час';
			}
			break;
		case 'settings-dayScheduleNotif':
			if (ctx.session.user.notifications.daySchedule) {
				ctx.session.user.notifications.daySchedule = false;
				alertText = '🔇 Бот больше не будет присылать расписание на день';
			} else {
				ctx.session.user.notifications.daySchedule = true;
				if (!ctx.session.user.dayScheduleTime || !ctx.session.user.dayScheduleTime.length) {
					ctx.session.user.dayScheduleTime = [{time: 'relatively', hours: 2, minutes: 0}];
					await saveUser(ctx.session.user, true);
					alertText = '🔊 Бот будет присылать расписание на день за 2 часа до занятий.\n\nДля настройки времени выбери соответсвующий пункт в настройках';
				} else {
					alertText = '🔊 Бот будет присылать расписание на день.\n\nДля настройки времени уведомлений выбери соответсвующий пункт в настройках';
				}
			}
			break;
		case 'settings-changeDayScheduleTime':
			deleteLastMessage(ctx);
			return ctx.scene.enter('daySchedule');
		case 'settings-changeMyGroup':
			deleteLastMessage(ctx);
			ctx.session.sceneType = "mySchedule";
			return ctx.scene.enter('selectGroup');
		case 'settings-changeBalance':
			deleteLastMessage(ctx);
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
		// console.error(e);
	} finally {
		// Вывод алерта с подробностями об изменении
		await ctx.answerCbQuery(alertText, true);
	}
});

function createKeyboard(ctx) {
	let user = ctx.session.user;
	let keyboard = [];

	/** Уведомления */
	let notif = ctx.session.user.notifications;

	if (user.myGroup.group)
		keyboard.push( [Markup.callbackButton(`${notif.scheduleChange ? '🔔' : '🔕'} Уведомлять об изменении расписания`, 'settings-scheduleChangeNotif')] );

	if (user.balance && user.balance.number)
		keyboard.push( [Markup.callbackButton(`${notif.balanceChange ? '🔔' : '🔕'} Уведомлять об изменении баланса`, 'settings-balanceChangeNotif')] );

	if (user.myGroup.group)
		keyboard.push( [Markup.callbackButton(`${notif.daySchedule ? '🔔' : '🔕'} Присылать расписание на день`, 'settings-dayScheduleNotif')] );

	/** Настройки */
	// Изменить мою группу
	if (user.myGroup.group && notif.daySchedule)
		keyboard.push( [Markup.callbackButton(`⏰ Настроить расписание на день`, 'settings-changeDayScheduleTime')] );

	// Изменить мою группу
	if (user.myGroup.group)
		keyboard.push( [Markup.callbackButton(`📝 Изменить мою группу`, 'settings-changeMyGroup')] );

	// Изменить номер лицевого счета
	if (user.balance && user.balance.number)
		keyboard.push( [Markup.callbackButton(`📝 Изменить номер лицевого счета`, 'settings-changeBalance')] );

	return keyboard;
}

module.exports = settings;