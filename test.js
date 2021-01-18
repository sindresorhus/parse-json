import test from 'ava';
import parseJson from '.';

const jsonErrorRegex = /Unexpected token "}".*in foo\.json/;

test('main', t => {
	t.truthy(parseJson('{"foo": true}'));

	t.throws(() => {
		parseJson('{\n\t"foo": true,\n}');
	}, {
		name: 'JSONError',
		message: /Unexpected token "}"/
	});

	t.throws(() => {
		try {
			parseJson('{\n\t"foo": true,\n}');
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, jsonErrorRegex);

	t.throws(() => {
		parseJson('{\n\t"foo": true,\n}', 'foo.json');
	}, jsonErrorRegex);

	t.throws(() => {
		try {
			parseJson('{\n\t"foo": true,\n}', 'bar.json');
		} catch (error) {
			error.fileName = 'foo.json';
			throw error;
		}
	}, jsonErrorRegex);
});

test('throws exported error error', t => {
	const error = t.throws(() => parseJson('asdf'));
	t.truthy(error instanceof parseJson.JSONError);
});
