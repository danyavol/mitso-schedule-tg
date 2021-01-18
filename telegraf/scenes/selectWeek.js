const Markup = require('telegraf/markup');

const { getAvailableWeeks } = require('../../src/database/scheduleCollection')
const deleteLastMessage = require('../deleteLastMessage');

const Scene = require('telegraf/scenes/base')
const selectWeek = new Scene('selectWeek');
module.exports = selectWeek;

selectWeek.enter(async (ctx) => {
	let keyboard = [],
		group, title, archive = false, archiveTitle;
	switch (ctx.session.sceneType) {
		case "mySchedule":
			group = ctx.session.user.myGroup.group;
			title = 'mySchedule-';
			archiveTitle = 'mySchedule-archive'
			break;
		case "myScheduleArchive":
			group = ctx.session.user.myGroup.group;
			title = 'mySchedule-';
			archive = true;
			break;
		case "teacherSchedule":
			title = 'teacherSchedule-';
			archiveTitle = 'teacherSchedule-archive';
			break;
		case "teacherScheduleArchive":
			title = 'teacherSchedule-';
			archive = true;
			break;
		case "otherSchedule":
			group = ctx.session.selectedGroup;
			title = 'otherSchedule-';
			archiveTitle = 'otherSchedule-archive';
			break;
		case "otherScheduleArchive":
			group = ctx.session.selectedGroup;
			title = 'otherSchedule-';
			archive = true;
			break;
	}

	// Массив недель, котоыре нужно показать пользователю
	let weeks = await getAvailableWeeks(group, archive);

	// Преобразование массива недель в массив кнопок
	for (let week of weeks) {
		keyboard.push([Markup.callbackButton(week.name, title + week.collection)]);
	}

	// Если показывается НЕ архив, тогда добавить дополнительную кнопку для открытия архива
	if (!archive) keyboard.push([Markup.callbackButton('📂 Предыдущие недели', archiveTitle)]);


	ctx.replyWithMarkdown(`📅 Выбери нужную неделю${archive ? '\n\n_Отображается дата начала недели, понедельник_' : (weeks.length ? '' : '\n\n_Актуальные недели не найдены_')}`,
		Markup.inlineKeyboard(keyboard).extra())
	.then(msg => {
		deleteLastMessage(ctx, msg.message_id);
		delete ctx.session.sceneType;
		ctx.scene.leave();
	});
});