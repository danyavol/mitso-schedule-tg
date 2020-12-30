const {longToShortDate} = require('./time');
const divideLongMessage = require('./divideLongMessage');

module.exports = (lessons, firstTitle, secondTitle, writeGroup=false) => {
	let msg = '📆 ';
	if (lessons.length) {
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
}