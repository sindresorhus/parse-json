import fallback from 'json-parse-even-better-errors';
import {codeFrameColumns} from '@babel/code-frame';
import indexToPosition from 'index-to-position';

export class JSONError extends Error {
	fileName;
	codeFrame;
	rawCodeFrame;

	constructor(message) {
		super(message);

		let _message = message instanceof Error
			? message.message
			: message;

		Object.defineProperty(this, 'message', {
			configurable: true,
			enumerable: false,
			get() {
				return `${_message}${this.fileName ? ` in ${this.fileName}` : ''}${this.codeFrame ? `\n\n${this.codeFrame}\n` : ''}`;
			},
			set(value) {
				_message = value;
			},
		});

		this.name = 'JSONError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, JSONError);
		}
	}
}

const generateCodeFrame = (string, location, highlightCode = true) =>
	codeFrameColumns(string, {start: location}, {highlightCode});

const getErrorLocation = (string, message) => {
	const match = message.match(/in JSON at position (?<index>\d+)(?: \(line (?<line>\d+) column (?<column>\d+)\))? while parsing/);

	if (!match) {
		return;
	}

	const {index, line, column} = match.groups;

	if (line && column) {
		return {line: Number(line), column: Number(column)};
	}

	return indexToPosition(string, Number(index), {oneBased: true});
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
