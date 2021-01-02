const {longToShortDate} = require('./time');
const divideLongMessage = require('./divideLongMessage');

module.exports.weekSchedule = (lessons, firstTitle, secondTitle, writeGroup=false) => {
	let msg = '📆 ';
	if (lessons && lessons.length) {
		// Проверка, были ли переданы первый и второй заголовки
		firstTitle ? firstTitle += '\n' : firstTitle = '';
		secondTitle ? secondTitle += '\n' : secondTitle = '';

		// Добавление первого, второго заголовка и заголовка недели
		msg += firstTitle + secondTitle + lessons[0].week + '\n';

		let prevDate;
		lessons.map(ls => {
			// Добавление названия групп
			let groupNumber = '';
			writeGroup ? groupNumber = ls.group + ' ║ ' : null;

			// Добавление заголовка нового дня
			if (prevDate !== ls.date) msg += `\n📍 ${ls.day}, ${longToShortDate(ls.date)}\n`;

			// Добавление информации о занятии
			msg += `🏷 ${ls.time.split('-')[0]} ║ ${groupNumber}${ls.classRoom} ║ ${ls.lessonName} (${ls.lessonType}) │ ${ls.teachers.join(', ')}\n`;

			// Сохранение даты предыдущего занятия, чтобы определять, когда начинается следующий день
			prevDate = ls.date;
		});
	} else {
		msg = '⚠ Расписание на найдено';
	}

	// Разделение сообщения на несколько, если оно превышает лимит длины одного сообщения
	return divideLongMessage(msg);
};

// dayInfo = {date: '19 октября', day: 'завтра', collection: '20201019'}
module.exports.daySchedule = (lessons, dayIncrement, dayInfo) => {
	let msg = '📚 ';
	// Расписание имеется
	if (lessons && lessons.length) {
		msg += `Расписание ${lessons[0].group} `;
		if (dayInfo.day) msg += `на ${dayInfo.day}\n`;
		else {
			if (dayIncrement > 0) {
				dayIncrement < 5 ?
					msg += `через ${Math.abs(dayIncrement)-1} дня\n` :
					msg += `через ${Math.abs(dayIncrement)-1 } дней\n`;
			} else {
				dayIncrement > -5 ?
					msg += `${Math.abs(dayIncrement)} дня назад\n` :
					msg += `${Math.abs(dayIncrement)} дней назад\n`;
			}
		}

		msg += `\n📍 ${lessons[0].day}, ${longToShortDate(lessons[0].date)}\n`;
		lessons.map(ls => {
			msg += `🏷 ${ls.time.split('-').join(' - ')} ║ ${ls.classRoom} ║\n ${ls.lessonName} (${ls.lessonType}) │ ${ls.teachers.join(', ')}\n`;
		});
	}
	// Расписания нету
	else {
		let dayOfWeek = '';
		switch(dayInfo.day.dayOfWeek) {
			case (1): dayOfWeek = 'в понедельник'; break;
			case (2): dayOfWeek = 'во вторник'; break;
			case (3): dayOfWeek = 'в среду'; break;
			case (4): dayOfWeek = 'в четверг'; break;
			case (5): dayOfWeek = 'в пятницу'; break;
			case (6): dayOfWeek = 'в субботу'; break;
			case (0): dayOfWeek = 'в воскресенье'; break;
		}

		let d = dayInfo.day.split('');
		d[0] = d[0].toUpperCase();

		if (dayInfo.day) {
			if (dayIncrement >= 0) {
				return `📚 ${d.join('')} ${dayOfWeek} ${dayInfo.date} занятий нет.`;
			} else {
				return `📚 ${d.join('')} ${dayOfWeek} ${dayInfo.date} занятий не было.`;
			}
		} else {
			if (dayIncrement > 0) {
				return `📚 Через ${dayIncrement - 1} дня ${dayOfWeek} ${dayInfo.date} занятий не будет.`
			} else {
				return `📚 ${Math.abs(dayIncrement)} дней назад ${dayOfWeek} ${dayInfo.date} занятий не было.`
			}
		}

	}
	return msg;
};