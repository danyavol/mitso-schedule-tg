const Composer = require('telegraf/composer')
const schedule = new Composer();

/** Объявление сцены добавления группы */
const Stage = require('telegraf/stage');
const selectGroup = require('./selectGroup');

const stage = new Stage();
stage.register(selectGroup);
schedule.use(stage.middleware());
/** End Объявление сцены добавления группы */

schedule.hears(/добавить мою группу/i, (ctx) => {
	ctx.scene.enter('selectGroup');
});

module.exports = schedule;