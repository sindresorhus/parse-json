# parse-json [![Build Status](https://travis-ci.org/sindresorhus/parse-json.svg?branch=master)](https://travis-ci.org/sindresorhus/parse-json)

> Parse JSON with more helpful errors


## Install

```
$ npm install --save parse-json
```


## Usage

```js
var parseJson = require('parse-json');
var json = '{\n\t"foo": true,\n}';

try {
	JSON.parse(json);
} catch (err) {
	console.log(err)
	/*
	undefined:3
	}
	^
	SyntaxError: Unexpected token }
	*/
}

try {
	parseJson(json);
} catch (err) {
	console.log(err)
	/*
	JSONError: Trailing comma in object at 3:1
	}
	^
	*/
}


try {
	parseJson(json);
} catch (err) {
	err.fileName = 'foo.json';
	console.log(err)
	/*
	JSONError: Trailing comma in object at 3:1 in foo.json
	}
	^
	*/
}

```

## API

### parseJson(input, [reviver])

#### input

Type: `string`

#### reviver

Type: `function`

Prescribes how the value originally produced by parsing is transformed, before being returned. See [`JSON.parse` docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
) for more.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
