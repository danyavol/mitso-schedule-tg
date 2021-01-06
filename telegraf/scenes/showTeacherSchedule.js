const Markup = require('telegraf/markup');

const { getTeacherSchedule } = require('../../src/database/scheduleCollection');
const { getWeekTitle } = require('../../src/components/time');
const { weekSchedule } = require('../../src/components/createOutputMessage');
const mainMenuKeyboard = require('../keyboards/mainMenu');
const deleteLastMessage = require('../deleteLastMessage');

const Scene = require('telegraf/scenes/base')
const showTeacherSchedule = new Scene('showTeacherSchedule');
module.exports = showTeacherSchedule;

showTeacherSchedule.enter(async (ctx) => {

	ctx.replyWithMarkdown(
		"💬 Введи ФАМИЛИЮ и ИНИЦИАЛЫ преподавателя\n\n_Например:_ *Иванов А. В.* _или_ *иванов ав*",
		Markup.keyboard(['↩ На главную']).resize().extra())
	.then(msg => deleteLastMessage(ctx, msg.message_id));
});

showTeacherSchedule.hears(/(главн|меню)/i, (ctx) => {
	ctx.scene.leave();
	ctx.replyWithMarkdown(ctx.state.msg || '〽 *Главное меню*', mainMenuKeyboard(ctx));
});

showTeacherSchedule.on('text', async (ctx) => {
	const regExp_isCorrectInput = /^[А-Я|а-я]{3,}\s+([А-Я|а-я]{1}[\s\.]+[А-Я|а-я]{1}[\s\.]*|[А-Я|а-я]{2}[\s\.]*)$/;
	const regExp_lastName = /[А-Я|а-я]{3,}/;
	const regExp_iniciali = /([А-Я|а-я]{1}[\s\.]+[А-Я|а-я]{1}|[А-Я|а-я]{2})/;

	// Проверка правильности ввода данных
	if (!regExp_isCorrectInput.test(ctx.message.text))
		return ctx.replyWithMarkdown('⚠ Некорректный ввод *ФАМИЛИИ* и *ИНИЦИАЛОВ*, попробуй еще раз.\n\n_Пример ввода:_ *Иванов А.В.*, *Иванов ав*, *иванов а в*.',
		Markup.keyboard(['↩ На главную']).resize().extra())
			.then(msg => deleteLastMessage(ctx, msg.message_id));

	// Обработка входных данных
	let lastName = ctx.message.text.match(regExp_lastName)[0].toLowerCase();
	let iniciali = ctx.message.text.substr(lastName.length).match(regExp_iniciali)[0].toUpperCase();
	let teacherName = lastName[0].toUpperCase() + lastName.substring(1) + ' ' + iniciali.match(/[А-Я]/g).join('. ') + '.';

	// Поиск расписания
	let schedule = await getTeacherSchedule(teacherName, ctx.session.selectedWeek);

	// Отправка расписания пользователю
	if (schedule.length) {
		let dividedMessage = weekSchedule(schedule, teacherName, getWeekTitle(ctx.session.selectedWeek), true);
		for (let msg of dividedMessage) {
			await ctx.reply(msg, mainMenuKeyboard(ctx));
		}
	} else {
		await ctx.reply(`🏖 Преподаватель ${teacherName} не найден, либо у него нету занятий на данной неделе.`, mainMenuKeyboard(ctx));
	}

	ctx.scene.leave();
});

showTeacherSchedule.on('message', (ctx) => {
	ctx.replyWithMarkdown('⚠ Отправь *ФАМИЛИЮ* и *ИНИЦИАЛЫ* преподавателя.', Markup.keyboard(['↩ На главную']).resize().extra())
		.then(msg => deleteLastMessage(ctx, msg.message_id));
});

showTeacherSchedule.leave((ctx) => {
	deleteLastMessage(ctx);
	delete ctx.session.selectedWeek;
});
