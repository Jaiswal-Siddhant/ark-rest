const path = require('path');
const { sanitizeSchema } = require('../helpers');
const jwt = require('jsonwebtoken');
const { sendToken } = require('../utils/sendToken');
const { logCreatedRoute } = require('../utils/logs');
const express = require('express');

const get = async (req, res, next, schema) => {
	try {
		let params = req.query;
		let Schema = require(path.resolve(schema));

		let data = await (params ? Schema.find(params) : Schema.find({}));

		res.json({ success: true, data });
		next();
	} catch (err) {
		console.error(err);
		// res.json({
		// 	success: false,
		// 	message: err.msg || err.message || 'Something went wrong!',
		// });
	} finally {
		res.end();
	}
};

const post = async (req, res, next, schema) => {
	try {
		let Schema = require(path.resolve(schema));
		let data = new Schema(req.body);

		const status = await data.save();
		res.status(200).json({ success: true, data: status }).end();

		next();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			message: err.msg || err.message || 'Something went wrong!',
		});
	}
};

const patch = async (req, res, next, schema) => {
	try {
		if (!req.body) {
			throw new Error('Provide data to update');
		}
		let Schema = require(path.resolve(schema));
		let id = req.body._id;
		delete req.body._id;
		let dataToUpdate = req.body;

		const data = await Schema.findOneAndUpdate(
			{ _id: id },
			{ $set: dataToUpdate },
			{ useFindAndModify: false }
		);

		if (!data) {
			res.status(404)
				.json({ success: false, message: 'Object not found' })
				.end();
			return;
		}

		res.status(200).json({ success: true, data }).end();
		next();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			message: err.msg || err.message || 'Something went wrong!',
		});
	}
};

const Delete = async (req, res, next, schema) => {
	try {
		let Schema = require(path.resolve(schema));
		let dataToDelete = req.body;

		const data = await Schema.deleteMany(dataToDelete);
		res.status(200).json({ success: true, data }).end();

		next();
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			message: err.msg || err.message || 'Something went wrong!',
		});
	}
};

const extendRoutes = (app, extendRoutes) => {
	if (!extendRoutes.routes || !extendRoutes.routesFilePath)
		throw new Error('Routes extension is not configured correctly');

	const routesFile = require(path.resolve(extendRoutes.routesFilePath));
	for (const routeExtension of extendRoutes.routes) {
		// @ts-ignore
		switch (String(routeExtension.method).toLowerCase()) {
			case 'get':
				app.get(
					routeExtension.route,
					routesFile[routeExtension.functionName]
				);
				logCreatedRoute('GET', `/${routeExtension.route}`);
				break;
			case 'post':
				app.post(
					routeExtension.route,
					routesFile[routeExtension.functionName]
				);
				logCreatedRoute('POST', `/${routeExtension.route}`);
				break;
			case 'put':
				app.put(
					routeExtension.route,
					routesFile[routeExtension.functionName]
				);
				logCreatedRoute('PUT', `/${routeExtension.route}`);
				break;
			case 'delete':
				app.delete(
					routeExtension.route,
					routesFile[routeExtension.functionName]
				);
				logCreatedRoute('DELETE', `/${routeExtension.route}`);
				break;
			case 'patch':
				app.patch(
					routeExtension.route,
					routesFile[routeExtension.functionName]
				);
				logCreatedRoute('PATCH', `/${routeExtension.route}`);
				break;
			case 'options':
				app.options(
					routeExtension.route,
					routesFile[routeExtension.functionName]
				);
				logCreatedRoute('OPTIONS', `/${routeExtension.route}`);
				break;
			default:
				throw new Error('Method not supported');
		}
	}
};

const createRoutes = (app, schemasList) => {
	for (const path of schemasList) {
		sanitizeSchema(path);
		app.get(`/${path.id}`, (req, res, next) =>
			get(req, res, next, path.schema)
		);
		logCreatedRoute(`GET`, `/${path.id}`);

		app.post(`/${path.id}`, (req, res, next) =>
			post(req, res, next, path.schema)
		);
		logCreatedRoute(`POST`, `/${path.id}`);

		app.patch(`/${path.id}`, (req, res, next) =>
			patch(req, res, next, path.schema)
		);
		logCreatedRoute(`PATCH`, `/${path.id}`);

		app.delete(`/${path.id}`, (req, res, next) =>
			Delete(req, res, next, path.schema)
		);
		logCreatedRoute(`Delete`, `/${path.id}`);
	}
};

const createAuth = (app, auth) => {
	let registerRoute = auth.routes?.register?.route || '/register';
	let loginRoute = auth.routes?.login?.route || '/login';
	let customModel = require(path.resolve(auth.schema));
	const router = express.Router();
	// router.use
	// Register route
	router.post(registerRoute, async (req, res, next) => {
		try {
			let user = new customModel(req.body);
			await user.save();
			let secret = null;
			if (auth.secret) {
				secret = auth.secret.includes('process')
					? process.env.SECRET
					: auth.secret;
			} else {
				res.status(403).json({
					success: false,
					message: 'Secret is not provided',
				});
			}

			user = await user.save();
			const token = jwt.sign(req.body.email, secret);

			res.cookie('auth-token', token)
				.header('auth-token', token)
				.json({ success: true, token, data: user })
				.end();
			next();
		} catch (error) {
			res.status(403).json({
				success: false,
				message: error.message,
			});
		}
	});

	// Login route
	router.post(loginRoute, async (req, res, next) => {
		try {
			const { email, password } = req.body;

			if (!email || !password)
				return res.status(403).json({
					success: false,
					message: 'Please enter email and password',
				});

			const user = await customModel
				.findOne({ email })
				.select('+password');

			if (!user)
				return res.status(403).json({
					success: false,
					message: 'Invalid email or password',
				});

			const isPasswordMatched = await user.comparePassword(password);
			if (!isPasswordMatched)
				return res.status(403).json({
					success: false,
					message: 'Invalid email or password',
				});

			sendToken(auth, user, 200, res);
			next();
		} catch (error) {
			res.status(403).json({
				success: false,
				message: error.message,
			});
		}
	});

	// Custom routes
	if (auth.routes && auth.routesFilePath) {
		for (let customObj of auth.routes) {
			let custom = Object.values(customObj)[0];
			// console.log(custom);
			const middlewareFn = custom.middlewareFn
				? require(path.resolve(auth.routesFilePath))[
				custom.middlewareFn
				]
				: (_, __, next) => {
					next();
				};

			const customFn = require(path.resolve(auth.routesFilePath))[
				custom.functionName
			];

			switch (String(custom.method).toLowerCase()) {
				case 'get':
					router.get(custom.route, middlewareFn, customFn);
					logCreatedRoute('GET', `/${custom.route}`);
					break;
				case 'post':
					router.post(custom.route, middlewareFn, customFn);
					logCreatedRoute('POST', `/${custom.route}`);
					break;
				case 'put':
					router.put(custom.route, middlewareFn, customFn);
					logCreatedRoute('PUT', `/${custom.route}`);
					break;
				case 'delete':
					router.delete(custom.route, middlewareFn, customFn);
					logCreatedRoute('DELETE', `/${custom.route}`);
					break;
				default:
					throw new Error('Method not supported');
			}
		}
	}
	app.use('/auth', router)
};

module.exports = {
	createRoutes,
	createAuth,
	get,
	post,
	patch,
	Delete,
	extendRoutes,
};
