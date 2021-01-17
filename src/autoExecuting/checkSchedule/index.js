/** Проверка обновилось ли расписание групп, включивших уведомления
 *
 * 1) Получение из БД списка пользователей
 * 2) Отбот пользователей с включенными уведомлениями. Сортировка этих пользователей по учебным группам, для избежания повторного отправления запросов
 * 3) Составление ссылок для проверки расписания
 * 4) Получение расписания с сайта МИТСО
 * 5) Получение расписания из БД
 * 6) Сравнение полученного расписания. Оставляем в массиве только группы, расписание которых изменилось
 * 7) Подготовка сообщения для отправки пользователям
 * 8) Составления массива пользователей, которым будет оптравлено сообщение. Отправка сообщений
 */

const { getAllUsers } = require('../../database/usersCollection');
const { getAvailableWeeks, getWeekSchedule } = require('../../database/scheduleCollection')
const sendScheduleRequest = require('../saveAllSchedule/sendScheduleRequest');
const sleep = require('../../components/sleep');
const createLinks = require('./createLinks');

module.exports = async () => {
	/** 1 */
	let users = await getAllUsers();

	/** 2 */
	const GROUPS = [];
	/*
	 GROUPS = [{
		group: '1820 ИСиТ',
		url: 'https://mitso.by/',
		users: [123456, 729457, 543256, ..]
	 }, .. ]
	*/

	for (let user of users) {
		// Проверка включил ли пользователь уведомление
		if (!(user.myGroup && user.notifications && user.notifications.scheduleChange)) continue;

		// Поиск такой же группы в массиве GROUPS
		let flag = true;
		for (let group of GROUPS) {
			if (group.group === user.myGroup.group) {
				group.users.push(user.id);
				flag = false;
				break;
			}
		}

		// Если true, значит такая группа еще не создана, создаем новую
		if (flag) {
			GROUPS.push({
				group: user.myGroup.group,
				url: user.myGroup.url,
				users: [user.id]
			});
		}
	}


	/** 3 */
	let promiseArray = [];
	let requestCounter = 0;
	for (let group of GROUPS) {
		if (requestCounter && requestCounter % 50 === 0) await sleep(25000);

		promiseArray.push(new Promise(async (res, rej) => {
			group.links = await createLinks(group.url);
			res();
		}));
		requestCounter++;
	}
	await Promise.all(promiseArray);


	/** 4 */
	promiseArray = [];
	requestCounter = 0;
	for (let group of GROUPS) {
		group.mitsoSch = [];
		for (let link of group.links) {
			if (requestCounter && requestCounter % 50 === 0) await sleep(25000);

			promiseArray.push(new Promise((res, rej) => {
				sendScheduleRequest(link).then((result) => {
					group.mitsoSch.push(result);
					res();
				}).catch(rej);
			}));
			requestCounter++;
		}
	}
	await Promise.all(promiseArray);

	/** 5 */
	// for (let group of GROUPS) {
	// 	// getAvailableWeeks
	//
	// 	// getWeekSchedule
	// }
	console.log(GROUPS);
};