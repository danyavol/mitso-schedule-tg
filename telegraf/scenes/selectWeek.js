const Markup = require('telegraf/markup');

const { getAvailableWeeks } = require('../../src/database/scheduleCollection')
const deleteLastMessage = require('../deleteLastMessage');

const Scene = require('telegraf/scenes/base')
const selectWeek = new Scene('selectWeek');
module.exports = selectWeek;

selectWeek.enter(async (ctx) => {
	let keyboard = [];
	// Расписание моей группы
	if (ctx.session.sceneType === 'mySchedule') {
		let weeks = await getAvailableWeeks(ctx.session.user.myGroup.group);

		for (let week of weeks) {
			keyboard.push([Markup.callbackButton(week.name, `mySchedule-${week.collection}`)]);
		}
		keyboard.push([Markup.callbackButton('📂 Предыдущие недели', `mySchedule-archive`)]);
	}

	ctx.replyWithMarkdown('📅 Выбери нужную неделю',
		Markup.inlineKeyboard(keyboard).extra())
	.then(msg => {
		deleteLastMessage(ctx, msg.message_id);
		delete ctx.session.sceneType;
		ctx.scene.leave();
	});
});