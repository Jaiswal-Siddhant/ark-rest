const path = require('path');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');

function logger(logging) {
	let query = logging.query || ':remote-addr :method :url :response-time';

	if (logging.tokenFunctions) {
		if (!logging.query) {
			console.warn('Psst.. Did you forget to use custom morgan query?');
		}

		for (const token of logging.tokenFunctions) {
			let tokenFunction = require(path.resolve(token.functionPath))[
				token.functionName
			];
			morgan.token(token.id, tokenFunction);
		}
	}

	return morgan(query);
}

async function authMiddleware(inputFile, req, res, next) {
	const token = req.headers.authorization?.split(' ')[1]?.trim();
	if (req.url.includes('auth/')) {
		next();
		return;
	}
	try {

		if (!token) {
			res.status(401).json({
				success: false,
				message: 'Forbidden',
			});
			next();
			return;
		}

		const decodedData = jwt.verify(token, inputFile.server.auth.secret);
		const User = require(path.resolve(inputFile.server.auth.schema));
		const users = await User.find({ email: decodedData.email });

		if (!users || users.length === 0) {
			// res.status(401).json({
			// 	success: false,
			// 	message: 'Forbidden',
			// });
			return next();
		}

		res.user = users[0];
		next();
	} catch (error) {
		console.log(error.message);
		res.status(403).json({
			success: false,
			message: error.message,
		})
		return next(error.message)
	}
}

function configureServer(app, inputFile) {
	const { logging, auth } = inputFile.server;

	if (logging?.enabled) {
		app.use(logger(logging));
	}

	if (auth?.enabled) {
		const cookieParser = require('cookie-parser');
		app.use(cookieParser());

		app.use('/', (req, res, next) => {
			authMiddleware(inputFile, req, res, next);
		});
	}
}

module.exports = { configureServer };
