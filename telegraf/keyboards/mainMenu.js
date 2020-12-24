const Markup = require('telegraf/markup');

module.exports = (ctx, oneTime = true) => {
	let keyboard;
	if (ctx.state.user && ctx.state.user.myGroup) {
		// Пользователь уже добавил свою группу
		keyboard = Markup
			.keyboard([
				['📗 Сегодня', '📘 Завтра', '📚 Неделя'],
				['👨🏻‍🎓 Преподаватели', '💰 Лицевой счет'],
				['🗂 Другие группы', '⚙ Настройки']
			]);
	} else {
		// Моя группа не выбрана
		keyboard = Markup
			.keyboard([
				['✅ Добавить мою группу'],
				['👨🏻‍🎓 Преподаватели', '💰 Лицевой счет'],
				['🗂 Другие группы', '⚙ Настройки']
			]);
	}

	if (oneTime) keyboard = keyboard.oneTime();

	return keyboard.resize().extra();
}

