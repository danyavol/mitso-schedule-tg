const { Schema } = require('mongoose');
module.exports = new Schema({
	id: Number,
	firstName: String,
	lastName: {type: String, default: null},
	username: {type: String, default: null},
	isBot: Boolean,
	language: {type: String, default: null},
	// myGroup: {
	//
	// },
	// additionalGroups: [
	//
	// ],
	// balance: {
	//
	// },
	notifications: {
		scheduleChange: Boolean,
		balanceChange: Boolean,
		daySchedule: Boolean
	},
	createdAt: Date,
	lastUseAt: Date
});

