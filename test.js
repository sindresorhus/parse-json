'use strict';
var assert = require('assert');
var test = require('ava');
var fn = require('./');
var reJsonErr = /JSONError: Trailing.*in foo\.json/;

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
	}, reJsonErr);

	assert.throws(function () {
		fn('{\n\t"foo": true,\n}', 'foo.json');
	}, reJsonErr);

	assert.throws(function () {
		try {
			fn('{\n\t"foo": true,\n}', 'bar.json');
		} catch (err) {
			err.fileName = 'foo.json';
			throw err;
		}
	}, reJsonErr);

	t.end();
});
