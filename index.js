require('dotenv').config()

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.TG_BOT_TOKEN)

const { saveUser, findUser } = require('./src/database/usersCollection');

const base_commands = require('./telegraf/commands');
const settings_page = require('./telegraf/pages/settings/settings');
const balance_page = require('./telegraf/pages/balance/balance');
const schedule_page = require('./telegraf/pages/schedule/schedule');
const teachers_page = require('./telegraf/pages/teachers/teachers');


const autoExecution = require('./src/autoExecuting/index');
autoExecution(bot);


const session = require('telegraf/session')
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
	// Обновление lastUseAt
	if (Date.now() - ctx.session.user.lastUseAt.getTime() >= 1000*60*60) {
		saveUser(ctx.sesssion.user, true);
	}
	await next();
});

/** Stage middleware */
const Stage = require('telegraf/stage');
const stage = new Stage();

stage.register(require('./telegraf/scenes/selectGroup'));
stage.register(require('./telegraf/scenes/addBalance'));
stage.register(require('./telegraf/scenes/selectWeek'));
stage.register(require('./telegraf/scenes/showTeacherSchedule'));

bot.use(stage.middleware());
/** End Stage middleware */

bot.use(schedule_page);
bot.use(balance_page);
bot.use(teachers_page);
bot.use(settings_page);
bot.use(base_commands);



bot.launch();