'use strict';

var util = require('util');
var typo = require('typo');

module.exports = function(options) {
    return new Loggie(options);
};


function standardize(subject){
    var str;

    if(subject instanceof Error){

    }else if(typeof subject !== 'string'){
        str = util.inspect(subject);
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
    level: 'info'
};


var PRESETS = {
    debug: {
        level: ['debug'],
        template: '{{}}'
    }
};


function Loggie(options){
    this.options = mix(options || {}, DEFAULT_OPTIONS, false);
    Object.defineProperty('__', {
        value: {},
        writable: true
    });
}


// @param {string} name
// @param {Object} logger
// - level: {Array.<string>}
// - fn: {function()|template}
loggie.prototype.register = function(name, setting) {

};


/**
 * Executes a function only if the current log level is in the levels list
 *
 * @param {Array} levels
 * @param {Function} fn
 */

var forLevels = function (levels, fn) {
    return function (label, val) {
        for (var i = 0; i < levels.length; i++) {
            if (levels[i] === exports.level) {
                return fn(label, val);
            }
        }
    };
};

/**
 * Logs debug messages, using util.inspect to show the properties of objects
 * (logged for 'debug' level only)
 */

exports.debug = forLevels(['debug'], function (label, val) {
    if (val === undefined) {
        val = label;
        label = null;
    }
    if (typeof val !== 'string') {
        val = util.inspect(val);
    }
    if (label && val) {
        console.log(magenta(label + ' ') + val);
    }
    else {
        console.log(label);
    }
});

/**
 * Logs info messages (logged for 'info' and 'debug' levels)
 */

exports.info = forLevels(['info', 'debug'], function (label, val) {
    if (val === undefined) {
        val = label;
        label = null;
    }
    if (typeof val !== 'string') {
        val = util.inspect(val);
    }
    if (label) {
        console.log(cyan(label + ' ') + val);
    }
    else {
        console.log(val);
    }
});

/**
 * Logs warnings messages (logged for 'warning', 'info' and 'debug' levels)
 */

exports.warning = forLevels(['warning', 'info', 'debug'], function (msg) {
    console.log(yellow(bold('Warning: ') + msg));
});

/**
 * Logs error messages (always logged)
 */

exports.error = function (err) {
    var msg = err.message || err.error || err;
    if (err.stack) {
        msg = err.stack.replace(/^Error: /, '');
    }
    console.error(red(bold('Error: ') + msg));
};


/**
 * Display a failure message if exit is unexpected.
 */

exports.clean_exit = false;
exports.end = function (msg) {
    exports.clean_exit = true;
    exports.success(msg);
};
exports.success = function (msg) {
    console.log(green(bold('OK') + (msg ? bold(': ') + msg: '')));
};
var _onExit = function () {
    if (!exports.clean_exit) {
        console.log(red(bold('Failed')));
        process.removeListener('exit', _onExit);
        process.exit(1);
    }
};
process.on('exit', _onExit);

/**
 * Log uncaught exceptions in the same style as normal errors.
 */

process.on('uncaughtException', function (err) {
    exports.error(err.stack || err);
});
