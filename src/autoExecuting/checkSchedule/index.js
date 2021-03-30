/** Проверка обновилось ли расписание групп, включивших уведомления
 *
 * 1) Получение из БД списка пользователей
 * 2) Отбот пользователей с включенными уведомлениями. Сортировка этих пользователей по учебным группам, для избежания повторного отправления запросов
 * 3) Составление ссылок для проверки расписания
 * 4) Получение расписания с сайта МИТСО
 * 5) Получение расписания из БД
 * 6) Сравнение полученного расписания. Подготовка сообщения для отправки пользователям
 * 7) Обновление расписания в БД
 * 8) Составления массива пользователей, которым будет оптравлено сообщение. Отправка сообщений
 */

const { getAllUsers } = require('../../database/usersCollection');
const { getAvailableWeeks, getWeekSchedule, saveSchedule } = require('../../database/scheduleCollection')
const sendScheduleRequest = require('../saveAllSchedule/sendScheduleRequest');
const sleep = require('../../components/sleep');
const createLinks = require('./createLinks');
const compareSchedule = require('./compareSchedule');
const sendBulkMessage = require('../../components/sendBulkMessage');

module.exports = async (bot) => {
	let start = new Date();
	/** 1 */
	let users = await getAllUsers();

	/** 2 */
	const GROUPS = [];
	/*
	 GROUPS = [{
		group: '1820 ИСиТ',
		url: 'https://mitso.by/',
		users: [123456, 729457, 543256, ..],
		links: ['https://mitso.by/1', 'https://mitso.by/2'],
		mitsoSch: [ [week1], [week2] ],
		dbSch: [ [week1], [week2] ],
		changes: [ {week: 'week1', added: [], deleted: []}, .. ],
		msg: 'Расписание обновилось! Поменялось то и то.'
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
		if (requestCounter && requestCounter % 50 === 0) await sleep(30000);

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
			if (requestCounter && requestCounter % 50 === 0) await sleep(30000);

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
	promiseArray = [];
	for (let group of GROUPS) {
		group.dbSch = [];
		promiseArray.push(new Promise(async (res, rej) => {
			let collections = await getAvailableWeeks(group.group);

			for (let item of collections) {
				group.dbSch.push( await getWeekSchedule(group.group, item.collection) );
			}

			res();
		}));
	}
	await Promise.all(promiseArray);

	/** 6 */
	compareSchedule(GROUPS);

	/** 7 */
	for (let group of GROUPS) {
		for (let changedWeek of group.changes) {
			for (let mitsoWeek of group.mitsoSch) {
				if (mitsoWeek[0] && mitsoWeek[0].week === changedWeek.week) {
					saveSchedule([mitsoWeek]);
				}
			}
		}
	}

	/** 8 */
	let messages = [];
	for (let group of GROUPS) {
		for (let user of group.users) {
			messages.push({userId: user, msg: group.msg});
		}
		console.info(group.msg);
	}
	
	await sendBulkMessage(bot, messages);


	let time = ((Date.now() - start.getTime())/1000).toFixed(1);
	if (GROUPS.length)
		console.info(`Проверка расписания окончена. Времени прошло - ${time}сек\nГрупп обновилось - ${GROUPS.length}. Сообщений отправлено - ${messages.length}`);
};