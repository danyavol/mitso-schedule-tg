const { Schema } = require('mongoose');
module.exports = new Schema({
	id: Number,
	firstName: String,
	lastName: String,
	username: String,
	isBot: Boolean,
	language: String,
	myGroup: {
		group: String,
		url: String
	},
	dayScheduleTime: [
		{
			time: String,
			hours: Number,
			minutes: Number
		}
	],
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

