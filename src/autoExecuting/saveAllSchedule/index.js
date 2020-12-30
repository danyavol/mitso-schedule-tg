/**
 * Сохранение расписания всех групп университета в базу данных
 *
 * Steps:
 * 1) Создание массива ссылок, на которые будут отправляться запросы
 * 2) Отправка запросов на эти ссылки и парсинг HTML страничек
 * 3) Сортировка данных и подготовка к сохранению в БД
 * 4) Сохранение расписания в БД
 */

const createLinks = require('./createLinks');
const sendScheduleRequest = require('./sendScheduleRequest');
const { timeStamp } = require('../../components/time');
const sleep = require('../../components/sleep');
const { saveSchedule } = require('../../database/scheduleCollection');

module.exports = async function saveAllSchedule() {
	console.log('Началось сохранение расписания всех групп... ', timeStamp());
	/** Step 1 */
	//const links = await createLinks();
	const links = require('../../../links');
	/** End Step 1 */
	console.log('Ссылки созданы. Отправляемся в сон на 0 секунд... ', timeStamp());
	console.log('Сон окончен. Отправляем запросы... ', timeStamp());

	/** Step 2 */
	let SCHEDULE = [];

	let promiseArray = [];
	let requestCounter = 0;
	for (let nWeek in links) {
		for (let link of links[nWeek]) {
			if (requestCounter && requestCounter % 50 === 0) {
				console.log('sleep');
				await sleep(25000);
			}
			promiseArray.push( sendScheduleRequest(link) );
			requestCounter++;
		}
	}
	console.log('start promise all, promiseArray.length '+promiseArray.length, timeStamp());
	await Promise.all(promiseArray)
		.then(response => SCHEDULE = response)
		.catch(err => console.log('Promise all error', err));
	/** End Step 2 */

	console.log('Добавляем данные в БД... ', timeStamp());
	/** Step 3 */
	console.log('SCHEDULE.length '+SCHEDULE.length);
	await saveSchedule(SCHEDULE);
	/** End Step 3 */
	console.log('Сохранение расписания окончено... ', timeStamp());
}