// Make sure to import model and schema from ark exports
const { Schema, Model } = require('ark-rest/exports');

const user = new Schema({
	name: String,
	age: Number,
	gender: String,
});

module.exports = Model('User', user);
