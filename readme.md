# parse-json [![Build Status](https://travis-ci.org/sindresorhus/parse-json.svg?branch=master)](https://travis-ci.org/sindresorhus/parse-json)

> Parse JSON with more helpful errors


## Install

```
$ npm install parse-json
```


## Usage

```js
const parseJson = require('parse-json');
const json = '{\n\t"foo": true,\n}';


JSON.parse(json);
/*
undefined:3
}
^
SyntaxError: Unexpected token }
*/


parseJson(json);
/*
JSONError: Unexpected token } in JSON at position 16 while parsing near '{      "foo": true,}'
*/


parseJson(json, 'foo.json');
/*
JSONError: Unexpected token } in JSON at position 16 while parsing near '{      "foo": true,}' in foo.json
*/


// You can also add the filename at a later point
try {
	parseJson(json);
} catch (err) {
	err.fileName = 'foo.json';
	throw err;
}
/*
JSONError: Unexpected token } in JSON at position 16 while parsing near '{      "foo": true,}' in foo.json
*/
```

## API

### parseJson(input, [reviver], [filename])

#### input

Type: `string`

#### reviver

Type: `Function`

Prescribes how the value originally produced by parsing is transformed, before being returned. See [`JSON.parse` docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
) for more.

#### filename

Type: `string`

Filename displayed in the error message.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
