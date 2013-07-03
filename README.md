# Loggie

Loggie is a lovely logger for node.js which is **SMART**, **SMALL**, and **EASY-TO-USE**.

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

So, you can use local settings for debugging and development, and will never worry about the possible forgetness of changing debug configurations to production.

## .register(name, setting)

Define your own log method.

##### name
`String`

The name of the log method you want. If you `register()` with `name = 'verbose'`, there will be a `logger.verbose` method.


##### setting.template
`String`

A [typo](https://github.com/kaelzhang/typo) syntax template.

There are several built-in template parameters to be used:

`'label'`: the first argument

`'arguments'`: arguments joined by a single whitespace (`' '`)

`'items'`: arguments joined by a single whitespace (`' '`) but except the first argument

`number`: such as `'0'`, the argument at index `0`

If you use the template, all arguments will be stringified


#### Example

```js
logger.register('verbose', {
	template: '{{bold label}} {{1}} {{items}}'
});
logger.verbose('mylabel', 'blah', new Error('error:blah-blah'));
```

Will print: **mylabel** blah blah error:blah-blah


##### setting.fn
`function()`

The log method.

Notice that if `setting.template` is defined, 	`setting.fn` will be overridden.


## Built-in log methods











