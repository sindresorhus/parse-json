'use strict';
var fallback = require('./vendor/parse');

module.exports = function (x, reviver) {
	try {
		return JSON.parse(x, reviver);
	} catch (err) {
		fallback.parse(x, {
			mode: 'json',
			reviver: reviver
		});

		throw err;
	}
};
