import {expectType, expectError} from 'tsd';
import type {JsonValue} from 'type-fest';
import parseJson, {type JSONError} from './index.js';

expectError(parseJson());
expectError(parseJson({foo: true}));
expectType<JsonValue>(parseJson('{"foo": true}'));
expectType<JsonValue>(parseJson('{"foo": true}', 'foo.json'));
expectType<JsonValue>(parseJson('{"foo": true}', (key, value) => String(value)));
expectType<JsonValue>(parseJson('{"foo": true}', (key, value) => String(value), 'foo.json'));
expectType<JsonValue>(parseJson('"foo"'));

expectType<string>((() => {
	let x: string;
	parseJson('{"foo": true}', (key, value) => x = key); // eslint-disable-line no-return-assign
	return x!;
})());

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
expectType<any>((() => {
	let x: any;
	parseJson('{"foo": true}', (key, value) => x = value); // eslint-disable-line no-return-assign
	return x;
})());
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

const jsonError: JSONError = {
	name: 'JSONError',
	message: 'Unexpected token } in JSON at position 16 while parsing near \'{      "foo": true,}\'',
	fileName: 'foo.json',
	codeFrame: `
		  1 | {
		  2 |   "foo": true,
		> 3 | }
			| ^
	`,
	rawCodeFrame: `
		  1 | {
		  2 |   "foo": true,
		> 3 | }
			| ^
	`,
};

expectError(jsonError.codeFrame = '');
