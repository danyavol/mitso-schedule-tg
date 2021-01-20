const MAX_MSG = 30; // максимальное количество сообщений за раз
const DELAY = 1000; // задержка между отправкой MAX_MSG сообщений
const previousMessages = [];

const { deleteUser } = require('../database/usersCollection')
const sleep = require('./sleep');

/** Массовая рассылка сообщений пользователям
 *
 * messages = [
 *     {
 *         userId: 1238123,
 *         msg: "hello world"
 *     }
 * ]
 */
module.exports = async (bot, messages) => {
	for(let i = 0; i < messages.length; i++) {
		// Механизм ограничения отправки максимум MAX_MSG сообщений за DELAY миллисекунд
		if (previousMessages.length < MAX_MSG) previousMessages.push(Date.now());
		else {
			previousMessages.shift();
			previousMessages.push(Date.now());
		}
		if (previousMessages.length >= MAX_MSG && Date.now() - previousMessages[0] < DELAY) await sleep(DELAY);


		// Отправка сообщения
		bot.telegram.sendMessage(messages[i].userId, messages[i].msg).catch(err => {
			if (!err.response.ok && err.code === 403) {
				// Пользователь заблокировал бота, удаляем его из БД
				deleteUser(err.on.payload.chat_id);
			}
		});
	}
}