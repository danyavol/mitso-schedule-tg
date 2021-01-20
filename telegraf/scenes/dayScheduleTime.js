const Markup = require('telegraf/markup');
const deleteLastMessage = require('../deleteLastMessage');
const mainMenuKeyboard = require('../keyboards/mainMenu');
const { saveUser } = require('../../src/database/usersCollection');

const Scene = require('telegraf/scenes/base')
const daySchedule = new Scene('daySchedule');
module.exports = daySchedule;

const MESSAGE_TITLE = "⏰ *Настройка времени, в которое бот будет присылать расписание на день*";
const MESSAGE = "\n\n_Чтобы удалить время - нажми на кнопку ниже_" +
	"\n\n_Чтобы добавить новое время, отправь сообщение следующего вида:_" +
	"\n*в 19:30*   -   для установки точного времени;" +
	"\n*1:00 до*   -   для установки времени относительно первой пары (за час до пары).";


daySchedule.enter(async (ctx) => {
	await ctx.replyWithMarkdown(MESSAGE_TITLE, Markup.keyboard(['↩ На главную']).resize().extra());
	replyWithSavedTime(ctx, MESSAGE);
});

daySchedule.hears(/(главн|меню)/i, (ctx) => {
	ctx.scene.leave();
});


/** Удаление времени */
daySchedule.action(/dayScheduleTime-/, async (ctx) => {
	let index = ctx.callbackQuery.data.split('-')[1];
	if (ctx.session.user.dayScheduleTime.length <= 1) {
		return ctx.answerCbQuery('Нельзя удалить. Должно быть установлено как минимум одно время.\n\nДобавь новое время, а потом удали это.', true);
	}
	ctx.session.user.dayScheduleTime.splice(index, 1);
	await saveUser(ctx.session.user, true);

	replyWithSavedTime(ctx, '✅ *Время успешно удалено!*');
});


/** Установка времени */
daySchedule.hears(/\d{1,2}:\d{2}/i, async (ctx) => {
	// Определение типа времени(относительное или точное)
	let timeType;
	if (/^в/i.test(ctx.message.text)) timeType = 'exactly';
	else if (/(до$|до пары$)/i.test(ctx.message.text)) timeType = 'relatively';
	else return replyWithSavedTime(ctx, '⚠ *Неверный формат времени. Попробуй еще раз.*' + MESSAGE);

	// Определения часов и минут
	let timeString = ctx.message.text.match(/\d{1,2}:\d{2}/)[0];
	let hours = parseInt(timeString.split(':')[0]);
	let minutes = parseInt(timeString.split(':')[1]);

	// Проверка ограничений
	if (hours > 24 || minutes > 60) return replyWithSavedTime(ctx, '⚠ *Неверный формат времени. Попробуй еще раз.*' + MESSAGE);
	if (ctx.session.user.dayScheduleTime.length >= 4) return replyWithSavedTime(ctx, '⚠ *Максимальное количество напоминаний - 4.*');

	// Проверка есть ли уже такое время
	for (let savedTime of ctx.session.user.dayScheduleTime) {
		if (savedTime.time === timeType && savedTime.hours === hours && savedTime.minutes === minutes) {
			return replyWithSavedTime(ctx, '⚠ *Данное время уже сохранено.*');
		}
	}

	ctx.session.user.dayScheduleTime.push({time: timeType, hours: hours, minutes: minutes});
	await saveUser(ctx.session.user, true);
	return replyWithSavedTime(ctx, '✅ *Новое время успешно сохранено!*');
});


/** Неверный формат времени */
daySchedule.on('message', (ctx) => {
	replyWithSavedTime(ctx, '⚠ *Неверный формат времени. Попробуй еще раз.*' + MESSAGE);
});

daySchedule.leave((ctx) => {
	deleteLastMessage(ctx);
	ctx.replyWithMarkdown('〽 *Главное меню*', mainMenuKeyboard(ctx));
});



function replyWithSavedTime(ctx, msgText=MESSAGE_TITLE) {
	ctx.replyWithMarkdown( msgText, Markup.inlineKeyboard(getSavedTime(ctx)).extra() )
		.then(msg => deleteLastMessage(ctx, msg.message_id));
}

function getSavedTime(ctx) {
	let keyboard = [];
	let time = ctx.session.user.dayScheduleTime;
	for (let i = 0; i < time.length; i++) {
		let stringTime = `${time[i].hours}:${time[i].minutes < 10 ? '0'+time[i].minutes : time[i].minutes}`;
		if (time[i].time === 'exactly') {
			keyboard.push([Markup.callbackButton('⏱ в '+stringTime, 'dayScheduleTime-'+i)]);
		} else {
			keyboard.push([Markup.callbackButton('⏱ '+stringTime+' до пары', 'dayScheduleTime-'+i)]);
		}
	}
	return keyboard;
}