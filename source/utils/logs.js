const { greenBright, bgYellow, black } = require('colorette');

function warn(message) {
	console.log(bgYellow(black(message)));
}

function logCreatedRoute(method, route) {
	let methodStr = String(method) + ' '.repeat(6 - method.length);
	console.log(greenBright(`✔️  Created ${methodStr} ${route} route`));
}

module.exports = { warn, logCreatedRoute };
