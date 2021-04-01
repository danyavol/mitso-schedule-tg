require('dotenv').config()
process.env.MAINTENANCE = 0;

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
	if (!getMsgFrom(ctx) || !ctx.session) return;

	if (!ctx.session.user) {
		let msgFrom = getMsgFrom(ctx);

		let user = await findUser({id: msgFrom.id});
		if (user instanceof Error) return ctx.reply(user.message);

		// Данный пользователь уже есть в БД, выгружаем его данные
		if (user) {
			ctx.session.user = user;
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
	// Обновление данных пользователя не чаще чем раз в 10 минут
	if (Date.now() - ctx.session.user.lastUseAt.getTime() >= 1000*60*10) {
		let msgFrom = getMsgFrom(ctx);
		ctx.session.user.firstName = msgFrom.first_name;
		ctx.session.user.lastName = msgFrom.last_name || null;
		ctx.session.user.username = msgFrom.username || null;
		ctx.session.user.language = msgFrom.language_code || null;
		saveUser(ctx.session.user, true);
	}
	await next();
});

// Ручное управление ботом для админа
bot.use(require('./src/maintenance'));

function getMsgFrom(ctx) {
	// В зависимости от типа входящего сообщения, данные о пользователе могут находиться в разных местах
	if (ctx.updateType === 'message') return ctx.message.from;
	else if (ctx.updateType === 'callback_query') return ctx.update.callback_query.from;
	else if (ctx.update.my_chat_member || ctx.update.chat_member) {
		console.info('Кто-то пригласил меня в беседу', JSON.stringify(ctx.update.my_chat_member));
	}
	else {
		console.error('/index.js\n','Не удается найти информацию о пользователе в контексте', ctx);
	}
}

/** Stage middleware */
const Stage = require('telegraf/stage');
const stage = new Stage();

stage.register(require('./telegraf/scenes/selectGroup'));
stage.register(require('./telegraf/scenes/addBalance'));
stage.register(require('./telegraf/scenes/selectWeek'));
stage.register(require('./telegraf/scenes/showTeacherSchedule'));
stage.register(require('./telegraf/scenes/dayScheduleTime'));
stage.register(require('./telegraf/scenes/mitsoSearch'));

bot.use(stage.middleware());
/** End Stage middleware */

bot.use(schedule_page);
bot.use(balance_page);
bot.use(teachers_page);
bot.use(settings_page);
bot.use(base_commands);



bot.launch();
