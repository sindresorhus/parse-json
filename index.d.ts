import type {JsonObject} from 'type-fest';

/** Exposed for `instanceof` checking. */
export type JSONError = Error & { // eslint-disable-line @typescript-eslint/naming-convention
	/**
	The filename displayed in the error message, if any.
	*/
	fileName: string;

	/**
	The printable section of the JSON which produces the error.
	*/
	readonly codeFrame: string;
};

// Get 'reviver' parameter from JSON.parse()
type ReviverFn = Parameters<typeof JSON['parse']>['1'];

/**
Parse JSON with more helpful errors

@param string A valid JSON string.
@param reviver Prescribes how the value originally produced by parsing is transformed, before being returned. See [`JSON.parse` docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
) for more.
@param filename The filename displayed in the error message.

@returns A parsed JSON object.
@throws A {@link JSONError} when there is a parsing error.
*/
export default function parseJson(string: string, reviver?: ReviverFn, filename?: string): JsonObject;
export default function parseJson(string: string, filename?: string): JsonObject;
