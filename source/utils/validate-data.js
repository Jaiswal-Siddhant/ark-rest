// /**
//  * Validates the input data and returns true if it is valid.
//  *
//  * @param {any} data - the input data to be validated
//  * @throws {Error} if the data is missing or invalid
//  * @return {boolean} true if the data is valid, otherwise false
//  */

/**
 * Validates the input data and returns true if it is valid.
 *
 * @param {any} data - the input data to be validated
 * @throws {Error} if the data is missing or invalid
 * @return {boolean} true if the data is valid, otherwise false
 */
const validateData = (data) => {
	if (!data) {
		throw new Error('Oops, there is no config file.');
	}

	if (!data.config.db) {
		throw new Error('Please provide the database configuration');
	}

	if (data.server.port && typeof data.server.port !== 'number') {
		throw new Error('Port must be a number');
	}

	// if (data.server.cors && !Array.isArray(data.server.cors)) {
	// 	throw new Error('CORS routes must be an array');
	// }

	if (data.server.routes && !Array.isArray(data.server.routes)) {
		throw new Error('Routes must be an array');
	}

	if (!data.schemas || !Array.isArray(data.schemas)) {
		throw new Error('Invalid database schema');
	}

	return true;
};

module.exports = { validateData };
