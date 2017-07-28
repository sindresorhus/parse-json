import test from 'ava';
import m from '.';

const reJsonErr = /JSONError: Trailing.* at 3:1 in foo\.json:3:1/;

test(t => {
	t.truthy(m('{"foo": true}'));

	t.throws(() => {
		m('{\n\t"foo": true,\n}');
	}, /JSONError: Trailing/);

	t.throws(() => {
		try {
			m('{\n\t"foo": true,\n}');
		} catch (err) {
			err.fileName = 'foo.json';
			err.appendPosition = true;
			throw err;
		}
	}, reJsonErr);

	t.throws(() => {
		m('{\n\t"foo": true,\n}', 'foo.json');
	}, reJsonErr);

	t.throws(() => {
		try {
			m('{\n\t"foo": true,\n}', 'bar.json');
		} catch (err) {
			err.fileName = 'foo.json';
			throw err;
		}
	}, reJsonErr);
});
