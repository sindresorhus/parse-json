'use strict';
const errorEx = require('error-ex');
const fallback = require('./vendor/parse');

const JSONError = errorEx('JSONError', {
	fileName: errorEx.append('in %s')
});

module.exports = (input, reviver, filename) => {
	if (typeof reviver === 'string') {
		filename = reviver;
		reviver = null;
	}

	try {
		try {
			return JSON.parse(input, reviver);
		} catch (err) {
			fallback.parse(input, {
				mode: 'json',
				reviver
			});

			throw err;
		}
	} catch (err) {
		const jsonErr = new JSONError(err);

		if (filename) {
			jsonErr.fileName = filename;
		}

		throw jsonErr;
	}
};
