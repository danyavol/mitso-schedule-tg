const Markup = require('telegraf/markup');
const deleteLastMessage = require('../../../deleteLastMessage');

const { getWeekSchedule } = require('../../../../src/database/scheduleCollection');
const { weekSchedule } = require('../../../../src/components/createOutputMessage');
const { getWeekTitle } = require('../../../../src/components/time');

const mainMenuKeyboard = require('../../../keyboards/mainMenu')

const Composer = require('telegraf/composer')
const otherSchedule = new Composer();
module.exports = otherSchedule;

otherSchedule.hears(/другая группа/i,async (ctx) => {
	ctx.session.sceneType = "otherSchedule";
	ctx.session.archive = false;
	ctx.scene.enter('selectGroup');
});

otherSchedule.action(/otherSchedule-archive/, async (ctx) => {
	ctx.session.sceneType = "otherScheduleArchive";
	ctx.session.archive = true;
	ctx.scene.enter('selectWeek');
});

/** Расписание на неделю, collection - выбранная любая неделя в базе данных */
otherSchedule.action(/otherSchedule-/, async (ctx) => {
	const data = ctx.callbackQuery.data;
	let collection = data.split('-')[1];

	let lessons = await getWeekSchedule(ctx.session.selectedGroup, collection);

	let dividedMsg = weekSchedule(lessons, ctx.session.selectedGroup,
		ctx.session.archive ? 'Из архива' : getWeekTitle(collection));

	delete ctx.session.archive;
	delete ctx.session.selectedGroup;

	deleteLastMessage(ctx);
	// Отправка сообщения
	for (let msg of dividedMsg) {
		await ctx.reply(msg, mainMenuKeyboard(ctx));
	}

});