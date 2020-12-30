require('dotenv').config()

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.TG_BOT_TOKEN)

// Imports
const session = require('telegraf/session')

const { saveUser, findUser } = require('./src/database/usersCollection');

const base_commands = require('./telegraf/commands');
const settings_page = require('./telegraf/pages/settings/settings');
const balance_page = require('./telegraf/pages/balance/balance');
const schedule_page = require('./telegraf/pages/schedule/schedule');

/*
Пример отправки личного сообщения
bot.telegram.sendMessage(251137781, 'Сообщение');
 */
bot.use(session());


/** Сохранение пользователя в БД при первом обращении
 * Пока не получится загрузить ctx.session.user, бот работать не будет */
bot.use(async (ctx, next) => {
	if (!ctx.session.user) {
		if (!ctx.message) return await next();
		let user = await findUser({id: ctx.message.from.id});
		if (user instanceof Error) return ctx.reply(user.message);

		// Данный пользователь уже есть в БД, выгружаем его данные
		if (user) {
			user.lastUseAt = Date.now();
			ctx.session.user = user;
			saveUser(user);
		}

		// Данного пользователя еще нету в БД, сохраняем его
		else {
			let {from} = ctx.message;
			user = {
				id: from.id,
				firstName: from.first_name,
				lastName: from.last_name || null,
				username: from.username || null,
				isBot: from.is_bot,
				language: from.language_code || null,
				createdAt: Date.now(),
				lastUseAt: Date.now()
			}

			user = await saveUser(user);
			ctx.session.user = user;
		}
	}
	await next();
});


bot.use(balance_page);
bot.use(settings_page);
bot.use(schedule_page);
bot.use(base_commands);


/**
 * Каким образом будет происходить просмотр баланса?
 * ------------
 * Просмотр всего расписания пользователем будет производиться ТОЛЬКО из БД.
 * Периодически сервер будет отправять запрос на сайт МИТСО и получать актуальное расписание.
 * Для людей, подписавшихся на уведомления, проверка будет производиться каждые 10 минут
 * Расписание остальных групп будет обновляться раз в сутки
 *
 *
 * Процесс сохранения всего расписания в БД
 * ------------
 * 1) Создание массива ссылок, на которые будут отправляться запросы
 * 		Включается в себя дерево запросов на /schedule_update и составляется большой массив ссылок на абсолютно все группы и недели
 * 2) Отправка запросов на эти ссылки
 * 		С некоторым интервалом отправляются запросы на эти ссылки. Запросы, не получившие ответ,
 * 		добавляются в отдельный массив и будут отправлены повторно позднее.
 * 		Результатом выполнения этой функции будет куча HTML строк
 * 3) Парсинг HTML страничек
 * 		На этом этапе HTML строки будут преобразовываться в DOM дерево и будет производиться поиск занятий
 * 		Сформируется масиив, подготовленный к сохранению в БД
 * 4) Сохранение в БД
 *
 * 
 *
 * */















bot.launch();