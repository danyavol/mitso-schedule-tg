const repeatFunction = require('../components/repeatFunction');
const saveAllSchedule = require('./saveAllSchedule/index');

module.exports = async (bot) => {

	repeatFunction(saveAllSchedule, {h:24}, {h:24});

}