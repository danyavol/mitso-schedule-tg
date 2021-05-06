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
	console.info('Началось сохранение расписания всех групп... ', timeStamp());

	/** Step 1 */
	const links = await createLinks();
	/** End Step 1 */

	/** Step 2 */
	let SCHEDULE = [];

	let promiseArray = [];
	for (let nWeek in links) {
		for (let link of links[nWeek]) {
			promiseArray.push( sendScheduleRequest(link) );
			await sleep(1000);
		}
	}
	await Promise.all(promiseArray)
		.then(response => SCHEDULE = response)
		.catch(err => console.error('src/autoExecuting/saveAllSchedule/index.js\n','Promise all error'));
	/** End Step 2 */

	/** Step 3 */
	await saveSchedule(SCHEDULE);
	/** End Step 3 */

	console.info(`Сохранение расписания окончено... Недель сохранено - ${SCHEDULE.length}...`, timeStamp());
}