import test from 'ava';
import parseJson, {JSONError} from './index.js';

const jsonErrorRegex = /Unexpected token "}".*in foo\.json/;

test('main', t => {
	t.truthy(parseJson('{"foo": true}'));

	t.throws(() => {
		parseJson('{\n\t"foo": true,\n}');
	}, {
		name: 'JSONError',
		message: /Unexpected token "}"/,
	});

	t.throws(() => {
		try {
			parseJson('{\n\t"foo": true,\n}');
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, {
		message: jsonErrorRegex,
	});

	t.throws(() => {
		parseJson('{\n\t"foo": true,\n}', 'foo.json');
	}, {
		message: jsonErrorRegex,
	});

	t.throws(() => {
		try {
			parseJson('{\n\t"foo": true,\n}', 'bar.json');
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, {
		message: jsonErrorRegex,
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
	} catch(e) {
		t.assert(e.codeFrame);
		t.deepEqual(e.rawCodeFrame, '  1 | {\n  2 | \t\"foo\": true,\n> 3 | }\n    | ^');
	}
});
