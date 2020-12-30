const mongoose = require('mongoose');


module.exports.saveGroups = async (groups) => {
	let conn;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/data', {useNewUrlParser: true, useUnifiedTopology: true});
		let collection = conn.collection('groups');

		let promiseArray = [];
		groups.map(group => {
			promiseArray.push(
				new Promise(res => {
					collection.updateOne({group: group.name}, {$set: {group: group.name, url: group.url}}, {upsert: true}, res);
				})
			);
		});
		await Promise.all(promiseArray);
	} catch (e) {
		console.log('Error saving groups!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}
}

module.exports.findGroup = async (groupName) => {
	let conn, group;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/data', {useNewUrlParser: true, useUnifiedTopology: true});
		group = await conn.collection('groups').find({group: {$regex: groupName, $options: "i"}} ).toArray();
	} catch (e) {
		console.log('Error finding group!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}

	return group;
}