/** Создания таймаутов для отправки расписания на день
 *
 * 1) Получение пользователей с включенными уведомлениями, сортировка их по группам
 * 2) Получение расписания групп на сегодня и завтра
 * 3) Подсчет времени до уведомления и создание таймаутов
 * */

const { getAllUsers } = require('../../database/usersCollection');
const { getDaySchedule } = require('../../database/scheduleCollection');
const { selectDay, getDate, getMinskDate } = require('../../components/time');
const { daySchedule } = require('../../components/createOutputMessage');
const sendBulkMessage = require('../../components/sendBulkMessage');

module.exports = async (bot) => {
	/** 1 */
	let users = await getAllUsers();
	let GROUPS = [];
	// GROUPS = [{
	// group: '1820 ИСиТ',
	// users: [{ id: 1212123, dayScheduleRequest: [{time: , hours: , minutes:}] }, .. ]
	// }]
	for (let user of users) {
		// Проверка включил ли пользователь уведомление
		if (!(user.myGroup && user.notifications && user.notifications.daySchedule)) continue;

		// Поиск такой же группы в массиве GROUPS
		let flag = true;
		for (let group of GROUPS) {
			if (group.group === user.myGroup.group) {
				group.users.push({id: user.id, dayScheduleTime: user.dayScheduleTime});
				flag = false;
				break;
			}
		}

		// Если true, значит такая группа еще не создана, создаем новую
		if (flag) {
			GROUPS.push({
				group: user.myGroup.group,
				users: [{id: user.id, dayScheduleTime: user.dayScheduleTime}]
			});
		}
	}

	/** 2 */
	let promiseArray = [];
	for (let group of GROUPS) {
		group.todayInfo = selectDay(0);
		group.tomorrowInfo = selectDay(1);
		promiseArray.push( getDaySchedule(group.group, group.todayInfo.collection, group.todayInfo.date).then(result => group.today = result) );
		promiseArray.push( getDaySchedule(group.group, group.tomorrowInfo.collection, group.tomorrowInfo.date).then(result => group.tomorrow = result) );
	}
	await Promise.all(promiseArray);

	/** 3 */
	let timeoutsArray = [];
	for (let group of GROUPS) {
		for (let user of group.users) {
			for (let time of user.dayScheduleTime) {
				let dayIncrement = 0;
				/** Определяем дату первой пары */
				let lessonTime;
				if (group.today && group.today.length) {
					lessonTime = getDate(group.today[0].date, group.today[0].time);
				} else if (group.tomorrow && group.tomorrow.length) {
					lessonTime = getDate(group.tomorrow[0].date, group.tomorrow[0].time);
					dayIncrement = 1;
				} else continue;


				/** Определяем дату уведомления */
				let now = getMinskDate().getTime();
				let noticeTime;
				/** Если тип времени - relatively */
				if (time.time === 'relatively') {
					let indent = (time.hours*60 + time.minutes)*60*1000;
					noticeTime = lessonTime - indent;

					// Если сейчас больше времени чем дата уведомления, то пробуем следующий день
					if ( now > noticeTime) {
						if (group.tomorrow && group.tomorrow.length) {
							lessonTime = getDate(group.tomorrow[0].date, group.tomorrow[0].time);
							dayIncrement = 1;
							noticeTime = lessonTime - indent;
						} else continue;
					}
				}
				/** Если тип времени - exactly */
				else {
					noticeTime = getExactlyNoticeTime(time.hours, time.minutes);

					// Если время уведомления уже больше чем время первой пары, то пробуем подставить завтрашний день
					if (lessonTime < noticeTime) {
						if (group.tomorrow && group.tomorrow.length) {
							lessonTime = getDate(group.tomorrow[0].date, group.tomorrow[0].time);
							dayIncrement = 1;
						}
						else continue;
					}

					// Если время до пары > 24ч, то игнорируем это уведомление
					if (lessonTime - noticeTime > 1000*60*60*24 || lessonTime < noticeTime) continue; // если время до пары > 24ч
				}


				/** Определяем время до уведомления и создаем уведомление */
				// Составление сообщения с расписанием
				let msg;
				if (dayIncrement === 0) msg = daySchedule(group.today, dayIncrement, group.todayInfo, false);
				else msg = daySchedule(group.tomorrow, dayIncrement, group.tomorrowInfo, false);

				// Создание таймаута
				let timeout = setTimeout(() => sendBulkMessage(bot, [{userId: user.id, msg: msg}]), noticeTime - now);
				timeoutsArray.push(timeout);

// console.log(`--- Расписание на день для ${user.id} - ${time.time}, ${time.hours}:${time.minutes < 10 ? '0'+time.minutes : time.minutes}
// 	${dayIncrement ? 'Завтра пара в '+group.tomorrow[0].time.split('-')[0] : 'Сегодня пара в '+group.today[0].time.split('-')[0]}. Уведомление через ${((noticeTime - now)/(1000*60*60)).toFixed(2)} часов`);
			}
		}
	}

	return timeoutsArray;
};



function getExactlyNoticeTime(hours, minutes) {
	let now = getMinskDate();

	// Если текущее время больше нужного времени, увеличиваем день на 1
	if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() > minutes)) {
		now.setDate(now.getDate()+1);
	}

	now.setHours(hours);
	now.setMinutes(minutes);
	now.setSeconds(0);
	now.setMilliseconds(0);

	return now.getTime();
}