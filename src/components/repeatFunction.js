/**
 * Выполняет переданную функцию каждый заданный промежуток времени начиная с заданной даты
 *
 * func - link to your function
 * interval - {h: 20, m: 5, s: 15}
 * dateStart - {h: 20, m: 5, even: true/false}
 *
 * Examples:
 * func, {m: 15}, {m:30} 				каждые 15 минут начиная в ближашие 30 минут
 * func, {h: 24}, {h: 23, m: 30}		каждый день в 23:30
 * func, {h: 1}, {m: 1}					каждый час в 01 минуту
 * func, {h: 2}							каждые 2 часа, запуска сразу же
 */
module.exports = function repeatFunc(func, interval=600000, dateStart) {
	if (interval != null && typeof interval === 'object') {
		let newInterval = 0;
		interval.h != null ? newInterval += interval.h*3600000 : null;
		interval.m != null ? newInterval += interval.m*60000 : null;
		interval.s != null ? newInterval += interval.s*1000 : null;

		newInterval != 0 ? interval = newInterval : null;
	}

	if (dateStart != null && typeof dateStart === 'object') {
		let now = new Date();
		let startAt;
		if (dateStart.h != null) {
			// Запуск функции в указанный час
			dateStart.m == null ? dateStart.m = 0 : null;
			startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), dateStart.h, dateStart.m).getTime();
			if (now.getTime() > startAt)
				startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, dateStart.h, dateStart.m).getTime();
		} else if (dateStart.h == null && dateStart.m != null) {
			// Запуск функции в указанную минуту
			startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), dateStart.m).getTime();
			if (now.getTime() > startAt)
				startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, dateStart.m).getTime();
		} else {
			// Запуск функции в ближайший час и 0 минут
			startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0).getTime();
			if (now.getTime() > startAt)
				startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0).getTime();
			if (dateStart.even === true && new Date(startAt).getHours() % 2 != 0)
				startAt = new Date(startAt + 1000*60*60).getTime();
			if (dateStart.even === false && new Date(startAt).getHours() % 2 == 0)
				startAt = new Date(startAt + 1000*60*60).getTime();
		}

		setTimeout( () => { repeatFunc(func, interval) }, startAt - now.getTime());
		return;
	}

	func();
	setTimeout( () => { repeatFunc(func, interval) }, interval);
}