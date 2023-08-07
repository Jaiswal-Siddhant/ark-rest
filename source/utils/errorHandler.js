class ErrorHandler extends Error {
	statuscode;

	constructor(message, statusCode) {
		super(message);
		this.message = message;
		this.statuscode = parseInt(statusCode);
		Error.captureStackTrace(this, message);
	}
	getError(res) {
		res.setHeader('Content-Type', 'application/json');
		res.status(this.statuscode);
		res.send(JSON.stringify(this.message));
	}
}

module.exports = ErrorHandler;
