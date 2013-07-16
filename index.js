'use strict';

var node_util = require('util');
var EventEmitter = require('events').EventEmitter;

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
    level: 'info, error, warn',
    catch_exception: true,
    use_exit: true
};

var DEFAULT_TEMPLATE = '{{arguments}}';


var PRESETS = {
    info: {},

    error: {
        template: '{{red|bold ERR!}} {{arguments}}'
    },

    warn: {
        template: '{{yellow WARN}} {{arguments}}'
    },

    verbose: {
        argv: '--verbose',
        template: '{{gray VERB}} {{arguments}}'
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
        this._setLevels(options.level);
    }

    this.register(PRESETS);

    var self = this;
    if(options.catch_exception){
        // > Note that uncaughtException is a very crude mechanism for exception handling and may be removed in the future.
        // There's not any good way to solve exceptions.
        // I would optimize loggie if the APIs of `cluster` or `domains` went stable
        process.on('uncaughtException', function(err) {
            self._emit('uncaughtException', err);
        });
    }

    if(options.use_exit){
        this._onExit = this._onExit.bind(this);
        process.on('exit', this._onExit);
    }
}


node_util.inherits(Loggie, EventEmitter);


// set log level
// @param {string|Array.<string>} 
Loggie.prototype._setLevels = function(levels) {
    this.level = levels === '*' ?
        levels : 
        Array.isArray(levels) ?
            levels : 
            String(levels).split(/\s*,\s*/);
};


// add a log level
// @param {string} level
Loggie.prototype.addLevel = function(level) {
    if( this.level !== '*' && ! ~ this.level.indexOf(level)){
        this.level.push(level);
    }
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

    if ( setting.argv ) {
        this._parseArgv(name, setting.argv);
    }

    this.__[name] = setting;

    return true;
} );


// verbose: {
//     argv: '--verbose'
// }
// if the array of user argv contains '--verbose', add 'verbose' to log level
Loggie.prototype._parseArgv = function(name, argv) {
    if(this.level === '*'){
        return;
    }

    argv = Array.isArray(argv) ? argv : [argv];

    if(
        argv.some(function(arg) {
            return ~ process.argv.indexOf( arg );
        })
    ){
        this.addLevel(name);
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

    // logger.info('abc')
    function method() {
        carriage_return = true;
        ln.apply(this, arguments);
        carriage_return = false;
    };

    var carriage_return;
    var self = this;

    // logger.info.ln('abc')
    method.ln = function() {
        return ln.apply(self, arguments);
    };

    return method;
};


Loggie.prototype._standardize = function (subject){
    var str;

    if(subject instanceof Error){
        str = 
            // detail information
            subject.stack || 
            subject.message || 
            subject.error || 
            subject;

    }else if(typeof subject !== 'string'){
        str = node_util.inspect(subject);

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
    this._clean_exit = true;
    
    this._emit('end', {
        msg: msg
    });
};


Loggie.prototype._onExit = function(code) {
    if (!this._clean_exit) {
        this._emit('unexpectedExit');

        process.removeListener('exit', this._onExit);
        process.exit(1);
    }
};

var DEFAULT_EVENTS = {
    unexpectedExit: function() {
        this.error('Unexpected exit.');
    },

    uncaughtException: function(err) {
        this.error(err);
    },

    end: function(e) {
        typo.log('{{green|bold OK}}: {{bold msg}}', {
            msg: e.msg || 'done!'
        });
    }
}


Loggie.prototype._emit = function(type, data) {
    if(!type){
        return;
    }

    // if there is no custom event listeners
    if( EventEmitter.listenerCount(this, type) === 0 ){
        DEFAULT_EVENTS[type].apply(this, Array.prototype.slice.call(arguments, 1) );
    }else{
        // this.emit('commandNotFound', command)
        this.emit.apply(this, arguments);
    }
};

