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
module.exports.decodeWeekNumber = (weekCode) => {
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
 * input -> '8 июня-13 июня'
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

/** Возвращает название коллекции текущей недели(в воскресенье начинается следующая неделя)
 *
 * input ->
 * output -> '20200608'
 */
module.exports.getCurrentWeek = () => {
	// Текущая дата с точностью до часов
	let now = new Date();
	now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours()+3);

	// Проверка какой сейчас день недели
	// Если сейчас воскресенье
	if (now.getDay() === 0) {
		// Добавляем ровно 1 день, чтобы стал понедельник
		now = new Date(now.getTime()+1000*60*60*24)
	}
	// Если любой другой день
	else if (now.getDay() > 1) {
		// Отнимаем столько дней, чтобы была дата понедельника
		now = new Date(now.getTime()-(now.getDay()-1)*1000*60*60*24)
	}

	// Определение месяца и даты
	let month = now.getMonth() + 1, date = now.getDate();
	month < 10 ? month = '0' + month : null;
	date < 10 ? date = '0' + date : null;

	return '' + now.getFullYear() + month + date;
};