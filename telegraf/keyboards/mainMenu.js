const Markup = require('telegraf/markup');

module.exports = (ctx, oneTime = false) => {
	let keyboard;
	if (ctx.state.user && ctx.state.user.myGroup) {
		// Пользователь уже добавил свою группу
		keyboard = Markup
			.keyboard([
				['📗 Сегодня', '📘 Завтра', '📚 Неделя'],
				['👨🏻‍🎓 Преподаватели', '💰 Баланс'],
				['🗂 Другие группы', '⚙ Настройки']
			]);
	} else {
		// Моя группа не выбрана
		keyboard = Markup
			.keyboard([
				['✅ Добавить мою группу'],
				['👨🏻‍🎓 Преподаватели', '💰 Баланс'],
				['🗂 Другие группы', '⚙ Настройки']
			]);
	}

	if (oneTime) keyboard = keyboard.oneTime();

	return keyboard.resize().extra();
}

