const Composer = require('telegraf/composer')
const schedule = new Composer();
module.exports = schedule;


schedule.use(require('./mySchedule/mySchedule'));
schedule.use(require('./otherSchedule/otherSchedule'));