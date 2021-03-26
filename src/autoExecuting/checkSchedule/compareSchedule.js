/** Сравнивание расписания в базе данных и расписания с сайта МИТСО
 *
 *
 */
const { longToShortDate, getDate } = require('../../components/time');

module.exports = (groups) => {
	for (let i = groups.length-1; i >= 0; i--) {
		// Если нету расписания на сайте МИТСО - удаляем группу
		if (!groups[i].mitsoSch.length) { groups.splice(i, 1); continue; }

		// Перебор недель
		let newWeeksCounter = 0;
		groups[i].changes = [];
		for (let j = groups[i].mitsoSch.length-1; j >= 0; j--) {
			let flag = true;
			for (let k = groups[i].dbSch.length-1; k >= 0; k--) {
				// Нужные недели найдены
				if (groups[i].mitsoSch[j][0] && groups[i].dbSch[k][0] && 
					groups[i].mitsoSch[j][0].week.split('-')[0] === groups[i].dbSch[k][0].week.split('-')[0]) {
					// Удаляем одинаковые занятия
					let result = compareTwoWeeks(groups[i].mitsoSch[j], groups[i].dbSch[k]);
					// Если есть добавленные или удаленные занятия - добавляем их в groups[i].changes
					if (result.added.length || result.deleted.length) groups[i].changes.push(result);

					flag = false;
					break;
				}

			}
			if (flag) {
				newWeeksCounter++;
				groups[i].changes.push({ week: groups[i].mitsoSch[j][0].week })
			}
		}

		// Появились новые недели
		if (newWeeksCounter) {
			groups[i].msg = `🔥 Расписание ${groups[i].group} обновилось!\n\nНовых недель в расписании - ${newWeeksCounter}`;
			continue;
		}

		// Расписание оказалось одинаковым
		if (!groups[i].changes.length) {
			groups.splice(i, 1);
			continue;
		}

		// Если код дошел до сюда - изменения есть, формируем сообщение
		groups[i].msg = createChangeMessage(groups[i].group, groups[i].changes);


	}
};

// Сравниваем расписание МИТСО и БД одной недели
function compareTwoWeeks(mitsoWeek, dbWeek) {
	let added = JSON.parse(JSON.stringify(mitsoWeek)),
		deleted = JSON.parse(JSON.stringify(dbWeek));

	for (let i = added.length-1; i >= 0; i--) {
		for (let j = deleted.length-1; j >= 0; j--) {
			if (added[i].date === deleted[j].date
				&& added[i].time === deleted[j].time
				&& added[i].lessonName === deleted[j].lessonName
				&& added[i].lessonType === deleted[j].lessonType) {

				added.splice(i, 1);
				deleted.splice(j, 1);
				break;
			}
		}
	}
	return {week: mitsoWeek[0].week, added: added, deleted: deleted};
}

// Формирует сообщение об изменениях в расписании
function createChangeMessage(groupName, changes) {
	let msg = `🔥 Расписание ${groupName} обновилось!`;
	for (let week of changes) {
		msg += `\n\n📝 Изменения ${week.week}:`;

		// Сортировка изменений недели по дням
		let days = [];
		createDays(week.added, 'added', days);
		createDays(week.deleted, 'deleted', days);

		function createDays(obj, field, days) {
			for (let lesson of obj) {
				let flag = true;
				for (let i = 0; i < days.length; i++) {
					if (lesson.date === days[i].date) {
						if (!days[i][field]) days[i][field] = [];
						days[i][field].push(lesson);
						flag = false;
					}
				}
				if (flag) {
					days.push({date: lesson.date, dayOfWeek: lesson.day});
					days[days.length-1][field] = [lesson];
				}
			}
		}

		// Сортировка дней
		days.sort((a, b) => getDate(a.date) - getDate(b.date))

		// Вывод изменений по дням
		for (let day of days) {
			msg += `\n\n📍 ${day.dayOfWeek}, ${longToShortDate(day.date)}`;
			if (day.deleted)
				for (let lesson of day.deleted) {
					msg += `\n➖ ${lesson.time.split('-')[0]} ║ ${lesson.classRoom} ║ ${lesson.lessonName} (${lesson.lessonType}) │ ${lesson.teachers.join(', ')}`;
				}
			if (day.added)
				for (let lesson of day.added) {
					msg += `\n➕ ${lesson.time.split('-')[0]} ║ ${lesson.classRoom} ║ ${lesson.lessonName} (${lesson.lessonType}) │ ${lesson.teachers.join(', ')}`
				}
		}

	}
	return msg;
}