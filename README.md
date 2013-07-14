# Loggie

Loggie is a lovely logger for node.js which is **SMART**, **SMALL**, and **EASY-TO-USE**.

Loggie has few options, which makes it work at your will.


## Installation

```bash
npm install loggie --save
```
	
## Usage

For most cases, you could use loggie immediately with no extra configurations

```js
var loggie = require('loggie');
logger = loggie();

logger.info('{{cyan install}}', 'loggie'); // will print a cyan 'install', space, and 'loggie'.
```

You could use [**typo**](https://github.com/kaelzhang/typo) template here to format your output.

There're several built-in log methods.

### Built-in log methods

Method) | Enabled By default) | Binded Argv) | Leading String)
------- | ------------------- | ------------ | -------------------
verbose | no                  | --verbose    | `'VERB '` in gray
debug   | no                  | --debug      | `'[D] '` in magenta
error   | yes                 |              | bold `'ERR! '` in red
warn    | yes                 |              | `'WARN '` in yellow
info    | yes                 |              | (nothing)

```js
logger.debug('blah-blah'); // will do nothing
```

Because `'debug'` is not enabled by default. 

But if you start your app with `'--debug'` option, `logger.debug` will be activated. Or, you could add `'debug'` into **log levels** in loggie options or with `logger.addLevel` method.

## Programming

### loggie(options)
Will create a new loggie instance

##### options.level
`Array.<String>|String`

`options.level` is just the loggie methods you want to activate. For example:

```js
var logger = loggie({
	level: 'info, error' // can also be ['info', 'error']
});
```

Then, `logger.warn('blah-blah')` will be deactivated and do nothing.

If set to `'*'`, Loggie will enable all log methods.


##### options.use_exit
`Boolean=`

Default to `true`

If set to `true`, Loggie will detect `'exit'` event of process, if process exited without `logger.end()` method, it will be considered as a failure.

#### Best practices

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


## Define custom log methods

```js
logger.register({
	detail: {
		template: '{{cyan|bold|underline Detail}} {{arguments}}', // typo template
		argv: '--detail'
	}
});
```
Then, we defined a log method `logger.detail()`:

```js
logger.detail('a'); // might print a bold cyan 'detail' with a underline, a whitespace, and an 'a'
```

By default, `logger.detail()` will do nothing because it is not in the log level list(`options.level`), but it will be activated if your app is started with '--detail' argument.

You can also use `logger.addLevel('detail')` to add `'detail'` to level list.


### .register(methods)

### .register(name, setting)

Define your own log method. You can also use this method to override existing log methods.

##### name
`String`

The name of the log method you want. If you `register()` with `name = 'verbose'`, there will be a `logger.verbose()` method.


##### setting.template
`String`

A [typo](https://github.com/kaelzhang/typo) syntax template.

There are several built-in template parameters to be used:

`'arguments'`: arguments joined by a single whitespace (`' '`)

`number`: such as `'0'`, the argument at index `0`

If you use the template, all arguments will be stringified


#### Example

```js
logger.register('verbose', {
	template: '{{gray verbose}} {{0}} {{arguments}}'
	// notice that the first argument will be duplicated once
});
logger.verbose('mylabel', 'blah', new Error('error:blah-blah'));
```

Will print: verbose(gray) mylabel mylabel blah error:blah-blah


##### setting.fn
`function()`

The log method.

Notice that if `setting.template` is defined, 	`setting.fn` will be overridden.


