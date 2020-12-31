const Markup = require('telegraf/markup');
const deleteLastMessage = require('../deleteLastMessage');
const mainMenuKeyboard = require('../keyboards/mainMenu');

const { saveUser } = require('../../src/database/usersCollection');

const Scene = require('telegraf/scenes/base')
const addBalance = new Scene('addBalance');
module.exports = addBalance;


addBalance.enter((ctx) => {
	deleteLastMessage(ctx);
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

addBalance.hears(/(главн|меню)/i, (ctx) => {
	ctx.scene.leave();
});

addBalance.on('message', (ctx) => {
	ctx.replyWithMarkdown('⚠ Неверный номер лицевого счета, попробуй еще раз.\n\n _Номер должен состоять из цифр длиной от 3 до 10 символов._')
		.then(msg => deleteLastMessage(ctx, msg.message_id));
})


addBalance.leave((ctx) => {
	deleteLastMessage(ctx);
	ctx.replyWithMarkdown(ctx.state.msg || '〽 *Главное меню*', mainMenuKeyboard(ctx));
})