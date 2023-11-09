import fallback from 'json-parse-even-better-errors';
import {codeFrameColumns} from '@babel/code-frame';
import indexToPosition from 'index-to-position';

export class JSONError extends Error {
	name = 'JSONError';
	fileName;
	codeFrame;
	rawCodeFrame;
	#message;

	constructor(message) {
		// We cannot pass message to `super()`, otherwise the message accessor will be overridden.
		// https://262.ecma-international.org/14.0/#sec-error-message
		super();

		this.#message = message;
		Error.captureStackTrace?.(this, JSONError);
	}

	get message() {
		const {fileName, codeFrame} = this;
		return `${this.#message}${fileName ? ` in ${fileName}` : ''}${codeFrame ? `\n\n${codeFrame}\n` : ''}`;
	}

	set message(message) {
		this.#message = message;
	}
}

const generateCodeFrame = (string, location, highlightCode = true) =>
	codeFrameColumns(string, {start: location}, {highlightCode});

const getErrorLocation = (string, message) => {
	const match = message.match(/in JSON at position (?<index>\d+)(?: \(line (?<line>\d+) column (?<column>\d+)\))? while parsing/);

	if (!match) {
		return;
	}

	let {index, line, column} = match.groups;

	if (line && column) {
		return {line: Number(line), column: Number(column)};
	}

	index = Number(index);

	// The error location can be out of bounds.
	if (index === string.length) {
		const {line, column} = indexToPosition(string, string.length - 1, {oneBased: true});
		return {line, column: column + 1};
	}

	return indexToPosition(string, index, {oneBased: true});
};

export default function parseJson(string, reviver, filename) {
	if (typeof reviver === 'string') {
		filename = reviver;
		reviver = undefined;
	}

	let message;
	try {
		return JSON.parse(string, reviver);
	} catch (error) {
		message = error.message;
	}

	try {
		fallback(string, reviver);
	} catch (error) {
		message = error.message;
	}

	message = message.replaceAll('\n', '');
	const jsonError = new JSONError(message);

	if (filename) {
		jsonError.fileName = filename;
	}

	const location = getErrorLocation(string, message);
	if (location) {
		jsonError.codeFrame = generateCodeFrame(string, location);
		jsonError.rawCodeFrame = generateCodeFrame(string, location, /* highlightCode */ false);
	}

	throw jsonError;
}
