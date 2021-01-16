const Markup = require('telegraf/markup');

module.exports = (ctx, oneTime = false) => {
	let kb = [];
	// Проверка добавил пользователь свою группу или нет
	if (!ctx.session.user.myGroup.group) kb.push(['💾 Добавить мою группу']);
	else kb.push(['📗 Сегодня', '📘 Завтра', '📚 Неделя']);

	// Проверка добавил ли пользователь номер лицевого счета
	if (ctx.session.user.balance && ctx.session.user.balance.number)
		kb.push(['👨🏻‍🎓 Преподаватели', '💰 Баланс']);
	else kb.push(['👨🏻‍🎓 Преподаватели', '💾 Добавить лицевой счет']);

	// Добавление остальных кнопок
	kb.push(['🗂 Другая группа', '⚙ Настройки']);

	// Инициализация клавиатуры
	let keyboard = Markup.keyboard(kb);

	// Проверка должна ли клавиатура отображаться до первого нажатия
	if (oneTime) keyboard = keyboard.oneTime();

	return keyboard.resize().extra();
}

