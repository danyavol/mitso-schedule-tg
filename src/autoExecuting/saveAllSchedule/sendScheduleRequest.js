const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent( {rejectUnauthorized: false} );
const handleError = require('../../components/handleAxiosError.js');
const cheerio = require('cheerio');


let rejectedCount = 0;

module.exports = async function sendScheduleRequest(link) {
	return new Promise((res, rej) => {
		axios.get(link, {httpsAgent})
			.then(response => {
				res( parseSchedulePage(response.data) );
			})
			.catch(error => {
				rejectedCount++;
				console.warn('src/autoExecuting/saveAllSchedule/sendScheduleRequest.js\nURL:'+link+'\n', handleError(error));
				rej();
				//console.log(reason);
			})
	});
}

let resolvedCount = 0;

function parseSchedulePage(html) {
	const LESSONS = [];
	const $ = cheerio.load(html);

	let docTitle = $('#sch .rp-rasp-n span');
	const groupName = docTitle.eq(0).text();
	const week = docTitle.eq(1).text().slice(0, -1);
	resolvedCount++;
	//console.log(resolvedCount, groupName, week);

	// Перебор всех дней недели
	$('#sch .rp-ras > div').each((i, elem) => {
		const date = $(elem).find('.rp-ras-data').text();
		const dayOfWeek = $(elem).find('.rp-ras-data2').text();

		// Перебор занятий в одном дне недели
		$(elem).find('.rp-ras-opis > div').each((i, elem) => {
			// Проверка, если ли даннные о занятии
			if ( $(elem).find('.rp-r-op > div').length) {
				const lessonFullName = $(elem).find('.rp-r-op > div').html();
				const classRoom = $(elem).find('.rp-r-aud').html();
				const lessonTime = $(elem).find('.rp-r-time').text();
				let data = normalizeLesson(lessonFullName, classRoom);

				LESSONS.push({
					week: week,
					date: date,
					day: dayOfWeek,

					group: groupName,
					teachers: data.teachers,
					lessonName: data.lessonName,
					lessonType: data.lessonType,
					classRoom: data.classRoom,
					time: lessonTime
				})
			}
		});
	});

	return LESSONS;
}


function normalizeLesson(lessonString, classRoomString) {
	const regExp_teacher = /[А-Я|Ё][а-я|ё]+\s*[А-Я]\.\s*[А-Я]\./g;
	const regExp_lessonType = /\([^)]*\)/g;

	const result = {
		teachers: [],
		classRoom: '',

		lessonType: '',
		lessonName: ''
	};

	// Поиск преподавателя
	let teacher = lessonString.match(regExp_teacher);
	if (teacher) result.teachers = teacher;

	// Нормализация учебной аудитории
	result.classRoom = classRoomString.split('<br>').join(', ');

	// Поиск типа занятия
	let lessonType = lessonString.match(regExp_lessonType);
	if (lessonType) result.lessonType = lessonType[lessonType.length-1].slice(1, -1);

	// Поиск названия занятия
	lessonString = lessonString.split('\n').join(' ');
	let index = lessonString.indexOf('(' + result.lessonType + ')');
	let variant = lessonString.slice(0, index).trim();
    
	// Удаление цифры в начале названия
    let num = variant.match(/^\d\./);
    if (num) variant = variant.slice(2, variant.length).trim();

    result.lessonName = variant;

	return result;
}