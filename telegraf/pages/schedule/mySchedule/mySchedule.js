const Composer = require('telegraf/composer')
const mySchedule = new Composer();
module.exports = mySchedule;


mySchedule.hears(/добавить мою группу/i, (ctx) => {
	ctx.session.sceneType = "mySchedule";
	ctx.scene.enter('selectGroup');
});