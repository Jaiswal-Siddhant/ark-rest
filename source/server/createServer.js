const cors = require('cors');
const { extendRoutes, createRoutes, createAuth } = require('../controllers');

let server;

// TODO fix: Bug here, Somewhere..., Probably not
// CORS is not being applied in following line
// or it probably is being applied and im dumb
const createServer = (app, inputFile) => {
	const { schemas, server } = inputFile;

	if (server.cors) {
		app.use(cors(server.cors));
	}

	createRoutes(app, schemas);

	if (server.extendRoutes) {
		extendRoutes(app, server.extendRoutes);
	}

	if (server.auth && server.auth.enabled) {
		createAuthRoutes(app, server.auth);
	}

	const port = server.port || 6666;

	// s.close();
	startServer(app, port);
	return app;
};

function startServer(app, port, msg) {
	server = app.listen(port, () => {
		console.log(`${msg ? msg : 'Server started'}: 127.0.0.1:${port}`);
	});
}

function stopServer() {
	if (server) {
		server.close();
	}
}

function createAuthRoutes(app, auth) {
	if (!auth.schema) throw new Error('Schema for auth is not provided');

	createAuth(app, auth);
	// if (!auth.routes || !auth.routes.login || !auth.routes.logout || !auth.routes.register)
	//     throw new Error("Option Auth is not configured correctly")
}

module.exports = { createServer, startServer, stopServer };
