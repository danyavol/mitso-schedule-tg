/**
 * Сохранение расписания всех групп университета в базу данных
 *
 * Steps:
 * 1) Создание массива ссылок, на которые будут отправляться запросы
 * 2) Отправка запросов на эти ссылки и парсинг HTML страничек
 * 3) Сохранение расписания в БД
 */

const createLinks = require('./createLinks');
const sendScheduleRequest = require('./sendScheduleRequest');
const { timeStamp } = require('../../components/time');
const sleep = require('../../components/sleep');
const { saveSchedule } = require('../../database/scheduleCollection');

module.exports = async function saveAllSchedule() {
	console.log('Началось сохранение расписания всех групп... ', timeStamp());

	/** Step 1 */
	const links = await createLinks();
	/** End Step 1 */

	/** Step 2 */
	let SCHEDULE = [];

	let promiseArray = [];
	let requestCounter = 0;
	for (let nWeek in links) {
		for (let link of links[nWeek]) {
			if (requestCounter && requestCounter % 50 === 0) {
				await sleep(30000);
			}
			promiseArray.push( sendScheduleRequest(link) );
			requestCounter++;
		}
	}
	await Promise.all(promiseArray)
		.then(response => SCHEDULE = response)
		.catch(err => console.error('Promise all error', err));
	/** End Step 2 */

	/** Step 3 */
	await saveSchedule(SCHEDULE);
	/** End Step 3 */

	console.log(`Сохранение расписания окончено... Недель сохранено - ${SCHEDULE.length}...`, timeStamp());
}