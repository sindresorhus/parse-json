import test from 'ava';
import m from '.';

const reJsonErr = /JSONError: Unexpected token }.*in foo\.json?/;

test(t => {
	t.truthy(m('{"foo": true}'));

	t.throws(() => {
		m('{\n\t"foo": true,\n}');
	}, /JSONError: Unexpected token }/);

	t.throws(() => {
		try {
			m('{\n\t"foo": true,\n}');
		} catch (err) {
			err.fileName = 'foo.json';
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

	t.throws(() => {
		m(undefined)
	}, /^JSONError: Cannot parse undefined$/)

	t.throws(() => {
		m(NaN)
	}, /^JSONError: Cannot parse NaN$/)
});
