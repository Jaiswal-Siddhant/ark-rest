const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const { stopServer, startServer } = require('../server/createServer');
const { warn } = require('./logs');

function keyboardRestart(app, inputFile) {
	const readline = require('readline');
	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	process.stdin.on('keypress', (_str, key) => {
		if (key.name === 'c' && !key.ctrl) {
			console.clear();
		} else if (key.name === 'r') {
			stopServer();
			startServer(app, inputFile?.server?.port, 'Server restarted');
			console.log('Server restarted.');
		} else if (key.ctrl && (key.name === 'c' || key.name === 'z')) {
			// Exit the process when Ctrl+C is pressed
			process.exit();
		}
	});
}

module.exports = function (argv, app, inputFile) {
	if (argv.quiet) {
		warn('Quiet mode enabled. Logs will not be displayed.');
		console.log = () => {};
	}

	if (argv.dev || argv.d || argv.development) {
		const chokidar = require('chokidar');
		const watcher = chokidar.watch(['./'], {
			persistent: true,
		});

		watcher.on('ready', () => {
			console.log('ready');
			watcher.on('all', () => {
				stopServer();

				// start server with changed conf
				let configPath = argv?.path || './ark.config.yaml';
				const inputFile = yaml.load(
					fs.readFileSync(path.resolve(configPath), 'utf8')
				);
				startServer(app, inputFile?.server?.port, 'Server restarted');
				Object.keys(require.cache).forEach((id) => {
					if (/[/\\]bin[/\\]/.test(id) || /[/\\]src[/\\]/.test(id)) {
						delete require.cache[id];
					}
				});
				console.log('App reloaded');
			});
		});

		keyboardRestart(app, inputFile);
	}

	if (argv.watch || argv.w) {
		const source = argv._[0];
		const watchedDir = path.dirname(source);
		let readError = false;
		fs.watch(watchedDir, (event, file) => {
			// https://github.com/typicode/json-server/issues/420
			// file can be null
			if (file) {
				const watchedFile = path.resolve(watchedDir, file);
				if (watchedFile === path.resolve(source)) {
					if (is.FILE(watchedFile)) {
						let obj;
						try {
							obj = jph.parse(fs.readFileSync(watchedFile));
							if (readError) {
								console.log(
									chalk.green(
										`  Read error has been fixed :)`
									)
								);
								readError = false;
							}
						} catch (e) {
							readError = true;
							console.log(
								chalk.red(`  Error reading ${watchedFile}`)
							);
							console.error(e.message);
							return;
						}

						// Compare .json file content with in memory database
						const isDatabaseDifferent = !_.isEqual(
							obj,
							app.db.getState()
						);
						if (isDatabaseDifferent) {
							console.log(
								chalk.gray(
									`  ${source} has changed, reloading...`
								)
							);
							server && server.destroy(() => start());
						}
					}
				}
			}
		});
	}
};
