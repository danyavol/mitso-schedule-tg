const mongoose = require('mongoose');
const { encodeWeekNumber, selectWeek } = require('../components/time')


module.exports.saveSchedule = async (schedule) => {
	// schedule = [ [{week: , date: , lessonName: , ...}, ...] ]
	let conn;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/schedule', {useNewUrlParser: true, useUnifiedTopology: true});

		let promiseArray = [];
		schedule.map(lessons => {
			if (lessons[0]) {
				let collection = conn.collection(encodeWeekNumber(lessons[0].week));
				promiseArray.push(
					new Promise((res) => {
						collection.updateOne({group: lessons[0].group}, {$set: {group: lessons[0].group, lessons: lessons}},
							{upsert: true},
							res);
					})

				);
			}
		})

		await Promise.all(promiseArray);
	} catch (e) {
		console.log('Error saving user data!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}
}

module.exports.getAvailableWeeks = (group) => {

};

module.exports.getWeekSchedule = async (group, weekIncrement=0) => {
	let conn, schedule;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/schedule', {useNewUrlParser: true, useUnifiedTopology: true});
		let collection = conn.collection(selectWeek(weekIncrement));

		schedule = await collection.findOne({group: group});
	} catch (e) {
		console.log('Error getting week schedule data!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}

	return schedule && schedule.lessons;
};