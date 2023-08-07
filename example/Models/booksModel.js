// Make sure to import model and schema from ark exports
const { Schema, Model } = require('ark-rest/exports');

const bookSchema = new Schema({
	name: {
		type: String,
		required: true,
		min: 4,
	},
	imgUrl: {
		type: String,
		required: false,
	},
	author: {
		type: String,
		required: true,
		min: 3,
	},
	pages: {
		type: Number,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});

module.exports = Model('Book', bookSchema);
