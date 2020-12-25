const { saveUser } = require('../../../src/database/usersCollection')
const { getUserBalance } = require('../../../src/balance/balance');

const Composer = require('telegraf/composer')
const balance = new Composer();

const mainMenuKeyboard = require('../../keyboards/mainMenu');
const Markup = require('telegraf/markup');


/** Объявление сцены добавления номера лицевого счета */
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')

const addBalance = new Scene('addBalance');

const stage = new Stage();
stage.register(addBalance);
balance.use(stage.middleware());
/** End Объявление сцены добавления номера лицевого счета */


balance.hears(/(баланс|лицевой счет)/i, async (ctx) => {
	// Если пользователь добавил номер лицевого счета
	if (ctx.session.user.balance && ctx.session.user.balance.number) {
		let balance = await getUserBalance(ctx.session.user.balance.number);

		// Сохранение баланса в БД если успешно получили баланс
		if (!balance.error) {
			ctx.session.user.balance = balance.data;
			saveUser(ctx.session.user, true);
		}

		ctx.reply(balance.text);
	}
	// Если лицевой счет не сохранен
	else {
		ctx.scene.enter('addBalance');
	}

});


addBalance.enter((ctx) => {
	ctx.reply(
		'💬 Введи номер лицевого счета',
		Markup.keyboard([
			['↩ На главную'],
		]).resize().extra());
});

addBalance.hears(/\d{3,10}/, async (ctx) => {
	let number = +ctx.message.text.match(/\d{3,10}/);

	// Сохранение номера в сессию
	if (!ctx.session.user.balance) ctx.session.user.balance = {};
	ctx.session.user.balance.number = number;


	// Сохранение изменений в базу данных
	let savedUser = await saveUser(ctx.session.user, true);
	//console.log(savedUser);
	if (savedUser instanceof Error) {
		delete ctx.session.user.balance.number;
		ctx.state.msg = '❌ Не удалось сохранить номер в базу данных. Попробуй позже.';
	} else {
		ctx.session.user = savedUser;
		ctx.state.msg = '✅ Номер лицевого счета сохранен.';
	}

	ctx.scene.leave();
});

addBalance.hears(/(главн|меню)/, (ctx) => {
	ctx.scene.leave();
});

addBalance.on('message', (ctx) => {
	ctx.replyWithMarkdown('⚠ Неверный номер лицевого счета, попробуй еще раз.\n\n _Номер должен состоять из цифр длиной от 3 до 10 символов._');
})


addBalance.leave((ctx) => {
	ctx.replyWithMarkdown(ctx.state.msg || '〽 *Главное меню*', mainMenuKeyboard(ctx));
})


balance.action(/balance-/, async (ctx) => {

});

module.exports = balance;