const { saveUser } = require('../../../src/database/usersCollection');
const { getUserBalance } = require('../../../src/balance/balance');
const deleteLastMessage = require('../../deleteLastMessage');

const Composer = require('telegraf/composer')
const balance = new Composer();
module.exports = balance;


balance.hears(/(баланс|лицевой счет)/i, async (ctx) => {
	// Если пользователь добавил номер лицевого счета
	if (ctx.session.user.balance && ctx.session.user.balance.number) {
		await ctx.reply('⏳ Загрузка...').then(msg => deleteLastMessage(ctx, msg.message_id));
		let balance = await getUserBalance(ctx.session.user.balance.number);

		// Сохранение баланса в БД если успешно получили баланс
		if (!balance.error) {
			ctx.session.user.balance = balance.data;
			saveUser(ctx.session.user, true);
		}

		deleteLastMessage(ctx);
		await ctx.reply(balance.text);
	}
	// Если лицевой счет не сохранен
	else {
		ctx.scene.enter('addBalance');
	}
});