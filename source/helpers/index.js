const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function isValidMongooseSchema(schemaFilePath) {
	const model = require(path.resolve(schemaFilePath));
	let isValid =
		model &&
		typeof model === 'function' &&
		model.prototype instanceof mongoose.Model;

	return isValid;
}

function sanitizeSchema(path) {
	if (!fs.existsSync(path.schema)) {
		throw new Error('Schema file not found');
	}
	if (!isValidMongooseSchema(path.schema)) {
		console.log(path.schema);
		throw new Error('Schema file is invalid');
	}

	return true;
}

module.exports = { isValidMongooseSchema, sanitizeSchema };
