import test from 'ava';
import fn from './';

const reJsonErr = /JSONError: Trailing.*in foo\.json/;

test(t => {
	t.ok(fn('{"foo": true}'));

	t.throws(() => {
		fn('{\n\t"foo": true,\n}');
	}, /JSONError: Trailing/);

	t.throws(() => {
		try {
			fn('{\n\t"foo": true,\n}');
		} catch (err) {
			err.fileName = 'foo.json';
			throw err;
		}
	}, reJsonErr);

	t.throws(() => {
		fn('{\n\t"foo": true,\n}', 'foo.json');
	}, reJsonErr);

	t.throws(() => {
		try {
			fn('{\n\t"foo": true,\n}', 'bar.json');
		} catch (err) {
			err.fileName = 'foo.json';
			throw err;
		}
	}, reJsonErr);
});
