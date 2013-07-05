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


var PRESETS = {
    log: {},

    error: {
        fn: function(value) {
            return typo.template('{{red|bold ERROR}}') + ( value && value !== '\n' ? ' ' + value : value || ''); 
        }
    },

    warn: {
        fn: function(value) {
            return typo.template('{{yellow WARN}}') + ( value && value !== '\n' ? ' ' + value : value || '');
        }
    },

    verbose: {
        template: '{{gray arguments}}',
        argv: '--verbose'
    },

    debug: {
        template: '{{magneta [D]}} {{value}}'
    }
};


function default_log(value){
    return value;
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

    this.register(PRESETS);

    options.level && this.setLevel(options.level);

    if(options.catch_exceptions){
        process.on('uncaughtException', function (err) {
            this.error(err);
        });
    }

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

    setting.fn = setting.fn || default_log;

    if(!(name in this.__)){
        this[name] = this._createMethod(name);
    }

    var argv = setting.argv;

    

    this.__[name] = setting;

    return true;
} );


Loggie.prototype._createMethod = function(name) {
    var ln = function(template, params) {
        if( this.level === '*' || ~ this.level.indexOf(name) ){
            var setting = this.__[name];
            var fn = setting.fn;
            var value;

            if(params){
                var key;
                for(key in params){
                    params[key] = this._standardize( params[key] );
                }

                value = typo.template(template, params);

            }else{
                value = this._standardize(template);
            }

            process.stdout.write( fn.call(this, value) );
        }
    };

    // logger.log('abc')
    var method = function(template, params) {
        ln.call(this, template + '\n', params);
    };

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
        str = subject;
    }

    return str;
}


var AP_slice = Array.prototype.slice;

Loggie.prototype._fnByTemplate = function(template) {
    return function(value) {
        return typo.template(template, {
            value: value
        });
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

