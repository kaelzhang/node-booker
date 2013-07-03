# Loggie

Loggie is a lovely logger for node.js which is smart, small, and easy-to-use

## Installation

```bash
npm install loggie --save
```
	
## Usage

```js
var loggie = require('loggie');
	
logger = loggie();

logger.info('install', 'blah-blah');
```

## loggie(options)
Will create a new loggie instance

##### options.level
`Array.<String>|String`

**Unlike** almost every logger modules, `options.level` of Loggie is obvious and easy to understand and remember.

`options.level` is just the loggie methods you want to activate. For example:

```js
var logger = loggie({
	level: ['info', 'error'] // can also be 'info,error'
});
```

Then, `logger.warn('blah-blah')` will be deactivated and do nothing.

If set to `'*'`, Loggie will enable all log methods.

##### options.catchException
`Boolean`

If set to `true`, Loggie will catch those uncaughtexceptions and log them with `logger.error` method.

### Best practices

```js
var logger = loggie({
	level: process.env['MY_LOG_LEVEL'] || 
	
		// log level for production
		'info, error, warn'
});
```
And your environment variables (maybe on Mac OS) could be:

```bash
# file: ~/.profile
export MY_LOG_LEVEL=debug,info,error,warn
```

So, you can use local settings for debugging and development, and will never worry about the possible forgotten

## .register(name, setting)

Define your own log method.

```js
logger.register('verbose', {
	template: '{{bold label}} {{items}}'
});
logger.verbose('')

##### name
`String`

The name of the log method you want. If you `register()` with `name = 'verbose'`, there will be a `logger.verbose` method.


##### setting.template
`String`

A [typo](https://github.com/kaelzhang/typo) syntax template.







