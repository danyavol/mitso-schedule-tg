const repeatFunction = require('../components/repeatFunction');

const saveAllSchedule = require('./saveAllSchedule/index');
const checkBalance = require('./checkBalance/index');
const checkSchedule = require('./checkSchedule/index');

module.exports = async (bot) => {

	// Сохранение всего расписания в БД. Каждый день в 24 часа 10 минут UTC
	repeatFunction(saveAllSchedule, {h:24}, {h:24, m:10});

	// Проверка баланса пользователей, которые включили уведомления. Каждый час в 5 минут
	repeatFunction(() => checkBalance(bot), {h:1}, {m:5});

	// Проверка расписания пользователей, которые включили уведомления. Каждые 15 минут
	repeatFunction(() => checkSchedule(bot), {m:15}, {m:0});
}