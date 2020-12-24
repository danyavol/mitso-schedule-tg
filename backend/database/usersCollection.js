const mongoose = require('mongoose');




module.exports.saveUser = async (userData) => {
	let conn, savedUser;
	try {
		conn = await mongoose.createConnection(process.env.DB_URI+'/data', {useNewUrlParser: true, useUnifiedTopology: true});
		const User = conn.model('User', require('./schemas/user'), 'users');

		savedUser = await User.updateOne({id: userData.id}, new User(userData), {upsert: true}).exec();

	} catch (e) {
		console.log('Error saving user data!', e);
	} finally {
		conn.close();
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
		console.log('Error saving user data!', e);
	} finally {
		conn.close();
	}
	return foundUser;
}