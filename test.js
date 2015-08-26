'use strict';
var assert = require('assert');
var test = require('ava');
var fn = require('./');

test(function (t) {
	t.assert(fn('{"foo": true}'));

	assert.throws(function () {
		fn('{\n\t"foo": true,\n}');
	}, /JSONError: Trailing/);

	assert.throws(function () {
		try {
			fn('{\n\t"foo": true,\n}');
		} catch (err) {
			err.fileName = 'foo.json';
			throw err;
		}
	}, /JSONError: Trailing.*in foo\.json/);

	t.end();
});
