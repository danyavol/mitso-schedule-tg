const repeatFunction = require('../components/repeatFunction');

const saveAllSchedule = require('./saveAllSchedule/index');
const checkBalance = require('./checkBalance/index');
const checkSchedule = require('./checkSchedule/index');
const sendDaySchedule = require('./sendDaySchedule/index');

module.exports = async (bot) => {

	// Сохранение всего расписания в БД. Каждый день в 23 часа 25 минут UTC
	repeatFunction(() => run(saveAllSchedule, ''), {h:24}, {h:23, m:25});

	// Проверка баланса пользователей, которые включили уведомления. Каждый час в 7 минут
	repeatFunction(() => run(checkBalance, '', [bot]), {h:1}, {m:7});

	// Проверка расписания пользователей, которые включили уведомления. Каждые 10 минут
	repeatFunction(() => run(checkSchedule, '', [bot]), {m:10}, {m:0});

	// Отправка расписания на день. Перепроверка уведомлений каждый час в 17 минут
	let timeouts = [];
	repeatFunction(() => run(restartTimeouts, 'sendDaySch'), {h:1}, {m: 17});

	async function restartTimeouts() {
		for (let timeout of timeouts) clearTimeout(timeout);
		timeouts = await sendDaySchedule(bot);
	}
}

function run(func, funcName, params = []) {
    switch(funcName) {
        case 'sendDaySch':
            if (process.env.SEND_DAY_SCH == 1) func(...params);
            return;
        default:
            if (process.env.MAINTENANCE == 0) func(...params);
            return;
    }
}