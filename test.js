import process from 'node:process';
import test from 'ava';
import {outdent} from 'outdent';
import stripAnsi from 'strip-ansi';
import parseJson, {JSONError} from './index.js';

const NODE_JS_VERSION = Number(process.versions.node.split('.')[0]);

const errorMessageRegex = (() => {
	if (NODE_JS_VERSION < 20) {
		return /Unexpected token "}"\(\\u{7d}\) in JSON at position 16/;
	}

	if (NODE_JS_VERSION < 21) {
		return /Expected double-quoted property name in JSON at position 16/;
	}

	return /Expected double-quoted property name in JSON at position 16 \(line 3 column 1\)/;
})();
const errorMessageRegexWithFileName = new RegExp(errorMessageRegex.source + '.*in foo\\.json');
const INVALID_JSON_STRING = outdent`
  {
  	"foo": true,
  }
`;
const EXPECTED_CODE_FRAME = `
  1 | {
  2 | 	"foo": true,
> 3 | }
    | ^
`.slice(1, -1);

test('main', t => {
	t.deepEqual(parseJson('{"foo": true}'), {foo: true});

	t.throws(() => {
		parseJson(INVALID_JSON_STRING);
	}, {
		name: 'JSONError',
		message: errorMessageRegex,
	});

	t.throws(() => {
		try {
			parseJson(INVALID_JSON_STRING);
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, {
		message: errorMessageRegexWithFileName,
	});

	t.throws(() => {
		parseJson(INVALID_JSON_STRING, 'foo.json');
	}, {
		message: errorMessageRegexWithFileName,
	});

	t.throws(() => {
		try {
			parseJson(INVALID_JSON_STRING, 'bar.json');
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, {
		message: errorMessageRegexWithFileName,
	});

	{
		let jsonError;
		try {
			parseJson(INVALID_JSON_STRING, 'foo.json');
		} catch (error) {
			jsonError = error;
		}

		jsonError.message = 'custom error message';
		t.true(jsonError.message.startsWith('custom error message in foo.json'));
		// Still have code frame in message.
		t.true(stripAnsi(jsonError.message).includes('> 3 | }'));
	}

	{
		let nativeJsonParseError;
		try {
			JSON.parse(INVALID_JSON_STRING);
		} catch (error) {
			nativeJsonParseError = error;
		}

		let jsonError;
		try {
			parseJson(INVALID_JSON_STRING);
		} catch (error) {
			jsonError = error;
		}

		t.is(nativeJsonParseError.name, 'SyntaxError');
		t.deepEqual(nativeJsonParseError, jsonError.cause);
	}
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
		parseJson(INVALID_JSON_STRING, 'foo.json');
	} catch (error) {
		t.is(error.rawCodeFrame, EXPECTED_CODE_FRAME);
		t.is(stripAnsi(error.codeFrame), EXPECTED_CODE_FRAME);
	}
});

test('allow error location out of bounds', t => {
	try {
		parseJson('{');
	} catch (error) {
		t.true(error instanceof JSONError);
		t.is(error.rawCodeFrame, NODE_JS_VERSION === 18 ? undefined : outdent`
			> 1 | {
			    |  ^
		`);
	}
});

test('empty string', t => {
	try {
		parseJson('');
	} catch (error) {
		t.true(error instanceof JSONError);
		t.is(error.message, 'Unexpected end of JSON input while parsing empty string');
		t.is(error.rawCodeFrame, undefined);
	}

	try {
		parseJson(' ');
	} catch (error) {
		t.true(error instanceof JSONError);
		t.is(error.message, 'Unexpected end of JSON input');
		t.is(error.rawCodeFrame, undefined);
	}
});

test('Unexpected tokens', t => {
	try {
		parseJson('a');
	} catch (error) {
		t.true(error instanceof JSONError);
		const firstLine = error.message.split('\n')[0];
		if (NODE_JS_VERSION === 18) {
			t.is(firstLine, 'Unexpected token "a"(\\u{61}) in JSON at position 0');
		} else {
			t.is(firstLine, 'Unexpected token "a"(\\u{61}), "a" is not valid JSON');
		}
	}
});
