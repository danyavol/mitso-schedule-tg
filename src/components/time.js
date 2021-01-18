/** Возвращает текущее время по Минской временной зоне */
module.exports.timeStamp = () => {
	const timeZoneUTC = 3;

	let now = new Date();

	// Проверка временной зоны UTC
	if (now.getTimezoneOffset() / 60 !== -timeZoneUTC) {
		let offset = timeZoneUTC * 60 + now.getTimezoneOffset()
		now = new Date(now.getTime() + offset*1000*60);
	}

	return `${now.getHours()}h ${now.getMinutes()}min ${now.getSeconds()}s ${now.getMilliseconds()}ms`;
}


/**
 * Преобразует длинную дату в короткую
 *
 * input -> "7 января"
 * output -> "07.01"
 */
module.exports.longToShortDate = (longDate) => {
	let output = longDate.split(' ');

	// output[0] - day
	if (parseInt(output[0], 10) < 10) output[0] = '0' + output[0];

	// output[1] - month
	let flag = false;
	switch (output[1].slice(0,-1)) {
		case 'январ': output[1] = '01'; break;
		case 'феврал': output[1] = '02'; break;
		case 'март': output[1] = '03'; break;
		case 'мар': output[1] = '03'; break;
		case 'апрел': output[1] = '04'; break;
		case 'ма': output[1] = '05'; break;
		case 'июн': output[1] = '06'; break;
		case 'июл': output[1] = '07'; break;
		case 'август': output[1] = '08'; break;
		case 'сентябр': output[1] = '09'; break;
		case 'октябр': output[1] = '10'; break;
		case 'ноябр': output[1] = '11'; break;
		case 'декабр': output[1] = '12'; break;
		default: flag = true;
	}
	if (flag) return ''; // if incorrect month name

	return output[0] + '.' + output[1];
}


/**
 * Преобразует код недели в строковую дату (код недели - дата понедельника)
 *
 * input -> 20200817 or "20200817"
 * output -> "17 августа 2020"
*/
module.exports.decodeWeekNumber = decodeWeekNumber;
function decodeWeekNumber(weekCode) {
	let output = [];
	let temp = (''+weekCode).split('');
	output.push( temp[6]+temp[7] );

	switch (temp[4]+temp[5]) {
		case '01': output.push('января'); break;
		case '02': output.push('февраля'); break;
		case '03': output.push('марта'); break;
		case '04': output.push('апреля'); break;
		case '05': output.push('мая'); break;
		case '06': output.push('июня'); break;
		case '07': output.push('июля'); break;
		case '08': output.push('августа'); break;
		case '09': output.push('сентября'); break;
		case '10': output.push('октября'); break;
		case '11': output.push('ноября'); break;
		case '12': output.push('декабря'); break;
	}

	output.push( temp[0]+temp[1]+temp[2]+temp[3] );

	return output.join(' ');
}


/** Преобразует номер недели в код для названия коллекции в БД. (код недели - дата понедельника)
 *
 * input -> '8 июня-13 июня' or '8 июня'
 * output -> '20200608'
 */
module.exports.encodeWeekNumber = (weekDate) => {
	// '8 июня-13 июня' -> ['8', 'июня']
	let output = weekDate.split('-')[0].split(' ');

	// Добавление нуля в начало, если число даты < 10
	if (parseInt(output[0], 10) < 10) output[0] = '0' + output[0];

	// Определение месяца даты
	let flag = false;
	switch (output[1].slice(0,-1)) {
		case 'январ': output[1] = '01'; break;
		case 'феврал': output[1] = '02'; break;
		case 'март': output[1] = '03'; break;
		case 'мар': output[1] = '03'; break;
		case 'апрел': output[1] = '04'; break;
		case 'ма': output[1] = '05'; break;
		case 'июн': output[1] = '06'; break;
		case 'июл': output[1] = '07'; break;
		case 'август': output[1] = '08'; break;
		case 'сентябр': output[1] = '09'; break;
		case 'октябр': output[1] = '10'; break;
		case 'ноябр': output[1] = '11'; break;
		case 'декабр': output[1] = '12'; break;
		default: flag = true;
	}
	if (flag) return '';

	let now = new Date();
	let nowYear = now.getFullYear();
	let nowMonth = now.getMonth()+1;

	// Проверка какой год нужно возвращать.
	// Если сейчас октябрь-декабрь, а расписание на январь+, год увеличивается на 1
	if (nowMonth > 9 && parseInt(output[1]) < 4) nowYear++;

	return '' + nowYear + output[1] + output[0];
};

/** Возвращает название недели по имени коллекции */
module.exports.getWeekTitle = (collectionName, archive=false) => {
	let weekIncrement = 0;
	if (!archive)
		while(selectWeek(weekIncrement) !== collectionName && weekIncrement < 20) weekIncrement++;
	else
		return decodeWeekNumber(collectionName);

	if (weekIncrement === 0) return 'Текущая неделя';
	return weekIncrement+1 + ' неделя';
};


/** Возвращает название коллекции выбранной недели(в воскресенье начинается следующая неделя)
 *
 * input -> weekIncrement (0 текущая, 1 следующая неделя, -1 предыдущая неделя)
 * 			currentDate instance of Date
 * output -> '20200608'
 */
module.exports.selectWeek = selectWeek;
function selectWeek (weekIncrement = 0, currentDate) {
	let now;
	if (currentDate && currentDate instanceof Date) now = currentDate;
	else now = new Date();
	// Текущая дата
	now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours()+3);

	// Проверка какой сейчас день недели
	// Если сейчас воскресенье
	if (now.getDay() === 0) {
		// Если currentDate был передам, возвращаем фактичекую неделю,
		// иначе воскресенье становится следующей неделей
		if (currentDate)
			// Убираем 6 дней
			now = new Date(now.getTime()-1000*60*60*24*6);
		 else
			// Добавляем 1 день
			now = new Date(now.getTime()+1000*60*60*24);
	}
	// Если любой другой день
	else if (now.getDay() > 1) {
		// Отнимаем столько дней, чтобы дата стала понедельником
		now = new Date(now.getTime()-(now.getDay()-1)*1000*60*60*24)
	}

	// Инкрементирование, чтобы получить нужную неделю
	now = new Date( now.getTime() + (1000*60*60*24*7)*weekIncrement );

	// Определение месяца и даты
	let month = now.getMonth() + 1, date = now.getDate();
	month < 10 ? month = '0' + month : null;
	date < 10 ? date = '0' + date : null;

	return '' + now.getFullYear() + month + date;
}


/** Возвращает день, расписание на который пользователь хочет получить
 *
 * input -> dayIncrement (0 сегодня, 1 завтра, 2 послезавтра, -1 вчера, -2 позавчера)
 * output -> {date: '19 октября', day: 'завтра', collection: '20201019'}
 */
module.exports.selectDay = (dayIncrement=0) => {
	const final = {};

	// Выбранная дата
	let dd = new Date();
	dd = new Date(dd.getUTCFullYear(), dd.getUTCMonth(), dd.getUTCDate() + dayIncrement, dd.getUTCHours() + 3);

	// Определение дня недели
	final.dayOfWeek = dd.getDay();

	// Определение даты
	let ddMonth;
	switch (dd.getMonth() + 1) {
		case 1: ddMonth = 'января'; break;
		case 2: ddMonth = 'февраля'; break;
		case 3: ddMonth = 'марта'; break;
		case 4: ddMonth = 'апреля'; break;
		case 5: ddMonth = 'мая'; break;
		case 6: ddMonth = 'июня'; break;
		case 7: ddMonth = 'июля'; break;
		case 8: ddMonth = 'августа'; break;
		case 9: ddMonth = 'сентября'; break;
		case 10: ddMonth = 'октября'; break;
		case 11: ddMonth = 'ноября'; break;
		case 12: ddMonth = 'декабря'; break;
	}
	final.date = `${dd.getDate()} ${ddMonth}`;

	// Определение дня
	switch (dayIncrement) {
		case 0: final.day = 'сегодня'; break;
		case 1: final.day = 'завтра'; break;
		case 2: final.day = 'послезавтра'; break;
		case -1: final.day = 'вчера'; break;
		case -2: final.day = 'позавчера'; break;
	}

	// Получение названия коллекции
	final.collection = selectWeek(0, dd);

	return final;
};

/** Возвращает дату занятия */
module.exports.getDate = (date, time="8:00-9:20") => {
	date = 	date.split(' ');
	time = time.split('-')[0].split(':');

	switch (date[1].slice(0,-1)) {
		case 'январ': date[1] = 0; break;
		case 'феврал': date[1] = 1; break;
		case 'март': date[1] = 2; break;
		case 'мар': date[1] = 3; break;
		case 'апрел': date[1] = 4; break;
		case 'ма': date[1] = 5; break;
		case 'июн': date[1] = 6; break;
		case 'июл': date[1] = 7; break;
		case 'август': date[1] = 8; break;
		case 'сентябр': date[1] = 9; break;
		case 'октябр': date[1] = 10; break;
		case 'ноябр': date[1] = 11; break;
		case 'декабр': date[1] = 12; break;
	}

	let now = new Date();

	if (date[1] > 9 && now.getMonth() < 3) now.setFullYear(now.getFullYear()-1);
	else if (date[1] < 3 && now.getMonth() > 9) now.setFullYear(now.getFullYear()+1);

	now.setMonth(date[1]);
	now.setDate(+date[0]);
	now.setHours(time[0]);
	now.setMinutes(time[1]);

	return now.getTime();
};