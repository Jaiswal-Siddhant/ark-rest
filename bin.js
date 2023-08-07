#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const init = require('./init');
const path = require('path');

const argv = yargs(hideBin(process.argv))
	.config('config')
	.usage('$0 [options] <source>')
	.options({
		init: {
			description: 'Initialize a new ark project',
		},
		path: {
			alias: 'p',
			description: 'Path to folder containing ark config file',
		},
		dev: {
			alias: 'd',
			description: 'Run in development mode',
		},
		watch: {
			alias: 'w',
			description: 'Watch file(s)',
		},
		quiet: {
			alias: 'q',
			description: 'Suppress log messages from output',
		},
	})
	.boolean('watch')
	.boolean('quiet')
	.boolean('init')
	.help()
	.argv;

if (argv['_'][0] === 'init') {
	let targetDir = argv['_'][1] || '.';
	init(
		path.join(__dirname + '/boiler-code/'),
		path.resolve(targetDir) || path.resolve('./')
	);

	if (['.', './'].includes(targetDir))
		console.log(`\nrun command to start server:\nnpx ark`);
	else {
		console.log(`\nrun command to start server:\ncd ${path.relative(process.cwd(), path.resolve(targetDir))}\nnpx ark`);
	}
	process.exit(0);
}

require('./source/app')(argv);
