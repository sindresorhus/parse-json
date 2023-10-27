import errorEx from 'error-ex';
import fallback from 'json-parse-even-better-errors';
import {codeFrameColumns} from '@babel/code-frame';
import {LinesAndColumns} from 'lines-and-columns';

export const JSONError = errorEx('JSONError', {
	fileName: errorEx.append('in %s'),
	codeFrame: errorEx.append('\n\n%s\n'),
});

const generateCodeFrame = (string, location, highlightCode = true) =>
	codeFrameColumns(string, {start: location}, {highlightCode});

const getErrorLocation = (string, error) => {
	const match = error.message.match(/in JSON at position (?<index>\d+)(?: \(line (?<line>\d+) column (?<column>\d+)\))? while parsing/);

	if (!match) {
		return;
	}

	let {index, line, column} = match.groups;

	if (line && column) {
		return {line: Number(line), column: Number(column)};
	}

	({line, column} = new LinesAndColumns(string).locationForIndex(Number(index)));

	return {line: line + 1, column: column + 1};
};

export default function parseJson(string, reviver, filename) {
	if (typeof reviver === 'string') {
		filename = reviver;
		reviver = null;
	}

	try {
		try {
			return JSON.parse(string, reviver);
		} catch (error) {
			fallback(string, reviver);
			throw error;
		}
	} catch (error) {
		error.message = error.message.replace(/\n/g, '');

		const jsonError = new JSONError(error);

		if (filename) {
			jsonError.fileName = filename;
		}

		const location = getErrorLocation(string, error);
		if (location) {
			jsonError.codeFrame = generateCodeFrame(string, location);
			jsonError.rawCodeFrame = generateCodeFrame(string, location, /* highlightCode */ false);
		}

		throw jsonError;
	}
}
