const { Schema } = require('mongoose');
module.exports = new Schema({
	id: Number,
	firstName: String,
	lastName: String,
	username: String,
	isBot: Boolean,
	language: String,
	// myGroup: {
	//
	// },
	// additionalGroups: [
	//
	// ],
	balance: {
		number: Number,
		balance: Number,
		dolg: Number,
		penia: Number
	},
	notifications: {
		scheduleChange: Boolean,
		balanceChange: Boolean,
		daySchedule: Boolean
	},
	createdAt: Date,
	lastUseAt: Date
});

