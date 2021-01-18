const { selectDay } = require('../../../../src/components/time');
const { getDaySchedule, getWeekSchedule } = require('../../../../src/database/scheduleCollection');
const { daySchedule, weekSchedule } = require('../../../../src/components/createOutputMessage');
const deleteLastMessage = require('../../../deleteLastMessage');
const { getWeekTitle } = require('../../../../src/components/time');

const Composer = require('telegraf/composer')
const mySchedule = new Composer();
module.exports = mySchedule;


mySchedule.hears(/добавить мою группу/i, (ctx) => {
	ctx.session.sceneType = "mySchedule";
	ctx.scene.enter('selectGroup');
});

mySchedule.hears(/неделя/i, (ctx) => {
	if (!ctx.session.user.myGroup.group) return;
	ctx.session.sceneType = "mySchedule";
	ctx.session.archive = false;
	ctx.scene.enter('selectWeek');
});

mySchedule.hears(/(сегодня|завтра)/i, async (ctx) => {
	if (!ctx.session.user.myGroup.group) return;
	let dayIncrement = 0;
	if (/завтра/i.test(ctx.message.text)) dayIncrement = 1;

	let dayInfo = selectDay(dayIncrement);
	let lessons = await getDaySchedule(ctx.session.user.myGroup.group, dayInfo.collection, dayInfo.date);

	let msg = daySchedule(lessons, dayIncrement, dayInfo);

	await ctx.reply(msg);
});

mySchedule.action(/mySchedule-archive/, async (ctx) => {
	ctx.session.sceneType = "myScheduleArchive";
	ctx.session.archive = true;
	ctx.scene.enter('selectWeek');
});

/** Расписание на неделю, collection - выбранная любая неделя в базе данных */
mySchedule.action(/mySchedule-/, async (ctx) => {
	const data = ctx.callbackQuery.data;
	let collection = data.split('-')[1];

	let lessons = await getWeekSchedule(ctx.session.user.myGroup.group, collection);

	let dividedMsg = weekSchedule(lessons, ctx.session.user.myGroup.group,
		ctx.session.archive ? 'Из архива' : getWeekTitle(collection));

	delete ctx.session.archive;

	deleteLastMessage(ctx);
	// Отправка сообщения
	for (let msg of dividedMsg) {
		await ctx.reply(msg);
	}
});

