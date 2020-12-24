require('dotenv').config()

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.TG_BOT_TOKEN)

// Imports
const session = require('telegraf/session')

const { saveUser, findUser } = require('./src/database/usersCollection');

const base_commands = require('./telegraf/commands');
const settings_page = require('./telegraf/pages/settings/settings');
const balance_page = require('./telegraf/pages/balance/balance');

/*
Пример отправки личного сообщения
bot.telegram.sendMessage(251137781, 'Сообщение');
 */

bot.use(session());


/** Сохранение пользователя в БД при первом обращении */
bot.use(async (ctx, next) => {
	if (!ctx.session.user) {
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


bot.use(base_commands);
bot.use(settings_page);
bot.use(balance_page);















bot.launch();