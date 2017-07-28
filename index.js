'use strict';
const errorEx = require('error-ex');
const fallback = require('./vendor/parse');

function appendPosition(message) {
	const numbers = message.match(/ at (\d+:\d+) in/);
	return message + ':' + numbers[1];
}

const JSONError = errorEx('JSONError', {
	fileName: errorEx.append('in %s'),
	appendPosition: {
		message: (shouldAppend, original) => {
			const originalMessage = original[0];
			return shouldAppend ? appendPosition(originalMessage) : originalMessage;
		}
	}
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
			jsonErr.appendPosition = true;
		}

		throw jsonErr;
	}
};
