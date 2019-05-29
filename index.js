'use strict';
const errorEx = require('error-ex');
const fallback = require('json-parse-better-errors');

const JSONError = errorEx('JSONError', {
	fileName: errorEx.append('in %s')
});

module.exports = (string, reviver, filename) => {
	if (typeof reviver === 'string') {
		filename = reviver;
		reviver = null;
	}

	try {
		try {
			return JSON.parse(string, reviver);
		} catch (error) {
			fallback(string, reviver);
			throw error;
		}
	} catch (error) {
		error.message = error.message.replace(/\n/g, '');

		const jsonError = new JSONError(error);
		if (filename) {
			jsonError.fileName = filename;
		}

		throw jsonError;
	}
};
