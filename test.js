import process from 'node:process';
import test from 'ava';
import parseJson, {JSONError} from './index.js';

const errorMessageRegex = (() => {
	const version = Number(process.version.split('.'));

	if (version < 20) {
		return /Unexpected token "}"/;
	}

	if (version < 21) {
		return /Expected double-quoted property name in JSON at position 16 while parsing/;
	}

	return /Expected double-quoted property name in JSON at position 16 \(line 3 column 1\) while parsing/;
})();
const errorMessageRegexWithFileName = new RegExp(errorMessageRegex.source + '.*in foo\\.json');

test('main', t => {
	t.truthy(parseJson('{"foo": true}'));

	t.throws(() => {
		parseJson('{\n\t"foo": true,\n}');
	}, {
		name: 'JSONError',
		message: errorMessageRegex,
	});

	t.throws(() => {
		try {
			parseJson('{\n\t"foo": true,\n}');
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, {
		message: errorMessageRegexWithFileName,
	});

	t.throws(() => {
		parseJson('{\n\t"foo": true,\n}', 'foo.json');
	}, {
		message: errorMessageRegexWithFileName,
	});

	t.throws(() => {
		try {
			parseJson('{\n\t"foo": true,\n}', 'bar.json');
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, {
		message: errorMessageRegexWithFileName,
	});
});

test('throws exported error error', t => {
	t.throws(() => {
		parseJson('asdf');
	}, {
		instanceOf: JSONError,
	});
});

test('has error frame properties', t => {
	try {
		parseJson('{\n\t"foo": true,\n}', 'foo.json');
	} catch (error) {
		t.assert(error.codeFrame);
		t.is(error.rawCodeFrame, '  1 | {\n  2 | \t"foo": true,\n> 3 | }\n    | ^');
	}
});
