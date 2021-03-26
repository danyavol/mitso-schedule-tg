const repeatFunction = require('../components/repeatFunction');

const saveAllSchedule = require('./saveAllSchedule/index');
const checkBalance = require('./checkBalance/index');
const checkSchedule = require('./checkSchedule/index');
const sendDaySchedule = require('./sendDaySchedule/index');

module.exports = async (bot) => {

	// Сохранение всего расписания в БД. Каждый день в 23 часа 25 минут UTC
	repeatFunction(saveAllSchedule, {h:24}, {h:23, m:25});

	// Проверка баланса пользователей, которые включили уведомления. Каждый час в 5 минут
	repeatFunction(() => checkBalance(bot), {h:1}, {m:5});

	// Проверка расписания пользователей, которые включили уведомления. Каждые 10 минут
	repeatFunction(() => checkSchedule(bot), {m:10}, {m:0});

	// Отправка расписания на день. Перепроверка уведомлений каждый час в 15 минут
	let timeouts = [];
	repeatFunction(async () => {
		for (let timeout of timeouts) clearTimeout(timeout);
		timeouts = await sendDaySchedule(bot);
	}, {h:1}, {m: 15});
}