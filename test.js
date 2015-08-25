'use strict';
var assert = require('assert');
var test = require('ava');
var fn = require('./');

test(function (t) {
	t.assert(fn('{"foo": true}'));

	assert.throws(function () {
		fn('{\n\t"foo": true,\n}');
	}, /SyntaxError: Trailing/);

	t.end();
});
