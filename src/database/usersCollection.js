const mongoose = require('mongoose');


module.exports.saveUser = async (userData, updateLastUse=false) => {
	let conn, savedUser;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/data', {useNewUrlParser: true, useUnifiedTopology: true});
		const User = conn.model('User', require('./schemas/user'), 'users');

		if (updateLastUse) userData.lastUseAt = Date.now();
		savedUser = new User(userData);

		await User.updateOne({id: userData.id}, savedUser, {upsert: true});

	} catch (e) {
		console.log('Error saving user data!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}
	return savedUser;
}


module.exports.findUser = async (query) => {
	let conn, foundUser;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/data', {useNewUrlParser: true, useUnifiedTopology: true});
		const User = conn.model('User', require('./schemas/user'), 'users');

		foundUser = await User.findOne(query).exec();
	} catch (e) {
		console.log('Error finding user data!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}
	return foundUser;
}