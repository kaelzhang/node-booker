'use strict';

var loggie = require('loggie');

var logger = loggie({
    level: 'debug'
});

logger.info('my label', {a: 1, b: function(){}});