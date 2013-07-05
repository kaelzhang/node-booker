'use strict';

var util = require('util');
var typo = require('typo');

module.exports = function(options) {
    return new Loggie(options);
};

function mix (receiver, supplier, override){
    var key;

    if(arguments.length === 2){
        override = true;
    }

    for(key in supplier){
        if(override || !(key in receiver)){
            receiver[key] = supplier[key]
        }
    }

    return receiver;
}


var DEFAULT_OPTIONS = {

    // global logging level
    level: '*',
    catch_exception: true,
    use_exit: true
};

var DEFAULT_TEMPLATE = '{{arguments}}';


var PRESETS = {
    log: {},

    error: {
        template: '{{red|bold ERROR}} {{arguments}}'
    },

    warn: {
        template: '{{yellow WARN}} {{arguments}}'
    },

    verbose: {
        argv: '--verbose',
        template: '{{gray verbose}} {{arguments}}'
    },

    debug: {
        argv: '--debug',
        template: '{{magenta [D]}} {{arguments}}'
    }
};


// @param {Object} options
// - level: {string} log level
function Loggie (options){
    options = options || {};
    mix(options, DEFAULT_OPTIONS, false);
    Object.defineProperty(this, '__', {
        value: {},
        writable: true
    });

    if ( options.level ) {
        this.setLevel(options.level);
    }

    this.register(PRESETS);

    if(options.use_exit){
        this._onExit = this._onExit.bind(this);
        process.on('exit', this._onExit);
    }
}


// @param {string|Array.<string>} 
Loggie.prototype.setLevel = function(level) {
    this.level = level === '*' ?
        level : 
        Array.isArray(level) ?
            level : 
            String(level).split(/\s*,\s*/);
};


function overload(fn){
    return function(key, value) {
        if( Object(key) === key && arguments.length === 1){
            for(var k in key){
                fn.call(this, k, key[k]);
            }

        }else if(typeof key === 'string'){
            fn.call(this, key, value);
        }
    };
};


// @param {string} name
// @param {Object} logger
// - fn: {function()|template}
// - template: 
Loggie.prototype.register = overload( function(name, setting) {
    if(name === 'end'){
        return false;
    }

    if(setting.template){
        setting.fn = this._fnByTemplate(setting.template);
    }

    setting.fn = setting.fn || this._fnByTemplate(DEFAULT_TEMPLATE);

    if(!(name in this.__)){
        this[name] = this._createMethod(name);
    }

    this._parseArgv(name, setting.argv);

    this.__[name] = setting;

    return true;
} );


// verbose: {
//     argv: '--verbose'
// }
// if the array of user argv contains '--verbose', add 'verbose' to log level
Loggie.prototype._parseArgv = function(name, argv) {
    if( ! ~ this.level.indexOf(name) ){
        argv = Array.isArray(argv) ? argv : [argv];

        if(
            argv.some(function(arg) {
                return ~ process.argv.indexOf( arg );
            }) 
        ){
            this.level.push(name);
        }
    }
};


// name
// -> this[name]()
// -> this[name].ln()
Loggie.prototype._createMethod = function(name) {
    function ln() {
        if( this.level === '*' || ~ this.level.indexOf(name) ){
            var setting = this.__[name];
            var fn = setting.fn;

            process.stdout.write(
                fn.apply(this, arguments) + 
                // prevent exception by stdout.write, if the argument is not a string
                ''
            );

            carriage_return && process.stdout.write('\n');
        }
    };

    // logger.log('abc')
    function method() {
        carriage_return = true;
        ln.apply(this, arguments);
        carriage_return = false;
    };

    var carriage_return;

    // logger.log.ln('abc')
    method.ln = ln;

    return method;
};


Loggie.prototype._standardize = function (subject){
    var str;

    if(subject instanceof Error){
        str = subject.message || subject.error || subject;

    }else if(typeof subject !== 'string'){
        str = util.inspect(subject);

    }else{
        str = typo.template(subject);
    }

    return str;
};


Loggie.prototype.template = function(template, params) {
    if(params){
        var key;
        for( key in params ){
            params[key] = this._standardize( params[key] );
        }
    }

    return typo.template( template, params );
};


var AP_slice = Array.prototype.slice;

Loggie.prototype._fnByTemplate = function(template) {
    return function() {
        var args = AP_slice.call(arguments, 0).map(this._standardize);
        args['arguments'] = args.join(' ');

        return typo.template(template, args);
    };
};

// inspired by [jam](https://github.com/caolan/jam/blob/master/lib/logger.js)
Loggie.prototype.end = function(msg) {
    this.clean_exit = true;
    typo.log('{{green|bold OK}}: {{bold msg}}', {
        msg: msg || 'done!'
    });
};


Loggie.prototype._onExit = function(code) {
    if (!this.clean_exit) {
        this.error('Faild! Unexpected exit.');
        process.removeListener('exit', this._onExit);
        process.exit(1);
    }
};

