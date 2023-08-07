const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const express = require('express');
const yaml = require('js-yaml');
const { validateData, configureArk } = require('./utils/index');
const { createServer } = require('./server/createServer');
const { configureServer } = require('./server/configureServer');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = function (argv) {
	try {
		let configPath = './ark.config.yaml';
		if (argv?.path) {
			configPath = argv.path + './ark.config.yaml';
		}

		const inputFile = yaml.load(
			fs.readFileSync(path.resolve(configPath), 'utf8')
		);

		configureArk(argv, app, inputFile);
		validateData(inputFile);

		mongoose.connect(inputFile.config.url).then(() => {
			console.log('Connected to database');
		});

		configureServer(app, inputFile);
		createServer(app, inputFile);
	} catch (e) {
		console.log(e);
	}
};

exports.Express = express;
exports.server = app;
