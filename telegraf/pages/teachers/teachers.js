const Markup = require('telegraf/markup');
const deleteLastMessage = require('../../deleteLastMessage');

const Composer = require('telegraf/composer')
const teachers = new Composer();
module.exports = teachers;

teachers.hears(/преподаватели/i,async (ctx) => {
	let keyboard = [];
	keyboard.push( [Markup.callbackButton('📚 Расписание преподавателя', `teachers-schedule`)] );

	await ctx.replyWithMarkdown('👨🏻‍🎓 Меню преподавателей', Markup.inlineKeyboard(keyboard).extra())
		.then(msg => deleteLastMessage(ctx, msg.message_id));
});

teachers.action(/teachers-schedule/, (ctx) => {
	ctx.session.sceneType = "teacherSchedule";
	ctx.session.archive = false;
	ctx.scene.enter('selectWeek');
});

teachers.action(/teacherSchedule-archive/, (ctx) => {
	ctx.session.sceneType = "teacherScheduleArchive";
	ctx.session.archive = true;
	ctx.scene.enter('selectWeek');
});

teachers.action(/teacherSchedule-/, (ctx) => {
	const data = ctx.callbackQuery.data;
	let collection = data.split('-')[1];
	ctx.session.selectedWeek = collection;
	ctx.scene.enter('showTeacherSchedule');
});