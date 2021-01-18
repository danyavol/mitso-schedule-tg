/** Регулярная проверка баланса пользователей с включенными уведомлениями
 *
 * 1) Получение списка всех пользователей из БД
 * 2) Оставляем только пользователей у которых указан лицевой счет и включены уведомления
 * 3) Отправка запросов на получение баланса
 * 4) Сравнение старого и нового баланса
 * 5) Составление сообщения для отправки пользователю, если баланс изменился
 * 6) Отправка сообщения пользователю
 */

const { getAllUsers, saveUser } = require('../../database/usersCollection');
const { getUserBalance } = require('../../balance/balance');
const sleep = require('../../components/sleep');
const sendBulkMessage = require('../../components/sendBulkMessage');

module.exports = async (bot) => {
	/** 1 */
	let users = await getAllUsers();

	/** 2 */
	users = users.filter(user => {
		if (user.balance && user.balance.number)
			if (user.notifications && user.notifications.balanceChange)
				return true;
		return false;
	});

	/** 3 */
	let promiseArray = [];
	for (let i = 0; i < users.length; i++) {
		if (i !== 0 && i % 50 === 0) await sleep(25000);
		promiseArray.push( getUserBalance(users[i].balance.number) );
	}
	let allBalance;
	await Promise.all(promiseArray).then(result => {
		allBalance = result;
	});

	/** 4 */
	let changedBalance = [];
	for (let balance of allBalance) {
		if (balance.error) {
			console.error('Error getting balance!', balance.text);
			continue;
		}
		for (let user of users) {
			if (user.balance.number === balance.data.number) {
				// Сравнение старого и нового баланса
				let flag = false;
				if (user.balance.balance !== balance.data.balance) flag = true;
				else if (user.balance.dolg !== balance.data.dolg) flag = true;
				else if (user.balance.penia !== balance.data.penia) flag = true;

				// Если изменения есть
				if (flag) {
					// Проверка смотрел ли пользователь баланс до этого
					if (user.balance.balance != null) {
						changedBalance.push({
							id: user.id,
							oldBalance: user.balance,
							newBalance: balance.data
						});
					}
					// Сохранение нового баланса в БД
					user.balance = balance.data;
					saveUser(user);
				}
			}
		}
	}

	/** 5 */
	let sendArray = [];
	for (let user of changedBalance) {
		let {oldBalance, newBalance} = user;
		let msg = `💳 Состояние лицевого счета изменилось!\n\n`;
		msg += countChanges('Баланс', oldBalance.balance, newBalance.balance);
		msg += countChanges('Долг', oldBalance.dolg, newBalance.dolg);
		msg += countChanges('Пеня', oldBalance.penia, newBalance.penia, true);
		msg += `\n💰 Новое состояние баланса:\n`
			+ `Баланс: ${newBalance.balance.toFixed(2)}р\n`
			+ `Основной долг: ${newBalance.dolg.toFixed(2)}р\n`
			+ `Пеня: ${newBalance.penia.toFixed(2)}р`;

		sendArray.push({
			userId: user.id,
			msg: msg
		});
	}
	function countChanges(word, oldValue, newValue, isPenia = false) {
		let msg = '';
		if (oldValue - newValue > 0)
			msg = `↘ ${word} ${isPenia ? 'уменьшилась':'уменьшился'} на ${(oldValue - newValue).toFixed(2)}р\n`;
		else if (oldValue - newValue < 0)
			msg = `↗ ${word} ${isPenia ? 'увеличилась':'увеличился'} на ${(newValue - oldValue).toFixed(2)}р\n`;
		return msg;
	}

	/** 6 */
	sendBulkMessage(bot, sendArray);
	console.log('Проверка баланса пользователей', sendArray);
};