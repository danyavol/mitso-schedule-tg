const { saveUser } = require('../../../src/database/usersCollection')
const { getUserBalance } = require('../../../src/balance/balance');

const Composer = require('telegraf/composer')
const balance = new Composer();

balance.hears(/баланс/i, async (ctx) => {
	let balance = await getUserBalance(100546);
	ctx.reply(balance.text);
	if (!balance.error) {

	}
	console.log(balance);
});

balance.action(/balance-/, async (ctx) => {

});

module.exports = balance;