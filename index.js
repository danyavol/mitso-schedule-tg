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
		let msgFrom;
		// В зависимости от типа входящего сообщения, данные о пользователе могут находиться в разных местах
		if (ctx.updateType === 'message') msgFrom = ctx.message.from;
		else if (ctx.updateType === 'callback_query') msgFrom = ctx.update.callback_query.from;
		else {
			console.log('Не удается найти информацию о пользователе в контексте');
			console.log('updateType: ', ctx.updateType);
			return;
		}

		let user = await findUser({id: msgFrom.id});
		if (user instanceof Error) return ctx.reply(user.message);

		// Данный пользователь уже есть в БД, выгружаем его данные
		if (user) {
			user.lastUseAt = Date.now();
			ctx.session.user = user;
			saveUser(user);
		}

		// Данного пользователя еще нету в БД, сохраняем его
		else {
			user = {
				id: msgFrom.id,
				firstName: msgFrom.first_name,
				lastName: msgFrom.last_name || null,
				username: msgFrom.username || null,
				isBot: msgFrom.is_bot,
				language: msgFrom.language_code || null,
				createdAt: Date.now(),
				lastUseAt: Date.now()
			}

			user = await saveUser(user);
			ctx.session.user = user;
		}
	}
	// Обновление lastUseAt
	if (Date.now() - ctx.session.user.lastUseAt.getTime() >= 1000*60*60) {
		saveUser(ctx.session.user, true);
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
