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

module.exports.deleteUser = async (tgId) => {
	let conn;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/data', {useNewUrlParser: true, useUnifiedTopology: true});

		await conn.collection('users').deleteOne({id: tgId});

	} catch (e) {
		console.log('Error deleting user!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}
};


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
};

module.exports.getAllUsers = async () => {
	let conn, foundUsers;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/data', {useNewUrlParser: true, useUnifiedTopology: true});

		foundUsers = await conn.collection('users').find().toArray();
	} catch (e) {
		console.log('Error finding user data!', e);
		return new Error('Ошибка соединения с базой данных');
	} finally {
		if (conn) conn.close();
	}
	return foundUsers;
};