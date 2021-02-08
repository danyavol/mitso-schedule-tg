/** Возвращает сообщение со статистикой бота */

const { getAllUsers } = require('../database/usersCollection');

module.exports = async (ctx) => {
	let msg = '📊 *Статистика бота*\n\n';
	let users = await getAllUsers();

	msg += `_Количество пользователей_  -  *${users.length}*\n`;
	msg += `✅ _Активные пользователи_  -  *${users.filter(u => (u.myGroup || u.balance) && Date.now() - u.lastUseAt.getTime() < 1000*60*60*24*7).length}*\n`; // Последняя активность менее недели назад
	msg += `🚫 _Абсолютный неактив_  -  *${users.filter(u => !u.myGroup && !u.balance).length}*\n\n`

	msg += `📈 Новых пользователей:\n`
	msg += `• _за месяц_  -  *${users.filter(u => Date.now() - u.createdAt.getTime() < 1000*60*60*24*30).length}*\n`;
	msg += `• _за неделю_  -  *${users.filter(u => Date.now() - u.createdAt.getTime() < 1000*60*60*24*7).length}*\n`;
	msg += `• _за день_  -  *${users.filter(u => Date.now() - u.createdAt.getTime() < 1000*60*60*24).length}*\n\n`;

	/** Подсчет количества людей на курсах */
	let courses = {'1': 0, '2': 0, '3': 0, '4': 0};
	for (let user of users) {
		if (user.myGroup && user.myGroup.url) {
			let kurs = user.myGroup.url.split('/');
			kurs = kurs[kurs.length-2].split(' ')[0];
			if (parseInt(kurs) > 0 && parseInt(kurs) < 5) courses[kurs]++;
		}
	}
	let sumCourses = courses[1] + courses[2] + courses[3] + courses[4];
	/** End Подсчет количества людей на курсах */

	msg += '🧮 Распределение по курсам:\n'
	msg += `_1 курс_  -  *${(courses[1]/sumCourses*100).toFixed(0)}%*          _3 курс_  -  *${(courses[3]/sumCourses*100).toFixed(0)}%*\n`;
	msg += `_2 курс_  -  *${(courses[2]/sumCourses*100).toFixed(0)}%*          _4 курс_  -  *${(courses[4]/sumCourses*100).toFixed(0)}%*\n\n`;

	let usersWithBalance = users.filter(u => u.balance && u.balance.number);
	let usersWithMyGroup = users.filter(u => u.myGroup && u.myGroup.group);
	msg += `💰 _Пользуется балансом_  -  *${(usersWithBalance.length/users.length*100).toFixed(0)}%*\n\n`;

	msg += `🔊 Включены уведомления:\n`;
	msg += `• _об изменении баланса_  -  *${(usersWithBalance.filter(u => u.notifications && u.notifications.balanceChange).length/usersWithBalance.length*100).toFixed(0)}%*\n`;
	msg += `• _об изменении расписания_  -  *${(usersWithMyGroup.filter(u => u.notifications && u.notifications.scheduleChange).length/usersWithMyGroup.length*100).toFixed(0)}%*\n`;
	msg += `• _расписание на день_  -  *${(usersWithMyGroup.filter(u => u.notifications && u.notifications.daySchedule).length/usersWithMyGroup.length*100).toFixed(0)}%*`;

	ctx.replyWithMarkdown(msg);
};