'use strict';

var util = require('util');
var typo = require('typo');

module.exports = function(options) {
    return new Loggie(options);
};


function standardize(subject){
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
    level: 'info',
    catchException: true
};


var PRESETS = {
    debug: {
        template: '{{bold label}} {{items}}'
    },

    info: {
        template: '{{cyan label}} {{items}}'
    },

    log: {},

    error: {
        template: '{{red|bold arguments}}'
    },

    warn: {
        template: '{{yellow arguments}}'
    }
};


function default_log(){
    return console.log.apply(console, arguments);
};


// @param {Object} options
// - level: {string} log level
function Loggie (options){
    mix(options || {}, DEFAULT_OPTIONS, false);
    Object.defineProperty(this, '__', {
        value: {},
        writable: true
    });

    this.register(PRESETS);

    options.level && this.setLevel(options.level);

    if(options.catchException){
        process.on('uncaughtException', function (err) {
            this.error(err);
        });
    }

    this._onExit = this._onExit.bind(this);
    process.on('exit', this._onExit);
}


// @param {string|Array.<string>} 
loggie.prototype.setLevel = function(level) {
    this.level = Array.isArray(level) ? level : String(level).split(/\s*,\s*/);
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
loggie.prototype.register = overload( function(name, setting) {
    if(name === 'end'){
        return false;
    }

    if(setting.template){
        setting.fn = this._fnByTemplate(name, setting.template);
    }

    setting.fn = setting.fn || default_log;

    if(!(name in this.__)){
        this[name] = this._createMethod(name);
    }

    this.__[name] = setting;

    return true;
} );

loggie.prototype._createMethod = function(name) {
    return function() {
        if( ~ this.level.indexOf(name) ){
            var setting = this.__[name];
            var fn = setting.fn;

            fn && fn.apply(this, arguments);
        }  
    };
};

var AP_slice = Array.prototype.slice;

loggie.prototype._fnByTemplate = function(name, template) {
    return function() {
        var args = AP_slice.call(arguments, 0).map(standardize);

        args['arguments'] = args.join(' ');
        args['label'] = args[0];
        args.items = args.slice(1).join(' '); 

        typo.log(template, args);
    };
};


// inspired by [jam](https://github.com/caolan/jam/blob/master/lib/logger.js)
loggie.prototype.end = function(msg) {
    this.clean_exit = true;
    typo.log('{{green|bold OK}}{{bold : msg}}', {
        msg: msg || 'done!'
    });
};


loggie.prototype._onExit = function() {
    if (!this.clean_exit) {
        this.error('Faild!');
        process.removeListener('exit', this._onExit);
        process.exit(1);
    }
};

