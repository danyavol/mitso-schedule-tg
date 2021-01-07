const mongoose = require('mongoose');
const { encodeWeekNumber, selectWeek, getWeekTitle, getDate } = require('../components/time')


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
module.exports.getAvailableWeeks = async (group, archive=false) => {
	let conn, weeks = [];
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/schedule', {useNewUrlParser: true, useUnifiedTopology: true});
		let collections = await conn.db.listCollections().toArray();

		// Оставляем только актуальные недели либо недели архива
		let currentWeek = selectWeek(0);
		if (archive) collections = collections.filter(item => +item.name < +currentWeek);
		else collections = collections.filter(item => +item.name >= +currentWeek);

		// Оставляем только недели, на которых есть расписание выбранной группы
		// (либо все коллекции, если группа не указана)
		for (let i = collections.length-1; i >= 0; i--) {
			let lessons;
			if (group) lessons = await conn.collection(collections[i].name).findOne({group: group});
			if (lessons == null && group)
				collections.splice(i, 1);
			else
				weeks.push({
					collection: collections[i].name,
					name: getWeekTitle(collections[i].name, archive)
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

module.exports.getTeacherSchedule = async (teacherName, collectionName) => {
	let conn, schedule = [];
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/schedule', {useNewUrlParser: true, useUnifiedTopology: true});

		let weekSchedule = await conn.collection(collectionName).find().toArray();

		// Поиск всех пар, где есть выбранный преподаватель
		weekSchedule.map(group => {
			group.lessons.map(lesson => {
				lesson.teachers.map(teacher => {
					if (teacher === teacherName) {
						schedule.push(lesson);
					}
				});
			});
		});

		// Сортировка пар по дате
		if (schedule.length) {
			schedule.sort((a, b) => getDate(a.date, a.time) - getDate(b.date, b.time) );
		}

		// Объединение пар у разных групп, но в одно время
		for (let i = 1; i < schedule.length; i++) {
			if (schedule[i].date === schedule[i-1].date &&
			schedule[i].time === schedule[i-1].time &&
			schedule[i].lessonName === schedule[i-1].lessonName &&
			schedule[i].lessonType === schedule[i-1].lessonType &&
			schedule[i].classRoom === schedule[i-1].classRoom) {
				schedule[i-1].group += ', ' + schedule[i].group;
				schedule.splice(i--, 1);
			}
		}
	} catch (e) {
		console.log('Error getting teacher schedule!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}

	return schedule;
}