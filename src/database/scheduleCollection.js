const mongoose = require('mongoose');
const { encodeWeekNumber, selectWeek, getWeekTitle } = require('../components/time')


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
		console.log('Error saving schedule!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}
}

/** Получение списка актуальных недель выбранной группы */
module.exports.getAvailableWeeks = async (group) => {
	let conn, weeks = [];
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/schedule', {useNewUrlParser: true, useUnifiedTopology: true});
		let collections = await conn.db.listCollections().toArray();

		// Оставляем только актуальные недели
		let currentWeek = selectWeek(0);
		collections = collections.filter(item => +item.name >= +currentWeek);

		// Оставляем только недели, на которых есть расписание выбранной группы
		for (let i = collections.length-1; i >= 0; i--) {
			let lessons = await conn.collection(collections[i].name).findOne({group: group});
			if (lessons == null)
				collections.splice(i, 1);
			else
				weeks.push({
					collection: collections[i].name,
					name: getWeekTitle(collections[i].name)
				});
		}
		// Сортировка недель
		weeks.sort((a, b) => {
			return (+a.collection) - (+b.collection);
		});
	} catch (e) {
		console.log('Error getting available weeks!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}

	return weeks;
};

/** Получение расписания на неделю выбранной группы */
module.exports.getWeekSchedule = async (group, collectionName) => {
	let conn, schedule;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/schedule', {useNewUrlParser: true, useUnifiedTopology: true});
		let collection = conn.collection(collectionName);

		schedule = await collection.findOne({group: group});
	} catch (e) {
		console.log('Error getting week schedule!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}

	return schedule && schedule.lessons;
};

/** Получение расписания на день выбранной группы */
module.exports.getDaySchedule = async (group, collectionName, date) => {
	let conn, schedule;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/schedule', {useNewUrlParser: true, useUnifiedTopology: true});
		let collection = conn.collection(collectionName);

		schedule = await collection.findOne({group: group});
		if (schedule && schedule.lessons && date)
			schedule.lessons = schedule.lessons.filter(item => item.date === date);
	} catch (e) {
		console.log('Error getting day schedule!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}

	return schedule && schedule.lessons;
}